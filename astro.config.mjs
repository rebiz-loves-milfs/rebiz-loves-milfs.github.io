import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';
import javascriptObfuscator from 'vite-plugin-javascript-obfuscator';

export default defineConfig({
  integrations: [svelte(), sitemap(), compress()],
  vite: {
    plugins: [
      {
        ...javascriptObfuscator({
          exclude: [
            /node_modules/,
            /\.svelte(\.[jt]s)?$/,
            /\?svelte/,
            /@astrojs/,
            /astro\//,
            /\.astro/,
            /vendor/
          ],
          options: {
            compact: true,
            simplify: true,
            numbersToExpressions: true,
            stringArray: true,
            stringArrayThreshold: 0.75,
            splitStrings: true,
            splitStringsChunkLength: 5,

            // Disable expensive transformations to prevent build timeouts
            controlFlowFlattening: false,
            deadCodeInjection: false,
            selfDefending: false,
            debugProtection: false,

            // Simplify string handling
            stringArrayEncoding: [],
            stringArrayRotate: false,
            stringArrayShuffle: false,
            stringArrayWrappersChainedCalls: false,

            // Critical for Svelte compatibility
            renameGlobals: false,

            // Reduce bundle size
            transformObjectKeys: false,
            unicodeEscapeSequence: false,

            identifierNamesGenerator: 'hexadecimal',
            log: false,
          },
        }),
        apply: 'build',
      },
    ],
  },
  site: 'https://rebiz-loves-milfs.github.io',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
