<script>
  import { onMount } from 'svelte';
  import { D, T } from './cyberbot/dialogs';
  import { isMobile } from './cyberbot/physics';
  import { pick, visEls, screenRipple, spawnGhosts, glitchHeading } from './cyberbot/effects';
  import { createRoutines } from './cyberbot/routines';
  import BotSprite from './cyberbot/BotSprite.svelte';

  const pause = ms => new Promise(r => setTimeout(r, ms));

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
  const glitchIvRef = { current: null };
  let cursor     = { x: 0, y: 0 };
  let busy       = false;

  // ── Movement ──────────────────────────────────────────────
  async function moveTo(nx, ny, opts = {}) {
    const speed = opts.speed ?? 2.4;
    const botW = isMobile() ? 80 : 110;
    nx = Math.max(4, Math.min(window.innerWidth - botW, nx));
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

  // ── Routines (built lazily after state is declared) ───────
  // pickRoutine and r_dance are initialised in onMount via createRoutines(ctx).
  let pickRoutine = () => async () => {};
  let r_dance     = async () => {};


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
    // Build context-bound routine functions
    const routineCtx = {
      getPos:      () => pos,       setPos:      (v) => { pos = v; },
      getEye:      () => eye,       setEye:      (v) => { eye = v; },
      getEyeMode:  () => eyeMode,   setEyeMode:  (v) => { eyeMode = v; },
      getBotState: () => botState,  setBotState: (v) => { botState = v; },
      getFacing:   () => facing,    setFacing:   (v) => { facing = v; },
      getTilt:     () => tilt,      setTilt:     (v) => { tilt = v; },
      getArm:      () => arm,       setArm:      (v) => { arm = v; },
      getCursor:   () => cursor,
      getElRef:    () => elRef,
      glitchIvRef,
      moveTo, speak, think, pause,
    };
    const routines = createRoutines(routineCtx);
    pickRoutine = routines.pickRoutine;
    r_dance     = routines.r_dance;

    // On mobile, start tucked into bottom-left so it doesn't block content
    pos = isMobile()
      ? { x: 8, y: window.innerHeight - 130 }
      : { x: 40, y: window.innerHeight - 160 };

    // Clamp position on resize (orientation change on mobile)
    const onResize = () => {
      pos = {
        x: Math.min(pos.x, window.innerWidth - 110),
        y: Math.min(pos.y, window.innerHeight - 130),
      };
    };
    window.addEventListener('resize', onResize);

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

    // React when PagePeel fires from any corner
    const onPeelStart = async (e) => {
      if (busy || botState === 'sleeping') return;
      busy = true;
      const c = e?.detail?.corner ?? 'br';
      // Move toward the corner where the peel appeared
      const tx = c.includes('r') ? window.innerWidth  - 160 : 90;
      const ty = c.includes('t') ? 90 : window.innerHeight - 170;
      botState = 'glitching'; eyeMode = 'wide';
      spawnGhosts(elRef);
      await moveTo(tx, ty, { speed: 5 });
      const cornerLines = D.peel_corner[c] ?? D.peel;
      speak(pick(cornerLines), 2800);
      await pause(900);
      speak(pick(D.peel), 2600);
      await pause(1800);
      botState = 'idle'; eyeMode = 'normal';
      busy = false;
    };
    window.addEventListener('nx7-peel-start', onPeelStart);

    // On peel end, say it's been fixed
    const onPeelEnd = () => {
      if (!busy && botState === 'idle') speak(pick(D.repaired), 2200);
    };
    window.addEventListener('nx7-peel-end', onPeelEnd);

    return ()=>{
      cancelled=true;
      clearTimeout(sleepTid);clearTimeout(speechTid);clearInterval(typeTid);if(glitchIvRef.current)clearInterval(glitchIvRef.current);
      window.removeEventListener('mousemove',onMouseMove);
      window.removeEventListener('mousemove',onDragMove);
      window.removeEventListener('touchmove',onDragMove);
      window.removeEventListener('mouseup',onDragUp);
      window.removeEventListener('touchend',onDragUp);
      window.removeEventListener('nx7-peel-start', onPeelStart);
      window.removeEventListener('nx7-peel-end', onPeelEnd);
      window.removeEventListener('resize', onResize);
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

    <BotSprite {eye} {eyeMode} />

    {#if botState==='sleeping'}
      <div class="nx7-zzz">z z z</div>
    {/if}
  </div>
{/if}

<style>
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
    touch-action: none;
  }
  @media (max-width: 480px) {
    .nx7-root { width:76px; height:76px; }
    .nx7-sprite { width:76px !important; height:76px !important; }
    .nx7-speech { width:180px; font-size:10px; }
  }
  .nx7-root:active{ cursor:grabbing; }
  .nx7-root.state-angry { filter:drop-shadow(0 0 12px oklch(.65 .28 25)); }
  .nx7-root.state-sleeping { opacity:.65; }

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
