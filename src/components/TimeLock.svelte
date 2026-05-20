<script>
  import { onMount, onDestroy } from 'svelte';
  import CryptoJS from 'crypto-js';

  export let unlockAt = undefined;
  export let encryptedContent = undefined;

  let phase = 'syncing'; // syncing | locked | unlocking | revealed
  let days = 0, hours = 0, minutes = 0, seconds = 0;
  let mounted = false;
  let intervalId = null;
  let serverOffset = 0;
  let cardEl, contentEl;

  // ── Server time sync ──────────────────────────────────────
  async function syncServerTime() {
    try {
      const t0 = Date.now();
      const res = await fetch('/robots.txt', { method: 'HEAD', cache: 'no-store' });
      const t1 = Date.now();
      const dateHeader = res.headers.get('Date');
      if (dateHeader) {
        const serverMs = new Date(dateHeader).getTime();
        serverOffset = serverMs - Math.round((t0 + t1) / 2);
      }
    } catch { /* keep offset = 0 */ }
  }

  function now() { return Date.now() + serverOffset; }
  function isValidDate(d) { return d instanceof Date && !isNaN(d.getTime()); }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
  function pad(n) { return String(n).padStart(2, '0'); }

  // ── Decrypt & inject content ──────────────────────────────
  function injectContent() {
    if (!contentEl) return;
    if (encryptedContent) {
      try {
        const key = String(unlockAt.getTime());
        const bytes = CryptoJS.AES.decrypt(encryptedContent, key);
        const raw = bytes.toString(CryptoJS.enc.Utf8);
        if (raw.startsWith('MIZUKI-TIMELOCK:')) {
          contentEl.innerHTML = raw.slice('MIZUKI-TIMELOCK:'.length);
          contentEl.querySelectorAll('script').forEach(old => {
            const s = document.createElement('script');
            s.textContent = old.textContent;
            old.replaceWith(s);
          });
        }
      } catch { /* decryption failed */ }
    }
    contentEl.style.display = '';
    // force reflow so animation triggers
    void contentEl.offsetHeight;
    contentEl.classList.add('tl-content-in');
  }

  async function triggerUnlock() {
    if (intervalId) clearInterval(intervalId);
    phase = 'unlocking';
    await sleep(700);
    phase = 'revealed';
    await sleep(20);
    injectContent();
  }

  function computeCountdown() {
    if (!isValidDate(unlockAt)) return;
    const diff = unlockAt.getTime() - now();
    if (diff <= 0) { triggerUnlock(); return; }
    const totalSec = Math.floor(diff / 1000);
    days    = Math.floor(totalSec / 86400);
    hours   = Math.floor((totalSec % 86400) / 3600);
    minutes = Math.floor((totalSec % 3600) / 60);
    seconds = totalSec % 60;
  }

  onMount(async () => {
    await syncServerTime();
    if (!isValidDate(unlockAt) || now() >= unlockAt.getTime()) {
      phase = 'revealed';
      mounted = true;
      await sleep(20);
      injectContent();
      return;
    }
    phase = 'locked';
    computeCountdown();
    intervalId = setInterval(computeCountdown, 1000);
    mounted = true;
  });

  onDestroy(() => { if (intervalId) clearInterval(intervalId); });
</script>

