<script>
  import { onMount, onDestroy } from 'svelte';

  export let compact = false;
  export let title = 'My Blog';
  export let subtitle = '';

  const BANNERS = [
    '/assets/banner-1.webp',
    '/assets/banner-2.webp',
    '/assets/banner-3.webp',
    '/assets/banner-4.webp',
  ];

  const SUBTITLES = [
    'Writing about things I love',
    'Ideas, anime, and everything in between',
    'Welcome to my corner of the internet',
    'Thoughts worth sharing',
    'Just another day, another post',
  ];

  let imgIdx = 0;
  let typedText = '';
  let phraseIdx = 0;
  let deleting = false;

  let bannerTimer;
  let typeTimer;

  function typeStep() {
    const current = SUBTITLES[phraseIdx];
    if (!deleting && typedText === current) {
      typeTimer = setTimeout(() => { deleting = true; typeStep(); }, 2000);
    } else if (deleting && typedText === '') {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % SUBTITLES.length;
      typeTimer = setTimeout(typeStep, 80);
    } else {
      typedText = deleting
        ? current.substring(0, typedText.length - 1)
        : current.substring(0, typedText.length + 1);
      typeTimer = setTimeout(typeStep, deleting ? 50 : 80);
    }
  }

  onMount(() => {
    if (!compact) {
      bannerTimer = setInterval(() => { imgIdx = (imgIdx + 1) % BANNERS.length; }, 4000);
      typeStep();
    }
  });

  onDestroy(() => {
    clearInterval(bannerTimer);
    clearTimeout(typeTimer);
  });
</script>

<div class="banner-wrap {compact ? 'compact' : ''}">
  {#each BANNERS as src, i}
    <img src={src} class="banner-img" style="opacity:{i === imgIdx ? 1 : 0}" alt="" />
  {/each}
  <div class="banner-overlay">
    <h1 class="banner-title">{title}</h1>
    {#if !compact}
      <div class="banner-subtitle">
        {subtitle || typedText}<span class="cursor-blink">▎</span>
      </div>
    {/if}
  </div>
  <svg class="waves" viewBox="0 24 150 28" preserveAspectRatio="none">
    <defs>
      <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z" />
    </defs>
    <g>
      <use href="#gentle-wave" x="48" y="0" />
      <use href="#gentle-wave" x="48" y="3" />
      <use href="#gentle-wave" x="48" y="5" />
      <use href="#gentle-wave" x="48" y="7" />
    </g>
  </svg>
</div>
