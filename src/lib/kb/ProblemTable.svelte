<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { channels, problemRows, PROBLEM_LABEL, type Problem } from '#lib/kb/problems';

  // `tickets`: where each problem is filed now, problem → ticket URL.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, string>> } = $props();

  const rows = $derived((reports as Report[]).filter((r) => r.mergedInto === ticket));
  const merged = $derived(uniqueById(rows));
  const problems = $derived(problemRows(merged, tenantOf, notes.oneDayMove));
  const count = (n: Record<string, number>) =>
    Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ×${v}`)
      .join(' · ');
  const ticketOf = (p: string) => (tickets as Record<string, string | undefined>)[p];
  const label = (url: string) => url.replace(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/issues\/(\d+)$/, '$1#$2');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ({rows.length} rows in the export) ·
  <strong>{problems.length}</strong>
  {problems.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>came in by</th><th>the desk files them as</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each problems as p (p.problem)}
      {@const url = ticketOf(p.problem)}
      <tr class:open={!url}>
        <td><code>{p.problem}</code><br /><span class="what">{PROBLEM_LABEL[p.problem]}</span></td>
        <td><strong>{p.reports.length}</strong></td>
        <td class="tags">{count(channels(p.reports))}</td>
        <td class="tags">{count(p.filedAs)}</td>
        <td>{p.tenants}</td>
        <td>{p.firstSeen} → {p.lastSeen}</td>
        <td>{#if url}<a href={url}>{label(url)}</a>{:else}no ticket yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each problems as p (p.problem)}
  {#if p.problem !== 'shift' && p.oneDayMove}
    <p class="note">
      {p.oneDayMove} of the <code>{p.problem}</code> reports read as a one-day move: counted where they're filed,
      footnoted here, and tracked as <code>shift</code>.
    </p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .what, .tags, .note { color: var(--muted); font-size: 0.85em; }
  .open td { background: var(--warn-bg); }
  .open td:last-child { color: var(--warn); font-weight: 600; }
</style>
