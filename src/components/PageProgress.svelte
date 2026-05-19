<script>
  import { onMount, onDestroy } from 'svelte';

  let scrollPct = 0;
  let navPct = 0;
  let navigating = false;
  let visible = true;
  let t1, t2, t3, t4;

  function onScroll() {
    if (navigating) return;
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    scrollPct = max > 0 ? (h.scrollTop / max) * 100 : 0;
  }

  function startNav() {
    navigating = true;
    visible = true;
    navPct = 18;
    clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    t1 = setTimeout(() => { if (navigating) navPct = 45; }, 150);
    t2 = setTimeout(() => { if (navigating) navPct = 68; }, 500);
    t3 = setTimeout(() => { if (navigating) navPct = 82; }, 1200);
  }

  function endNav() {
    navPct = 100;
    t4 = setTimeout(() => {
      navigating = false;
      navPct = 0;
      scrollPct = 0;
    }, 220);
  }

  onMount(() => {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('astro:before-preparation', startNav);
    document.addEventListener('astro:page-load', endNav);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('astro:before-preparation', startNav);
      document.removeEventListener('astro:page-load', endNav);
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
  });
</script>

<div
  class="page-progress"
  style="
    width: {navigating ? navPct : scrollPct}%;
    transition: width {navigating ? '500ms' : '80ms'} cubic-bezier(.4,0,.2,1);
    opacity: {navigating ? 1 : (scrollPct > 1 ? 1 : 0)};
  "
></div>
