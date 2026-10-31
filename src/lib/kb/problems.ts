// The problems in #4471, counted with the desk's own view (causes.ts, as exported). causes.ts files
// day-first tenants' reports as `parser` or `hint` by channel and booking form; both show the same
// day/month swap, so both are `swap`. The reports the desk read as a one-day move (desk-notes.json)
// stay counted where they're filed and are footnoted there; they also make up `shift`.
import { groupByCause, readAs, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'swap' | 'shift';

export const PROBLEM_LABEL: Record<Problem | 'unplaced', string> = {
  swap: 'day-first date read month first: day and month swapped',
  shift: 'date moves one day (time zone), no day/month swap',
  unplaced: 'no day-first tenant on file',
};

export type ProblemRow = {
  problem: Problem | 'unplaced';
  reports: Report[];
  // How the desk files these reports: cause → count.
  filedAs: Record<string, number>;
  // Of these, how many the desk read as a one-day move.
  oneDayMove: number;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

const tally = (keys: string[]) => keys.reduce<Record<string, number>>((n, k) => ({ ...n, [k]: (n[k] ?? 0) + 1 }), {});

function row(problem: ProblemRow['problem'], groups: CauseGroup[], oneDayMove: readonly string[]): ProblemRow {
  const reports = groups.flatMap((g) => g.reports);
  const days = reports.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports,
    filedAs: Object.fromEntries(groups.map((g) => [g.cause, g.reports.length])),
    oneDayMove: groups.reduce((n, g) => n + readAs(g, oneDayMove), 0),
    tenants: new Set(reports.map((r) => r.tenant)).size,
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

export function problemRows(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemRow[] {
  const groups = groupByCause(reports, tenantOf);
  const filed = groups.filter((g) => g.cause !== 'unplaced');
  const moved = groupByCause(reports.filter((r) => oneDayMove.includes(r.id)), tenantOf);
  return [
    row('swap', filed, oneDayMove),
    row('shift', moved, oneDayMove),
    ...groups.filter((g) => g.cause === 'unplaced').map((g) => row('unplaced', [g], oneDayMove)),
  ].filter((p) => p.reports.length);
}

export const channels = (rs: Report[]) => tally(rs.map((r) => r.channel));
