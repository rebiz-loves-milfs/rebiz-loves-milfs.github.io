// ── Physics / gravity helpers for NX-7 CyberBot ─────────────────────────────

/** Returns true when running on a narrow (mobile) viewport. */
export function isMobile(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 640;
}

export interface FallState {
  el:        HTMLElement;
  origStyle: string;
  origX:     number;
  origY:     number;
  w:         number;
  h:         number;
  x:         number;
  y:         number;
  vy:        number;
  vx:        number;
  rot:       number;
  vrot:      number;
  settled:   boolean;
}

/**
 * Captures the current on-screen rect of each element and immediately
 * repositions it as `position:fixed` so it can be animated freely.
 * Returns the array of mutable fall states — caller drives the tick loop.
 */
export function captureFalls(
  targets: HTMLElement[],
): FallState[] {
  return targets.map(el => {
    const r         = el.getBoundingClientRect();
    const origStyle = el.getAttribute('style') ?? '';
    el.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;z-index:9950;pointer-events:none;transition:none;margin:0;box-sizing:border-box;`;
    return {
      el, origStyle,
      origX: r.left, origY: r.top,
      w: r.width,    h: r.height,
      x: r.left,     y: r.top,
      vy: 0,
      vx: (Math.random() - 0.5) * 80,
      rot: 0,
      vrot: (Math.random() - 0.5) * 200,
      settled: false,
    };
  });
}

const GRAVITY  = 1000;
const BOUNCE   = 0.32;
const FRICTION = 0.72;

/**
 * Runs the gravity/bounce physics loop until all elements have settled
 * (or the 5-second safety timeout fires).
 *
 * @param falls   Array produced by `captureFalls`.
 * @param onImpact  Called each time an element settles, with the impact x/y.
 */
export function simulateGravityFall(
  falls:    FallState[],
  onImpact: (x: number, y: number) => void,
): Promise<void> {
  return new Promise(resolve => {
    let lastT = performance.now();
    const tid = setTimeout(resolve, 5000);

    function tick(t: number) {
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;
      let allDone = true;

      for (const f of falls) {
        if (f.settled) continue;
        allDone = false;

        f.vy  += GRAVITY * dt;
        f.y   += f.vy   * dt;
        f.x   += f.vx   * dt;
        f.rot += f.vrot * dt;

        const floor = window.innerHeight - f.h - 10;
        if (f.y >= floor) {
          f.y   = floor;
          f.vy  = -Math.abs(f.vy) * BOUNCE;
          f.vx  *= FRICTION;
          f.vrot *= FRICTION;
          if (Math.abs(f.vy) < 30 && Math.abs(f.vx) < 8) {
            f.settled = true;
            onImpact(f.x + f.w / 2, floor + 5);
          }
        }

        f.el.style.left      = `${f.x}px`;
        f.el.style.top       = `${f.y}px`;
        f.el.style.transform = `rotate(${f.rot % 360}deg)`;
      }

      if (allDone) { clearTimeout(tid); resolve(); }
      else requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

/**
 * Animates each fallen element back to its original position, then
 * restores its original inline style so it re-enters normal document flow.
 *
 * @param f  A single fall state.
 */
export function restoreElement(f: FallState): void {
  f.el.style.transition = 'top .7s cubic-bezier(.34,1.56,.64,1),left .6s ease-out,transform .65s cubic-bezier(.34,1.3,.64,1)';
  f.el.style.top        = `${f.origY}px`;
  f.el.style.left       = `${f.origX}px`;
  f.el.style.transform  = 'rotate(0deg)';

  // After the transition completes, put the original style back
  setTimeout(() => {
    if (f.origStyle) f.el.setAttribute('style', f.origStyle);
    else             f.el.removeAttribute('style');
  }, 750);
}
