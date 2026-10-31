<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, readAs, uniqueById, type Cause, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { mistagged, PROBLEM_LABEL } from '#lib/kb/problems';

  // `tickets`: where each problem is filed now, problem → ticket URL.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Cause, string>> } = $props();

  const rows = $derived((reports as Report[]).filter((r) => r.mergedInto === ticket));
  const merged = $derived(uniqueById(rows));
  const groups = $derived(groupByCause(merged, tenantOf));
  const wrongTag = $derived(mistagged(groups));
  const count = (n: Record<string, number>) =>
    Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ×${v}`)
      .join(' · ');
  const channels = (rs: Report[]) => count(rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}));
  const ticketOf = (p: string) => (tickets as Record<string, string | undefined>)[p];
  const label = (url: string) => url.replace(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/issues\/(\d+)$/, '$1#$2');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ({rows.length} rows in the export) ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>came in by</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.cause)}
      {@const url = ticketOf(g.cause)}
      <tr class:open={!url}>
        <td><code>{g.cause}</code><br /><span class="what">{PROBLEM_LABEL[g.cause]}</span></td>
        <td><strong>{g.reports.length}</strong></td>
        <td class="tags">{channels(g.reports)}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if url}<a href={url}>{label(url)}</a>{:else}no ticket yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each groups as g (g.cause)}
  {@const moved = readAs(g, notes.oneDayMove)}
  {#if moved}
    <p class="note">{moved} of the <code>{g.cause}</code> reports read as a one-day move; counted under <code>{g.cause}</code> by tenant.</p>
  {/if}
{/each}

<p class="note">
  {wrongTag} of {merged.length} reports carry an intake tag that is not their problem. Intake tags come
  from the reporter's browser; the problem comes from the tenant, the channel and the booking form.
</p>

<style>
  .sum { font-size: 1.1rem; }
  .what, .tags, .note { color: var(--muted); font-size: 0.85em; }
  .open td { background: var(--warn-bg); }
  .open td:last-child { color: var(--warn); font-weight: 600; }
</style>
