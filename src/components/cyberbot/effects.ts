// ── DOM visual effects for NX-7 CyberBot ────────────────────────────────────
// Pure side-effect helpers that create/animate DOM elements.
// None of these touch Svelte reactive state.

/** Ref object used to track the glitch interval so the component can clear it on unmount. */
export interface GlitchIvRef {
  current: ReturnType<typeof setInterval> | null;
}

/** Returns the current CSS --hue value from the document root. */
export function getHue(): number {
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hue')) || 30;
}

/** Pick a random element from an array. */
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Returns all visible elements matching `sel` (in viewport, not in top nav). */
export function visEls(sel: string): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(sel)).filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.top > 60 && r.bottom < window.innerHeight - 20;
  });
}

/** Highlight a random visible paragraph with a translucent overlay. */
export function highlightParagraph(): HTMLElement | null {
  const el = pick(visEls('.post-body p, .post-item p'));
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const ov = document.createElement('div');
  ov.style.cssText = `position:fixed;left:${r.left-2}px;top:${r.top-2}px;width:${r.width+4}px;height:${r.height+4}px;background:linear-gradient(120deg,oklch(0.92 0.18 92/0.35),oklch(0.90 0.20 60/0.45));border-radius:6px;z-index:9990;pointer-events:none;mix-blend-mode:multiply;opacity:0;transition:opacity .35s,transform .35s;transform:translateY(-4px);`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => { ov.style.opacity = '1'; ov.style.transform = 'translateY(0)'; });
  setTimeout(() => { ov.style.opacity = '0'; setTimeout(() => ov.remove(), 400); }, 2400);
  return el;
}

/**
 * Glitch-animate a random visible heading.
 * Returns the interval id so the caller can clear it on unmount if needed.
 */
export function glitchHeading(glitchIvRef: { current: ReturnType<typeof setInterval> | null }): HTMLElement | null {
  const el = pick(visEls('.post-body h2, h1.title, h3, .archive-year'));
  if (!el) return null;
  const orig = el.style.cssText;
  let n = 0;
  if (glitchIvRef.current !== null) clearInterval(glitchIvRef.current);
  glitchIvRef.current = setInterval(() => {
    n++;
    const dx = (Math.random() - .5) * 5, dy = (Math.random() - .5) * 3, h = getHue();
    el.style.cssText = orig + `;transform:translate(${dx}px,${dy}px);text-shadow:${dx}px 0 oklch(0.6 0.3 ${(h + 180) % 360}),${-dx}px 0 oklch(0.6 0.3 ${(h + 60) % 360});`;
    if (n > 9) { clearInterval(glitchIvRef.current!); glitchIvRef.current = null; el.style.cssText = orig; }
  }, 55);
  return el;
}

/** Attach an animated sticky note to a random visible card. */
export function stickyNote(): HTMLElement | null {
  const c = pick(visEls('.card, .post-item, .archive-row, .profile')) as HTMLElement & { __nx7sticky?: boolean };
  if (!c || c.__nx7sticky) return null;
  c.__nx7sticky = true;
  const lines = ['→ read this one', 'rebiz wrote this past midnight', 'good vibes here ♡', 'underrated', 'TODO: reread', '★ favourite', 'pinned in my heart', 'hmmm. interesting.'];
  const n = document.createElement('div');
  n.textContent = pick(lines);
  const t = (Math.random() - .5) * 12;
  n.style.cssText = `position:absolute;top:-14px;left:50%;padding:8px 12px 10px;background:oklch(0.92 0.10 92);color:oklch(0.30 0.05 60);font-family:'Comic Sans MS',monospace;font-size:11.5px;line-height:1.2;border-radius:2px;box-shadow:0 4px 12px rgba(0,0,0,0.18);transform:translateX(-50%) translateY(-20px) rotate(${t}deg) scale(.6);opacity:0;transition:transform .45s cubic-bezier(.34,1.56,.64,1),opacity .3s;z-index:20;pointer-events:none;max-width:140px;font-weight:600;`;
  if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
  c.appendChild(n);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    n.style.transform = `translateX(-50%) translateY(0) rotate(${t}deg) scale(1)`;
    n.style.opacity = '1';
  }));
  setTimeout(() => {
    n.style.opacity = '0';
    n.style.transform = `translateX(-50%) translateY(-12px) rotate(${t}deg) scale(.9)`;
    setTimeout(() => { n.remove(); delete c.__nx7sticky; }, 500);
  }, 6500);
  return c;
}

