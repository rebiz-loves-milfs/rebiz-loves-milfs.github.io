// ── Behaviour routines for NX-7 CyberBot ────────────────────────────────────
// Each r_* function is a behaviour that the bot runs during its idle loop.
// All routines are created via createRoutines(ctx) so they can read/write
// Svelte reactive state without being inside the .svelte file.

import { D, T } from "./dialogs";
import { captureFalls, simulateGravityFall, restoreElement } from "./physics";
import {
  pick,
  getHue,
  visEls,
  highlightParagraph,
  stickyNote,
  scribbleUnder,
  screenRipple,
  markTarget,
  sparkle,
  spawnGhosts,
  spawnImpact,
  slapLabel,
} from "./effects";
import type { GlitchIvRef } from "./effects";

export interface BotContext {
  // Reactive state accessors
  getPos: () => { x: number; y: number };
  setPos: (v: { x: number; y: number }) => void;
  getEye: () => { x: number; y: number };
  setEye: (v: { x: number; y: number }) => void;
  getEyeMode: () => string;
  setEyeMode: (v: string) => void;
  getBotState: () => string;
  setBotState: (v: string) => void;
  getFacing: () => number;
  setFacing: (v: number) => void;
  getTilt: () => number;
  setTilt: (v: number) => void;
  getArm: () => { angle: number; length: number } | null;
  setArm: (v: { angle: number; length: number } | null) => void;
  getCursor: () => { x: number; y: number };
  getElRef: () => HTMLElement | null;
  glitchIvRef: GlitchIvRef;

  // Helpers provided by the component
  moveTo: (nx: number, ny: number, opts?: { speed?: number }) => Promise<void>;
  speak: (
    text: string,
    dur?: number,
    action?: { route: string; label: string } | null,
  ) => void;
  think: (text: string, dur?: number) => void;
  pause: (ms: number) => Promise<void>;
}

