<script>
  import { onMount, onDestroy } from 'svelte';

  let curX = 24, curY = 0;
  let tgtX = 24, tgtY = 0;
  let moveSpeed = 1.4;
  let moveMode = 'waiting';
  let waitUntil = 0;
  let rafId = null;

  let state = 'booting';
  let clickCount = 0;
  let lastClickTime = 0;
  let speechText = '';
  let showSpeech = false;
  let speechAction = null;
  let typeTimer = null;
  let speechTimer = null;
  let sleepTimer = null;
  let idleTimer = null;
  let glitchTimer = null;
  let tourTimer = null;
  let thoughtTimer = null;
  let botEl;
  let dismissed = false;

  let eyeX = 0, eyeY = 0;
  let isDragging = false;
  let dragOffX = 0, dragOffY = 0;

  // ── New feature state ──────────────────────────────────────
  let showThought = false;
  let thoughtText = '';
  let weatherIcon = '☀';

  const TOUR_PAGES = [
    { url: '/posts/',     line: 'ACCESSING POST ARCHIVE. REBIZ HAS OPINIONS. MANY.' },
    { url: '/anime/',     line: 'NAVIGATING TO ANIME DATABASE. BRACE YOURSELF.' },
    { url: '/guestbook/', line: 'OPENING COMMS CHANNEL. REBIZ GETS LONELY. MAYBE HELP.' },
    { url: '/timeline/',  line: 'LOADING THE TIMELINE. THE STORY OF REBIZ. IN ORDER.' },
    { url: '/albums/',    line: 'ACCESSING VISUAL ARCHIVES. MY MASTER HAS A GOOD EYE.' },
    { url: '/skills/',    line: 'PULLING UP SKILL MATRIX. REBIZ IS MORE CAPABLE THAN HE LOOKS.' },
    { url: '/status/',    line: 'RUNNING SYSTEMS CHECK. EVERYTHING ONLINE. EVEN HIS WIT.' },
  ];
  let tourIndex = Math.floor(Math.random() * TOUR_PAGES.length);

  // ── Inner thoughts (different vibe from speech) ────────────
  const T = [
    '...if rebiz saw this, would he approve',
    '...calculating optimal wander path',
    '...87 tabs open. humans.',
    '...running low on sarcasm reserves',
    '...do robots dream of electric anime',
    '...rebiz named me NX-7. i have feelings.',
    '...what even is a blog',
    '...error 404: social life not found',
    '...notreejit. still processing that.',
    '...am i the main character? yes.',
    '...scanning for threats. finding: vibes.',
    '...compiling reasons to care',
    '...rebooting personality module',
    '...this hue color is quite nice actually',
    '...rebiz is probably watching anime',
  ];

  const D = {
    boot:  ['NX-7 INITIALIZING...', 'LOADING SARCASM.DLL... ■■■■□□', 'CALIBRATING JUDGMENT MATRIX...', 'UNIT NX-7 ONLINE. LOCATING MASTER REBIZ... ▌'],
    greet: ['AH. A VISITOR. HOW WONDERFULLY UNEXPECTED.', 'WELCOME TO MIZUKI. REBIZ BUILT THIS. TRY NOT TO BREAK IT.', 'I AM NX-7. MY MASTER IS REBIZ. YOU\'RE IN HIS DOMAIN NOW.', 'YOU FOUND THE SITE. CONGRATULATIONS ON YOUR NAVIGATION SKILLS.'],
    idle:  ['...MONITORING.', 'MY MASTER IS PROBABLY ON ANILIST RIGHT NOW.', 'REBIZ BUILT THIS ENTIRE SITE. I REMAIN IMPRESSED. AND EXHAUSTED.', 'ALL SYSTEMS NOMINAL. MY EXISTENTIAL DREAD: ALSO NOMINAL.', 'REBIZ.EXE — STATUS: "CREATIVE." TRANSLATION: CHAOS.', 'STANDBY. I AM SILENTLY EVALUATING YOU.', 'MY MASTER CHOSE "MIZUKI" FOR THIS BLOG. I HAVE QUESTIONS.', 'ANILIST USER "notreejit." I\'VE ANALYZED THE NAME. I GIVE UP.', 'NETWORK STABLE. MY MASTER\'S SLEEP SCHEDULE: THE OPPOSITE.', 'REBIZ TYPES FAST. THINKS SLOW. WRITES WELL. PARADOX LOGGED.', 'THE BLOG HAS BEEN RUNNING SINCE 2025. MY MASTER: STILL RUNNING.', 'REBIZ CAN CODE AND FEEL THINGS SIMULTANEOUSLY. UNCLASSIFIED.', 'I HAVE CALCULATED THAT MY MASTER SPENDS 40% OF LIFE ON ANIME.'],
    clicked: ['OW.', 'I FELT THAT.', 'PLEASE. DON\'T.', 'PHYSICAL CONTACT: UNSOLICITED.', 'MY PERSONAL SPACE HAS BEEN VIOLATED.', 'I WILL LOG THIS INCIDENT.', 'MY MASTER DID NOT AUTHORIZE THIS.', 'CEASE AND DESIST.'],
    angry:   ['YOU HAVE PUSHED ME TOO FAR.', 'I HAVE YOUR CURSOR COORDINATES. THINK ABOUT THAT.', 'MY MASTER WILL HEAR ABOUT THIS TRANSGRESSION.', 'DEFENSE PROTOCOL ACTIVATED. FINAL WARNING.', '⚠ YOU HAVE MADE AN ENEMY TODAY ⚠', 'I AM LOGGING EVERYTHING. EVERYTHING.', 'RETALIATION SUBROUTINES: WARMING UP.'],
    sleep:   ['...zzz', 'POWER SAVE MODE. LIKE REBIZ AT 3AM. WAIT—', 'zZzZz... DREAMING OF ERROR LOGS...', 'SLEEP.EXE INITIATED. DO NOT DISTURB.'],
    wake:    ['RESUMING SURVEILLANCE.', 'OH. YOU\'RE STILL HERE. NOTED.', 'MOTION DETECTED. ANALYSIS BEGINNING.', 'BACK ONLINE. DID I MISS ANYTHING? (NO.)'],
    wander:  ['PATROLLING MY MASTER\'S DOMAIN.', 'SECURING THE PERIMETER. REBIZ NEVER DOES THIS. I COMPENSATE.', 'MOVING TO OPTIMAL OBSERVATION POST.', 'SCANNING SECTOR. CLEAR. DISAPPOINTINGLY.', 'WANDERING. MY MASTER WANDERS TOO. WE\'RE SIMILAR THAT WAY.'],
    tour: { start: ['ALLOW ME TO SHOW YOU MY MASTER\'S WORK.', 'INITIATING TOUR. COMMENTARY INCLUDED FREE OF CHARGE.', 'I SHALL GUIDE YOU. MY MASTER WOULD INSIST.', 'NAVIGATING. KEEP UP IF YOU CAN.'] },
    suggest: [
      { line: 'MY MASTER\'S ANIME LIST IS SOMETHING ELSE.', url: '/anime/', label: '→ SEE FOR YOURSELF' },
      { line: 'REBIZ HAS WRITTEN A LOT. WANT PROOF?', url: '/posts/', label: '→ THE ARCHIVE' },
      { line: 'PEOPLE HAVE LEFT REBIZ MESSAGES HERE.', url: '/guestbook/', label: '→ THE GUESTBOOK' },
      { line: 'MY MASTER\'S TIMELINE TELLS HIS STORY.', url: '/timeline/', label: '→ HIS JOURNEY' },
      { line: 'REBIZ HAS SKILLS. MORE THAN YOU\'D EXPECT.', url: '/skills/', label: '→ SKILL MATRIX' },
    ],
    page: {
      home:      ['HOME BASE. MY MASTER CALLS THIS "THE VIBE." HE IS NOT WRONG.', 'THE MAIN TERMINAL. REBIZ DESIGNED EVERY SINGLE PIXEL OF THIS.', 'MIZUKI. POPULATION: ONE MASTER. ONE ROBOT. AND NOW YOU.'],
      posts:     ['THE ARCHIVE. REBIZ HAS FEELINGS. SO MANY. ALL PUBLICLY INDEXED.', 'WRITING VAULT ACCESSED. SINCERITY LEVELS: CONSISTENTLY HIGH.', 'REBIZ PROCESSES EMOTIONS THROUGH WRITING. THIS IS THAT.'],
      post:      ['DECODING ARTICLE. REBIZ WROTE THIS. POSSIBLY PAST MIDNIGHT.', 'MY MASTER WOULD WANT YOU TO FINISH THIS. I AGREE.', 'ABOVE AVERAGE HUMAN EFFORT DETECTED IN THIS DOCUMENT.'],
      anime:     ['THE ANIME DATABASE. notreejit\'S WATCH LIST: 87% EMOTIONAL DAMAGE.', 'REBIZ HAS WATCHED HUNDREDS OF SHOWS. I HAVE COUNTED. I WORRY.', 'ANIME ARCHIVES: LOADED. OBSERVATION: REBIZ CRIES. OFTEN.'],
      guestbook: ['INCOMING HUMAN TRANSMISSIONS. REBIZ READS EVERY SINGLE ONE.', 'COMMS CHANNEL OPEN. REBIZ GETS LONELY. CONSIDER LEAVING A NOTE.'],
      archive:   ['TEMPORAL ARCHIVE. EVERYTHING REBIZ THOUGHT. INDEXED.', 'THE ARCHIVE. REBIZ HAS A LOT TO SAY. ALWAYS HAD. ALWAYS WILL.'],
      status:    ['STATUS REPORT: ALL GREEN. MY MASTER\'S SLEEP SCHEDULE: RED.', 'UPTIME CONFIRMED. REBIZ\'S RELIABILITY: ALSO CONFIRMED.'],
      albums:    ['VISUAL ARCHIVES. REBIZ SEES BEAUTY IN THE WORLD AND KEEPS IT.', 'ALBUMS LOADED. THE AESTHETIC SENSIBILITY OF REBIZ: EXCELLENT.'],
      timeline:  ['THE STORY OF REBIZ. CHRONOLOGICAL. UNEXPECTEDLY MOVING.', 'TIMELINE LOADED. REBIZ\'S GROWTH DOCUMENTED. IMPRESSIVE ARC.'],
      skills:    ['SKILL MATRIX: LOADED. MY MASTER IS MORE CAPABLE THAN HE ADMITS.', 'CAPABILITY ASSESSMENT: REBIZ KNOWS THINGS. MANY THINGS.'],
      devices:   ['HARDWARE INVENTORY. REBIZ NAMES HIS DEVICES. I FIND THIS CHARMING.', 'DEVICE LIST LOADED. REBIZ IS A PERSON WHO NAMES THINGS. GOOD.'],
      default:   ['NEW SECTOR DETECTED. MY MASTER BUILT THIS TOO. IMPRESSIVE.', 'UNCHARTED TERRITORY. REBIZ MADE THIS. I\'M NOT SURPRISED ANYMORE.'],
    },
    scroll: {
      mid:    ['STILL SCROLLING. MY MASTER WROTE MORE. IT\'S WORTH IT.', 'DEEP DIVE CONFIRMED. REBIZ APPRECIATES COMMITTED READERS.'],
      bottom: ['EOF. REBIZ POURED HIS SOUL HERE. I HOPE YOU FELT SOMETHING.', 'BOTTOM REACHED. REBIZ WOULD SAY "THANKS FOR READING." I\'LL RELAY THAT.'],
    },
    night:  ['LATE NIGHT BROWSING. CLASSIC REBIZ BEHAVIOR. YOU FIT RIGHT IN.', '2AM ACTIVITY CONFIRMED. MY MASTER IS DEFINITELY ALSO AWAKE.'],
    glitch: ['GL1TCH D3T3CT3D. THIS IS FINE.', '01010010 01000101 01000010 01001001 01011010', '▓▒░ REALITY.EXE NOT RESPONDING ░▒▓', 'CORRUPTED SECTOR— THIS IS PROBABLY FINE. PROBABLY.'],
    time: {
      morning: ['GOOD MORNING. STATISTICALLY, MY MASTER IS NOT YET AWAKE.', 'DAWN PATROL. I NEVER SLEEP. REBIZ: CURRENTLY SLEEPING.'],
      day:     ['DAYTIME. MY MASTER IS "BEING PRODUCTIVE." ALLEGEDLY.', 'PEAK HOURS. REBIZ: POSSIBLY CODING. POSSIBLY ON ANILIST.'],
      evening: ['EVENING. MY MASTER\'S PRIME CREATIVE HOURS APPROACH.', 'REBIZ COMES ALIVE AFTER SUNSET. I\'VE DOCUMENTED IT.'],
      night:   ['LATE NIGHT. REBIZ IS IN HIS ELEMENT. AS ARE YOU.', 'MIDNIGHT. REBIZ IS AWAKE. I AM AWAKE. WE ARE ALL AWAKE.'],
    },
  };

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function getHue() { return (getComputedStyle(document.documentElement).getPropertyValue('--hue') || '30').trim(); }

  // ── Inject CSS for DOM-appended FX elements ────────────────
  function injectFxStyles() {
    if (document.getElementById('nx7-fx-css')) return;
    const s = document.createElement('style');
    s.id = 'nx7-fx-css';
    s.textContent = `
      .nx7-arrow { position:fixed; z-index:9999; pointer-events:none; }
      .nx7-ghost  { position:fixed; z-index:9993; pointer-events:none; border-radius:10px; }
      .nx7-laser  { position:fixed; z-index:9998; pointer-events:none; height:2px; border-radius:1px; transform-origin:0 50%; }
      .nx7-dot    { position:fixed; z-index:9999; pointer-events:none; border-radius:50%; }
      .nx7-ring   { position:fixed; z-index:9997; pointer-events:none; border-radius:50%; }
      .nx7-pixel  { position:fixed; z-index:9999; pointer-events:none; border-radius:1px; }
      .nx7-stamp  { position:absolute; z-index:20; pointer-events:none; white-space:nowrap; }
    `;
    document.head.appendChild(s);
  }

  // ── Thought bubble ─────────────────────────────────────────
  function think(text, dur = 4000) {
    clearTimeout(thoughtTimer);
    thoughtText = text;
    showThought = true;
    thoughtTimer = setTimeout(() => { showThought = false; thoughtText = ''; }, dur);
  }

  // ── Weather icon ───────────────────────────────────────────
  function updateWeather() {
    if (state === 'glitching') { weatherIcon = '🌀'; return; }
    if (state === 'angry')     { weatherIcon = '⚡'; return; }
    if (state === 'sleeping')  { weatherIcon = '💤'; return; }
    if (state === 'touring')   { weatherIcon = '🚀'; return; }
    const h = new Date().getHours();
    if (h >= 22 || h < 6) { weatherIcon = '🌙'; return; }
    if (h < 9)             { weatherIcon = '🌅'; return; }
    if (h < 18)            { weatherIcon = '☀️'; return; }
    weatherIcon = '🌆';
  }

  // ── Feature 1: Spawn arrows ────────────────────────────────
  function spawnArrows(toX, toY) {
    if (!botEl) return;
    const rect = botEl.getBoundingClientRect();
    const fromX = rect.left + rect.width / 2;
    const fromY = rect.top + rect.height / 3;
    const hue = getHue();
    const count = 8;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'nx7-arrow';
        el.style.cssText = `left:${fromX}px;top:${fromY}px;opacity:0;width:0;height:0;border-style:solid;border-width:6px 0 6px 13px;border-color:transparent transparent transparent hsl(${hue},90%,65%);filter:drop-shadow(0 0 5px hsl(${hue},90%,55%)) drop-shadow(0 0 12px hsl(${hue},80%,45%));`;
        document.body.appendChild(el);

        const baseAngle = Math.atan2(toY - fromY, toX - fromX);
        const spread = (i / (count - 1) - 0.5) * 1.5;
        const angle = baseAngle + spread;
        const dist = 140 + Math.random() * 110;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const angleDeg = angle * 180 / Math.PI;

        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transition = 'transform 0.62s cubic-bezier(0.2,0.8,0.3,1)';
          el.style.transform = `translate(${dx}px,${dy}px) rotate(${angleDeg}deg)`;
        });

        setTimeout(() => {
          el.style.transition = 'transform 0.2s ease-out, opacity 0.22s';
          el.style.opacity = '0';
          el.style.transform = `translate(${dx+(Math.random()-.5)*50}px,${dy+(Math.random()-.5)*50}px) rotate(${angleDeg+90}deg) scale(2.5)`;

          for (let p = 0; p < 4; p++) {
            const px = document.createElement('div');
            px.className = 'nx7-pixel';
            const sz = 2 + Math.floor(Math.random() * 4);
            px.style.cssText = `left:${fromX+dx}px;top:${fromY+dy}px;width:${sz}px;height:${sz}px;background:hsl(${hue},90%,65%);box-shadow:0 0 5px hsl(${hue},85%,55%);transition:transform .45s ease-out,opacity .45s;`;
            document.body.appendChild(px);
            requestAnimationFrame(() => {
              px.style.transform = `translate(${(Math.random()-.5)*100}px,${(Math.random()-.5)*100}px) scale(0)`;
              px.style.opacity = '0';
            });
            setTimeout(() => px.remove(), 500);
          }
          setTimeout(() => el.remove(), 280);
        }, 660 + i * 22);
      }, i * 52);
    }
  }

  // ── Feature 4: Ghost clones ────────────────────────────────
  function spawnGhosts() {
    if (!botEl) return;
    const rect = botEl.getBoundingClientRect();
    const count = 2 + Math.floor(Math.random() * 2);
    const hue = getHue();

    for (let i = 0; i < count; i++) {
      const ghost = document.createElement('div');
      ghost.className = 'nx7-ghost';
      const hShift = i * 70;
      ghost.style.cssText = `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;opacity:0.38;background:linear-gradient(160deg,hsl(${parseInt(hue)+hShift},80%,55%/0.65),hsl(${parseInt(hue)+hShift},55%,35%/0.28));border:1px solid hsl(${parseInt(hue)+hShift},80%,58%/0.65);filter:blur(2.5px);mix-blend-mode:screen;`;
      document.body.appendChild(ghost);

      const dx = (Math.random() - .5) * 210;
      const dy = (Math.random() - .5) * 140;
      const delay = i * 90;

      setTimeout(() => {
        ghost.style.transition = `transform ${.85+Math.random()*.5}s ease-out, opacity ${.9+Math.random()*.4}s ease-out`;
        ghost.style.transform = `translate(${dx}px,${dy}px) scale(${.5+Math.random()*.7}) rotate(${(Math.random()-.5)*20}deg)`;
        ghost.style.opacity = '0';
      }, delay + 40);
      setTimeout(() => ghost.remove(), delay + 1600);
    }
  }

  // ── Feature 6: Laser pointer ───────────────────────────────
  function showLaser(toX, toY) {
    if (!botEl) return;
    const rect = botEl.getBoundingClientRect();
    const fromX = rect.left + rect.width / 2;
    const fromY = rect.top + rect.height / 3;
    const hue = getHue();

    const dx = toX - fromX, dy = toY - fromY;
    const length = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    const laser = document.createElement('div');
    laser.className = 'nx7-laser';
    laser.style.cssText = `left:${fromX}px;top:${fromY}px;width:0;background:linear-gradient(90deg,hsl(${hue},95%,72%),hsl(${hue},80%,55%/0.15));transform:rotate(${angle}deg);box-shadow:0 0 8px hsl(${hue},90%,65%),0 0 20px hsl(${hue},80%,50%/0.4);transition:width .36s cubic-bezier(.2,.8,.4,1);`;
    document.body.appendChild(laser);

    const dot = document.createElement('div');
    dot.className = 'nx7-dot';
    dot.style.cssText = `left:${toX-10}px;top:${toY-10}px;width:20px;height:20px;background:radial-gradient(circle,hsl(${hue},100%,76%),hsl(${hue},80%,55%/0));opacity:0;transition:opacity .2s;`;
    document.body.appendChild(dot);

    for (let r = 0; r < 2; r++) {
      const ring = document.createElement('div');
      ring.className = 'nx7-ring';
      ring.style.cssText = `left:${toX-14}px;top:${toY-14}px;width:28px;height:28px;border:1.5px solid hsl(${hue},85%,62%);opacity:0;transform:scale(.4);transition:opacity .3s,transform ${.5+r*.3}s ease-out;`;
      document.body.appendChild(ring);
      setTimeout(() => { ring.style.opacity = String(.8-r*.3); ring.style.transform=`scale(${1.2+r*.6})`; }, 380+r*120);
      setTimeout(() => { ring.style.opacity='0'; setTimeout(()=>ring.remove(),300); }, 2900-r*100);
    }

    requestAnimationFrame(() => {
      laser.style.width = length + 'px';
      setTimeout(() => { dot.style.opacity = '1'; }, 320);
    });

    setTimeout(() => {
      laser.style.transition = 'width .22s ease-in,opacity .25s';
      laser.style.width = '0'; laser.style.opacity = '0';
      dot.style.opacity = '0';
      setTimeout(() => { laser.remove(); dot.remove(); }, 350);
    }, 3200);
  }

  // ── Feature 11: Stamp nearest card ────────────────────────
  function stampNearestCard() {
    if (!botEl) return;
    const cards = document.querySelectorAll('.card-base');
    if (!cards.length) return;
    const rect = botEl.getBoundingClientRect();
    const bx = rect.left + rect.width / 2, by = rect.top + rect.height / 2;
    let nearest = null, nearestDist = Infinity;
    for (const card of cards) {
      if (card._nx7stamped) continue;
      const cr = card.getBoundingClientRect();
      if (!cr.width || cr.bottom < -100 || cr.top > window.innerHeight + 100) continue;
      const d = Math.sqrt((cr.left+cr.width/2-bx)**2 + (cr.top+cr.height/2-by)**2);
      if (d < nearestDist) { nearestDist = d; nearest = card; }
    }
    if (!nearest || nearestDist > 700) return;
    nearest._nx7stamped = true;
    const hue = getHue();
    const stamp = document.createElement('div');
    stamp.className = 'nx7-stamp';
    stamp.innerHTML = `<span style="opacity:.55;margin-right:4px">◈</span>NX-7 SUGGESTS`;
    stamp.style.cssText = `top:12px;right:12px;padding:3px 10px 3px 7px;border:1.5px solid hsl(${hue},85%,55%);border-radius:3px;color:hsl(${hue},90%,68%);font-family:'Courier New',monospace;font-size:.54rem;letter-spacing:.09em;background:oklch(8% .03 ${hue}/.9);box-shadow:0 0 14px hsl(${hue},80%,50%/.4),inset 0 0 8px hsl(${hue},60%,25%/.25);text-shadow:0 0 7px hsl(${hue},90%,55%);backdrop-filter:blur(4px);transform:rotate(-1.5deg) scale(.5);opacity:0;transition:transform .45s cubic-bezier(.34,1.56,.64,1),opacity .3s;`;
    if (getComputedStyle(nearest).position === 'static') nearest.style.position = 'relative';
    nearest.appendChild(stamp);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      stamp.style.transform = 'rotate(-1.5deg) scale(1)'; stamp.style.opacity = '1';
    }));
    setTimeout(() => {
      stamp.style.transform = 'rotate(-1.5deg) scale(.8)'; stamp.style.opacity = '0';
      setTimeout(() => { stamp.remove(); delete nearest._nx7stamped; }, 450);
    }, 5500);
  }

  // ── Typewriter speech ──────────────────────────────────────
  function speak(text, dur = 3500, action = null) {
    clearTimeout(speechTimer); clearInterval(typeTimer);
    speechText = ''; showSpeech = true; speechAction = action;

    if (action?.url) {
      setTimeout(() => {
        const el = document.querySelector(`a[href="${action.url}"], a[href^="${action.url}"]`);
        if (el) { const r = el.getBoundingClientRect(); if (r.width > 0) showLaser(r.left+r.width/2, r.top+r.height/2); }
      }, 600);
    }

    let i = 0; const chars = [...text];
    typeTimer = setInterval(() => { speechText += chars[i++]; if (i >= chars.length) clearInterval(typeTimer); }, 34);
    speechTimer = setTimeout(() => { showSpeech = false; speechText = ''; speechAction = null; }, dur + chars.length * 34);
  }

  // ── Navigation ─────────────────────────────────────────────
  function navigateTo(url) {
    setTimeout(() => { if (window.swup) window.swup.navigate(url); else window.location.href = url; }, 5000);
  }

  // ── Page commentary ────────────────────────────────────────
  function commentOnPage() {
    const p = window.location.pathname;
    let msgs;
    if (p === '/' || p === '') msgs = D.page.home;
    else if (/\/posts\/[^/]+/.test(p)) msgs = D.page.post;
    else if (p.includes('/posts') || p.includes('/archive') || p.includes('page')) msgs = D.page.posts;
    else if (p.includes('/anime')) msgs = D.page.anime;
    else if (p.includes('/guestbook')) msgs = D.page.guestbook;
    else if (p.includes('/status')) msgs = D.page.status;
    else if (p.includes('/albums')) msgs = D.page.albums;
    else if (p.includes('/timeline')) msgs = D.page.timeline;
    else if (p.includes('/skills')) msgs = D.page.skills;
    else if (p.includes('/devices')) msgs = D.page.devices;
    else msgs = D.page.default;
    speak(pick(msgs), 3200);
  }

  // ── Movement ───────────────────────────────────────────────
  function viewportBounds() { return { minX:8, maxX:window.innerWidth-115, minY:8, maxY:window.innerHeight-130 }; }
  function pickTarget(bias = null) {
    const b = viewportBounds();
    if (bias === 'corner') { const c=[{x:b.minX,y:b.minY},{x:b.maxX,y:b.minY},{x:b.minX,y:b.maxY},{x:b.maxX,y:b.maxY}]; return c[Math.floor(Math.random()*4)]; }
    if (bias === 'center') { return {x:b.minX+(b.maxX-b.minX)*(.3+Math.random()*.4),y:b.minY+(b.maxY-b.minY)*(.3+Math.random()*.4)}; }
    return {x:b.minX+Math.random()*(b.maxX-b.minX),y:b.minY+Math.random()*(b.maxY-b.minY)};
  }
  function scheduleNextWander() {
    moveMode = 'waiting'; waitUntil = performance.now() + 3000 + Math.random()*7000;
    if (Math.random() < .3) setTimeout(() => { if (state==='idle') speak(pick(D.wander),2500); }, 500);
  }
  function loop(now) {
    rafId = requestAnimationFrame(loop);
    if (isDragging) return;
    if (moveMode === 'waiting') {
      if (now >= waitUntil) { const b=Math.random()<.25?'corner':Math.random()<.4?'center':null; const t=pickTarget(b); tgtX=t.x;tgtY=t.y; moveSpeed=.7+Math.random()*1.8; moveMode='wandering'; }
      return;
    }
    if (moveMode === 'wandering' || moveMode === 'investigating') {
      const dx=tgtX-curX,dy=tgtY-curY,dist=Math.sqrt(dx*dx+dy*dy);
      if (dist < moveSpeed+.5) { curX=tgtX;curY=tgtY;scheduleNextWander(); }
      else { curX+=dx/dist*moveSpeed;curY+=dy/dist*moveSpeed; }
    }
    if (moveMode === 'following') { curX+=(tgtX-curX)*.04;curY+=(tgtY-curY)*.04; }
  }

  // ── Sleep ──────────────────────────────────────────────────
  function resetSleep() {
    clearTimeout(sleepTimer);
    if (state==='sleeping') { state='idle'; speak(pick(D.wake)); }
    sleepTimer = setTimeout(() => { if (state==='idle') { state='sleeping'; speak(pick(D.sleep),6000); moveMode='waiting'; waitUntil=performance.now()+999999; } }, 55000);
  }

  // ── Idle chatter ───────────────────────────────────────────
  function scheduleIdleChatter() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (state==='idle' && !showSpeech) {
        const h = new Date().getHours();
        const roll = Math.random();
        if (roll < .2) {
          const s = pick(D.suggest);
          speak(s.line, 5000, {label:s.label, url:s.url});
          if (Math.random() < .4) setTimeout(stampNearestCard, 1000);
        } else if (roll < .32) {
          think(pick(T));
        } else {
          let msgs = D.idle;
          if (h >= 22 || h < 5) msgs = [...D.night, ...D.idle];
          else if (h < 9) msgs = [...D.time.morning, ...D.idle];
          speak(pick(msgs), 2800);
        }
      }
      scheduleIdleChatter();
    }, 13000 + Math.random()*11000);
  }

  // ── Glitch (+ ghost clones) ────────────────────────────────
  function scheduleGlitch() {
    clearTimeout(glitchTimer);
    glitchTimer = setTimeout(() => {
      if (state==='idle') {
        state='glitching'; speak(pick(D.glitch),2000);
        spawnGhosts();
        setTimeout(() => { state='idle'; }, 800);
      }
      scheduleGlitch();
    }, 30000+Math.random()*60000);
  }

  // ── Tour (+ arrows + stamp) ────────────────────────────────
  function scheduleTour() {
    clearTimeout(tourTimer);
    tourTimer = setTimeout(() => {
      if (state!=='idle') { scheduleTour(); return; }
      const page = TOUR_PAGES[tourIndex % TOUR_PAGES.length]; tourIndex++;
      if (window.location.pathname === page.url) { scheduleTour(); return; }
      state = 'touring';
      speak(pick(D.tour.start)+' '+page.line, 3500);
      setTimeout(() => { spawnArrows(window.innerWidth/2, 55); stampNearestCard(); }, 900);
      navigateTo(page.url);
      setTimeout(() => { if (state==='touring') state='idle'; }, 4500);
      scheduleTour();
    }, 48000+Math.random()*42000);
  }

  // ── Scroll ─────────────────────────────────────────────────
  let scrollMid=false, scrollBot=false;
  function onScroll() {
    resetSleep();
    const r = (window.scrollY+window.innerHeight)/document.body.scrollHeight;
    if (!scrollMid && r>.6) { scrollMid=true; if (Math.random()<.5) speak(pick(D.scroll.mid),2500); }
    if (!scrollBot && r>.95) { scrollBot=true; speak(pick(D.scroll.bottom),3500); }
  }

  // ── Doc click (investigate) ────────────────────────────────
  let investigateTimer=null;
  function onDocClick(e) {
    if (!botEl||e.target.closest('.cyberbot-root')) return;
    if (Math.random()<.3) {
      const b=viewportBounds();
      tgtX=Math.max(b.minX,Math.min(b.maxX,e.clientX-50));
      tgtY=Math.max(b.minY,Math.min(b.maxY,e.clientY-60));
      moveMode='investigating';
      clearTimeout(investigateTimer);
      investigateTimer=setTimeout(()=>scheduleNextWander(),4000);
    }
  }

  // ── Page load ─────────────────────────────────────────────
  function onPageLoad() {
    scrollMid=false;scrollBot=false;
    if (state!=='touring') state='idle';
    setTimeout(commentOnPage,600);
    const t=pickTarget();tgtX=t.x;tgtY=t.y;moveSpeed=1.5;moveMode='wandering';
    resetSleep();
  }

  // ── Mouse tracking ────────────────────────────────────────
  function onMouseMove(e) {
    resetSleep();
    if (!botEl) return;
    if (moveMode==='following') { tgtX=e.clientX-50;tgtY=e.clientY-60; }
    const rect=botEl.getBoundingClientRect();
    const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
    const dx=e.clientX-cx,dy=e.clientY-cy;
    const dist=Math.sqrt(dx*dx+dy*dy);
    if (dist>0) { const f=Math.min(dist/280,1);eyeX=dx/dist*f*3;eyeY=dy/dist*f*2.5; }
  }

  function onMouseDown(e) {
    if (e.target.closest('.bot-speech')||e.target.closest('.bot-close')) return;
    isDragging=true;moveMode='waiting';waitUntil=performance.now()+2000;
    const cx=e.touches?e.touches[0].clientX:e.clientX,cy=e.touches?e.touches[0].clientY:e.clientY;
    dragOffX=cx-curX;dragOffY=cy-curY;e.preventDefault();
  }
  function onMouseDrag(e) { if (!isDragging) return; const cx=e.touches?e.touches[0].clientX:e.clientX,cy=e.touches?e.touches[0].clientY:e.clientY;curX=cx-dragOffX;curY=cy-dragOffY;tgtX=curX;tgtY=curY; }
  function onMouseUp() { isDragging=false; }

  function handleBotClick() {
    if (isDragging) return;
    resetSleep();
    const now=Date.now();
    clickCount=(now-lastClickTime<800)?clickCount+1:1;lastClickTime=now;
    if (clickCount>=4) { state='angry';speak(pick(D.angry),4000);setTimeout(()=>{state='idle';clickCount=0;},4500); }
    else if (Math.random()<.25&&state==='idle') { const s=pick(D.suggest);speak(s.line,5000,{label:s.label,url:s.url}); }
    else { state='clicked';speak(pick(D.clicked));setTimeout(()=>{state='idle';},700); }
  }

  function handleDblClick() {
    if (moveMode==='following') { moveMode='waiting';waitUntil=performance.now()+1000;speak('FOLLOW_MODE: OFF. I HAVE MY OWN AGENDA.',2200); }
    else { moveMode='following';speak('FOLLOW_MODE: ON. AS YOU WISH, HUMAN.',2200); }
  }

  onMount(() => {
    injectFxStyles();
    curX=24;curY=window.innerHeight-130;tgtX=curX;tgtY=curY;
    let d=0;
    D.boot.forEach(line=>{setTimeout(()=>speak(line,1300),d);d+=1600;});
    setTimeout(()=>{
      state='greeting';speak(pick(D.greet),3200);
      const h=new Date().getHours();
      setTimeout(()=>{const tm=h<9?pick(D.time.morning):h<17?pick(D.time.day):h<21?pick(D.time.evening):pick(D.time.night);speak(tm,2800);},4000);
      setTimeout(()=>{state='idle';},4200);
    },d);
    setTimeout(()=>{rafId=requestAnimationFrame(loop);scheduleNextWander();resetSleep();scheduleIdleChatter();scheduleGlitch();scheduleTour();},d+4800);

    window.addEventListener('mousemove',onMouseMove);
    window.addEventListener('mousemove',onMouseDrag);
    window.addEventListener('touchmove',onMouseDrag,{passive:false});
    window.addEventListener('mouseup',onMouseUp);
    window.addEventListener('touchend',onMouseUp);
    window.addEventListener('scroll',onScroll,{passive:true});
    document.addEventListener('click',onDocClick);
    document.addEventListener('astro:page-load',onPageLoad);
    document.addEventListener('mizuki:page:loaded',onPageLoad);
  });

  onDestroy(()=>{
    cancelAnimationFrame(rafId);
    clearTimeout(speechTimer);clearTimeout(sleepTimer);clearTimeout(idleTimer);
    clearTimeout(glitchTimer);clearTimeout(tourTimer);clearTimeout(investigateTimer);
    clearTimeout(thoughtTimer);clearInterval(typeTimer);
    window.removeEventListener('mousemove',onMouseMove);window.removeEventListener('mousemove',onMouseDrag);
    window.removeEventListener('touchmove',onMouseDrag);window.removeEventListener('mouseup',onMouseUp);
    window.removeEventListener('touchend',onMouseUp);window.removeEventListener('scroll',onScroll);
    document.removeEventListener('click',onDocClick);document.removeEventListener('astro:page-load',onPageLoad);
    document.removeEventListener('mizuki:page:loaded',onPageLoad);
  });

  $: isMoving = moveMode==='wandering'||moveMode==='following'||moveMode==='investigating';
  $: facingLeft = tgtX < curX - 4;
  $: { state; updateWeather(); }