/** Draw an animated squiggly underline below a random visible link/heading. */
export function scribbleUnder(): HTMLElement | null {
  const link = pick(visEls('a.nav-link, .post-body a, .post-body h2, .archive-row'));
  if (!link) return null;
  const r = link.getBoundingClientRect();
  const h = getHue();
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 14');
  svg.style.cssText = `position:fixed;left:${r.left}px;top:${r.bottom - 1}px;width:${r.width}px;height:12px;z-index:9990;pointer-events:none;overflow:visible;`;
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M 0 6 C 8 1,16 11,24 6 S 40 1,48 6 S 64 11,72 6 S 88 1,100 6');
  path.setAttribute('stroke', `oklch(0.65 0.20 ${h})`);
  path.setAttribute('stroke-width', '2.4');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('filter', `drop-shadow(0 0 4px oklch(0.65 0.20 ${h}))`);
  svg.appendChild(path);
  document.body.appendChild(svg);
  const len = path.getTotalLength();
  path.style.strokeDasharray = String(len);
  path.style.strokeDashoffset = String(len);
  path.style.transition = 'stroke-dashoffset .9s ease-out,opacity .4s';
  requestAnimationFrame(() => { path.style.strokeDashoffset = '0'; });
  setTimeout(() => { path.style.opacity = '0'; setTimeout(() => svg.remove(), 450); }, 3200);
  return link;
}

/** Flash a radial gradient overlay across the screen. */
export function screenRipple(): void {
  const r = document.createElement('div');
  r.style.cssText = `position:fixed;inset:0;background:radial-gradient(circle at 50% 30%,oklch(0.85 0.20 var(--hue)/0.18),transparent 60%);z-index:9985;pointer-events:none;opacity:0;transition:opacity .4s;`;
  document.body.appendChild(r);
  requestAnimationFrame(() => { r.style.opacity = '1'; });
  setTimeout(() => { r.style.opacity = '0'; setTimeout(() => r.remove(), 400); }, 600);
}

/** Show concentric ripple rings + corner reticle brackets centred on (cx, cy). */
export function markTarget(cx: number, cy: number, el: HTMLElement | null): void {
  const h = getHue();
  for (let i = 0; i < 3; i++) {
    const ring = document.createElement('div');
    const size = 24 + i * 18;
    ring.style.cssText = `position:fixed;left:${cx - size / 2}px;top:${cy - size / 2}px;width:${size}px;height:${size}px;border-radius:50%;border:${1.5 - i * .3}px solid oklch(0.85 0.22 ${h}/${1 - i * .25});box-shadow:0 0 ${8 + i * 4}px oklch(0.75 0.22 ${h}/${0.6 - i * .15});z-index:9998;pointer-events:none;opacity:0;transform:scale(2.5);transition:transform ${.35 + i * .12}s cubic-bezier(.2,.8,.4,1) ${i * .06}s, opacity .2s ${i * .06}s;`;
    document.body.appendChild(ring);
    requestAnimationFrame(() => { ring.style.opacity = '1'; ring.style.transform = 'scale(1)'; });
    setTimeout(() => { ring.style.opacity = '0'; ring.style.transition = 'opacity .4s'; setTimeout(() => ring.remove(), 420); }, 1400 + i * 120);
  }
  if (el) {
    const r = el.getBoundingClientRect();
    const pad = 4, arm = 10;
    const corners = [
      { t: r.top - pad,        l: r.left - pad,        bt: 'border-top',    bl: 'border-left' },
      { t: r.top - pad,        l: r.right + pad - arm,  bt: 'border-top',    bl: 'border-right' },
      { t: r.bottom + pad - arm, l: r.left - pad,       bt: 'border-bottom', bl: 'border-left' },
      { t: r.bottom + pad - arm, l: r.right + pad - arm, bt: 'border-bottom', bl: 'border-right' },
    ];
    for (const c of corners) {
      const d = document.createElement('div');
      const b = `1.5px solid oklch(0.85 0.22 ${h})`;
      d.style.cssText = `position:fixed;top:${c.t}px;left:${c.l}px;width:${arm}px;height:${arm}px;${c.bt}:${b};${c.bl}:${b};z-index:9998;pointer-events:none;opacity:0;transform:scale(0.4);transition:opacity .25s,transform .4s cubic-bezier(.34,1.56,.64,1);box-shadow:0 0 6px oklch(0.75 0.22 ${h}/0.5);`;
      document.body.appendChild(d);
      requestAnimationFrame(() => { d.style.opacity = '1'; d.style.transform = 'scale(1)'; });
      setTimeout(() => { d.style.opacity = '0'; d.style.transition = 'opacity .35s'; setTimeout(() => d.remove(), 360); }, 1800);
    }
    const dot = document.createElement('div');
    dot.style.cssText = `position:fixed;left:${cx - 3}px;top:${cy - 3}px;width:6px;height:6px;border-radius:50%;background:oklch(0.92 0.22 ${h});box-shadow:0 0 12px oklch(0.85 0.22 ${h}),0 0 24px oklch(0.75 0.22 ${h}/0.5);z-index:9999;pointer-events:none;opacity:0;transform:scale(0);transition:opacity .2s,transform .3s cubic-bezier(.34,1.8,.64,1);`;
    document.body.appendChild(dot);
    requestAnimationFrame(() => { dot.style.opacity = '1'; dot.style.transform = 'scale(1)'; });
    setTimeout(() => { dot.style.opacity = '0'; dot.style.transition = 'opacity .4s'; setTimeout(() => dot.remove(), 420); }, 1600);
  }
}

