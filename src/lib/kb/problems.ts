// The problems in a merged ticket, each with the ticket it is filed under now. causes.ts decides
// which problem a report belongs to (tenant, channel, booking form); this file only names them and
// counts what intake got wrong.
import type { Cause, CauseGroup } from '#lib/kb/causes';

export const PROBLEM_LABEL: Record<Cause | 'unplaced', string> = {
  parser: 'shared parser reads day-first dates month first',
  hint: 'booking-v3 form hints MM/DD/YYYY, then reads the date day first',
  unplaced: 'no day-first tenant on file',
};

// Reports whose intake tag names a different problem than the one they belong to.
export function mistagged(groups: CauseGroup[]): number {
  return groups.reduce((n, g) => n + g.reports.filter((r) => r.meta.intakeTag !== g.cause).length, 0);
}
