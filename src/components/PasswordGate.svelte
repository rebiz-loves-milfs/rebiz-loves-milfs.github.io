<script>
  import { onMount } from 'svelte';

  export let encryptedContent = '';
  export let hint = '';

  let password = '';
  let error = '';
  let phase = 'idle'; // idle | loading | shaking | success
  let showPw = false;
  let inputEl;
  let gateEl;
  let contentEl;

  onMount(() => {
    inputEl?.focus();
    const saved = sessionStorage.getItem('post-pw-' + window.location.pathname);
    if (saved) attemptUnlock(saved, true);
  });

  async function loadCrypto() {
    if (typeof window.CryptoJS !== 'undefined') return;
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = '/assets/crypto-js.min.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  async function attemptUnlock(pwd, silent = false) {
    if (!pwd) { if (!silent) triggerShake('Enter a password.'); return; }
    phase = 'loading'; error = '';
    try {
      await loadCrypto();
      const bytes = window.CryptoJS.AES.decrypt(encryptedContent, pwd);
      const plain = bytes.toString(window.CryptoJS.enc.Utf8);
      if (!plain || !plain.startsWith('MIZUKI-VERIFY:')) {
        sessionStorage.removeItem('post-pw-' + window.location.pathname);
        if (!silent) triggerShake('Wrong password — try again.');
        else phase = 'idle';
        return;
      }
      sessionStorage.setItem('post-pw-' + window.location.pathname, pwd);
      // success path
      phase = 'success';
      const html = plain.replace('MIZUKI-VERIFY:', '');
      // wait for success animation to play before injecting
      await sleep(560);
      if (contentEl) {
        contentEl.innerHTML = html;
        contentEl.querySelectorAll('script').forEach(old => {
          const s = document.createElement('script');
          s.textContent = old.textContent;
          old.replaceWith(s);
        });
        contentEl.classList.add('pw-content-in');
        contentEl.style.display = 'block';
      }
      await sleep(40);
      if (gateEl) gateEl.style.display = 'none';
    } catch {
      triggerShake('Decryption failed. Try again.');
    }
  }

  function triggerShake(msg) {
    error = msg; phase = 'shaking';
    setTimeout(() => { phase = 'idle'; }, 520);
  }

  function submit(e) { e.preventDefault(); attemptUnlock(password); }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
</script>