{#if mounted}
  {#if phase !== 'revealed'}
    <div class="tl-scene">
      <div class="tl-blob b1" aria-hidden="true"></div>
      <div class="tl-blob b2" aria-hidden="true"></div>

      <div class="tl-card" class:phase-unlocking={phase === 'unlocking'} bind:this={cardEl}>

        <div class="tl-lock-ring" class:unlocking={phase === 'unlocking'}>
          <div class="tl-lock-icon">
            {#if phase === 'unlocking'}
              <iconify-icon icon="material-symbols:lock-open-outline" width="36"></iconify-icon>
            {:else}
              <iconify-icon icon="material-symbols:lock-clock" width="36"></iconify-icon>
            {/if}
          </div>
        </div>

        {#if phase === 'unlocking'}
          <div class="tl-text">
            <h2 class="tl-heading">Unlocking…</h2>
            <p class="tl-sub">Decrypting your content.</p>
          </div>
        {:else}
          <div class="tl-text">
            <h2 class="tl-heading">Time-Locked Post</h2>
            <p class="tl-sub">This content unlocks in:</p>
          </div>

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
            {unlockAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            at {unlockAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </div>
        {/if}

      </div>
    </div>
  {/if}

  <div bind:this={contentEl} style="display:none">
    {#if !encryptedContent}<slot />{/if}
  </div>
{/if}

<style>
  /* ── Scene ──────────────────────────────────────────────── */
  .tl-scene {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 56px 16px 72px;
    overflow: hidden;
  }

  /* ── Blobs ──────────────────────────────────────────────── */
  .tl-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    pointer-events: none;
    opacity: 0.30;
    animation: blob-drift 8s ease-in-out infinite alternate;
  }
  .b1 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, oklch(0.78 0.14 55), transparent 70%);
    top: -80px; left: -60px;
    animation-delay: 0s;
  }
  .b2 {
    width: 240px; height: 240px;
    background: radial-gradient(circle, oklch(0.78 0.12 calc(var(--hue) + 40)), transparent 70%);
    bottom: -60px; right: -40px;
    animation-delay: -3s;
  }
  @keyframes blob-drift {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(20px, 15px) scale(1.08); }
  }

  /* ── Card ───────────────────────────────────────────────── */
  .tl-card {
    position: relative; z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    width: 100%;
    max-width: 420px;
    padding: 40px 32px 32px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-large);
    text-align: center;
    box-shadow:
      0 2px 0 oklch(0.78 0.14 55 / 0.35),
      0 8px 32px rgba(0,0,0,0.08),
      0 2px 8px rgba(0,0,0,0.04);
    animation: tl-card-in 500ms cubic-bezier(.34,1.56,.64,1) both;
    transition: transform 500ms cubic-bezier(.4,0,.2,1), opacity 500ms;
  }
  .tl-card.phase-unlocking {
    transform: scale(0.92);
    opacity: 0;
    pointer-events: none;
  }
  @keyframes tl-card-in {
    from { opacity: 0; transform: translateY(24px) scale(0.95); }
    to   { opacity: 1; transform: none; }
  }

  /* ── Lock ring ──────────────────────────────────────────── */
  .tl-lock-ring {
    width: 80px; height: 80px;
    border-radius: 50%;
    background: oklch(0.92 0.08 55 / 0.5);
    border: 2px solid oklch(0.72 0.14 55 / 0.6);
    display: flex; align-items: center; justify-content: center;
    color: oklch(0.52 0.18 55);
    position: relative;
    transition: background 300ms, border-color 300ms, transform 300ms, color 300ms;
    animation: ring-pulse 3s ease-in-out infinite;
  }
  .tl-lock-ring.unlocking {
    background: oklch(0.88 0.14 145 / 0.25);
    border-color: oklch(0.62 0.18 145);
    color: oklch(0.50 0.18 145);
    animation: ring-pop 400ms cubic-bezier(.34,1.56,.64,1) both;
  }
  .dark .tl-lock-ring {
    background: oklch(0.28 0.08 55 / 0.5);
    border-color: oklch(0.55 0.16 55 / 0.6);
    color: oklch(0.78 0.16 55);
  }
  @keyframes ring-pulse {
    0%,100% { box-shadow: 0 0 0 0 oklch(0.65 0.16 55 / 0.35); }
    50%      { box-shadow: 0 0 0 10px oklch(0.65 0.16 55 / 0); }
  }
  @keyframes ring-pop {
    from { transform: scale(0.8); }
    to   { transform: scale(1); }
  }
  .tl-lock-icon { display: flex; align-items: center; justify-content: center; }

  /* ── Text ───────────────────────────────────────────────── */
  .tl-text { display: flex; flex-direction: column; gap: 6px; }
  .tl-heading {
    font-family: var(--font-display); font-weight: 700;
    font-size: 22px; color: var(--fg-1); margin: 0; line-height: 1.2;
  }
  .tl-sub { font-size: 14px; color: var(--fg-2); margin: 0; line-height: 1.55; }

  /* ── Countdown ──────────────────────────────────────────── */
  .tl-countdown {
    display: flex; align-items: center; justify-content: center;
    gap: 8px; width: 100%;
  }
  .tl-unit {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    background: var(--btn-regular-bg);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 12px 14px;
    min-width: 60px;
  }
  .tl-num {
    font-family: var(--font-mono); font-weight: 800;
    font-size: 26px; color: oklch(0.52 0.18 55);
    line-height: 1; letter-spacing: -0.02em;
  }
  .dark .tl-num { color: oklch(0.78 0.16 55); }
  .tl-label {
    font-family: var(--font-mono); font-size: 10px;
    font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--fg-4);
  }
  .tl-sep {
    font-family: var(--font-mono); font-size: 22px;
    font-weight: 700; color: var(--fg-4);
    margin-bottom: 18px; line-height: 1;
  }

  /* ── Unlock date ────────────────────────────────────────── */
  .tl-unlock-date {
    font-family: var(--font-mono); font-size: 11px;
    color: var(--fg-4); letter-spacing: 0.04em;
  }

  /* ── Content reveal ─────────────────────────────────────── */
  :global(.tl-content-in) {
    animation: tl-content-reveal 500ms cubic-bezier(.4,0,.2,1) both;
  }
  @keyframes tl-content-reveal {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: none; }
  }

  @media (max-width: 480px) {
    .tl-card { padding: 28px 20px; }
    .tl-num { font-size: 20px; }
    .tl-unit { min-width: 50px; padding: 10px 10px; }
  }
</style>
