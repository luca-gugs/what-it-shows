// What a report shows, not which cause causes.ts guesses for it. causes.ts splits day-first tenants'
// reports into `parser` and `hint` by channel and booking form; the reports themselves show one
// thing, a day/month swap. The reports the desk read as a one-day move (desk-notes.json) show no
// swap at all: no swap fix closes them. Two problems, by what the reports show.
import { causeOf, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'swap' | 'shift';

export const PROBLEM_LABEL: Record<Problem | 'unplaced', string> = {
  swap: 'day-first date read month first: day and month swapped',
  shift: 'date moves one day (time zone), no day/month swap',
  unplaced: 'no day-first tenant on file',
};

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem | 'unplaced' {
  if (oneDayMove.includes(r.id)) return 'shift';
  return causeOf(r, t) ? 'swap' : 'unplaced';
}

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: number;
  // How the reports came in: channel → count.
  channels: Record<string, number>;
  // What causes.ts guesses for them: cause → count.
  guessed: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

const tally = (keys: string[]) => keys.reduce<Record<string, number>>((n, k) => ({ ...n, [k]: (n[k] ?? 0) + 1 }), {});

export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const byProblem = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of reports) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    byProblem.set(p, [...(byProblem.get(p) ?? []), r]);
  }
  return [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: new Set(rs.map((r) => r.tenant)).size,
        channels: tally(rs.map((r) => r.channel)),
        guessed: tally(rs.map((r) => causeOf(r, tenantOf(r)) ?? 'none')),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