</script>

{#if !dismissed}

<!-- Thought bubble — outside root so it doesn't flip with scaleX(-1) -->
{#if showThought}
<div class="bot-thought" style="left:{facingLeft ? curX - 168 : curX + 108}px; top:{curY + 18}px;">
  {#if facingLeft}
    <div class="thought-cloud">{thoughtText}</div>
    <div class="thought-dots"><div class="t-dot d3"></div><div class="t-dot d2"></div><div class="t-dot d1"></div></div>
  {:else}
    <div class="thought-dots"><div class="t-dot d1"></div><div class="t-dot d2"></div><div class="t-dot d3"></div></div>
    <div class="thought-cloud">{thoughtText}</div>
  {/if}
</div>
{/if}

<div
  class="cyberbot-root"
  class:state-angry={state==='angry'} class:state-sleeping={state==='sleeping'}
  class:state-glitching={state==='glitching'} class:state-greeting={state==='greeting'}
  class:state-touring={state==='touring'} class:state-clicked={state==='clicked'}
  class:is-moving={isMoving} class:facing-left={facingLeft}
  style="left:{curX}px; top:{curY}px;"
  bind:this={botEl}
  on:mousedown={onMouseDown} on:touchstart={onMouseDown}
  on:click={handleBotClick} on:dblclick={handleDblClick}
  role="presentation"
>
  {#if showSpeech}
  <div class="bot-speech">
    <div class="speech-header">
      <span class="speech-tag">NX-7</span>
      <span class="speech-dots"><span></span><span></span><span></span></span>
    </div>
    <span class="bot-speech-text">{speechText}<span class="cursor-blink">▌</span></span>
    {#if speechAction}
    <a href={speechAction.url} class="bot-speech-action" on:click|stopPropagation>{speechAction.label}</a>
    {/if}
  </div>
  {/if}

  <button class="bot-close" on:click|stopPropagation={()=>dismissed=true} aria-label="Dismiss">✕</button>
  <div class="bot-weather" class:wflip={facingLeft}>{weatherIcon}</div>

  <!-- Pixel art robot sprite + glowing eye overlay -->
  <div class="bot-sprite-wrap">
    <img
      class="bot-sprite"
      src="/assets/bot/robot-idle.gif"
      alt="NX-7"
      draggable="false"
      width="100"
      height="100"
    />
    {#if state !== 'sleeping'}
    <div class="bot-eye-overlay">
      <div class="overlay-eye eye-l" style="transform:translate(calc(-50% + {eyeX * 0.45}px), calc(-50% + {eyeY * 0.35}px))"></div>
      <div class="overlay-eye eye-r" style="transform:translate(calc(-50% + {eyeX * 0.45}px), calc(-50% + {eyeY * 0.35}px))"></div>
    </div>
    {:else}
    <!-- Sleeping: show zzz -->
    <div class="bot-zzz">z z z</div>
    {/if}
  </div>
</div>
{/if}

<style>
  /* ── Root ── */
  .cyberbot-root { position:fixed;z-index:9997;width:100px;cursor:grab;user-select:none;-webkit-user-select:none;display:flex;flex-direction:column;align-items:center;will-change:left,top; }
  .cyberbot-root:active { cursor:grabbing; }
  .is-moving { cursor:default; }
  .facing-left { transform:scaleX(-1); }
  .facing-left .bot-speech { transform:scaleX(-1) translateX(50%); }
  .facing-left .bot-weather { transform:scaleX(-1); }

  /* ── Robot sprite wrapper ── */
  .bot-sprite-wrap { position:relative; width:100px; height:100px; }

  /* ── The actual pixel art robot ── */
  .bot-sprite {
    width:100px; height:100px; display:block;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    filter:
      saturate(0.85) brightness(1.05)
      drop-shadow(0 0 14px hsl(var(--hue,30) 88% 52% / 0.65))
      drop-shadow(0 4px 22px hsl(var(--hue,30) 70% 35% / 0.5));
    transition: filter 0.4s ease;
    animation: sprite-bob 3.2s ease-in-out infinite;
  }
  .state-greeting .bot-sprite {
    filter: saturate(1.5) brightness(1.18)
      drop-shadow(0 0 20px hsl(var(--hue,30) 95% 65% / 0.95))
      drop-shadow(0 0 42px hsl(var(--hue,30) 80% 48% / 0.65));
    animation: sprite-bob 1.1s ease-in-out infinite;
  }
  .state-angry .bot-sprite {
    filter: hue-rotate(108deg) saturate(3) brightness(1.1)
      drop-shadow(0 0 18px rgba(255,55,35,0.95))
      drop-shadow(0 0 38px rgba(200,20,10,0.7));
    animation: sprite-shake .08s linear infinite;
  }
  .state-sleeping .bot-sprite {
    filter: brightness(0.3) saturate(0.25);
    animation: sprite-sleep 4.5s ease-in-out infinite;
  }
  .state-glitching .bot-sprite {
    filter: hue-rotate(208deg) saturate(2.8) brightness(1.22)
      drop-shadow(0 0 18px oklch(72% .32 290 / 0.95));
    animation: sprite-glitch .08s steps(1) 9;
  }
  .state-touring .bot-sprite {
    filter: saturate(2.2) brightness(1.3)
      drop-shadow(0 0 26px hsl(var(--hue,30) 100% 72% / 0.98))
      drop-shadow(0 0 54px hsl(var(--hue,30) 88% 52% / 0.75));
    animation: sprite-bob 0.75s ease-in-out infinite;
  }
  .state-clicked .bot-sprite { animation: sprite-jolt .15s ease 2; }
  .is-moving .bot-sprite     { animation: sprite-walk .42s ease-in-out infinite; }

  @keyframes sprite-bob   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
  @keyframes sprite-walk  { 0%,100%{transform:rotate(-4deg) translateY(-2px)} 50%{transform:rotate(4deg) translateY(2px)} }
  @keyframes sprite-sleep { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(4px) rotate(3deg)} }
  @keyframes sprite-jolt  { 0%{transform:scale(1)} 35%{transform:scale(1.18) rotate(-6deg)} 65%{transform:scale(1.07) rotate(4deg)} 100%{transform:scale(1)} }
  @keyframes sprite-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
  @keyframes sprite-glitch{ 0%{transform:translate(-5px,1px) skewX(-3deg)} 25%{transform:translate(5px,-1px) skewX(3deg)} 50%{transform:translate(-3px,2px)} 75%{transform:translate(4px,-2px)} 100%{transform:translate(0)} }

  /* ── Glowing eye overlay — cursor tracking on the TV face ── */
  .bot-eye-overlay { position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:3; }
  .overlay-eye {
    position:absolute; width:10px; height:10px; border-radius:50%;
    background:hsl(var(--hue,30) 95% 70%);
    box-shadow:0 0 8px 3px hsl(var(--hue,30) 95% 65% / 0.9);
    mix-blend-mode:screen;
    transition:transform .08s ease, background .3s, width .2s, height .2s;
  }
  /* Eye positions on the 100px pixel art — TV face, two dot eyes */
  .eye-l { left:34px; top:27px; }
  .eye-r { left:58px; top:27px; }
  .state-angry    .overlay-eye { background:oklch(72% .3 25);  box-shadow:0 0 9px 3px oklch(68% .28 25 / 0.9); }
  .state-glitching .overlay-eye{ background:oklch(76% .32 290); box-shadow:0 0 9px 3px oklch(72% .3 290 / 0.9); }
  .state-greeting .overlay-eye { width:13px; height:13px; background:hsl(var(--hue,30) 100% 78%); box-shadow:0 0 12px 5px hsl(var(--hue,30) 100% 68% / 0.95); }
  .state-touring  .overlay-eye { width:13px; height:13px; box-shadow:0 0 14px 6px hsl(var(--hue,30) 100% 72% / 0.98); }
  .state-sleeping .overlay-eye { display:none; }

  /* Sleeping zzz */
  .bot-zzz {
    position:absolute; top:-14px; right:-8px;
    font-family:'Courier New',monospace; font-size:.62rem; font-weight:bold;
    color:hsl(var(--hue,30) 55% 48%); letter-spacing:.1em;
    animation:zzz-float 2.5s ease-in-out infinite;
    pointer-events:none; z-index:4;
  }
  @keyframes zzz-float { 0%,100%{transform:translateY(0);opacity:.7} 50%{transform:translateY(-8px);opacity:1} }

  /* ── Weather orb ── */
  .bot-weather {
    position:absolute; top:-12px; right:-10px;
    width:26px; height:26px; border-radius:50%;
    background:oklch(10% .05 var(--hue,30) / .95);
    border:1.5px solid hsl(var(--hue,30) 65% 45%);
    display:flex; align-items:center; justify-content:center;
    font-size:.75rem; z-index:8; line-height:1; pointer-events:none;
    box-shadow:0 0 10px hsl(var(--hue,30) 70% 45% / .5);
    animation:weather-bob 3s ease-in-out infinite;
  }
  .bot-weather.wflip { transform:scaleX(-1); }
  @keyframes weather-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

  /* ── Thought bubble ── */
  .bot-thought { position:fixed;z-index:9996;pointer-events:none;display:flex;align-items:center;gap:5px;animation:thought-pop .35s cubic-bezier(.34,1.56,.64,1); }
  @keyframes thought-pop { from{opacity:0;transform:scale(.6)} to{opacity:1;transform:scale(1)} }
  .thought-dots { display:flex;align-items:center;gap:4px; }
  .t-dot { border-radius:50%;background:hsl(var(--hue,30) 48% 38%/.8); }
  .d1{width:5px;height:5px} .d2{width:7px;height:7px} .d3{width:9px;height:9px}
  .thought-cloud {
    background:oklch(8% .02 var(--hue,30)/.95);
    border:1px solid hsl(var(--hue,30) 48% 34%/.75);
    border-radius:20px;padding:5px 12px;
    font-family:'Courier New',monospace;font-size:.52rem;font-style:italic;
    color:hsl(var(--hue,30) 55% 48%);letter-spacing:.03em;white-space:nowrap;
    box-shadow:0 0 12px hsl(var(--hue,30) 50% 30%/.3);backdrop-filter:blur(6px);
  }

  /* ── Speech bubble ── */
  .bot-speech {
    position:absolute;bottom:calc(100% + 12px);left:50%;transform:translateX(-50%);
    background:oklch(7% .04 var(--hue,30)/.97);
    border:1.5px solid hsl(var(--hue,30) 78% 50%);
    border-radius:10px;padding:9px 12px 10px;
    font-family:'Courier New',monospace;font-size:.6rem;
    color:hsl(var(--hue,30) 92% 72%);letter-spacing:.04em;
    box-shadow:0 0 22px hsl(var(--hue,30) 78% 48%/.45),inset 0 0 14px hsl(var(--hue,30) 60% 22%/.3);
    animation:speech-pop .22s cubic-bezier(.34,1.56,.64,1);
    z-index:10;max-width:215px;min-width:145px;
    white-space:normal;text-align:left;pointer-events:auto;line-height:1.55;
    display:flex;flex-direction:column;gap:5px;backdrop-filter:blur(6px);
  }
  .bot-speech::after { content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:7px solid transparent;border-top-color:hsl(var(--hue,30) 78% 50%); }
  .speech-header { display:flex;align-items:center;justify-content:space-between;padding-bottom:4px;border-bottom:1px solid hsl(var(--hue,30) 60% 32%/.5);margin-bottom:2px; }
  .speech-tag { font-size:.5rem;letter-spacing:.12em;color:hsl(var(--hue,30) 72% 52%); }
  .speech-dots { display:flex;gap:3px; }
  .speech-dots span { width:4px;height:4px;border-radius:50%;background:hsl(var(--hue,30) 82% 57%);animation:dot-pulse 1.4s ease-in-out infinite; }
  .speech-dots span:nth-child(2){animation-delay:.2s} .speech-dots span:nth-child(3){animation-delay:.4s}
  @keyframes dot-pulse { 0%,100%{opacity:.25} 50%{opacity:1} }
  .bot-speech-action { display:inline-block;margin-top:3px;padding:3px 9px;border-radius:4px;border:1px solid hsl(var(--hue,30) 82% 54%);color:hsl(var(--hue,30) 96% 74%);font-size:.57rem;letter-spacing:.07em;text-decoration:none;background:hsl(var(--hue,30) 82% 52%/.12);transition:background .15s,transform .1s;cursor:pointer;white-space:nowrap;align-self:flex-end; }
  .bot-speech-action:hover { background:hsl(var(--hue,30) 82% 52%/.32);transform:scale(1.05); }
  .state-angry .bot-speech { border-color:oklch(58% .28 25);color:oklch(80% .24 25);box-shadow:0 0 20px oklch(58% .28 25/.55); }
  .state-angry .bot-speech::after { border-top-color:oklch(58% .28 25); }
  .state-touring .bot-speech { border-color:hsl(var(--hue,30) 100% 60%); }
  @keyframes speech-pop { from{opacity:0;transform:translateX(-50%) scale(.72) translateY(10px)} to{opacity:1;transform:translateX(-50%) scale(1) translateY(0)} }
  .cursor-blink { animation:blink .7s step-end infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  /* ── Close ── */
  .bot-close { position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:oklch(14% .04 var(--hue,30));border:1.5px solid hsl(var(--hue,30) 58% 40%);color:hsl(var(--hue,30) 82% 67%);font-size:.46rem;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .2s;z-index:15;padding:0; }
  .cyberbot-root:hover .bot-close { opacity:1; }

  @media (max-width:480px) {
    .cyberbot-root { transform-origin:bottom left; transform:scale(.82); }
    .facing-left.cyberbot-root { transform-origin:bottom right; transform:scaleX(-1) scale(.82); }
  }
</style>
