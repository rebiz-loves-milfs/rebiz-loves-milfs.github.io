<script>
  export let eye     = { x: 0, y: 0 };
  export let eyeMode = 'normal';
</script>

<svg class="nx7-sprite" width="100" height="100" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="mikoRobeFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="oklch(0.92 0.015 30)" stop-opacity="1"/>
      <stop offset="100%" stop-color="oklch(0.92 0.015 30)" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Antennae — flowing curves with glowing tips -->
  <path d="M 38 21 C 30 14 18 9 12 5" stroke="oklch(0.82 0.04 30)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="11" cy="4" r="3.5" fill="oklch(0.85 0.22 var(--hue))" class="nx7-bulb"/>
  <path d="M 62 21 C 70 14 82 9 88 5" stroke="oklch(0.82 0.04 30)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="89" cy="4" r="3.5" fill="oklch(0.85 0.22 var(--hue))" class="nx7-bulb"/>

  <!-- Face -->
  <ellipse cx="50" cy="30" rx="18" ry="20" fill="oklch(0.93 0.015 30)" stroke="oklch(0.55 0.25 20)" stroke-width="1"/>

  <!-- Miko headband -->
  <rect x="32" y="19" width="36" height="8" rx="3.5" fill="oklch(0.50 0.25 20)"/>
  <line x1="46" y1="19" x2="46" y2="15" stroke="rgba(255,255,255,0.65)" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="54" y1="19" x2="54" y2="15" stroke="rgba(255,255,255,0.65)" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="44" y1="17" x2="56" y2="17" stroke="rgba(255,255,255,0.65)" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="43" y1="19" x2="57" y2="19" stroke="rgba(255,255,255,0.40)" stroke-width="1" stroke-linecap="round"/>

  <!-- Eyes — tracked by mouse -->
  <g style="transform:translate({eye.x*.4}px,{eye.y*.3}px);transition:transform 0.08s ease">
    {#if eyeMode==='closed'}
      <path d="M 36 31 Q 40 28 44 31" stroke="oklch(0.55 0.25 20)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M 56 31 Q 60 28 64 31" stroke="oklch(0.55 0.25 20)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    {:else if eyeMode==='smirk'}
      <ellipse cx="40" cy="31" rx="4.5" ry="5" fill="#0a0a18"/>
      <circle cx="40" cy="31" r="2.7" fill="oklch(0.65 0.18 var(--hue))"/>
      <circle cx="41.5" cy="29.5" r="1.2" fill="white" opacity="0.9"/>
      <path d="M 36 27 Q 40 24.5 44 27" stroke="#0a0a18" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M 56 31 Q 60 27.5 64 31" stroke="oklch(0.55 0.25 20)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    {:else if eyeMode==='hearts'}
      <text x="40" y="37" font-size="12" fill="oklch(0.68 0.25 0)" text-anchor="middle" font-family="serif">♡</text>
      <text x="60" y="37" font-size="12" fill="oklch(0.68 0.25 0)" text-anchor="middle" font-family="serif">♡</text>
    {:else if eyeMode==='question'}
      <ellipse cx="40" cy="31" rx="4.5" ry="5" fill="#0a0a18"/>
      <circle cx="40" cy="31" r="2.7" fill="oklch(0.65 0.18 var(--hue))"/>
      <circle cx="41.5" cy="29.5" r="1.2" fill="white" opacity="0.9"/>
      <path d="M 36 27 Q 40 24.5 44 27" stroke="#0a0a18" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <text x="60" y="36" font-size="10" fill="oklch(0.65 0.18 var(--hue))" text-anchor="middle" font-weight="900">?</text>
    {:else if eyeMode==='tired'}
      <ellipse cx="40" cy="32.5" rx="4.5" ry="3.5" fill="#0a0a18"/>
      <ellipse cx="40" cy="32.5" rx="2.4" ry="1.9" fill="oklch(0.65 0.18 var(--hue))"/>
      <path d="M 35 29 Q 40 27 45 29" stroke="oklch(0.88 0.02 30)" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.85"/>
      <ellipse cx="60" cy="32.5" rx="4.5" ry="3.5" fill="#0a0a18"/>
      <ellipse cx="60" cy="32.5" rx="2.4" ry="1.9" fill="oklch(0.65 0.18 var(--hue))"/>
      <path d="M 55 29 Q 60 27 65 29" stroke="oklch(0.88 0.02 30)" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.85"/>
    {:else if eyeMode==='surprised'}
      <ellipse cx="40" cy="31" rx="5.5" ry="6" fill="#0a0a18"/>
      <circle cx="40" cy="31" r="3.3" fill="oklch(0.68 0.18 var(--hue))"/>
      <circle cx="42" cy="29" r="1.5" fill="white" opacity="0.9"/>
      <ellipse cx="60" cy="31" rx="5.5" ry="6" fill="#0a0a18"/>
      <circle cx="60" cy="31" r="3.3" fill="oklch(0.68 0.18 var(--hue))"/>
      <circle cx="62" cy="29" r="1.5" fill="white" opacity="0.9"/>
    {:else if eyeMode==='wide'}
      <ellipse cx="40" cy="31" rx="5" ry="5.5" fill="#0a0a18"/>
      <circle cx="40" cy="31" r="3" fill="oklch(0.68 0.18 var(--hue))"/>
      <circle cx="41.5" cy="29" r="1.3" fill="white" opacity="0.9"/>
      <path d="M 35 27 Q 40 24 45 27" stroke="#0a0a18" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="60" cy="31" rx="5" ry="5.5" fill="#0a0a18"/>
      <circle cx="60" cy="31" r="3" fill="oklch(0.68 0.18 var(--hue))"/>
      <circle cx="61.5" cy="29" r="1.3" fill="white" opacity="0.9"/>
      <path d="M 55 27 Q 60 24 65 27" stroke="#0a0a18" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    {:else if eyeMode==='angry-eyes'}
      <path d="M 34 27 L 45 31" stroke="oklch(0.55 0.25 20)" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 55 31 L 66 27" stroke="oklch(0.55 0.25 20)" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="40" cy="33.5" rx="4.5" ry="2.8" fill="#0a0a18"/>
      <ellipse cx="40" cy="33.5" rx="2.4" ry="1.5" fill="oklch(0.55 0.25 20)"/>
      <ellipse cx="60" cy="33.5" rx="4.5" ry="2.8" fill="#0a0a18"/>
      <ellipse cx="60" cy="33.5" rx="2.4" ry="1.5" fill="oklch(0.55 0.25 20)"/>
    {:else}
      <!-- normal — large anime eyes with eyelashes -->
      <ellipse cx="40" cy="31" rx="4.5" ry="5" fill="#0a0a18"/>
      <circle cx="40" cy="31" r="2.8" fill="oklch(0.65 0.18 var(--hue))"/>
      <circle cx="41.5" cy="29.5" r="1.2" fill="white" opacity="0.9"/>
      <path d="M 36 27 Q 40 24.5 44 27" stroke="#0a0a18" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <ellipse cx="60" cy="31" rx="4.5" ry="5" fill="#0a0a18"/>
      <circle cx="60" cy="31" r="2.8" fill="oklch(0.65 0.18 var(--hue))"/>
      <circle cx="61.5" cy="29.5" r="1.2" fill="white" opacity="0.9"/>
      <path d="M 56 27 Q 60 24.5 64 27" stroke="#0a0a18" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    {/if}
  </g>

  <!-- Mouth -->
  {#if eyeMode==='closed'||eyeMode==='smirk'||eyeMode==='hearts'}
    <path d="M 45 40 Q 50 44 55 40" stroke="oklch(0.55 0.22 20)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  {:else if eyeMode==='angry-eyes'}
    <path d="M 46 42 Q 50 38.5 54 42" stroke="oklch(0.55 0.25 20)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  {:else if eyeMode==='surprised'}
    <ellipse cx="50" cy="42" rx="3.5" ry="3" fill="none" stroke="oklch(0.60 0.15 30)" stroke-width="1.5"/>
  {:else}
    <path d="M 46 40 Q 50 43.5 54 40" stroke="oklch(0.60 0.18 20)" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  {/if}

  <!-- Body — kimono silhouette -->
  <path d="M 37 47 L 32 48 L 30 80 L 70 80 L 68 48 L 63 47 Q 56 44 50 44 Q 44 44 37 47Z"
        fill="oklch(0.92 0.015 30)" stroke="oklch(0.55 0.25 20)" stroke-width="1.2"/>
  <!-- Kimono collar V -->
  <path d="M 42 48 L 50 60 L 58 48" stroke="oklch(0.50 0.25 20)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M 43 50 L 50 59 L 57 50" stroke="oklch(0.92 0.015 30)" stroke-width="1.2" fill="none" stroke-linecap="round"/>

  <!-- Torii motif — chest -->
  <line x1="43" y1="66" x2="57" y2="66" stroke="oklch(0.50 0.25 20)" stroke-width="2" stroke-linecap="round"/>
  <line x1="42" y1="68.5" x2="58" y2="68.5" stroke="oklch(0.50 0.25 20)" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="45" y1="68.5" x2="45" y2="75" stroke="oklch(0.50 0.25 20)" stroke-width="1.6" stroke-linecap="round"/>
  <line x1="55" y1="68.5" x2="55" y2="75" stroke="oklch(0.50 0.25 20)" stroke-width="1.6" stroke-linecap="round"/>

  <!-- Circuit seams -->
  <path d="M 33 58 L 39 58 M 61 58 L 67 58" stroke="oklch(0.65 0.14 var(--hue))" stroke-width="0.9" opacity="0.5" stroke-linecap="round"/>
  <path d="M 34 70 L 40 70 M 60 70 L 66 70" stroke="oklch(0.65 0.14 var(--hue))" stroke-width="0.9" opacity="0.4" stroke-linecap="round"/>
  <circle cx="39" cy="58" r="1" fill="oklch(0.65 0.14 var(--hue))" opacity="0.55"/>
  <circle cx="61" cy="58" r="1" fill="oklch(0.65 0.14 var(--hue))" opacity="0.55"/>

  <!-- Arms -->
  <path d="M 36 52 C 28 59 24 68 26 76" stroke="oklch(0.90 0.015 30)" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M 36 52 C 28 59 24 68 26 76" stroke="oklch(0.55 0.25 20)" stroke-width="0.9" fill="none" stroke-linecap="round"/>
  <circle cx="25.5" cy="76.5" r="3.2" fill="oklch(0.90 0.015 30)" stroke="oklch(0.55 0.25 20)" stroke-width="0.9"/>
  <path d="M 64 52 C 72 59 76 68 74 76" stroke="oklch(0.90 0.015 30)" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M 64 52 C 72 59 76 68 74 76" stroke="oklch(0.55 0.25 20)" stroke-width="0.9" fill="none" stroke-linecap="round"/>
  <circle cx="74.5" cy="76.5" r="3.2" fill="oklch(0.90 0.015 30)" stroke="oklch(0.55 0.25 20)" stroke-width="0.9"/>

  <!-- Floating robe fade -->
  <rect x="30" y="77" width="40" height="10" fill="url(#mikoRobeFade)"/>

  <!-- Particle dissolve -->
  <circle cx="37" cy="91" r="2.2" fill="oklch(0.80 0.18 var(--hue))" opacity="0.55" class="nx7-bulb"/>
  <circle cx="50" cy="94" r="1.6" fill="oklch(0.80 0.18 var(--hue))" opacity="0.38"/>
  <circle cx="63" cy="91" r="2.2" fill="oklch(0.80 0.18 var(--hue))" opacity="0.55" class="nx7-bulb"/>
  <circle cx="43" cy="96" r="1" fill="oklch(0.80 0.18 var(--hue))" opacity="0.22"/>
  <circle cx="57" cy="96" r="1.2" fill="oklch(0.80 0.18 var(--hue))" opacity="0.28"/>
  <circle cx="31" cy="87" r="1.5" fill="oklch(0.80 0.18 var(--hue))" opacity="0.30"/>
  <circle cx="69" cy="87" r="1.5" fill="oklch(0.80 0.18 var(--hue))" opacity="0.30"/>
</svg>

<style>
  .nx7-sprite { display: block; }
  .nx7-bulb   { animation: nx7-bulb-pulse 2.4s ease-in-out infinite; }

  @keyframes nx7-bulb-pulse {
    0%,100% { opacity: 1;   filter: drop-shadow(0 0 4px oklch(0.85 0.22 var(--hue))); }
    50%     { opacity: .7;  filter: drop-shadow(0 0 8px oklch(0.85 0.22 var(--hue))); }
  }
</style>