<!-- Gate -->
<div id="pw-gate" bind:this={gateEl} class="gate-scene">

  <!-- decorative bg blobs -->
  <div class="gate-blob b1" aria-hidden="true"></div>
  <div class="gate-blob b2" aria-hidden="true"></div>

  <div class="gate-card" class:phase-loading={phase === 'loading'} class:phase-success={phase === 'success'}>

    <!-- lock icon ring -->
    <div class="gate-lock-ring" class:unlocking={phase === 'success'}>
      <div class="gate-lock-icon">
        {#if phase === 'success'}
          <iconify-icon icon="material-symbols:lock-open-outline" width="36"></iconify-icon>
        {:else}
          <iconify-icon icon="material-symbols:lock-outline" width="36"></iconify-icon>
        {/if}
      </div>
    </div>

    <div class="gate-text">
      <h2 class="gate-title">Password Protected</h2>
      <p class="gate-desc">This post is encrypted. Enter the password to unlock it.</p>
    </div>

    {#if hint}
      <div class="gate-hint">
        <iconify-icon icon="material-symbols:lightbulb-outline" width="12"></iconify-icon>
        Hint: {hint}
      </div>
    {/if}

    <form class="gate-form" class:shake={phase === 'shaking'} on:submit={submit}>
      <div class="gate-input-wrap" class:has-error={!!error && phase !== 'loading'}>
        <input
          bind:this={inputEl}
          bind:value={password}
          type={showPw ? 'text' : 'password'}
          placeholder="Enter password…"
          class="gate-input"
          disabled={phase === 'loading' || phase === 'success'}
          autocomplete="off"
          spellcheck="false"
        />
        <button
          type="button"
          class="pw-toggle"
          aria-label={showPw ? 'Hide password' : 'Show password'}
          tabindex="-1"
          on:click={() => showPw = !showPw}
        >
          <iconify-icon icon={showPw ? 'material-symbols:visibility-off-outline' : 'material-symbols:visibility-outline'} width="16"></iconify-icon>
        </button>
      </div>

      <button
        class="gate-btn"
        type="submit"
        disabled={phase === 'loading' || phase === 'success'}
      >
        {#if phase === 'loading'}
          <span class="gate-spinner"></span>
          Unlocking…
        {:else if phase === 'success'}
          <iconify-icon icon="material-symbols:check" width="16"></iconify-icon>
          Unlocked
        {:else}
          <iconify-icon icon="material-symbols:lock-open-outline" width="15"></iconify-icon>
          Unlock
        {/if}
      </button>
    </form>

    {#if error && phase !== 'loading' && phase !== 'success'}
      <p class="gate-error">
        <iconify-icon icon="material-symbols:error-outline" width="13"></iconify-icon>
        {error}
      </p>
    {/if}

  </div>
</div>

<!-- Revealed content injected here -->
<div id="pw-content" bind:this={contentEl} style="display:none"></div>

<style>
  /* ── Scene wrapper ──────────────────────────────────── */
  .gate-scene {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 56px 16px 72px;
    overflow: hidden;
  }

  /* ── Decorative blobs ───────────────────────────────── */
  .gate-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    pointer-events: none;
    opacity: 0.35;
    animation: blob-drift 8s ease-in-out infinite alternate;
  }
  .b1 {
    width: 320px; height: 320px;
    background: radial-gradient(circle, oklch(0.88 0.10 var(--hue)), transparent 70%);
    top: -80px; left: -60px;
    animation-delay: 0s;
  }
  .b2 {
    width: 260px; height: 260px;
    background: radial-gradient(circle, oklch(0.88 0.08 calc(var(--hue) + 60)), transparent 70%);
    bottom: -60px; right: -40px;
    animation-delay: -3s;
  }
  @keyframes blob-drift {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(20px, 15px) scale(1.08); }
  }

  /* ── Card ───────────────────────────────────────────── */
  .gate-card {
    position: relative; z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    width: 100%;
    max-width: 400px;
    padding: 40px 32px 32px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-large);
    text-align: center;
    box-shadow:
      0 2px 0 oklch(0.88 0.06 var(--hue) / 0.5),
      0 8px 32px rgba(0,0,0,0.08),
      0 2px 8px rgba(0,0,0,0.04);
    animation: gate-in 500ms cubic-bezier(.34,1.56,.64,1) both;
    transition: transform 400ms cubic-bezier(.4,0,.2,1), opacity 400ms, box-shadow 200ms;
  }
  .gate-card.phase-success {
    transform: scale(0.93);
    opacity: 0;
    pointer-events: none;
  }

  @keyframes gate-in {
    from { opacity: 0; transform: translateY(24px) scale(0.95); }
    to   { opacity: 1; transform: none; }
  }

  /* ── Lock ring ──────────────────────────────────────── */
  .gate-lock-ring {
    width: 80px; height: 80px;
    border-radius: 50%;
    background: var(--primary-soft);
    border: 2px solid oklch(0.85 0.08 var(--hue));
    display: flex; align-items: center; justify-content: center;
    color: var(--primary);
    position: relative;
    transition: background 300ms, border-color 300ms, transform 300ms;
    animation: ring-pulse 3s ease-in-out infinite;
  }
  .gate-lock-ring.unlocking {
    background: oklch(0.88 0.14 145 / 0.25);
    border-color: oklch(0.62 0.18 145);
    color: oklch(0.50 0.18 145);
    animation: ring-pop 400ms cubic-bezier(.34,1.56,.64,1) both;
  }
  @keyframes ring-pulse {
    0%,100% { box-shadow: 0 0 0 0 oklch(0.70 0.14 var(--hue) / 0.3); }
    50%      { box-shadow: 0 0 0 10px oklch(0.70 0.14 var(--hue) / 0); }
  }
  @keyframes ring-pop {
    from { transform: scale(0.8); }
    to   { transform: scale(1); }
  }

  .gate-lock-icon { display: flex; align-items: center; justify-content: center; }

  /* ── Text ───────────────────────────────────────────── */
  .gate-text { display: flex; flex-direction: column; gap: 6px; }
  .gate-title {
    font-family: var(--font-display); font-weight: 700;
    font-size: 22px; color: var(--fg-1); margin: 0; line-height: 1.2;
  }
  .gate-desc { font-size: 14px; color: var(--fg-2); line-height: 1.55; margin: 0; }

  /* ── Hint ───────────────────────────────────────────── */
  .gate-hint {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12px; color: var(--fg-3);
    background: var(--btn-regular-bg);
    padding: 5px 12px; border-radius: 999px;
    border: 1px solid var(--border);
  }

  /* ── Form ───────────────────────────────────────────── */
  .gate-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .gate-form.shake { animation: shake 500ms cubic-bezier(.36,.07,.19,.97) both; }

  @keyframes shake {
    10%, 90%  { transform: translateX(-2px); }
    20%, 80%  { transform: translateX(4px); }
    30%, 50%, 70% { transform: translateX(-6px); }
    40%, 60%  { transform: translateX(6px); }
  }

  /* input row */
  .gate-input-wrap {
    position: relative;
    display: flex; align-items: center;
    border: 1.5px solid var(--border);
    border-radius: 0.7rem;
    background: var(--page-bg);
    transition: border-color 150ms, box-shadow 150ms;
    overflow: hidden;
  }
  .gate-input-wrap:focus-within {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px oklch(0.70 0.14 var(--hue) / 0.15);
  }
  .gate-input-wrap.has-error {
    border-color: oklch(0.62 0.22 25);
    box-shadow: 0 0 0 3px oklch(0.62 0.22 25 / 0.12);
  }
  .gate-input {
    flex: 1;
    padding: 11px 14px;
    border: 0; outline: 0;
    background: transparent;
    color: var(--fg-1);
    font-family: var(--font-display);
    font-size: 15px;
    letter-spacing: 0.04em;
  }
  .gate-input::placeholder { color: var(--fg-4); letter-spacing: 0; }
  .gate-input:disabled { opacity: 0.5; }

  .pw-toggle {
    padding: 0 12px;
    border: 0; background: none; cursor: pointer;
    color: var(--fg-3);
    display: flex; align-items: center;
    transition: color 120ms;
    flex-shrink: 0;
  }
  .pw-toggle:hover { color: var(--primary); }

  /* submit button */
  .gate-btn {
    display: flex; align-items: center; justify-content: center; gap: 7px;
    width: 100%; padding: 11px 16px;
    border: 0; border-radius: 0.7rem;
    background: var(--primary); color: white;
    font-family: var(--font-display); font-size: 15px; font-weight: 600;
    cursor: pointer;
    transition: opacity 150ms, transform 100ms, background 200ms;
  }
  .gate-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .gate-btn:active:not(:disabled) { transform: scale(0.98); }
  .gate-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* loading spinner inside button */
  .gate-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Error line ─────────────────────────────────────── */
  .gate-error {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12.5px; color: oklch(0.52 0.22 25);
    margin: 0;
    animation: err-in 200ms ease both;
  }
  @keyframes err-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: none; }
  }

  /* ── Content reveal animation ───────────────────────── */
  :global(.pw-content-in) {
    animation: content-reveal 500ms cubic-bezier(.4,0,.2,1) both;
  }
  @keyframes content-reveal {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: none; }
  }
</style>