export function createRoutines(ctx: BotContext) {
  const { moveTo, speak, think, pause } = ctx;

  async function r_point() {
    const el = pick(
      visEls(".post-item,.anime-tile,.nav-link,.card,.archive-row,.profile"),
    );
    if (!el) return;
    const r = el.getBoundingClientRect();
    const side = r.left + r.width / 2 < window.innerWidth / 2 ? 1 : -1;
    await moveTo(
      r.left + r.width / 2 + side * (r.width / 2 + 60),
      r.top + r.height / 2 - 40,
    );
    const me = ctx.getElRef()?.getBoundingClientRect();
    if (!me) return;
    const angle =
      (Math.atan2(
        r.top + r.height / 2 - (me.top + 50),
        r.left + r.width / 2 - (me.left + me.width / 2),
      ) *
        180) /
      Math.PI;
    const length =
      Math.hypot(
        r.left + r.width / 2 - (me.left + me.width / 2),
        r.top + r.height / 2 - (me.top + 50),
      ) - 12;
    ctx.setArm({ angle, length });
    markTarget(r.left + r.width / 2, r.top + r.height / 2, el);
    speak(pick(D.point), 2500);
    await pause(2400);
    ctx.setArm(null);
  }

  async function r_trip() {
    const el = pick(
      visEls(
        ".post-body h1.title,.post-body h2,.post-item h3,.archive-row,.title-overlay,.post-body p",
      ),
    );
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pos = ctx.getPos();
    const side = pos.x < r.left + r.width / 2 ? 1 : -1;
    ctx.setFacing(side);
    await moveTo(side > 0 ? r.left - 70 : r.right + 10, r.top - 30, {
      speed: 3,
    });
    await moveTo(side > 0 ? r.left - 30 : r.right - 30, r.top - 30, {
      speed: 5,
    });
    ctx.setBotState("tripping");
    el.style.animation = "nx7-bumped 0.5s ease";
    setTimeout(() => {
      el.style.animation = "";
    }, 550);
    spawnImpact(side > 0 ? r.left : r.right, r.top + 30);
    ctx.setTilt(side > 0 ? 80 : -80);
    const p0 = ctx.getPos();
    ctx.setPos({ x: p0.x + side * 30, y: p0.y + 36 });
    const tripped = (el.textContent || "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 28);
    speak(`OUCH. WHO PUT "${tripped.split(" ")[0]}" THERE.`, 2400);
    await pause(1500);
    const p1 = ctx.getPos();
    ctx.setPos({ x: p1.x - side * 30, y: p1.y - 36 });
    ctx.setTilt(0);
    await pause(200);
    ctx.setBotState("idle");
  }

  async function r_climb() {
    const el = pick(visEls(".card,.post-item,.anime-cover"));
    if (!el) return;
    const r = el.getBoundingClientRect();
    await moveTo(r.left + r.width / 2 - 50, r.top - 110);
    ctx.setBotState("climbing");
    speak(pick(D.climb), 2800);
    await pause(2400);
    ctx.setBotState("idle");
  }

  async function r_knock() {
    await moveTo(window.innerWidth / 2 - 50, 100);
    ctx.setBotState("knocking");
    speak(pick(D.knock), 2200);
    for (let i = 0; i < 3; i++) {
      screenRipple();
      await pause(380);
    }
    ctx.setBotState("idle");
  }

  async function r_read() {
    const el = pick(visEls(".post-body p,.post-item p,.post-body h2"));
    if (!el) return;
    const r = el.getBoundingClientRect();
    await moveTo(r.left + r.width / 2 - 50, r.top - 70);
    ctx.setBotState("reading");
    let i = 0;
    const sc = setInterval(() => {
      i++;
      ctx.setEye({ x: Math.sin(i * 0.5) * 2.8, y: 0 });
    }, 90);
    await pause(2800);
    clearInterval(sc);
    ctx.setEye({ x: 0, y: 0 });
    speak(pick(D.read), 2400);
    ctx.setBotState("idle");
  }

  async function r_highlight() {
    const el = highlightParagraph();
    if (!el) return;
    const r = el.getBoundingClientRect();
    await moveTo(r.left + r.width + 16, r.top - 30, { speed: 3 });
    speak(pick(D.highlight), 2400);
    await pause(2000);
  }

  async function r_glitch_text() {
    const { glitchHeading } = await import("./effects");
    const el = glitchHeading(ctx.glitchIvRef);
    if (!el) return;
    const r = el.getBoundingClientRect();
    await moveTo(r.left + r.width + 16, r.top - 50, { speed: 3 });
    speak(pick(D.break), 2400);
    await pause(1800);
  }

  async function r_sticky() {
    const c = stickyNote();
    if (!c) return;
    const r = c.getBoundingClientRect();
    await moveTo(r.left - 60, r.top - 30, { speed: 3 });
    speak(pick(D.sticky), 2400);
    await pause(2000);
  }

  async function r_scribble() {
    const link = scribbleUnder();
    if (!link) return;
    const r = link.getBoundingClientRect();
    await moveTo(r.left + r.width / 2 - 50, r.bottom + 10, { speed: 3 });
    speak(pick(D.scribble), 2200);
    await pause(1800);
  }

  async function r_dance() {
    ctx.setBotState("dancing");
    speak(pick(D.dance), 2400);
    for (let i = 0; i < 6; i++) {
      ctx.setFacing(i % 2 ? 1 : -1);
      const p0 = ctx.getPos();
      ctx.setPos({ x: p0.x + (i % 2 ? 12 : -12), y: p0.y - (i % 2 ? 0 : 8) });
      await pause(180);
      const p1 = ctx.getPos();
      ctx.setPos({ x: p1.x + (i % 2 ? -12 : 12), y: p1.y + (i % 2 ? 0 : 8) });
      await pause(180);
    }
    ctx.setBotState("idle");
  }

  async function r_stretch() {
    ctx.setBotState("stretching");
    speak(pick(D.stretch), 2000);
    await pause(1800);
    ctx.setBotState("idle");
  }
  async function r_glitch() {
    ctx.setBotState("glitching");
    speak(pick(D.glitch), 2000);
    spawnGhosts(ctx.getElRef());
    await pause(900);
    ctx.setBotState("idle");
  }

  async function r_wander() {
    await moveTo(
      60 + Math.random() * (window.innerWidth - 180),
      80 + Math.random() * (window.innerHeight - 220),
    );
    if (Math.random() < 0.3) speak(pick(D.wander), 2200);
    else if (Math.random() < 0.5) think(pick(T), 3800);
    else speak(pick(D.idle), 2400);
  }

  async function r_suggest() {
    const s = pick(D.suggest);
    const link = document.querySelector<HTMLElement>(`a[href="/${s.route}"]`);
    if (link) {
      const r = link.getBoundingClientRect();
      await moveTo(r.left + r.width / 2 - 50, r.top + 38, { speed: 4 });
      slapLabel(link, "CHECK THIS OUT ↓");
      ctx.setEyeMode("smirk");
      speak(s.line, 4500, { route: s.route, label: s.label });
      for (let i = 0; i < 3; i++) {
        ctx.setFacing(i % 2 ? 1 : -1);
        await pause(220);
      }
      ctx.setEyeMode("closed");
      await pause(220);
      ctx.setEyeMode("smirk");
      await pause(1400);
      ctx.setEyeMode("normal");
    } else {
      speak(s.line, 4500, { route: s.route, label: s.label });
      await pause(2400);
    }
  }

  async function r_chase() {
    ctx.setBotState("chasing");
    speak(pick(D.chase), 1600);
    for (let i = 0; i < 4; i++) {
      const c = ctx.getCursor();
      await moveTo(c.x - 50, c.y - 50, { speed: 4 });
      await pause(150);
    }
    ctx.setBotState("idle");
  }

  async function r_tour() {
    const path = window.location.pathname;
    const cur =
      path === "/"
        ? "home"
        : path.startsWith("/posts/")
          ? "posts"
          : path.slice(1).split("/")[0];
    const next = pick(
      ["anime", "archive", "about", "home"].filter((r) => r !== cur),
    );
    ctx.setBotState("touring");
    speak("INITIATING TOUR. NAVIGATING TO " + next.toUpperCase() + ".", 3000);
    const link = document.querySelector<HTMLElement>(`a[href="/${next}"]`);
    if (link) {
      const r = link.getBoundingClientRect();
      markTarget(r.left + r.width / 2, r.top + r.height / 2, link);
    }
    await pause(1800);
    window.location.href = "/" + next;
  }

  async function r_admire() {
    const el = pick(visEls(".post-item,.anime-tile,.card,.profile"));
    if (!el) return;
    const r = el.getBoundingClientRect();
    await moveTo(r.left + r.width / 2 - 50, r.top - 70, { speed: 2 });
    ctx.setEyeMode("hearts");
    const h = getHue();
    const glow = document.createElement("div");
    glow.style.cssText = `position:fixed;left:${r.left - 4}px;top:${r.top - 4}px;width:${r.width + 8}px;height:${r.height + 8}px;border-radius:14px;box-shadow:0 0 0 2px oklch(0.75 0.22 ${h}/0.5),0 0 24px oklch(0.75 0.22 ${h}/0.35),0 0 60px oklch(0.75 0.22 ${h}/0.15);z-index:9990;pointer-events:none;opacity:0;transition:opacity .4s;`;
    document.body.appendChild(glow);
    requestAnimationFrame(() => {
      glow.style.opacity = "1";
    });
    speak(
      [
        "BEAUTIFUL.",
        "EXCEPTIONAL.",
        "REBIZ MADE THIS. I APPROVE.",
        "A+. CHEF'S KISS.",
        "10/10. NO NOTES.",
      ][Math.floor(Math.random() * 5)],
      2800,
    );
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        const heart = document.createElement("div");
        heart.textContent = "♡";
        const hx = r.left + Math.random() * r.width;
        heart.style.cssText = `position:fixed;left:${hx}px;top:${r.top}px;font-size:${14 + Math.random() * 10}px;color:oklch(0.75 0.22 ${h});z-index:9991;pointer-events:none;opacity:0;transition:transform 1.4s ease-out,opacity .4s;`;
        document.body.appendChild(heart);
        requestAnimationFrame(() => {
          heart.style.opacity = "1";
          heart.style.transform = `translateY(-60px) rotate(${(Math.random() - 0.5) * 20}deg) scale(${0.8 + Math.random() * 0.4})`;
        });
        setTimeout(() => {
          heart.style.opacity = "0";
          setTimeout(() => heart.remove(), 420);
        }, 1200);
      }, i * 320);
    }
    await pause(2800);
    glow.style.opacity = "0";
    setTimeout(() => glow.remove(), 420);
    ctx.setEyeMode("normal");
  }

  async function r_nod() {
    speak(pick(D.idle), 2400);
    for (let i = 0; i < 4; i++) {
      const p0 = ctx.getPos();
      ctx.setPos({ x: p0.x, y: p0.y - 8 });
      await pause(180);
      const p1 = ctx.getPos();
      ctx.setPos({ x: p1.x, y: p1.y + 8 });
      await pause(180);
    }
  }

  async function r_panic() {
    ctx.setBotState("panicking");
    ctx.setEyeMode("surprised");
    speak("WAIT. WAIT. WAIT. THIS IS FINE.", 2200);
    for (let i = 0; i < 5; i++) {
      await moveTo(
        40 + Math.random() * (window.innerWidth - 180),
        80 + Math.random() * (window.innerHeight - 220),
        { speed: 9 },
      );
      await pause(80);
    }
    ctx.setEyeMode("tired");
    speak("...FINE. THAT WAS PLANNED.", 2000);
    await pause(800);
    ctx.setEyeMode("normal");
    ctx.setBotState("idle");
  }

  async function r_investigate() {
    const el = pick(visEls(".post-item,.anime-tile,.archive-row"));
    if (!el) return;
    const r = el.getBoundingClientRect();
    ctx.setBotState("reading");
    ctx.setEyeMode("question");
    await moveTo(r.left + r.width / 2 - 50, r.top - 60, { speed: 1.2 });
    let n = 0;
    const sc = setInterval(() => {
      n++;
      ctx.setEye({ x: Math.sin(n * 0.8) * 3.5, y: Math.cos(n * 0.4) * 0.8 });
    }, 60);
    await pause(1800);
    clearInterval(sc);
    ctx.setEye({ x: 0, y: 0 });
    ctx.setEyeMode("normal");
    speak(
      [
        "ANALYSIS COMPLETE. VERDICT: INTERESTING.",
        "DETECTED. LOGGED. EVALUATED.",
        "I HAVE QUESTIONS. THEY ARE RHETORICAL.",
        "MY SENSORS ARE INTRIGUED.",
        "CLASSIFIED AS: NOTABLE.",
      ][Math.floor(Math.random() * 5)],
      2600,
    );
    ctx.setBotState("idle");
  }

  async function r_star() {
    const el = pick(visEls(".post-item h3,.archive-row,.title-overlay"));
    if (!el) return;
    const r = el.getBoundingClientRect();
    await moveTo(r.left - 60, r.top - 30, { speed: 3 });
    const h = getHue();
    const star = document.createElement("div");
    star.textContent = "★";
    star.style.cssText = `position:fixed;left:${r.left - 18}px;top:${r.top - 14}px;font-size:20px;color:oklch(0.82 0.22 ${h});text-shadow:0 0 12px oklch(0.75 0.22 ${h}/0.8);z-index:9991;pointer-events:none;opacity:0;transform:scale(0) rotate(-30deg);transition:opacity .3s,transform .5s cubic-bezier(.34,1.8,.64,1);`;
    document.body.appendChild(star);
    requestAnimationFrame(() => {
      star.style.opacity = "1";
      star.style.transform = "scale(1) rotate(0deg)";
    });
    speak(
      [
        "STARRED. YOU'RE WELCOME.",
        "THIS ONE. SPECIFICALLY.",
        "REBIZ WOULD WANT YOU TO SEE THIS.",
        "MARKED FOR ETERNITY.",
      ][Math.floor(Math.random() * 4)],
      2400,
    );
    sparkle(r.left - 8, r.top, 5);
    await pause(2200);
    star.style.opacity = "0";
    star.style.transition = "opacity .5s";
    setTimeout(() => star.remove(), 520);
  }

  async function r_coffee() {
    speak(
      [
        "*sips*",
        "FUEL ACQUIRED.",
        "REBIZ RUNS ON THIS TOO, I'M TOLD.",
        "PROCESSING EFFICIENCY: +12%.",
      ][Math.floor(Math.random() * 4)],
      2000,
    );
    ctx.setEyeMode("smirk");
    const me = ctx.getElRef()?.getBoundingClientRect();
    if (me) {
      const cup = document.createElement("div");
      cup.textContent = "☕";
      cup.style.cssText = `position:fixed;left:${me.left + me.width - 4}px;top:${me.top - 10}px;font-size:22px;z-index:9991;pointer-events:none;opacity:0;transform:translateY(8px);transition:opacity .3s,transform .4s cubic-bezier(.34,1.56,.64,1);`;
      document.body.appendChild(cup);
      requestAnimationFrame(() => {
        cup.style.opacity = "1";
        cup.style.transform = "translateY(0)";
      });
      await pause(1800);
      cup.style.opacity = "0";
      cup.style.transition = "opacity .4s";
      setTimeout(() => cup.remove(), 420);
    } else {
      await pause(1800);
    }
    ctx.setEyeMode("normal");
  }

  async function r_sit() {
    const el = pick(visEls(".post-item,.anime-tile,.card,.profile"));
    if (!el) return;
    const r = el.getBoundingClientRect();
    await moveTo(r.left + r.width / 2 - 50, r.top - 88, { speed: 2.5 });
    ctx.setBotState("climbing");
    ctx.setEyeMode("smirk");
    for (let i = 0; i < 5; i++) {
      const p0 = ctx.getPos();
      ctx.setPos({ x: p0.x, y: p0.y - 4 });
      await pause(200);
      const p1 = ctx.getPos();
      ctx.setPos({ x: p1.x, y: p1.y + 4 });
      await pause(200);
    }
    speak(
      pick([
        "ALTITUDE SECURED.",
        "PRIME VANTAGE POINT.",
        "I LIVE HERE NOW.",
        "DO NOT DISTURB. I AM SEATED.",
        "...COMFY.",
      ]),
      2400,
    );
    await pause(1800);
    ctx.setEyeMode("normal");
    ctx.setBotState("idle");
  }

  async function r_grab() {
    const el = pick(visEls(".post-item,.anime-tile,.card"));
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pos = ctx.getPos();
    const side = pos.x < r.left + r.width / 2 ? 1 : -1;
    await moveTo(
      r.left + (side > 0 ? -45 : r.width + 5) - 50,
      r.top + r.height / 2 - 50,
      { speed: 3.5 },
    );
    const me = ctx.getElRef()?.getBoundingClientRect();
    if (me) {
      const tx = r.left + r.width / 2,
        ty = r.top + r.height / 2;
      const angle =
        (Math.atan2(ty - (me.top + 50), tx - (me.left + 50)) * 180) / Math.PI;
      const length = Math.hypot(tx - (me.left + 50), ty - (me.top + 50)) - 12;
      ctx.setArm({ angle, length });
    }
    el.style.transition = "transform 60ms";
    for (let i = 0; i < 5; i++) {
      el.style.transform = `translateX(${i % 2 === 0 ? "-5px" : "5px"}) rotate(${i % 2 === 0 ? "-0.8" : "0.8"}deg)`;
      await pause(70);
    }
    el.style.transform = "";
    el.style.transition = "";
    speak(
      pick([
        "GOTCHA.",
        "STRUCTURAL TEST: PASSED.",
        "JUST CHECKING.",
        "HELLO? ANYONE HOME?",
        "I CAN DO THIS ALL DAY.",
      ]),
      2000,
    );
    await pause(900);
    ctx.setArm(null);
  }

  async function r_write_screen() {
    const el = pick(
      visEls(".post-item h3,.title-overlay,.archive-row,.post-body h2"),
    );
    if (!el) return;
    const r = el.getBoundingClientRect();
    await moveTo(r.left - 38, r.top - 42, { speed: 3 });
    const h = getHue();
    const txt = pick([
      "← READ THIS",
      "★ NOTED",
      "!! IMPORTANT",
      "→ CLICK ME",
      "♡ FAVE",
    ]);
    const rot = -10 + Math.random() * 20;
    const lbl = document.createElement("div");
    lbl.textContent = txt;
    lbl.style.cssText = `position:fixed;left:${r.left}px;top:${r.top - 26}px;font-family:var(--font-mono),monospace;font-size:13px;font-weight:900;color:oklch(0.92 0.22 ${h});text-shadow:0 0 14px oklch(0.75 0.22 ${h}/0.9);letter-spacing:0.1em;z-index:9991;pointer-events:none;transform:rotate(${rot}deg) scale(0.4);opacity:0;transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .3s;`;
    document.body.appendChild(lbl);
    requestAnimationFrame(() => {
      lbl.style.opacity = "1";
      lbl.style.transform = `rotate(${rot}deg) scale(1)`;
    });
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.cssText = `position:fixed;left:${r.left}px;top:${r.bottom - 2}px;width:${r.width}px;height:8px;z-index:9991;pointer-events:none;overflow:visible;`;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "4");
    line.setAttribute("x2", String(r.width));
    line.setAttribute("y2", "4");
    line.setAttribute("stroke", `oklch(0.85 0.22 ${h})`);
    line.setAttribute("stroke-width", "2.5");
    line.setAttribute("stroke-linecap", "round");
    line.style.strokeDasharray = String(r.width);
    line.style.strokeDashoffset = String(r.width);
    line.style.transition = "stroke-dashoffset 0.6s ease-out";
    svg.appendChild(line);
    document.body.appendChild(svg);
    requestAnimationFrame(() => {
      line.style.strokeDashoffset = "0";
    });
    speak(pick(D.scribble), 2200);
    await pause(3800);
    lbl.style.opacity = "0";
    lbl.style.transform = `rotate(${rot}deg) scale(0.6)`;
    svg.style.opacity = "0";
    (svg.style as unknown as Record<string, string>).transition =
      "opacity .35s";
    setTimeout(() => {
      lbl.remove();
      svg.remove();
    }, 380);
  }

  async function r_peek() {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const r = sidebar.getBoundingClientRect();
      await moveTo(r.right - 85, r.top + 100 + Math.random() * 80, {
        speed: 2,
      });
      ctx.setEyeMode("smirk");
      speak(
        pick([
          "...BOO.",
          "YOU SAW NOTHING.",
          "I WAS ALWAYS HERE.",
          "OPTIMAL OBSERVATION SPOT.",
          "...JUST LURKING.",
        ]),
        2200,
      );
      await pause(800);
      const savedX = ctx.getPos().x;
      ctx.setPos({ x: r.right - 20, y: ctx.getPos().y });
      await pause(1200);
      ctx.setPos({ x: savedX, y: ctx.getPos().y });
      await pause(500);
      ctx.setEyeMode("normal");
    } else {
      const y = 160 + Math.random() * (window.innerHeight - 360);
      ctx.setPos({ x: -68, y });
      ctx.setFacing(1);
      await pause(1800);
      speak(pick(["PEEK.", "I AM WATCHING.", "...HI.", "SPOTTED YOU."]), 1800);
      await pause(1200);
      await moveTo(60, y, { speed: 3 });
      ctx.setEyeMode("normal");
    }
  }

  async function r_matrix() {
    ctx.setBotState("glitching");
    ctx.setEyeMode("wide");
    speak(pick(D.hacker), 1800);
    spawnGhosts(ctx.getElRef());
    await pause(900);
    (
      window as Window & { __nx7_triggerPeel?: () => void }
    ).__nx7_triggerPeel?.();
    speak(pick(D.matrix), 2800);
    await pause(1800);
    ctx.setBotState("idle");
    ctx.setEyeMode("normal");
  }

  async function r_gravity_chaos() {
    const pool = visEls(
      ".post-item,.card,.anime-tile,.archive-row,.profile,.sidebar-widget,.widget",
    );
    if (pool.length < 1) return;
    const count = Math.min(pool.length, 2 + Math.floor(Math.random() * 3));
    const targets = pool
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    ctx.setBotState("panicking");
    ctx.setEyeMode("surprised");
    speak(pick(D.gravity), 2600);
    spawnGhosts(ctx.getElRef());
    await pause(700);
    const falls = captureFalls(targets);
    await simulateGravityFall(falls, (x, y) => spawnImpact(x, y));
    ctx.setBotState("idle");
    ctx.setEyeMode("angry-eyes");
    speak(pick(D.fix_gravity), 2200);
    await pause(500);
    const repairLines = [
      "RECALIBRATING.",
      "STRUCTURAL RESTORE: ACTIVE.",
      "GRAVITY OVERRIDE.",
      "PATCHING PHYSICS.",
      "POSITION: LOCKED.",
      "ELEMENT: SECURED.",
    ];
    for (const f of falls) {
      const r = f.el.getBoundingClientRect();
      await moveTo(r.left + f.w / 2 - 50, r.top - 90, { speed: 7 });
      ctx.setEyeMode("wide");
      markTarget(r.left + f.w / 2, r.top + f.h / 2, f.el);
      sparkle(r.left + f.w / 2, r.top + f.h / 2, 8);
      speak(pick(repairLines), 1500);
      screenRipple();
      restoreElement(f);
      await pause(750);
      sparkle(f.origX + f.w / 2, f.origY + f.h / 2, 5);
      ctx.setEyeMode("smirk");
      await pause(380);
    }
    ctx.setEyeMode("normal");
    ctx.setBotState("idle");
    speak(pick(D.repaired), 2800);
    await pause(1200);
  }

  async function r_gf_easter_egg() {
    ctx.setBotState("reading");
    ctx.setEyeMode("wide");
    speak(pick(D.gf), 3200);
    const rand = Math.random();
    if (rand < 0.4) {
      const { glitchHeading } = await import("./effects");
      glitchHeading(ctx.glitchIvRef);
    } else if (rand < 0.7) {
      stickyNote();
    } else {
      const h = getHue();
      const symbols = ["⌬", "△", "◈", "⧫", "⬡", "⬟", "⌘", "⍟", "⎔", "⏣"];
      const glyph = document.createElement("div");
      glyph.textContent = symbols.map(() => pick(symbols)).join("");
      const cx = 60 + Math.random() * (window.innerWidth - 200);
      const cy = 80 + Math.random() * (window.innerHeight - 240);
      glyph.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;font-size:18px;font-family:var(--font-mono),monospace;color:oklch(0.65 0.18 ${h});text-shadow:0 0 12px oklch(0.55 0.18 ${h}/0.7);z-index:9990;pointer-events:none;opacity:0;letter-spacing:.15em;transition:opacity .4s,transform .4s;transform:translateY(8px) scale(.8);`;
      document.body.appendChild(glyph);
      requestAnimationFrame(() => {
        glyph.style.opacity = "1";
        glyph.style.transform = "translateY(0) scale(1)";
      });
      setTimeout(() => {
        glyph.style.opacity = "0";
        setTimeout(() => glyph.remove(), 420);
      }, 4000);
    }
    await pause(3000);
    ctx.setEyeMode("normal");
    ctx.setBotState("idle");
  }

  const ALL = [
    { fn: r_wander, w: 13 },
    { fn: r_point, w: 9 },
    { fn: r_trip, w: 6 },
    { fn: r_read, w: 6 },
    { fn: r_highlight, w: 5 },
    { fn: r_sticky, w: 5 },
    { fn: r_scribble, w: 5 },
    { fn: r_glitch_text, w: 4 },
    { fn: r_dance, w: 4 },
    { fn: r_climb, w: 4 },
    { fn: r_knock, w: 3 },
    { fn: r_stretch, w: 3 },
    { fn: r_glitch, w: 3 },
    { fn: r_chase, w: 3 },
    { fn: r_suggest, w: 6 },
    { fn: r_tour, w: 2 },
    { fn: r_admire, w: 7 },
    { fn: r_nod, w: 5 },
    { fn: r_panic, w: 3 },
    { fn: r_investigate, w: 6 },
    { fn: r_star, w: 5 },
    { fn: r_coffee, w: 4 },
    { fn: r_sit, w: 6 },
    { fn: r_grab, w: 5 },
    { fn: r_write_screen, w: 5 },
    { fn: r_peek, w: 4 },
    { fn: r_matrix, w: 3 },
    { fn: r_gravity_chaos, w: 4 },
    { fn: r_gf_easter_egg, w: 4 },
  ];

  function pickRoutine(): () => Promise<void> {
    const total = ALL.reduce((a, r) => a + r.w, 0);
    let n = Math.random() * total;
    for (const r of ALL) {
      if ((n -= r.w) <= 0) return r.fn;
    }
    return r_wander;
  }

  return { pickRoutine, r_dance };
}
