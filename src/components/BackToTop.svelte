<script>
  import { onMount } from 'svelte';

  let visible = $state(false);

  onMount(() => {
    const handleScroll = () => {
      visible = window.scrollY > 300;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

{#if visible}
  <button
    class="back-to-top"
    onclick={scrollToTop}
    aria-label="Back to top"
    title="Back to top"
  >
    <iconify-icon icon="material-symbols:keyboard-arrow-up" width="24" height="24"></iconify-icon>
  </button>
{/if}

<style>
  .back-to-top {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    width: 44px;
    height: 44px;
    border-radius: 999px;
    background: var(--card-bg);
    color: var(--primary);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    opacity: 1;
    transform: translateY(0);
    transition: opacity 200ms ease, transform 200ms ease, box-shadow 120ms ease;
  }

  .back-to-top:hover {
    box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1)), 0 6px 20px rgba(0,0,0,0.12);
    transform: translateY(-2px);
  }

  .back-to-top:active {
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: reduce) {
    .back-to-top {
      transition: none;
    }

    .back-to-top:hover {
      transform: none;
    }
  }
</style>
