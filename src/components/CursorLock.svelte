<script>
  import { onMount } from 'svelte';

  onMount(() => {
    if (window.matchMedia('(hover: none)').matches) return;

    const cursor = document.createElement('div');
    cursor.id = 'cl-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<div class="cl-content"></div>';
    document.body.appendChild(cursor);

    const DEFAULT_SIZE = '1em';
    let isCursorLocked = false;
    let unlockTimer    = null;
    let activeMag      = null; // for scroll re-anchor

    // ── original logic, verbatim ──────────────────────────────────

    document.addEventListener('mousedown', () => {
      if (!isCursorLocked) cursor.style.setProperty('--scale', 0.9);
    });

    document.addEventListener('mouseup', () => {
      if (!isCursorLocked) cursor.style.setProperty('--scale', 1);
    });

    document.addEventListener('mousemove', ({ clientX, clientY }) => {
      if (!isCursorLocked) {
        cursor.style.setProperty('--top',  clientY + 'px');
        cursor.style.setProperty('--left', clientX + 'px');
      }
    });

    // text elements → thin bar
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption').forEach((p) => {
      p.addEventListener('mouseover', () => {
        if (isCursorLocked) return;
        cursor.style.setProperty('--width',  '0.2em');
        cursor.style.setProperty('--height', '1.5em');
      }, { passive: true });
      p.addEventListener('mouseout', () => {
        if (isCursorLocked) return;
        cursor.style.setProperty('--width',  DEFAULT_SIZE);
        cursor.style.setProperty('--height', DEFAULT_SIZE);
      }, { passive: true });
    });

    // ── card wrapping: bubble up to nearest card container ────────
    const CARD_SEL = 'article, [data-cursor-card]';

    document.querySelectorAll('a, button, [data-cursor-lock]').forEach((a) => {
      let rect = null;
      let mag  = null; // the element that physically moves + gets the cursor overlay

      a.addEventListener('mouseenter', ({ target }) => {
        // Cancel pending is-locked removal so we never flash dot between elements
        if (unlockTimer) { clearTimeout(unlockTimer); unlockTimer = null; }

        // Clean up previous mag without resetting cursor position/size
        if (activeMag && activeMag !== mag) {
          activeMag.classList.remove('cl-target');
          activeMag.style.setProperty('--cl-tx',    '0');
          activeMag.style.setProperty('--cl-ty',    '0');
          activeMag.style.setProperty('--cl-scale', '1');
        }

        isCursorLocked = true;

        const card = target.matches(CARD_SEL) ? target : target.closest(CARD_SEL);
        mag = activeMag = card || target;

        rect = mag.getBoundingClientRect();

        // ── glitch fix: strip is-locked so top/left have NO transition,
        //   commit position instantly, then restore is-locked next frame
        //   so only width/height animate.
        cursor.classList.remove('is-locked');
        cursor.style.setProperty('--top',    rect.top  + rect.height / 2 + 'px');
        cursor.style.setProperty('--left',   rect.left + rect.width  / 2 + 'px');
        cursor.style.setProperty('--width',  rect.width  + 'px');
        cursor.style.setProperty('--height', rect.height + 'px');
        cursor.style.setProperty('--translateX', '0');
        cursor.style.setProperty('--translateY', '0');
        requestAnimationFrame(() => cursor.classList.add('is-locked'));

        const br = getComputedStyle(mag).borderRadius || '0.6em';
        cursor.style.setProperty('--cl-br', br);

        mag.classList.add('cl-target');
        mag.style.setProperty('--cl-scale', card ? '1.02' : '1.05');
      }, { passive: true });

      a.addEventListener('mousemove', ({ clientX, clientY }) => {
        if (!rect || !mag) return;
        const halfH    = rect.height / 2;
        const halfW    = rect.width  / 2;
        const topOff   = (clientY - rect.top  - halfH) / halfH;
        const leftOff  = (clientX - rect.left - halfW) / halfW;

        // cursor content wobbles (original: 3px)
        cursor.style.setProperty('--translateX', `${leftOff * 3}px`);
        cursor.style.setProperty('--translateY', `${topOff  * 3}px`);

        // magnetic element pull — cards subtler than standalone links
        const str = mag.matches(CARD_SEL) ? 5 : 8;
        mag.style.setProperty('--cl-tx', `${leftOff * str}px`);
        mag.style.setProperty('--cl-ty', `${topOff  * (str * 0.65)}px`);
      }, { passive: true });

      a.addEventListener('mouseleave', ({ target }) => {
        isCursorLocked = false;

        // original: reset size + translate immediately on leave
        cursor.style.setProperty('--width',      DEFAULT_SIZE);
        cursor.style.setProperty('--height',     DEFAULT_SIZE);
        cursor.style.setProperty('--translateX', '0');
        cursor.style.setProperty('--translateY', '0');

        if (mag) {
          mag.style.setProperty('--cl-tx',    '0');
          mag.style.setProperty('--cl-ty',    '0');
          mag.style.setProperty('--cl-scale', '1');
        }

        const prev = mag;
        // original: remove is-locked after 100ms so size transition plays out
        unlockTimer = setTimeout(() => {
          unlockTimer = null;
          if (!isCursorLocked) {
            cursor.classList.remove('is-locked');
            if (prev) prev.classList.remove('cl-target');
            activeMag = null;
          }
        }, 100);

        mag  = null;
        rect = null;
      }, { passive: true });
    });

    // ── scroll: keep overlay on correct position ──────────────────
    window.addEventListener('scroll', () => {
      if (!isCursorLocked || !activeMag) return;
      const r = activeMag.getBoundingClientRect();
      cursor.style.setProperty('--top',    r.top  + r.height / 2 + 'px');
      cursor.style.setProperty('--left',   r.left + r.width  / 2 + 'px');
      cursor.style.setProperty('--width',  r.width  + 'px');
      cursor.style.setProperty('--height', r.height + 'px');
    }, { passive: true });

    document.addEventListener('astro:after-swap', () => {
      if (!document.getElementById('cl-cursor')) document.body.appendChild(cursor);
    });

    return () => cursor.remove();
  });
