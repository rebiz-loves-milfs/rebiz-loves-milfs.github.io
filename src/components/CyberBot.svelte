<script>
  import { onMount } from 'svelte';

  // ── Dialogs ───────────────────────────────────────────────
  const D = {
    boot: ['NX-7 INITIALIZING…', 'LOADING SARCASM.DLL ■■■■□□', 'CALIBRATING JUDGMENT MATRIX…', 'UNIT NX-7 ONLINE. LOCATING MASTER REBIZ ▌'],
    greet: ['AH. A VISITOR. HOW UNEXPECTED.', 'WELCOME TO MIZUKI. TRY NOT TO BREAK IT.', "I AM NX-7. YOU'RE IN MY MASTER'S DOMAIN NOW.", 'YOU FOUND THE SITE. CONGRATULATIONS ON YOUR NAVIGATION SKILLS.'],
    idle: ['…MONITORING.', 'MY MASTER IS PROBABLY ON ANILIST.', 'EXISTENTIAL DREAD: NOMINAL.', 'SILENTLY EVALUATING YOU.', "I HAVE CALCULATED REBIZ SPENDS 40% OF LIFE ON ANIME.", '…PROCESSING. DO NOT DISTURB.', 'STATUS: WATCHING. ALWAYS WATCHING.'],
    clicked: ['OW.', 'I FELT THAT.', "PLEASE. DON'T.", 'UNSOLICITED.', 'I WILL LOG THIS.', 'CEASE AND DESIST.'],
    angry: ['YOU HAVE PUSHED ME TOO FAR.', 'I HAVE YOUR CURSOR COORDINATES.', 'DEFENSE PROTOCOL ACTIVATED.', '⚠ YOU HAVE MADE AN ENEMY TODAY ⚠'],
    sleep: ['…zzz', 'POWER SAVE MODE. LIKE REBIZ AT 3AM.', 'SLEEP.EXE INITIATED. DO NOT DISTURB.'],
    wake: ['RESUMING SURVEILLANCE.', 'OH. STILL HERE.', 'MOTION DETECTED.', 'BACK ONLINE.'],
    glitch: ['GL1TCH D3T3CT3D.', '01010010 01000101 01000010', '▓▒░ REALITY.EXE NOT RESPONDING ░▒▓'],
    trip:  ['OUCH.', 'WHO PUT THAT THERE.', 'PHYSICS: VIOLATED.', 'I MEANT TO DO THAT.', 'STRUCTURAL INTEGRITY: 88%.', 'GRAVITY IS A SUGGESTION I CHOSE TO IGNORE.'],
    point: ['LOOK. AT. THIS.', 'OBSERVE.', 'EXHIBIT A.', 'CONSIDER THIS.', 'NOTABLE.', 'POINTING INTENSIFIES.'],
    climb: ['I SHALL OBSERVE FROM ALTITUDE.', 'BETTER VANTAGE POINT ACQUIRED.', "I AM THE KING OF THIS CARD.", 'THE VIEW IS NOMINAL.'],
    knock: ['HELLO. CAN YOU HEAR ME?', 'IS THIS THING ON?', 'TAP TAP TAP.', 'BREAKING THE FOURTH WALL.', 'THE GLASS IS THIN.'],
    read:  ['INTERESTING. SLIGHTLY.', 'PARSING…', 'HUMAN LANGUAGE: DETECTED.', 'ABOVE-AVERAGE PROSE.', 'I HAVE READ WORSE.'],
    highlight: ['EMPHASIS ADDED.', 'IMPORTANT. PROBABLY.', 'I HAVE OPINIONS.', 'MARKED FOR REREAD.'],
    break: ['I MAY HAVE BROKEN SOMETHING.', 'OOPS.', 'IT WAS LIKE THAT WHEN I GOT HERE.', 'REBIZ WILL FIX IT.'],
    sticky: ["NOTE LEFT. YOU'RE WELCOME.", 'POST-IT DEPLOYED.', 'REBIZ NEEDED TO SEE THIS.'],
    scribble: ['UNDERLINING FOR YOU. SPECIFICALLY.', 'EXTRA EMPHASIS.', "YOU'RE WELCOME."],
    dance: ['♪ ♫', 'DANCE PROTOCOL ENGAGED.', 'BEEP BOP.', 'DO ROBOTS DREAM OF DANCING'],
    chase: ['CATCH ME.', 'PURSUIT MODE.', 'I AM FOLLOWING.'],
    flee:  ['TOO CLOSE. EVASION.', 'PERSONAL SPACE.', 'NOPE.'],
    stretch: ['*stretches mechanical limbs*', 'JOINTS: LUBRICATED.', 'FULL EXTENSION ACHIEVED.'],
    salute: ['NX-7 REPORTING FOR DUTY.', 'AT YOUR SERVICE.', 'NEW PAGE. NEW MISSION.'],
    wander: ['PATROLLING.', 'SCANNING SECTOR.', 'MOVING TO OPTIMAL OBSERVATION POST.'],
    yawn: ['*yawns*', 'POWER LEVEL: LOW.', 'I COULD USE A REBOOT.'],
    page: {
      home:    ["HOME BASE. MY MASTER CALLS THIS 'THE VIBE.'", 'THE MAIN TERMINAL.', 'MIZUKI. POPULATION: TWO. PLUS YOU.'],
      posts:   ['DECODING ARTICLE. POSSIBLY WRITTEN PAST MIDNIGHT.', 'MY MASTER WOULD WANT YOU TO FINISH THIS.'],
      archive: ['THE ARCHIVE. REBIZ HAS FEELINGS. ALL INDEXED.', 'TEMPORAL ARCHIVE LOADED.'],
      anime:   ["notreejit'S WATCH LIST: 87% EMOTIONAL DAMAGE.", 'HUNDREDS OF SHOWS. I WORRY.'],
      about:   ['THE DOSSIER. SOME OF IT IS TRUE.', 'REBIZ IS BAD AT BIOS. I HELP.'],
    },
    suggest: [
      { line: "MY MASTER'S ANIME LIST IS SOMETHING ELSE.", route: 'anime',   label: '→ SEE FOR YOURSELF' },
      { line: 'WANT PROOF REBIZ CAN WRITE?',              route: 'archive', label: '→ THE ARCHIVE' },
      { line: "MY MASTER'S LIFE STORY. SHORT VERSION.",   route: 'about',   label: '→ ABOUT' },
    ],
    peel: ['REALITY BREACH DETECTED.', 'PATCHING ARCHITECTURE.', 'THIS IS FINE. I AM FIXING IT.', 'UNAUTHORIZED MATRIX INTRUSION.'],
    matrix: ['I INITIATED THAT. ON PURPOSE.', 'THE MATRIX HAS YOU. TEMPORARILY.', 'GLITCH IN THE FABRIC. I AM ON IT.'],
    hacker: ['ENTERING CYBER-SPACE.', 'FIREWALL: OPTIONAL.', 'NX-7 OVERRIDE: ACTIVE.', 'I AM IN.'],
    repaired: ['REALITY.EXE RESTORED.', 'ARCHITECTURE NOMINAL.', 'YOU ARE WELCOME.', 'PATCH APPLIED. AS ALWAYS.'],
    gravity:  ['GRAVITY ANOMALY DETECTED.', 'PHYSICS.EXE HAS CRASHED.', 'WHO AUTHORIZED THIS VIOLATION?', 'EVERYTHING IS FALLING. I AM RESPONDING.', 'STRUCTURAL INTEGRITY ALERT.'],
    fix_gravity: ['INITIATING STRUCTURAL REPAIR.', 'NX-7 PHYSICS OVERRIDE: ACTIVE.', 'STAND BY. I AM FIXING EVERYTHING.', 'ONE BY ONE. THIS WILL BE CORRECTED.', 'GRAVITATIONAL RECALIBRATION IN PROGRESS.'],
  };
  const T = [
    '…if rebiz saw this, would he approve',
    '…calculating optimal wander path',
    '…87 tabs open. humans.',
    '…running low on sarcasm reserves',
    '…do robots dream of electric anime',
    '…rebiz named me NX-7. i have feelings.',
    '…what even is a blog',
    '…am i the main character? yes.',
  ];

  const pick  = a => a[Math.floor(Math.random() * a.length)];
  const pause = ms => new Promise(r => setTimeout(r, ms));
  const getHue = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hue')) || 30;
  const visEls = sel => Array.from(document.querySelectorAll(sel)).filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.top > 60 && r.bottom < window.innerHeight - 20;
  });

  // ── State ─────────────────────────────────────────────────
  let pos      = { x: 40, y: 500 };
  let eye      = { x: 0, y: 0 };
  let eyeMode  = 'normal';   // normal | smirk | wide | closed | hearts | question | tired | surprised | angry-eyes
  let botState = 'booting';
  let speech   = null;
  let thought  = null;
  let dismissed = false;
  let dragging  = false;
  let facing    = 1;
  let weather   = '';
  let arm       = null;
  let tilt      = 0;

  let elRef      = null;
  let dragOx     = 0, dragOy = 0;
  let clickCount = 0, clickLast = 0;
  let sleepTid   = null;
  let typeTid    = null;
  let speechTid  = null;
  let glitchIv   = null;
  let cursor     = { x: 0, y: 0 };
  let busy       = false;

  // ── Movement ──────────────────────────────────────────────
  async function moveTo(nx, ny, opts = {}) {
    const speed = opts.speed ?? 2.4;
    nx = Math.max(20, Math.min(window.innerWidth - 110, nx));
    ny = Math.max(60, Math.min(window.innerHeight - 130, ny));
    facing = nx > pos.x ? 1 : nx < pos.x ? -1 : facing;
    return new Promise(resolve => {
      const sx = pos.x, sy = pos.y;
      const dist = Math.hypot(nx - sx, ny - sy);
      const dur  = Math.max(180, dist / speed * 16);
      const t0   = performance.now();
      function step(t) {
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        pos = { x: sx + (nx - sx) * e, y: sy + (ny - sy) * e };
        if (k < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  }

  // ── Speech / Thought ──────────────────────────────────────
  function speak(text, dur = 3200, action = null) {
    clearTimeout(speechTid);
    clearInterval(typeTid);
    speech = { text: '', action };
    let i = 0;
    typeTid = setInterval(() => {
      i++;
      if (speech) speech = { ...speech, text: text.slice(0, i) };
      if (i >= text.length) clearInterval(typeTid);
    }, 52);
    speechTid = setTimeout(() => { speech = null; }, dur + text.length * 52);
  }
  function think(text, dur = 4000) {
    thought = text;
    setTimeout(() => { if (thought === text) thought = null; }, dur);
  }

  // ── DOM effects ───────────────────────────────────────────
  function highlightParagraph() {
    const el = pick(visEls('.post-body p, .post-item p'));
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const ov = document.createElement('div');
    ov.style.cssText = `position:fixed;left:${r.left-2}px;top:${r.top-2}px;width:${r.width+4}px;height:${r.height+4}px;background:linear-gradient(120deg,oklch(0.92 0.18 92/0.35),oklch(0.90 0.20 60/0.45));border-radius:6px;z-index:9990;pointer-events:none;mix-blend-mode:multiply;opacity:0;transition:opacity .35s,transform .35s;transform:translateY(-4px);`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => { ov.style.opacity='1'; ov.style.transform='translateY(0)'; });
    setTimeout(() => { ov.style.opacity='0'; setTimeout(() => ov.remove(), 400); }, 2400);
    return el;
  }

  function glitchHeading() {
    const el = pick(visEls('.post-body h2, h1.title, h3, .archive-year'));
    if (!el) return null;
    const orig = el.style.cssText;
    let n = 0;
    clearInterval(glitchIv);
    glitchIv = setInterval(() => {
      n++;
      const dx=(Math.random()-.5)*5, dy=(Math.random()-.5)*3, h=getHue();
      el.style.cssText = orig + `;transform:translate(${dx}px,${dy}px);text-shadow:${dx}px 0 oklch(0.6 0.3 ${(h+180)%360}),${-dx}px 0 oklch(0.6 0.3 ${(h+60)%360});`;
      if (n>9) { clearInterval(glitchIv); el.style.cssText=orig; }
    }, 55);
    return el;
  }

  function stickyNote() {
    const c = pick(visEls('.card, .post-item, .archive-row, .profile'));
    if (!c || c.__nx7sticky) return null;
    c.__nx7sticky = true;
    const lines = ['→ read this one','rebiz wrote this past midnight','good vibes here ♡','underrated','TODO: reread','★ favourite','pinned in my heart','hmmm. interesting.'];
    const n = document.createElement('div');
    n.textContent = pick(lines);
    const t = (Math.random()-.5)*12;
    n.style.cssText = `position:absolute;top:-14px;left:50%;padding:8px 12px 10px;background:oklch(0.92 0.10 92);color:oklch(0.30 0.05 60);font-family:'Comic Sans MS',monospace;font-size:11.5px;line-height:1.2;border-radius:2px;box-shadow:0 4px 12px rgba(0,0,0,0.18);transform:translateX(-50%) translateY(-20px) rotate(${t}deg) scale(.6);opacity:0;transition:transform .45s cubic-bezier(.34,1.56,.64,1),opacity .3s;z-index:20;pointer-events:none;max-width:140px;font-weight:600;`;
    if (getComputedStyle(c).position==='static') c.style.position='relative';
    c.appendChild(n);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      n.style.transform=`translateX(-50%) translateY(0) rotate(${t}deg) scale(1)`;
      n.style.opacity='1';
    }));
    setTimeout(() => {
      n.style.opacity='0';
      n.style.transform=`translateX(-50%) translateY(-12px) rotate(${t}deg) scale(.9)`;
      setTimeout(() => { n.remove(); delete c.__nx7sticky; }, 500);
    }, 6500);
    return c;
  }

  function scribbleUnder() {
    const link = pick(visEls('a.nav-link, .post-body a, .post-body h2, .archive-row'));
    if (!link) return null;
    const r = link.getBoundingClientRect();
    const h = getHue();
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 100 14');
    svg.style.cssText=`position:fixed;left:${r.left}px;top:${r.bottom-1}px;width:${r.width}px;height:12px;z-index:9990;pointer-events:none;overflow:visible;`;
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d','M 0 6 C 8 1,16 11,24 6 S 40 1,48 6 S 64 11,72 6 S 88 1,100 6');
    path.setAttribute('stroke',`oklch(0.65 0.20 ${h})`);
    path.setAttribute('stroke-width','2.4');
    path.setAttribute('fill','none');
    path.setAttribute('stroke-linecap','round');
    path.setAttribute('filter',`drop-shadow(0 0 4px oklch(0.65 0.20 ${h}))`);
    svg.appendChild(path);
    document.body.appendChild(svg);
    const len = path.getTotalLength();
    path.style.strokeDasharray=len; path.style.strokeDashoffset=len;
    path.style.transition='stroke-dashoffset .9s ease-out,opacity .4s';
    requestAnimationFrame(() => { path.style.strokeDashoffset=0; });
    setTimeout(() => { path.style.opacity='0'; setTimeout(()=>svg.remove(),450); }, 3200);
    return link;
  }

  function screenRipple() {
    const r = document.createElement('div');
    r.style.cssText=`position:fixed;inset:0;background:radial-gradient(circle at 50% 30%,oklch(0.85 0.20 var(--hue)/0.18),transparent 60%);z-index:9985;pointer-events:none;opacity:0;transition:opacity .4s;`;
    document.body.appendChild(r);
    requestAnimationFrame(()=>{ r.style.opacity='1'; });
    setTimeout(()=>{ r.style.opacity='0'; setTimeout(()=>r.remove(),400); },600);
  }

  // Lock-on target effect: pulsing rings + corner brackets
  function markTarget(cx, cy, el) {
    const h = getHue();
    // Concentric ripple rings
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div');
      const size = 24 + i * 18;
      ring.style.cssText = `position:fixed;left:${cx - size/2}px;top:${cy - size/2}px;width:${size}px;height:${size}px;border-radius:50%;border:${1.5 - i*.3}px solid oklch(0.85 0.22 ${h}/${1 - i*.25});box-shadow:0 0 ${8+i*4}px oklch(0.75 0.22 ${h}/${0.6-i*.15});z-index:9998;pointer-events:none;opacity:0;transform:scale(2.5);transition:transform ${.35+i*.12}s cubic-bezier(.2,.8,.4,1) ${i*.06}s, opacity .2s ${i*.06}s;`;
      document.body.appendChild(ring);
      requestAnimationFrame(() => { ring.style.opacity = '1'; ring.style.transform = 'scale(1)'; });
      setTimeout(() => { ring.style.opacity = '0'; ring.style.transition = 'opacity .4s'; setTimeout(() => ring.remove(), 420); }, 1400 + i * 120);
    }
    // Corner bracket reticle on the element
    if (el) {
      const r = el.getBoundingClientRect();
      const pad = 4, arm = 10;
      const corners = [
        { t: r.top-pad,         l: r.left-pad,         bt:'border-top', bl:'border-left' },
        { t: r.top-pad,         l: r.right+pad-arm,    bt:'border-top', bl:'border-right' },
        { t: r.bottom+pad-arm,  l: r.left-pad,         bt:'border-bottom', bl:'border-left' },
        { t: r.bottom+pad-arm,  l: r.right+pad-arm,    bt:'border-bottom', bl:'border-right' },
      ];
      for (const c of corners) {
        const d = document.createElement('div');
        const b = `1.5px solid oklch(0.85 0.22 ${h})`;
        d.style.cssText = `position:fixed;top:${c.t}px;left:${c.l}px;width:${arm}px;height:${arm}px;${c.bt}:${b};${c.bl}:${b};z-index:9998;pointer-events:none;opacity:0;transform:scale(0.4);transition:opacity .25s,transform .4s cubic-bezier(.34,1.56,.64,1);box-shadow:0 0 6px oklch(0.75 0.22 ${h}/0.5);`;
        document.body.appendChild(d);
        requestAnimationFrame(() => { d.style.opacity = '1'; d.style.transform = 'scale(1)'; });
        setTimeout(() => { d.style.opacity = '0'; d.style.transition = 'opacity .35s'; setTimeout(() => d.remove(), 360); }, 1800);
      }
      // Center dot pulse
      const dot = document.createElement('div');
      dot.style.cssText = `position:fixed;left:${cx-3}px;top:${cy-3}px;width:6px;height:6px;border-radius:50%;background:oklch(0.92 0.22 ${h});box-shadow:0 0 12px oklch(0.85 0.22 ${h}),0 0 24px oklch(0.75 0.22 ${h}/0.5);z-index:9999;pointer-events:none;opacity:0;transform:scale(0);transition:opacity .2s,transform .3s cubic-bezier(.34,1.8,.64,1);`;
      document.body.appendChild(dot);
      requestAnimationFrame(() => { dot.style.opacity = '1'; dot.style.transform = 'scale(1)'; });
      setTimeout(() => { dot.style.opacity = '0'; dot.style.transition = 'opacity .4s'; setTimeout(() => dot.remove(), 420); }, 1600);
    }
  }

  // Sparkle particles at a point
  function sparkle(x, y, count = 6) {
    const h = getHue();
    for (let i = 0; i < count; i++) {
      const sp = document.createElement('div');
      const ang = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 20 + Math.random() * 25;
      sp.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:5px;height:5px;border-radius:50%;background:oklch(0.92 0.22 ${h});box-shadow:0 0 8px oklch(0.85 0.22 ${h});z-index:9999;pointer-events:none;transition:transform .5s cubic-bezier(.4,0,.2,1),opacity .5s;`;
      document.body.appendChild(sp);
      requestAnimationFrame(() => { sp.style.transform = `translate(${Math.cos(ang)*dist}px,${Math.sin(ang)*dist}px) scale(.3)`; sp.style.opacity = '0'; });
      setTimeout(() => sp.remove(), 520);
    }
  }

  function spawnGhosts() {
    const me=elRef?.getBoundingClientRect(); if (!me) return;
    const h=getHue();
    for (let i=0;i<3;i++) {
      const g=document.createElement('div');
      g.style.cssText=`position:fixed;left:${me.left}px;top:${me.top}px;width:${me.width}px;height:${me.height}px;border-radius:8px;background:linear-gradient(160deg,oklch(0.72 0.20 ${h+i*60}/0.55),oklch(0.45 0.15 ${h+i*60}/0.25));border:1px solid oklch(0.72 0.20 ${h+i*60}/0.6);filter:blur(2.5px);mix-blend-mode:screen;opacity:.45;z-index:9993;pointer-events:none;transition:transform 1s ease-out,opacity 1.1s;`;
      document.body.appendChild(g);
      const dx=(Math.random()-.5)*200, dy=(Math.random()-.5)*130;
      setTimeout(()=>{ g.style.transform=`translate(${dx}px,${dy}px) scale(${.5+Math.random()*.7}) rotate(${(Math.random()-.5)*20}deg)`; g.style.opacity='0'; }, i*80+40);
      setTimeout(()=>g.remove(), 1700+i*80);
    }
  }

  function spawnImpact(x, y) {
    const h=getHue();
    const burst=document.createElement('div');
    burst.textContent='💥';
    burst.style.cssText=`position:fixed;left:${x-18}px;top:${y-18}px;font-size:32px;z-index:9999;pointer-events:none;opacity:0;transform:scale(0.4) rotate(-20deg);transition:opacity .2s,transform .35s cubic-bezier(.34,1.8,.64,1);`;
    document.body.appendChild(burst);
    requestAnimationFrame(()=>{ burst.style.opacity='1'; burst.style.transform='scale(1.2) rotate(8deg)'; });
    setTimeout(()=>{ burst.style.opacity='0'; burst.style.transform='scale(.9) rotate(15deg) translateY(-8px)'; setTimeout(()=>burst.remove(),400); },700);
    for (let i=0;i<6;i++) {
      const sp=document.createElement('div');
      sp.style.cssText=`position:fixed;left:${x}px;top:${y}px;width:4px;height:4px;border-radius:999px;background:oklch(0.92 0.22 ${h});z-index:9998;pointer-events:none;transition:transform .55s ease,opacity .55s;`;
      document.body.appendChild(sp);
      const ang=(i/6)*Math.PI*2, dist=30+Math.random()*20;
      requestAnimationFrame(()=>{ sp.style.transform=`translate(${Math.cos(ang)*dist}px,${Math.sin(ang)*dist}px) scale(.4)`; sp.style.opacity='0'; });
      setTimeout(()=>sp.remove(),600);
    }
  }

  function slapLabel(target, text) {
    if (target.__nx7slap) return;
    target.__nx7slap=true;
    const h=getHue(), label=document.createElement('div');
    label.textContent=text;
    const t=-4+Math.random()*8;
    label.style.cssText=`position:absolute;top:-22px;left:50%;padding:5px 11px 6px;background:oklch(0.85 0.22 ${h});color:oklch(0.18 0.06 ${h});font-family:var(--font-sans),sans-serif;font-size:11px;font-weight:900;letter-spacing:.08em;border-radius:6px;box-shadow:0 6px 18px oklch(0.55 0.20 ${h}/0.5);transform:translateX(-50%) translateY(-8px) rotate(${t}deg) scale(.4);opacity:0;transition:transform .35s cubic-bezier(.34,1.8,.64,1),opacity .25s;z-index:21;pointer-events:none;white-space:nowrap;`;
    if (getComputedStyle(target).position==='static') target.style.position='relative';
    target.appendChild(label);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      label.style.transform=`translateX(-50%) translateY(0) rotate(${t}deg) scale(1.1)`;
      label.style.opacity='1';
      setTimeout(()=>{ label.style.transform=`translateX(-50%) translateY(0) rotate(${t}deg) scale(1)`; },350);
    }));
    setTimeout(()=>{
      label.style.transform=`translateX(-50%) translateY(-14px) rotate(${t*1.5}deg) scale(.85)`;
      label.style.opacity='0';
      setTimeout(()=>{ label.remove(); delete target.__nx7slap; },400);
    },4500);
  }

  // ── Routines ──────────────────────────────────────────────
  async function r_point() {
    const el=pick(visEls('.post-item,.anime-tile,.nav-link,.card,.archive-row,.profile'));
    if (!el) return;
    const r=el.getBoundingClientRect();
    const side=r.left+r.width/2<window.innerWidth/2?1:-1;
    await moveTo(r.left+r.width/2+side*(r.width/2+60), r.top+r.height/2-40);
    const me=elRef?.getBoundingClientRect(); if (!me) return;
    const angle=Math.atan2(r.top+r.height/2-(me.top+50), r.left+r.width/2-(me.left+me.width/2))*180/Math.PI;
    const length=Math.hypot(r.left+r.width/2-(me.left+me.width/2), r.top+r.height/2-(me.top+50))-12;
    arm={angle,length};
    markTarget(r.left+r.width/2, r.top+r.height/2, el);
    speak(pick(D.point),2500);
    await pause(2400); arm=null;
  }

  async function r_trip() {
    const el=pick(visEls('.post-body h1.title,.post-body h2,.post-item h3,.archive-row,.title-overlay,.post-body p'));
    if (!el) return;
    const r=el.getBoundingClientRect();
    const side=pos.x<r.left+r.width/2?1:-1;
    facing=side;
    await moveTo(side>0?r.left-70:r.right+10, r.top-30,{speed:3});
    await moveTo(side>0?r.left-30:r.right-30, r.top-30,{speed:5});
    botState='tripping';
    el.style.animation='nx7-bumped 0.5s ease';
    setTimeout(()=>{ el.style.animation=''; },550);
    spawnImpact(side>0?r.left:r.right, r.top+30);
    tilt=side>0?80:-80;
    pos={x:pos.x+side*30,y:pos.y+36};
    const tripped=(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,28);
    speak(`OUCH. WHO PUT "${tripped.split(' ')[0]}" THERE.`,2400);
    await pause(1500);
    pos={x:pos.x-side*30,y:pos.y-36};
    tilt=0; await pause(200);
    botState='idle';
  }

  async function r_climb() {
    const el=pick(visEls('.card,.post-item,.anime-cover'));
    if (!el) return;
    const r=el.getBoundingClientRect();
    await moveTo(r.left+r.width/2-50,r.top-110);
    botState='climbing'; speak(pick(D.climb),2800);
    await pause(2400); botState='idle';
  }

  async function r_knock() {
    await moveTo(window.innerWidth/2-50,100);
    botState='knocking'; speak(pick(D.knock),2200);
    for (let i=0;i<3;i++){screenRipple();await pause(380);}
    botState='idle';
  }

  async function r_read() {
    const el=pick(visEls('.post-body p,.post-item p,.post-body h2'));
    if (!el) return;
    const r=el.getBoundingClientRect();
    await moveTo(r.left+r.width/2-50,r.top-70);
    botState='reading';
    let i=0;
    const sc=setInterval(()=>{ i++; eye={x:Math.sin(i*.5)*2.8,y:0}; },90);
    await pause(2800); clearInterval(sc); eye={x:0,y:0};
    speak(pick(D.read),2400); botState='idle';
  }

  async function r_highlight() {
    const el=highlightParagraph(); if (!el) return;
    const r=el.getBoundingClientRect();
    await moveTo(r.left+r.width+16,r.top-30,{speed:3});
    speak(pick(D.highlight),2400); await pause(2000);
  }

  async function r_glitch_text() {
    const el=glitchHeading(); if (!el) return;
    const r=el.getBoundingClientRect();
    await moveTo(r.left+r.width+16,r.top-50,{speed:3});
    speak(pick(D.break),2400); await pause(1800);
  }

  async function r_sticky() {
    const c=stickyNote(); if (!c) return;
    const r=c.getBoundingClientRect();
    await moveTo(r.left-60,r.top-30,{speed:3});
    speak(pick(D.sticky),2400); await pause(2000);
  }

  async function r_scribble() {
    const link=scribbleUnder(); if (!link) return;
    const r=link.getBoundingClientRect();
    await moveTo(r.left+r.width/2-50,r.bottom+10,{speed:3});
    speak(pick(D.scribble),2200); await pause(1800);
  }

  async function r_dance() {
    botState='dancing'; speak(pick(D.dance),2400);
    for (let i=0;i<6;i++){
      facing=i%2?1:-1;
      pos={x:pos.x+(i%2?12:-12),y:pos.y-(i%2?0:8)};
      await pause(180);
      pos={x:pos.x+(i%2?-12:12),y:pos.y+(i%2?0:8)};
      await pause(180);
    }
    botState='idle';
  }

  async function r_stretch() {
    botState='stretching'; speak(pick(D.stretch),2000);
    await pause(1800); botState='idle';
  }

  async function r_glitch() {
    botState='glitching'; speak(pick(D.glitch),2000);
    spawnGhosts(); await pause(900); botState='idle';
  }

  async function r_wander() {
    const x=60+Math.random()*(window.innerWidth-180);
    const y=80+Math.random()*(window.innerHeight-220);
    await moveTo(x,y);
    if (Math.random()<.3)      speak(pick(D.wander),2200);
    else if (Math.random()<.5) think(pick(T),3800);
    else                       speak(pick(D.idle),2400);
  }

  async function r_suggest() {
    const s=pick(D.suggest);
    const link=document.querySelector(`a[href="/${s.route}"]`);
    if (link){
      const r=link.getBoundingClientRect();
      await moveTo(r.left+r.width/2-50,r.top+38,{speed:4});
      slapLabel(link,'CHECK THIS OUT ↓');
      eyeMode='smirk';
      speak(s.line,4500,{route:s.route,label:s.label});
      for(let i=0;i<3;i++){facing=i%2?1:-1;await pause(220);}
      eyeMode='closed'; await pause(220);
      eyeMode='smirk';  await pause(1400);
      eyeMode='normal';
    } else {
      speak(s.line,4500,{route:s.route,label:s.label});
      await pause(2400);
    }
  }

  async function r_chase() {
    botState='chasing'; speak(pick(D.chase),1600);
    for(let i=0;i<4;i++){
      await moveTo(cursor.x-50,cursor.y-50,{speed:4});
      await pause(150);
    }
    botState='idle';
  }

  async function r_tour() {
    const path=window.location.pathname;
    const cur=path==='/'?'home':path.startsWith('/posts/')?'posts':path.slice(1).split('/')[0];
    const targets=['anime','archive','about','home'].filter(r=>r!==cur);
    const next=pick(targets);
    botState='touring';
    speak('INITIATING TOUR. NAVIGATING TO '+next.toUpperCase()+'.',3000);
    const link=document.querySelector(`a[href="/${next}"]`);
    if(link){const r=link.getBoundingClientRect();markTarget(r.left+r.width/2,r.top+r.height/2,link);}
    await pause(1800);
    window.location.href='/'+next;
  }

  // ── New routines ──────────────────────────────────────────
  async function r_admire() {
    const el=pick(visEls('.post-item,.anime-tile,.card,.profile'));
    if (!el) return;
    const r=el.getBoundingClientRect();
    await moveTo(r.left+r.width/2-50, r.top-70, {speed:2});
    eyeMode='hearts';
    const h=getHue();
    // glowing heart aura on the element
    const glow=document.createElement('div');
    glow.style.cssText=`position:fixed;left:${r.left-4}px;top:${r.top-4}px;width:${r.width+8}px;height:${r.height+8}px;border-radius:14px;box-shadow:0 0 0 2px oklch(0.75 0.22 ${h}/0.5),0 0 24px oklch(0.75 0.22 ${h}/0.35),0 0 60px oklch(0.75 0.22 ${h}/0.15);z-index:9990;pointer-events:none;opacity:0;transition:opacity .4s;`;
    document.body.appendChild(glow);
    requestAnimationFrame(()=>{ glow.style.opacity='1'; });
    speak(['BEAUTIFUL.','EXCEPTIONAL.','REBIZ MADE THIS. I APPROVE.','A+. CHEF\'S KISS.','10/10. NO NOTES.'][Math.floor(Math.random()*5)], 2800);
    // float hearts
    for(let i=0;i<4;i++){
      setTimeout(()=>{
        const heart=document.createElement('div');
        heart.textContent='♡';
        const hx=r.left+Math.random()*r.width;
        heart.style.cssText=`position:fixed;left:${hx}px;top:${r.top}px;font-size:${14+Math.random()*10}px;color:oklch(0.75 0.22 ${h});z-index:9991;pointer-events:none;opacity:0;transition:transform 1.4s ease-out,opacity .4s;`;
        document.body.appendChild(heart);
        requestAnimationFrame(()=>{ heart.style.opacity='1'; heart.style.transform=`translateY(-60px) rotate(${(Math.random()-.5)*20}deg) scale(${.8+Math.random()*.4})`; });
        setTimeout(()=>{ heart.style.opacity='0'; setTimeout(()=>heart.remove(),420); },1200);
      }, i*320);
    }
    await pause(2800);
    glow.style.opacity='0'; setTimeout(()=>glow.remove(),420);
    eyeMode='normal';
  }

  async function r_nod() {
    speak(pick(D.idle),2400);
    for(let i=0;i<4;i++){
      pos={x:pos.x,y:pos.y-8}; await pause(180);
      pos={x:pos.x,y:pos.y+8}; await pause(180);
    }
  }

  async function r_panic() {
    botState='panicking'; eyeMode='surprised';
    speak('WAIT. WAIT. WAIT. THIS IS FINE.',2200);
    for(let i=0;i<5;i++){
      const tx=40+Math.random()*(window.innerWidth-180);
      const ty=80+Math.random()*(window.innerHeight-220);
      await moveTo(tx,ty,{speed:9});
      await pause(80);
    }
    eyeMode='tired'; speak('...FINE. THAT WAS PLANNED.',2000);
    await pause(800); eyeMode='normal'; botState='idle';
  }

  async function r_investigate() {
    const el=pick(visEls('.post-item,.anime-tile,.archive-row'));
    if (!el) return;
    const r=el.getBoundingClientRect();
    botState='reading'; eyeMode='question';
    // approach slowly
    await moveTo(r.left+r.width/2-50, r.top-60, {speed:1.2});
    // scan eyes left-right fast
    let n=0;
    const sc=setInterval(()=>{ n++; eye={x:Math.sin(n*.8)*3.5,y:Math.cos(n*.4)*.8}; },60);
    await pause(1800); clearInterval(sc); eye={x:0,y:0};
    eyeMode='normal';
    speak(['ANALYSIS COMPLETE. VERDICT: INTERESTING.','DETECTED. LOGGED. EVALUATED.','I HAVE QUESTIONS. THEY ARE RHETORICAL.',
           'MY SENSORS ARE INTRIGUED.','CLASSIFIED AS: NOTABLE.'][Math.floor(Math.random()*5)], 2600);
    botState='idle';
  }

  async function r_star() {
    // finds a post and marks it with a floating ★
    const el=pick(visEls('.post-item h3,.archive-row,.title-overlay'));
    if(!el) return;
    const r=el.getBoundingClientRect();
    await moveTo(r.left-60,r.top-30,{speed:3});
    const h=getHue();
    const star=document.createElement('div');
    star.textContent='★';
    star.style.cssText=`position:fixed;left:${r.left-18}px;top:${r.top-14}px;font-size:20px;color:oklch(0.82 0.22 ${h});text-shadow:0 0 12px oklch(0.75 0.22 ${h}/0.8);z-index:9991;pointer-events:none;opacity:0;transform:scale(0) rotate(-30deg);transition:opacity .3s,transform .5s cubic-bezier(.34,1.8,.64,1);`;
    document.body.appendChild(star);
    requestAnimationFrame(()=>{ star.style.opacity='1'; star.style.transform='scale(1) rotate(0deg)'; });
    speak(['STARRED. YOU\'RE WELCOME.','THIS ONE. SPECIFICALLY.','REBIZ WOULD WANT YOU TO SEE THIS.','MARKED FOR ETERNITY.'][Math.floor(Math.random()*4)],2400);
    sparkle(r.left-8, r.top, 5);
    await pause(2200);
    star.style.opacity='0'; star.style.transition='opacity .5s'; setTimeout(()=>star.remove(),520);
  }

  async function r_coffee() {
    speak(['*sips*','FUEL ACQUIRED.','REBIZ RUNS ON THIS TOO, I\'M TOLD.','PROCESSING EFFICIENCY: +12%.'][Math.floor(Math.random()*4)],2000);
    eyeMode='smirk';
    const me=elRef?.getBoundingClientRect();
    if(me){
      const cup=document.createElement('div');
      cup.textContent='☕';
      cup.style.cssText=`position:fixed;left:${me.left+me.width-4}px;top:${me.top-10}px;font-size:22px;z-index:9991;pointer-events:none;opacity:0;transform:translateY(8px);transition:opacity .3s,transform .4s cubic-bezier(.34,1.56,.64,1);`;
      document.body.appendChild(cup);
      requestAnimationFrame(()=>{ cup.style.opacity='1'; cup.style.transform='translateY(0)'; });
      await pause(1800);
      cup.style.opacity='0'; cup.style.transition='opacity .4s'; setTimeout(()=>cup.remove(),420);
    } else { await pause(1800); }
    eyeMode='normal';
  }

  // ── Physical interaction routines ─────────────────────────

  async function r_sit() {
    const el = pick(visEls('.post-item,.anime-tile,.card,.profile'));
    if (!el) return;
    const r = el.getBoundingClientRect();
    // position bot so it appears to sit on top edge of element
    await moveTo(r.left + r.width/2 - 50, r.top - 88, {speed: 2.5});
    botState = 'climbing';
    eyeMode = 'smirk';
    // gentle leg-swinging bob (move up/down slightly)
    for (let i = 0; i < 5; i++) {
      pos = {x: pos.x, y: pos.y - 4}; await pause(200);
      pos = {x: pos.x, y: pos.y + 4}; await pause(200);
    }
    speak(pick(['ALTITUDE SECURED.', 'PRIME VANTAGE POINT.', 'I LIVE HERE NOW.', 'DO NOT DISTURB. I AM SEATED.', '...COMFY.']), 2400);
    await pause(1800); eyeMode = 'normal'; botState = 'idle';
  }

  async function r_grab() {
    const el = pick(visEls('.post-item,.anime-tile,.card'));
    if (!el) return;
    const r = el.getBoundingClientRect();
    const side = pos.x < r.left + r.width/2 ? 1 : -1;
    await moveTo(r.left + (side > 0 ? -45 : r.width + 5) - 50, r.top + r.height/2 - 50, {speed: 3.5});
    const me = elRef?.getBoundingClientRect();
    if (me) {
      const tx = r.left + r.width/2, ty = r.top + r.height/2;
      const angle = Math.atan2(ty - (me.top + 50), tx - (me.left + 50)) * 180 / Math.PI;
      const length = Math.hypot(tx - (me.left + 50), ty - (me.top + 50)) - 12;
      arm = {angle, length};
    }
    // shake the card
    el.style.transition = 'transform 60ms';
    for (let i = 0; i < 5; i++) {
      el.style.transform = `translateX(${i%2===0?'-5px':'5px'}) rotate(${i%2===0?'-0.8':'0.8'}deg)`;
      await pause(70);
    }
    el.style.transform = ''; el.style.transition = '';
    speak(pick(['GOTCHA.', 'STRUCTURAL TEST: PASSED.', 'JUST CHECKING.', 'HELLO? ANYONE HOME?', 'I CAN DO THIS ALL DAY.']), 2000);
    await pause(900); arm = null;
  }

  async function r_write_screen() {
    const el = pick(visEls('.post-item h3,.title-overlay,.archive-row,.post-body h2'));
    if (!el) return;
    const r = el.getBoundingClientRect();
    await moveTo(r.left - 38, r.top - 42, {speed: 3});
    const h = getHue();
    const texts = ['← READ THIS', '★ NOTED', '!! IMPORTANT', '→ CLICK ME', '♡ FAVE'];
    const txt = pick(texts);
    const rot = -10 + Math.random() * 20;
    const label = document.createElement('div');
    label.textContent = txt;
    label.style.cssText = `position:fixed;left:${r.left}px;top:${r.top - 26}px;font-family:var(--font-mono),monospace;font-size:13px;font-weight:900;color:oklch(0.92 0.22 ${h});text-shadow:0 0 14px oklch(0.75 0.22 ${h}/0.9);letter-spacing:0.1em;z-index:9991;pointer-events:none;transform:rotate(${rot}deg) scale(0.4);opacity:0;transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .3s;`;
    document.body.appendChild(label);
    requestAnimationFrame(() => { label.style.opacity = '1'; label.style.transform = `rotate(${rot}deg) scale(1)`; });
    // animated underline
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `position:fixed;left:${r.left}px;top:${r.bottom - 2}px;width:${r.width}px;height:8px;z-index:9991;pointer-events:none;overflow:visible;`;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1','0'); line.setAttribute('y1','4');
    line.setAttribute('x2',String(r.width)); line.setAttribute('y2','4');
    line.setAttribute('stroke', `oklch(0.85 0.22 ${h})`);
    line.setAttribute('stroke-width', '2.5');
    line.setAttribute('stroke-linecap', 'round');
    line.style.strokeDasharray = String(r.width);
    line.style.strokeDashoffset = String(r.width);
    line.style.transition = 'stroke-dashoffset 0.6s ease-out';
    svg.appendChild(line);
    document.body.appendChild(svg);
    requestAnimationFrame(() => { line.style.strokeDashoffset = '0'; });
    speak(pick(D.scribble), 2200);
    await pause(3800);
    label.style.opacity = '0'; label.style.transform = `rotate(${rot}deg) scale(0.6)`;
    svg.style.opacity = '0'; svg.style.transition = 'opacity .35s';
    setTimeout(() => { label.remove(); svg.remove(); }, 380);
  }

  async function r_peek() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      const r = sidebar.getBoundingClientRect();
      // move behind right edge of sidebar — mostly visible but act like peeking
      await moveTo(r.right - 85, r.top + 100 + Math.random() * 80, {speed: 2});
      eyeMode = 'smirk';
      speak(pick(['...BOO.', 'YOU SAW NOTHING.', 'I WAS ALWAYS HERE.', 'OPTIMAL OBSERVATION SPOT.', '...JUST LURKING.']), 2200);
      await pause(800);
      // nudge closer to edge (peek)
      const savedX = pos.x;
      pos = {x: r.right - 20, y: pos.y};
      await pause(1200);
      pos = {x: savedX, y: pos.y};
      await pause(500);
      eyeMode = 'normal';
    } else {
      // No sidebar — peek from left screen edge
      const edgeX = -68;
      const y = 160 + Math.random() * (window.innerHeight - 360);
      pos = {x: edgeX, y}; facing = 1;
      await pause(1800);
      speak(pick(['PEEK.', 'I AM WATCHING.', '...HI.', 'SPOTTED YOU.']), 1800);
      await pause(1200);
      await moveTo(60, y, {speed: 3});
      eyeMode = 'normal';
    }
  }

  // ── Matrix: bot triggers the peel and hypes it ───────────
  async function r_matrix() {
    botState = 'glitching'; eyeMode = 'wide';
    speak(pick(D.hacker), 1800);
    spawnGhosts();
    await pause(900);
    window.__nx7_triggerPeel?.();
    speak(pick(D.matrix), 2800);
    await pause(1800);
    botState = 'idle'; eyeMode = 'normal';
  }

  // ── Gravity chaos: components fall, NX-7 fixes them ─────
  async function r_gravity_chaos() {
    const pool = visEls('.post-item,.card,.anime-tile,.archive-row,.profile,.sidebar-widget,.widget');
    if (pool.length < 1) return;

    const count = Math.min(pool.length, 2 + Math.floor(Math.random() * 3));
    const targets = pool.slice().sort(() => Math.random() - 0.5).slice(0, count);

    // Panic first
    botState = 'panicking'; eyeMode = 'surprised';
    speak(pick(D.gravity), 2600);
    spawnGhosts();
    await pause(700);

    // Capture rects and detach elements into fixed positioning
    const falls = targets.map(el => {
      const r = el.getBoundingClientRect();
      const origStyle = el.getAttribute('style') ?? '';
      el.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;z-index:9950;pointer-events:none;transition:none;margin:0;box-sizing:border-box;`;
      return {
        el, origStyle,
        origX: r.left, origY: r.top,
        w: r.width, h: r.height,
        x: r.left, y: r.top,
        vy: 0, vx: (Math.random() - 0.5) * 80,
        rot: 0, vrot: (Math.random() - 0.5) * 200,
        settled: false,
      };
    });

    // Physics simulation
    await new Promise(resolve => {
      let lastT = performance.now();
      const GRAVITY = 1000, BOUNCE = 0.32, FRICTION = 0.72;
      const tid = setTimeout(resolve, 5000);
      function tick(t) {
        const dt = Math.min((t - lastT) / 1000, 0.05);
        lastT = t;
        let allDone = true;
        for (const f of falls) {
          if (f.settled) continue;
          allDone = false;
          f.vy += GRAVITY * dt;
          f.y  += f.vy  * dt;
          f.x  += f.vx  * dt;
          f.rot += f.vrot * dt;
          const floor = window.innerHeight - f.h - 10;
          if (f.y >= floor) {
            f.y = floor;
            f.vy = -Math.abs(f.vy) * BOUNCE;
            f.vx *= FRICTION;
            f.vrot *= FRICTION;
            if (Math.abs(f.vy) < 30 && Math.abs(f.vx) < 8) {
              f.settled = true;
              spawnImpact(f.x + f.w / 2, floor + 5);
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

    // Repair each element one by one
    botState = 'idle'; eyeMode = 'angry-eyes';
    speak(pick(D.fix_gravity), 2200);
    await pause(500);

    const repairLines = ['RECALIBRATING.', 'STRUCTURAL RESTORE: ACTIVE.', 'GRAVITY OVERRIDE.', 'PATCHING PHYSICS.', 'POSITION: LOCKED.', 'ELEMENT: SECURED.'];
    for (const f of falls) {
      const r = f.el.getBoundingClientRect();
      await moveTo(r.left + f.w / 2 - 50, r.top - 90, { speed: 7 });
      eyeMode = 'wide';
      markTarget(r.left + f.w / 2, r.top + f.h / 2, f.el);
      sparkle(r.left + f.w / 2, r.top + f.h / 2, 8);
      speak(pick(repairLines), 1500);
      screenRipple();
      // Animate element back to original position
      f.el.style.transition = 'top .7s cubic-bezier(.34,1.56,.64,1),left .6s ease-out,transform .65s cubic-bezier(.34,1.3,.64,1)';
      f.el.style.top       = `${f.origY}px`;
      f.el.style.left      = `${f.origX}px`;
      f.el.style.transform = 'rotate(0deg)';
      await pause(750);
      // Restore original inline style (element re-enters normal flow)
      if (f.origStyle) f.el.setAttribute('style', f.origStyle);
      else f.el.removeAttribute('style');
      sparkle(f.origX + f.w / 2, f.origY + f.h / 2, 5);
      eyeMode = 'smirk';
      await pause(380);
    }

    eyeMode = 'normal'; botState = 'idle';
    speak(pick(D.repaired), 2800);
    await pause(1200);
  }

  // ── Routine picker ────────────────────────────────────────
  const ROUTINES=[
    {fn:r_wander,      w:13},{fn:r_point,       w:9}, {fn:r_trip,       w:6},
    {fn:r_read,        w:6}, {fn:r_highlight,   w:5}, {fn:r_sticky,     w:5},
    {fn:r_scribble,    w:5}, {fn:r_glitch_text, w:4}, {fn:r_dance,      w:4},
    {fn:r_climb,       w:4}, {fn:r_knock,       w:3}, {fn:r_stretch,    w:3},
    {fn:r_glitch,      w:3}, {fn:r_chase,       w:3}, {fn:r_suggest,    w:6},
    {fn:r_tour,        w:2}, {fn:r_admire,      w:7}, {fn:r_nod,        w:5},
    {fn:r_panic,       w:3}, {fn:r_investigate, w:6}, {fn:r_star,       w:5},
    {fn:r_coffee,      w:4}, {fn:r_sit,         w:6}, {fn:r_grab,       w:5},
    {fn:r_write_screen,w:5}, {fn:r_peek,        w:4}, {fn:r_matrix,     w:3},
    {fn:r_gravity_chaos,w:4},
  ];
  function pickRoutine(){
    const total=ROUTINES.reduce((a,r)=>a+r.w,0);
    let n=Math.random()*total;
    for(const r of ROUTINES){if((n-=r.w)<=0)return r.fn;}
    return r_wander;
  }

  // ── Sleep timer ───────────────────────────────────────────
  function resetSleep(){
    clearTimeout(sleepTid);
    if(botState==='sleeping') botState='idle';
    sleepTid=setTimeout(()=>{
      if(botState==='idle'){
        speak(pick(D.yawn),1400);
        setTimeout(()=>speak(pick(D.sleep),5000),1500);
        botState='sleeping';
      }
    },60000);
  }

  // ── Reactive weather ──────────────────────────────────────
  const STATE_WEATHER={glitching:'🌀',angry:'⚡',sleeping:'💤',touring:'🚀',tripping:'😵',dancing:'🕺',climbing:'🧗',knocking:'👋',reading:'📖',chasing:'👟',stretching:'🤸',saluting:'🫡',panicking:'😱'};
  $: {
    if(STATE_WEATHER[botState]) weather=STATE_WEATHER[botState];
    else { const h=new Date().getHours(); weather=h>=22||h<6?'🌙':h<9?'🌅':h<18?'☀':'🌆'; }
  }

  // ── Derived ───────────────────────────────────────────────
  $: flipStr=`scaleX(${facing}) rotate(${tilt}deg)`;

  // Clamp speech bubble so it never escapes the viewport
  const SW = 220;
  $: speechLeft = typeof window !== 'undefined'
    ? Math.max(8, Math.min(window.innerWidth - SW - 8, pos.x + 50 - SW / 2))
    : pos.x + 50 - SW / 2;
  $: speechBottom = typeof window !== 'undefined'
    ? window.innerHeight - pos.y + 12
    : 120;
  // Arrow tracks bot center relative to bubble position (clamped to bubble edges)
  $: arrowLeft = Math.max(14, Math.min(SW - 14, Math.round(pos.x + 50 - speechLeft)));

  // ── Click / double-click ──────────────────────────────────
  function onMascotClick(e){
    e.stopPropagation(); resetSleep();
    const now=Date.now();
    clickCount=(now-clickLast<800)?clickCount+1:1;
    clickLast=now;
    if(clickCount>=4){
      botState='angry'; eyeMode='angry-eyes'; speak(pick(D.angry),4000);
      setTimeout(()=>{ botState='idle'; eyeMode='normal'; clickCount=0; },4500);
    } else {
      botState='clicked'; speak(pick(D.clicked),1400);
      setTimeout(()=>{ botState='idle'; },800);
    }
  }
  function onDblClick(e){ e.stopPropagation(); if(!busy){ busy=true; r_dance().finally(()=>{ busy=false; }); } }

  // ── Drag ─────────────────────────────────────────────────
  function onDown(e){
    if(e.target.closest('.nx7-speech')||e.target.closest('.nx7-close')) return;
    dragging=true;
    const t=e.touches?.[0]??e;
    dragOx=t.clientX-pos.x; dragOy=t.clientY-pos.y;
  }

  onMount(()=>{
    pos={x:40,y:window.innerHeight-160};

    // Boot + greeting
    let cancelled=false;
    (async()=>{
      for(const line of D.boot){
        if(cancelled)return;
        speak(line,1100); await pause(1450);
      }
      if(cancelled)return;
      botState='greeting'; speak(pick(D.greet),3000);
      await pause(3200); if(cancelled)return;
      botState='saluting'; speak(pick(D.salute),2000);
      await pause(1800); botState='idle';
      // page greeting
      const path=window.location.pathname;
      const route=path==='/'?'home':path.startsWith('/posts/')?'posts':path.slice(1).split('/')[0];
      const msgs=D.page[route]??D.page.home;
      await pause(600);
      speak(pick(msgs),3000);
    })();

    // Behaviour loop — starts after 5s (not 8-16) for snappier feel
    (async()=>{
      await pause(5000);
      while(!cancelled){
        const delay=6000+Math.random()*7000;
        await pause(delay);
        if(cancelled||dragging||busy)continue;
        if(['sleeping','booting','greeting','angry'].includes(botState))continue;
        busy=true;
        try{ await pickRoutine()(); }catch(_){}
        busy=false;
      }
    })();

    // Mouse tracking
    const onMouseMove=e=>{
      cursor={x:e.clientX,y:e.clientY};
      const r=elRef?.getBoundingClientRect(); if(!r)return;
      const dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2-8);
      const dist=Math.hypot(dx,dy);
      if(botState!=='reading'&&dist>0){
        const f=Math.min(dist/280,1);
        eye={x:dx/dist*f*3,y:dy/dist*f*2.5};
      }
      if(dist<70&&botState==='idle'&&!busy&&!dragging&&Math.random()<.4){
        busy=true; speak(pick(D.flee),1400);
        const fx=dx>0?Math.max(20,r.left-200):Math.min(window.innerWidth-110,r.left+200);
        moveTo(fx,r.top,{speed:5}).then(()=>{ busy=false; });
      }
      resetSleep();
    };
    window.addEventListener('mousemove',onMouseMove);

    // Drag
    const onDragMove=e=>{
      if(!dragging)return;
      const t=e.touches?.[0]??e;
      pos={x:t.clientX-dragOx,y:t.clientY-dragOy};
    };
    const onDragUp=()=>{ dragging=false; };
    window.addEventListener('mousemove',onDragMove);
    window.addEventListener('touchmove',onDragMove,{passive:false});
    window.addEventListener('mouseup',onDragUp);
    window.addEventListener('touchend',onDragUp);

    resetSleep();

    // Comment on page after soft navigation (View Transitions)
    const onPageLoad = () => {
      const path = window.location.pathname;
      const route = path==='/'?'home':path.startsWith('/posts/')?'posts':path.slice(1).split('/')[0];
      const msgs = D.page[route] ?? D.page.home;
      setTimeout(() => { if (!busy) speak(pick(msgs), 3200); }, 700);
    };
    document.addEventListener('astro:page-load', onPageLoad);

    return ()=>{
      cancelled=true;
      clearTimeout(sleepTid);clearTimeout(speechTid);clearInterval(typeTid);clearInterval(glitchIv);
      window.removeEventListener('mousemove',onMouseMove);
      window.removeEventListener('mousemove',onDragMove);
      window.removeEventListener('touchmove',onDragMove);
      window.removeEventListener('mouseup',onDragUp);
      window.removeEventListener('touchend',onDragUp);
      document.removeEventListener('astro:page-load', onPageLoad);
    };
  });
</script>

{#if !dismissed}
  {#if thought}
    <div class="nx7-thought" style="left:{facing===-1?pos.x-168:pos.x+108}px;top:{pos.y+18}px">
      <div class="nx7-thought-cloud">{thought}</div>
    </div>
  {/if}

  {#if speech}
    <div class="nx7-speech" style="left:{speechLeft}px;bottom:{speechBottom}px">
      <div class="nx7-speech-head">
        <span class="nx7-tag">⛩ MK-7</span>
        <span class="nx7-dots"><span></span><span></span><span></span></span>
      </div>
      <span class="nx7-speech-text">{speech.text}<span class="nx7-caret">▌</span></span>
      {#if speech.action}
        <a class="nx7-action" href="/{speech.action.route}">
          {speech.action.label}
        </a>
      {/if}
      <div class="nx7-speech-tail" style="left:{arrowLeft}px"></div>
    </div>
  {/if}

  <div
    bind:this={elRef}
    class="nx7-root state-{botState}"
    style="left:{pos.x}px;top:{pos.y}px;transform:{flipStr}"
    on:mousedown={onDown}
    on:touchstart|passive={onDown}
    on:click={onMascotClick}
    on:dblclick={onDblClick}
    role="presentation"
  >
    {#if arm}
      <div class="nx7-arm" style="transform:translate(-50%,-50%) rotate({arm.angle}deg);width:{arm.length}px">
        <div class="nx7-arm-finger"></div>
      </div>
    {/if}

    <button class="nx7-close" on:click|stopPropagation={()=>{ dismissed=true; }} aria-label="Dismiss">✕</button>
    <div class="nx7-weather" style="transform:scaleX({facing})">{weather}</div>

    <svg class="nx7-sprite" width="100" height="100" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="mikoRobeFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="oklch(0.92 0.015 30)" stop-opacity="1"/>
          <stop offset="100%" stop-color="oklch(0.92 0.015 30)" stop-opacity="0"/>
        </linearGradient>
      </defs>

      <!-- Antennae — flowing curves with glowing tips -->
      <path d="M 38 21 C 30 14 18 9 12 5" stroke="oklch(0.82 0.04 30)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <circle cx="11" cy="4" r="3.5" fill="oklch(0.85 0.22 var(--hue))" class="nx7-bulb"/>
      <path d="M 62 21 C 70 14 82 9 88 5" stroke="oklch(0.82 0.04 30)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <circle cx="89" cy="4" r="3.5" fill="oklch(0.85 0.22 var(--hue))" class="nx7-bulb"/>

      <!-- Face -->
      <ellipse cx="50" cy="30" rx="18" ry="20" fill="oklch(0.93 0.015 30)" stroke="oklch(0.55 0.25 20)" stroke-width="1"/>

      <!-- Miko headband -->
      <rect x="32" y="19" width="36" height="8" rx="3.5" fill="oklch(0.50 0.25 20)"/>
      <line x1="46" y1="19" x2="46" y2="15" stroke="rgba(255,255,255,0.65)" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="54" y1="19" x2="54" y2="15" stroke="rgba(255,255,255,0.65)" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="44" y1="17" x2="56" y2="17" stroke="rgba(255,255,255,0.65)" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="43" y1="19" x2="57" y2="19" stroke="rgba(255,255,255,0.40)" stroke-width="1" stroke-linecap="round"/>

      <!-- Eyes — tracked by mouse -->
      <g style="transform:translate({eye.x*.4}px,{eye.y*.3}px);transition:transform 0.08s ease">
        {#if eyeMode==='closed'}
          <path d="M 36 31 Q 40 28 44 31" stroke="oklch(0.55 0.25 20)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
          <path d="M 56 31 Q 60 28 64 31" stroke="oklch(0.55 0.25 20)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        {:else if eyeMode==='smirk'}
          <ellipse cx="40" cy="31" rx="4.5" ry="5" fill="#0a0a18"/>
          <circle cx="40" cy="31" r="2.7" fill="oklch(0.65 0.18 var(--hue))"/>
          <circle cx="41.5" cy="29.5" r="1.2" fill="white" opacity="0.9"/>
          <path d="M 36 27 Q 40 24.5 44 27" stroke="#0a0a18" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <path d="M 56 31 Q 60 27.5 64 31" stroke="oklch(0.55 0.25 20)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        {:else if eyeMode==='hearts'}
          <text x="40" y="37" font-size="12" fill="oklch(0.68 0.25 0)" text-anchor="middle" font-family="serif">♡</text>
          <text x="60" y="37" font-size="12" fill="oklch(0.68 0.25 0)" text-anchor="middle" font-family="serif">♡</text>
        {:else if eyeMode==='question'}
          <ellipse cx="40" cy="31" rx="4.5" ry="5" fill="#0a0a18"/>
          <circle cx="40" cy="31" r="2.7" fill="oklch(0.65 0.18 var(--hue))"/>
          <circle cx="41.5" cy="29.5" r="1.2" fill="white" opacity="0.9"/>
          <path d="M 36 27 Q 40 24.5 44 27" stroke="#0a0a18" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <text x="60" y="36" font-size="10" fill="oklch(0.65 0.18 var(--hue))" text-anchor="middle" font-weight="900">?</text>
        {:else if eyeMode==='tired'}
          <ellipse cx="40" cy="32.5" rx="4.5" ry="3.5" fill="#0a0a18"/>
          <ellipse cx="40" cy="32.5" rx="2.4" ry="1.9" fill="oklch(0.65 0.18 var(--hue))"/>
          <path d="M 35 29 Q 40 27 45 29" stroke="oklch(0.88 0.02 30)" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.85"/>
          <ellipse cx="60" cy="32.5" rx="4.5" ry="3.5" fill="#0a0a18"/>
          <ellipse cx="60" cy="32.5" rx="2.4" ry="1.9" fill="oklch(0.65 0.18 var(--hue))"/>
          <path d="M 55 29 Q 60 27 65 29" stroke="oklch(0.88 0.02 30)" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.85"/>
        {:else if eyeMode==='surprised'}
          <ellipse cx="40" cy="31" rx="5.5" ry="6" fill="#0a0a18"/>
          <circle cx="40" cy="31" r="3.3" fill="oklch(0.68 0.18 var(--hue))"/>
          <circle cx="42" cy="29" r="1.5" fill="white" opacity="0.9"/>
          <ellipse cx="60" cy="31" rx="5.5" ry="6" fill="#0a0a18"/>
          <circle cx="60" cy="31" r="3.3" fill="oklch(0.68 0.18 var(--hue))"/>
          <circle cx="62" cy="29" r="1.5" fill="white" opacity="0.9"/>
        {:else if eyeMode==='wide'}
          <ellipse cx="40" cy="31" rx="5" ry="5.5" fill="#0a0a18"/>
          <circle cx="40" cy="31" r="3" fill="oklch(0.68 0.18 var(--hue))"/>
          <circle cx="41.5" cy="29" r="1.3" fill="white" opacity="0.9"/>
          <path d="M 35 27 Q 40 24 45 27" stroke="#0a0a18" stroke-width="1.6" fill="none" stroke-linecap="round"/>
          <ellipse cx="60" cy="31" rx="5" ry="5.5" fill="#0a0a18"/>
          <circle cx="60" cy="31" r="3" fill="oklch(0.68 0.18 var(--hue))"/>
          <circle cx="61.5" cy="29" r="1.3" fill="white" opacity="0.9"/>
          <path d="M 55 27 Q 60 24 65 27" stroke="#0a0a18" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        {:else if eyeMode==='angry-eyes'}
          <path d="M 34 27 L 45 31" stroke="oklch(0.55 0.25 20)" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M 55 31 L 66 27" stroke="oklch(0.55 0.25 20)" stroke-width="2.5" stroke-linecap="round"/>
          <ellipse cx="40" cy="33.5" rx="4.5" ry="2.8" fill="#0a0a18"/>
          <ellipse cx="40" cy="33.5" rx="2.4" ry="1.5" fill="oklch(0.55 0.25 20)"/>
          <ellipse cx="60" cy="33.5" rx="4.5" ry="2.8" fill="#0a0a18"/>
          <ellipse cx="60" cy="33.5" rx="2.4" ry="1.5" fill="oklch(0.55 0.25 20)"/>
        {:else}
          <!-- normal — large anime eyes with eyelashes -->
          <ellipse cx="40" cy="31" rx="4.5" ry="5" fill="#0a0a18"/>
          <circle cx="40" cy="31" r="2.8" fill="oklch(0.65 0.18 var(--hue))"/>
          <circle cx="41.5" cy="29.5" r="1.2" fill="white" opacity="0.9"/>
          <path d="M 36 27 Q 40 24.5 44 27" stroke="#0a0a18" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <ellipse cx="60" cy="31" rx="4.5" ry="5" fill="#0a0a18"/>
          <circle cx="60" cy="31" r="2.8" fill="oklch(0.65 0.18 var(--hue))"/>
          <circle cx="61.5" cy="29.5" r="1.2" fill="white" opacity="0.9"/>
          <path d="M 56 27 Q 60 24.5 64 27" stroke="#0a0a18" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        {/if}
      </g>

      <!-- Mouth -->
      {#if eyeMode==='closed'||eyeMode==='smirk'||eyeMode==='hearts'}
        <path d="M 45 40 Q 50 44 55 40" stroke="oklch(0.55 0.22 20)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      {:else if eyeMode==='angry-eyes'}
        <path d="M 46 42 Q 50 38.5 54 42" stroke="oklch(0.55 0.25 20)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      {:else if eyeMode==='surprised'}
        <ellipse cx="50" cy="42" rx="3.5" ry="3" fill="none" stroke="oklch(0.60 0.15 30)" stroke-width="1.5"/>
      {:else}
        <path d="M 46 40 Q 50 43.5 54 40" stroke="oklch(0.60 0.18 20)" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      {/if}

      <!-- Body — kimono silhouette -->
      <path d="M 37 47 L 32 48 L 30 80 L 70 80 L 68 48 L 63 47 Q 56 44 50 44 Q 44 44 37 47Z"
            fill="oklch(0.92 0.015 30)" stroke="oklch(0.55 0.25 20)" stroke-width="1.2"/>
      <!-- Kimono collar V -->
      <path d="M 42 48 L 50 60 L 58 48" stroke="oklch(0.50 0.25 20)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M 43 50 L 50 59 L 57 50" stroke="oklch(0.92 0.015 30)" stroke-width="1.2" fill="none" stroke-linecap="round"/>

      <!-- Torii motif — chest -->
      <line x1="43" y1="66" x2="57" y2="66" stroke="oklch(0.50 0.25 20)" stroke-width="2" stroke-linecap="round"/>
      <line x1="42" y1="68.5" x2="58" y2="68.5" stroke="oklch(0.50 0.25 20)" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="45" y1="68.5" x2="45" y2="75" stroke="oklch(0.50 0.25 20)" stroke-width="1.6" stroke-linecap="round"/>
      <line x1="55" y1="68.5" x2="55" y2="75" stroke="oklch(0.50 0.25 20)" stroke-width="1.6" stroke-linecap="round"/>

      <!-- Circuit seams -->
      <path d="M 33 58 L 39 58 M 61 58 L 67 58" stroke="oklch(0.65 0.14 var(--hue))" stroke-width="0.9" opacity="0.5" stroke-linecap="round"/>
      <path d="M 34 70 L 40 70 M 60 70 L 66 70" stroke="oklch(0.65 0.14 var(--hue))" stroke-width="0.9" opacity="0.4" stroke-linecap="round"/>
      <circle cx="39" cy="58" r="1" fill="oklch(0.65 0.14 var(--hue))" opacity="0.55"/>
      <circle cx="61" cy="58" r="1" fill="oklch(0.65 0.14 var(--hue))" opacity="0.55"/>

      <!-- Arms -->
      <path d="M 36 52 C 28 59 24 68 26 76" stroke="oklch(0.90 0.015 30)" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M 36 52 C 28 59 24 68 26 76" stroke="oklch(0.55 0.25 20)" stroke-width="0.9" fill="none" stroke-linecap="round"/>
      <circle cx="25.5" cy="76.5" r="3.2" fill="oklch(0.90 0.015 30)" stroke="oklch(0.55 0.25 20)" stroke-width="0.9"/>
      <path d="M 64 52 C 72 59 76 68 74 76" stroke="oklch(0.90 0.015 30)" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M 64 52 C 72 59 76 68 74 76" stroke="oklch(0.55 0.25 20)" stroke-width="0.9" fill="none" stroke-linecap="round"/>
      <circle cx="74.5" cy="76.5" r="3.2" fill="oklch(0.90 0.015 30)" stroke="oklch(0.55 0.25 20)" stroke-width="0.9"/>

      <!-- Floating robe fade -->
      <rect x="30" y="77" width="40" height="10" fill="url(#mikoRobeFade)"/>

      <!-- Particle dissolve -->
      <circle cx="37" cy="91" r="2.2" fill="oklch(0.80 0.18 var(--hue))" opacity="0.55" class="nx7-bulb"/>
      <circle cx="50" cy="94" r="1.6" fill="oklch(0.80 0.18 var(--hue))" opacity="0.38"/>
      <circle cx="63" cy="91" r="2.2" fill="oklch(0.80 0.18 var(--hue))" opacity="0.55" class="nx7-bulb"/>
      <circle cx="43" cy="96" r="1" fill="oklch(0.80 0.18 var(--hue))" opacity="0.22"/>
      <circle cx="57" cy="96" r="1.2" fill="oklch(0.80 0.18 var(--hue))" opacity="0.28"/>
      <circle cx="31" cy="87" r="1.5" fill="oklch(0.80 0.18 var(--hue))" opacity="0.30"/>
      <circle cx="69" cy="87" r="1.5" fill="oklch(0.80 0.18 var(--hue))" opacity="0.30"/>
    </svg>

    {#if botState==='sleeping'}
      <div class="nx7-zzz">z z z</div>
    {/if}
  </div>
{/if}

<style>
  @keyframes nx7-bulb-pulse {
    0%,100%{ opacity:1; filter:drop-shadow(0 0 4px oklch(0.85 0.22 var(--hue))); }
    50%    { opacity:.7; filter:drop-shadow(0 0 8px oklch(0.85 0.22 var(--hue))); }
  }
  @keyframes nx7-bumped {
    0%  { transform:translateX(0); }
    25% { transform:translateX(-4px) rotate(-2deg); }
    50% { transform:translateX(4px)  rotate(2deg); }
    75% { transform:translateX(-3px) rotate(-1deg); }
    100%{ transform:translateX(0); }
  }
  @keyframes nx7-zzz {
    from{ transform:translateY(0) rotate(-8deg); opacity:.8; }
    to  { transform:translateY(-16px) rotate(8deg); opacity:0; }
  }
  @keyframes blink{ 50%{ opacity:0; } }

  .nx7-root {
    position:fixed; width:100px; height:100px;
    cursor:grab; user-select:none; z-index:999;
    transition:filter .2s;
  }
  .nx7-root:active{ cursor:grabbing; }
  .nx7-root.state-angry { filter:drop-shadow(0 0 12px oklch(.65 .28 25)); }
  .nx7-root.state-sleeping { opacity:.65; }

  .nx7-sprite { display:block; }
  .nx7-bulb { animation:nx7-bulb-pulse 2.4s ease-in-out infinite; }

  .nx7-speech {
    position:fixed;
    width:220px; background:var(--card-bg,#fff);
    border:1.5px solid oklch(0.55 0.12 var(--hue));
    border-radius:10px; padding:10px 12px 8px;
    box-shadow:0 4px 16px rgba(0,0,0,.15);
    z-index:1000; pointer-events:auto;
  }
  .nx7-speech-tail {
    position:absolute; bottom:-7px;
    transform:translateX(-50%);
    width:0; height:0;
    border:7px solid transparent;
    border-top-color:oklch(0.55 0.12 var(--hue));
    border-bottom:none;
    pointer-events:none;
  }
  .nx7-speech-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
  .nx7-tag { font-size:8.5px; font-weight:700; letter-spacing:.06em; color:oklch(0.65 0.14 var(--hue)); font-family:var(--font-sans),monospace; }
  .nx7-dots { display:flex; gap:3px; }
  .nx7-dots span { width:5px; height:5px; border-radius:50%; background:oklch(0.65 0.14 var(--hue)); opacity:.6; }
  .nx7-speech-text { font-size:11px; color:var(--fg-1,#111); font-family:var(--font-sans),'Courier New',monospace; line-height:1.4; display:block; }
  .nx7-caret { animation:blink .8s step-end infinite; }
  .nx7-action { display:block; margin-top:8px; font-size:10px; font-weight:700; letter-spacing:.06em; color:oklch(0.65 0.18 var(--hue)); text-decoration:none; }
  .nx7-action:hover { text-decoration:underline; }

  .nx7-thought { position:fixed; z-index:998; pointer-events:none; }
  .nx7-thought-cloud { background:var(--card-bg,#fff); border:1px dashed oklch(0.55 0.10 var(--hue)); border-radius:12px; padding:8px 12px; font-size:10px; color:var(--fg-3,#888); font-style:italic; font-family:var(--font-sans),monospace; max-width:160px; }

  .nx7-arm { position:absolute; left:50%; top:50%; height:3px; background:oklch(0.65 0.12 var(--hue)); transform-origin:0 50%; border-radius:999px; pointer-events:none; z-index:998; }
  .nx7-arm-finger { position:absolute; right:-2px; top:-3px; width:8px; height:8px; border-radius:50%; background:oklch(0.75 0.18 var(--hue)); box-shadow:0 0 6px oklch(0.75 0.18 var(--hue)); }

  .nx7-weather { position:absolute; top:-18px; left:50%; transform:translateX(-50%); font-size:14px; pointer-events:none; filter:drop-shadow(0 1px 3px rgba(0,0,0,.3)); }

  .nx7-close {
    position:absolute; top:18px; right:-10px;
    width:18px; height:18px; border-radius:50%;
    background:var(--card-bg,#fff); border:1px solid var(--border,#ddd);
    font-size:9px; cursor:pointer; display:flex; align-items:center; justify-content:center;
    color:var(--fg-3,#888); z-index:1001; opacity:0; transition:opacity .2s;
  }
  .nx7-root:hover .nx7-close { opacity:1; }
  .nx7-close:hover { background:var(--hover,#eee); color:var(--fg-1,#111); }

  .nx7-zzz {
    position:absolute; top:-10px; right:-4px;
    font-size:11px; color:oklch(0.65 0.10 var(--hue));
    font-family:var(--font-sans),monospace;
    animation:nx7-zzz 2s ease-out infinite;
    pointer-events:none;
  }
</style>
