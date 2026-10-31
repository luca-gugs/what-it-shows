import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';

const layout = (name) => fileURLToPath(new URL(`./src/lib/layouts/${name}.svelte`, import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [mdsvex({ extensions: ['.svx'], layout: { runbook: layout('runbook') } })],
  kit: {
    adapter: adapter(),
    inlineStyleThreshold: Infinity,
    prerender: { entries: ['/kb'] },
  },
};