</script>

<!-- Sentinel so Svelte has a scopable element; cursor DOM is injected via JS -->
<span aria-hidden="true" style="display:none"></span>

<style>
  :global(html), :global(body), :global(*) { cursor: none !important; }

  /* ── shell (original .cursor) ────────────────────────────────── */
  :global(#cl-cursor) {
    position: fixed;
    height: var(--height, 1em);
    width:  var(--width,  1em);
    left:   var(--left,  -1em);
    top:    var(--top,   -1em);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%) scale(var(--scale, 1));
    /* default: only size animates */
    transition-property: width, height;
    transition-duration: 0.1s;
    transition-timing-function: ease-out;
  }

  /* locked: size + position animate (original behaviour) */
  :global(#cl-cursor.is-locked) {
    transition-property: width, height, left, top;
  }

  /* ── pill (original .cursor__content) ────────────────────────── */
  :global(.cl-content) {
    position: absolute;
    inset: 0;
    border-radius: var(--cl-br, 0.6em);
    opacity: 0.3;
    transform: translate(var(--translateX, 0), var(--translateY, 0));
    transition-property: opacity;
    transition-duration: 0.1s;
    transition-timing-function: ease-out;

    /* light mode: dark pill (original) */
    background-color: #000;
  }

  :global(#cl-cursor.is-locked .cl-content) {
    opacity: 0.06;
  }

  /* dark mode: flip to white pill */
  :global(html.dark) :global(.cl-content) {
    background-color: #fff;
    opacity: 0.25;
  }
  :global(html.dark) :global(#cl-cursor.is-locked .cl-content) {
    opacity: 0.1;
  }

  /* ── magnetic pull on locked elements ────────────────────────── */
  :global(.cl-target) {
    transform: translate(var(--cl-tx, 0), var(--cl-ty, 0)) scale(var(--cl-scale, 1)) !important;
    transition: transform 0.1s ease-out, opacity 0.1s ease-out !important;
  }
  :global(.cl-target:active) {
    opacity: 0.5;
    transform: translate(var(--cl-tx, 0), var(--cl-ty, 0)) scale(1) !important;
  }
</style>
