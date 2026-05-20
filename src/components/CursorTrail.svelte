<script>
  import { onMount } from 'svelte';

  onMount(() => {
    if (window.matchMedia('(hover: none)').matches) return;

    // ── Single morphing cursor element ────────────────────────────
    const cursor = document.createElement('div');
    cursor.id = 'mk-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<span id="mk-cursor-label"></span>';
    document.body.appendChild(cursor);
    const label = document.getElementById('mk-cursor-label');

    // ── Lerp state ────────────────────────────────────────────────
    let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
    let curX   = mouseX,         curY   = mouseY;
    const EASE = 0.18;
    let raf;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function tick() {
      raf = requestAnimationFrame(tick);
      curX += (mouseX - curX) * EASE;
      curY += (mouseY - curY) * EASE;
      cursor.style.transform = `translate(${curX}px,${curY}px) translate(-50%,-50%)`;
    }
    tick();

    // ── State helpers ─────────────────────────────────────────────
    const LABELS = { view: 'View', drag: 'Drag', read: 'Read', play: 'Play', open: 'Open' };

    function set(state, text) {
      cursor.className = state ? `is-${state}` : '';
      label.textContent = text ?? '';
    }

    // ── Delegation via mouseover / mouseout ───────────────────────
    // More robust than pre-binding: works after SPA navigation
    document.addEventListener('mouseover', (e) => {
      // Priority 1: explicit data-cursor attribute
      const dc = e.target.closest('[data-cursor]');
      if (dc) {
        const type = dc.dataset.cursor;
        set(type, LABELS[type] ?? type);
        return;
      }
      // Priority 2: links and buttons → ring
      if (e.target.closest('a, button')) {
        set('link');
        return;
      }
      // Priority 3: post card links → Read
      if (e.target.closest('.post-card-link')) {
        set('read', 'Read');
        return;
      }
      // Default: dot
      set(null);
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      // Only clear when leaving to a non-interactive element
      const to = e.relatedTarget;
      if (!to || to === document.documentElement) set(null);
    }, { passive: true });

    // ── Re-run state on Astro view transitions ────────────────────
    document.addEventListener('astro:after-swap', () => {
      if (!document.getElementById('mk-cursor')) {
        document.body.appendChild(cursor);
      }
      set(null);
    });

    return () => {
      cancelAnimationFrame(raf);
      cursor.remove();
    };
  });
</script>

<style>
  /* ── Hide native cursor on pointer devices ──────────────────── */
  :global(html), :global(body), :global(*) { cursor: none !important; }

  /* ─────────────────────────────────────────────────────────────
     Base cursor — 8px dot
     Color uses --fg-1 so it's dark in light mode, light in dark mode
  ────────────────────────────────────────────────────────────── */
  :global(#mk-cursor) {
    position: fixed;
    top: 0; left: 0;
    width: 8px;
    height: 8px;
    background: var(--fg-1, #0a0a0a);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    will-change: transform, width, height;
    transition:
      width      0.35s cubic-bezier(0.23, 1, 0.32, 1),
      height     0.35s cubic-bezier(0.23, 1, 0.32, 1),
      background 0.30s ease,
      border     0.30s ease,
      box-shadow 0.30s ease;
  }

  :global(#mk-cursor-label) {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.25s ease;
    /* label is always light text — works on dark cursor fill */
    color: oklch(0.97 0.005 var(--hue, 30));
    user-select: none;
  }

  /* ── is-link: expand to hollow ring ──────────────────────────── */
  :global(#mk-cursor.is-link) {
    width: 46px;
    height: 46px;
    background: transparent;
    border: 1.5px solid var(--fg-1, #0a0a0a);
  }

  /* ── is-view: large dot + "View" ─────────────────────────────── */
  :global(#mk-cursor.is-view) {
    width: 88px;
    height: 88px;
    background: oklch(0.14 0.018 var(--hue, 30));
  }
  :global(html.dark #mk-cursor.is-view) {
    background: oklch(0.78 0.16 var(--hue, 30));
  }
  :global(#mk-cursor.is-view #mk-cursor-label) { opacity: 1; }

  /* ── is-drag: large dot + "Drag" ─────────────────────────────── */
  :global(#mk-cursor.is-drag) {
    width: 80px;
    height: 80px;
    background: oklch(0.14 0.018 var(--hue, 30));
  }
  :global(html.dark #mk-cursor.is-drag) {
    background: oklch(0.78 0.16 var(--hue, 30));
  }
  :global(#mk-cursor.is-drag #mk-cursor-label) { opacity: 1; }

  /* ── is-read: large dot + "Read" (blog cards) ────────────────── */
  :global(#mk-cursor.is-read) {
    width: 76px;
    height: 76px;
    background: oklch(0.14 0.018 var(--hue, 30));
  }
  :global(html.dark #mk-cursor.is-read) {
    background: oklch(0.78 0.16 var(--hue, 30));
  }
  :global(#mk-cursor.is-read #mk-cursor-label) { opacity: 1; }

  /* ── is-play ──────────────────────────────────────────────────── */
  :global(#mk-cursor.is-play) {
    width: 72px;
    height: 72px;
    background: oklch(0.14 0.018 var(--hue, 30));
  }
  :global(html.dark #mk-cursor.is-play) {
    background: oklch(0.78 0.16 var(--hue, 30));
  }
  :global(#mk-cursor.is-play #mk-cursor-label) { opacity: 1; }

  /* ── dark mode label: invert to dark text on light accent fill ── */
  :global(html.dark #mk-cursor .cursor-label) {
    color: oklch(0.12 0.02 var(--hue, 30));
  }
  /* dark mode ring: use lighter fg */
  :global(html.dark #mk-cursor.is-link) {
    border-color: var(--fg-1);
  }
</style>
