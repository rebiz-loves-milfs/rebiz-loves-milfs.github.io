<script>
  import { onMount, onDestroy } from 'svelte';

  export let unlockAt = undefined;

  let locked = false;
  let days = 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let mounted = false;
  let intervalId = null;

  function isValidDate(d) {
    return d instanceof Date && !isNaN(d.getTime());
  }

  function computeCountdown() {
    if (!isValidDate(unlockAt)) return;
    const diff = unlockAt.getTime() - Date.now();
    if (diff <= 0) {
      locked = false;
      if (intervalId) clearInterval(intervalId);
      return;
    }
    locked = true;
    const totalSec = Math.floor(diff / 1000);
    days    = Math.floor(totalSec / 86400);
    hours   = Math.floor((totalSec % 86400) / 3600);
    minutes = Math.floor((totalSec % 3600) / 60);
    seconds = totalSec % 60;
  }

  onMount(() => {
    if (!isValidDate(unlockAt) || Date.now() >= unlockAt.getTime()) {
      locked = false;
      mounted = true;
      return;
    }
    computeCountdown();
    intervalId = setInterval(computeCountdown, 1000);
    mounted = true;
  });

  onDestroy(() => {
    if (intervalId) clearInterval(intervalId);
  });

  function pad(n) {
    return String(n).padStart(2, '0');
  }
</script>

{#if mounted}
  {#if locked}
    <div class="tl-wrap" role="status" aria-label="This post is time-locked">
      <div class="tl-card">
        <div class="tl-icon-row">
          <iconify-icon icon="material-symbols:lock-outline" width="36" class="tl-lock-icon"></iconify-icon>
        </div>
        <h2 class="tl-heading">This post is time-locked</h2>
        <p class="tl-sub">Come back when it unlocks.</p>

        <div class="tl-countdown" aria-live="polite">
          <div class="tl-unit">
            <span class="tl-num">{pad(days)}</span>
            <span class="tl-label">days</span>
          </div>
          <span class="tl-sep">:</span>
          <div class="tl-unit">
            <span class="tl-num">{pad(hours)}</span>
            <span class="tl-label">hrs</span>
          </div>
          <span class="tl-sep">:</span>
          <div class="tl-unit">
            <span class="tl-num">{pad(minutes)}</span>
            <span class="tl-label">min</span>
          </div>
          <span class="tl-sep">:</span>
          <div class="tl-unit">
            <span class="tl-num">{pad(seconds)}</span>
            <span class="tl-label">sec</span>
          </div>
        </div>

        <div class="tl-unlock-date">
          Unlocks {unlockAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {unlockAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
        </div>
      </div>
    </div>
  {:else}
    <slot />
  {/if}
{/if}

<style>
  .tl-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    min-height: 320px;
  }

  .tl-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-large);
    padding: 40px 48px;
    max-width: 480px;
    width: 100%;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    position: relative;
    overflow: hidden;
  }

  .tl-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
      oklch(0.70 0.10 var(--hue) / 0.04) 0%,
      transparent 60%);
    pointer-events: none;
  }

  .tl-icon-row {
    margin-bottom: 16px;
  }

  .tl-lock-icon {
    color: var(--primary);
    opacity: 0.8;
    display: inline-block;
    animation: tl-pulse 3s ease-in-out infinite;
  }

  @keyframes tl-pulse {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.06); opacity: 1; }
  }

  .tl-heading {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 22px;
    color: var(--fg-1);
    margin: 0 0 8px;
    letter-spacing: -0.01em;
  }

  .tl-sub {
    font-size: 14px;
    color: var(--fg-3);
    margin: 0 0 28px;
    line-height: 1.5;
  }

  .tl-countdown {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 20px;
  }

  .tl-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    background: var(--btn-regular-bg);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 12px 16px;
    min-width: 64px;
  }

  .tl-num {
    font-family: var(--font-mono);
    font-weight: 800;
    font-size: 28px;
    color: var(--primary);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .tl-label {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--fg-4);
  }

  .tl-sep {
    font-family: var(--font-mono);
    font-size: 24px;
    font-weight: 700;
    color: var(--fg-4);
    margin-bottom: 18px;
    line-height: 1;
  }

  .tl-unlock-date {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--fg-4);
    letter-spacing: 0.04em;
  }

  @media (max-width: 480px) {
    .tl-card { padding: 28px 20px; }
    .tl-num { font-size: 22px; }
    .tl-unit { min-width: 52px; padding: 10px 12px; }
  }
</style>