/** Emit sparkle particles outward from (x, y). */
export function sparkle(x: number, y: number, count = 6): void {
  const h = getHue();
  for (let i = 0; i < count; i++) {
    const sp = document.createElement('div');
    const ang = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 20 + Math.random() * 25;
    sp.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:5px;height:5px;border-radius:50%;background:oklch(0.92 0.22 ${h});box-shadow:0 0 8px oklch(0.85 0.22 ${h});z-index:9999;pointer-events:none;transition:transform .5s cubic-bezier(.4,0,.2,1),opacity .5s;`;
    document.body.appendChild(sp);
    requestAnimationFrame(() => { sp.style.transform = `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist}px) scale(.3)`; sp.style.opacity = '0'; });
    setTimeout(() => sp.remove(), 520);
  }
}

/**
 * Spawn ghost duplicates of the bot element radiating outward.
 * @param elRef  The bot's root DOM element (bound via Svelte bind:this).
 */
export function spawnGhosts(elRef: HTMLElement | null): void {
  const me = elRef?.getBoundingClientRect();
  if (!me) return;
  const h = getHue();
  for (let i = 0; i < 3; i++) {
    const g = document.createElement('div');
    g.style.cssText = `position:fixed;left:${me.left}px;top:${me.top}px;width:${me.width}px;height:${me.height}px;border-radius:8px;background:linear-gradient(160deg,oklch(0.72 0.20 ${h + i * 60}/0.55),oklch(0.45 0.15 ${h + i * 60}/0.25));border:1px solid oklch(0.72 0.20 ${h + i * 60}/0.6);filter:blur(2.5px);mix-blend-mode:screen;opacity:.45;z-index:9993;pointer-events:none;transition:transform 1s ease-out,opacity 1.1s;`;
    document.body.appendChild(g);
    const dx = (Math.random() - .5) * 200, dy = (Math.random() - .5) * 130;
    setTimeout(() => { g.style.transform = `translate(${dx}px,${dy}px) scale(${.5 + Math.random() * .7}) rotate(${(Math.random() - .5) * 20}deg)`; g.style.opacity = '0'; }, i * 80 + 40);
    setTimeout(() => g.remove(), 1700 + i * 80);
  }
}

/** Spawn an impact burst at (x, y). */
export function spawnImpact(x: number, y: number): void {
  const h = getHue();
  const burst = document.createElement('div');
  burst.textContent = '💥';
  burst.style.cssText = `position:fixed;left:${x - 18}px;top:${y - 18}px;font-size:32px;z-index:9999;pointer-events:none;opacity:0;transform:scale(0.4) rotate(-20deg);transition:opacity .2s,transform .35s cubic-bezier(.34,1.8,.64,1);`;
  document.body.appendChild(burst);
  requestAnimationFrame(() => { burst.style.opacity = '1'; burst.style.transform = 'scale(1.2) rotate(8deg)'; });
  setTimeout(() => { burst.style.opacity = '0'; burst.style.transform = 'scale(.9) rotate(15deg) translateY(-8px)'; setTimeout(() => burst.remove(), 400); }, 700);
  for (let i = 0; i < 6; i++) {
    const sp = document.createElement('div');
    sp.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:4px;height:4px;border-radius:999px;background:oklch(0.92 0.22 ${h});z-index:9998;pointer-events:none;transition:transform .55s ease,opacity .55s;`;
    document.body.appendChild(sp);
    const ang = (i / 6) * Math.PI * 2, dist = 30 + Math.random() * 20;
    requestAnimationFrame(() => { sp.style.transform = `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist}px) scale(.4)`; sp.style.opacity = '0'; });
    setTimeout(() => sp.remove(), 600);
  }
}

/** Slap a floating label badge onto a target element. */
export function slapLabel(target: HTMLElement & { __nx7slap?: boolean }, text: string): void {
  if (target.__nx7slap) return;
  target.__nx7slap = true;
  const h = getHue();
  const label = document.createElement('div');
  label.textContent = text;
  const t = -4 + Math.random() * 8;
  label.style.cssText = `position:absolute;top:-22px;left:50%;padding:5px 11px 6px;background:oklch(0.85 0.22 ${h});color:oklch(0.18 0.06 ${h});font-family:var(--font-sans),sans-serif;font-size:11px;font-weight:900;letter-spacing:.08em;border-radius:6px;box-shadow:0 6px 18px oklch(0.55 0.20 ${h}/0.5);transform:translateX(-50%) translateY(-8px) rotate(${t}deg) scale(.4);opacity:0;transition:transform .35s cubic-bezier(.34,1.8,.64,1),opacity .25s;z-index:21;pointer-events:none;white-space:nowrap;`;
  if (getComputedStyle(target).position === 'static') target.style.position = 'relative';
  target.appendChild(label);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    label.style.transform = `translateX(-50%) translateY(0) rotate(${t}deg) scale(1.1)`;
    label.style.opacity = '1';
    setTimeout(() => { label.style.transform = `translateX(-50%) translateY(0) rotate(${t}deg) scale(1)`; }, 350);
  }));
  setTimeout(() => {
    label.style.transform = `translateX(-50%) translateY(-14px) rotate(${t * 1.5}deg) scale(.85)`;
    label.style.opacity = '0';
    setTimeout(() => { label.remove(); delete target.__nx7slap; }, 400);
  }, 4500);
}
