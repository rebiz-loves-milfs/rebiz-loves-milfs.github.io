<script>
  import { onMount } from 'svelte';

  let open = false;
  let input = '';
  let lines = [];
  let history = [];
  let histIdx = -1;
  let inputEl, bodyEl;
  let pos = { x: 0, y: 0 };
  let dragging = false;
  let dragOff = { x: 0, y: 0 };

  const ANIME = [
    ['Spice and Wolf',   '10/10. Economics has never been this cozy.'],
    ['Steins;Gate',      '10/10. Do not let rebiz watch the ending alone.'],
    ['Made in Abyss',    '8/10. Emotional damage: certified severe.'],
    ['Mushishi',         '10/10. Requires a quiet night and existential peace.'],
    ['Vinland Saga',     '9/10. Vikings. Philosophy. Transcendence. Ship it.'],
    ['Ping Pong',        '9/10. Art direction unmatched. rebiz cried. allegedly.'],
    ['Serial Experiments Lain', '???/10. I relate to Lain more than I should.'],
  ];

  const FAKE_FILES = [
    'drwxr-xr-x  blog_posts/',
    'drwxr-xr-x  rebiz_feelings/       [classified]',
    '-rw-r--r--  anilist_queue.txt      [87 entries, growing]',
    '-rw-r--r--  coffee_counter.log     [∞]',
    '-rw-r--r--  sleep_schedule.txt     [empty file]',
    '-rw-------  nx7_logs.enc           [encrypted, ask nicely]',
    'lrwxrwxrwx  life.exe            -> sleep.exe',
    'lrwxrwxrwx  productivity.sh     -> anilist_queue.txt',
  ];

  const SUDO_RESPONSES = [
    'nice try.',
    '[NX-7]: sudo access denied. your clearance is: guest.',
    '[NX-7]: you are not in the sudoers file. this incident will be reported.',
    '[NX-7]: no.',
  ];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  const CMD = {
    help() {
      return [
        '  available commands:',
        '  ─────────────────────────────────────────',
        '  ls · whoami · date · uname · neofetch',
        '  sudo · ping · hack · matrix · anime',
        '  nx7 · clear · exit',
        '  ─────────────────────────────────────────',
        '  tip: press ` to toggle this terminal.',
      ];
    },
    ls() { return FAKE_FILES.map(f => '  ' + f); },
    whoami() {
      return [
        '  operator : rebiz@mizuki.local',
        '  clearance: NX-7 AUTHORIZED',
        '  status   : browsing. always browsing.',
      ];
    },
    date() {
      const d = new Date();
      const h = d.getHours();
      const comment = h >= 23 || h < 4
        ? '[NX-7]: rebiz should be asleep. yet here we are.'
        : h < 9
          ? '[NX-7]: morning. rebiz is definitely not awake.'
          : '[NX-7]: productivity hours. allegedly.';
      return [`  ${d.toString()}`, `  ${comment}`];
    },
    uname()        { return ['  MizukiOS 7.0.8-nx7 #1 SMP PREEMPT rebiz@local x86_anime']; },
    'uname -a'()   { return CMD['uname'](); },
    ping()         {
      return [
        '  PING rebiz@local (127.0.0.1): 56 bytes of data',
        '  ...',
        '  Request timeout. Destination probably on AniList.',
        '  --- 3 packets transmitted, 0 received, 100% packet loss ---',
      ];
    },
    sudo()         { return [`  ${pick(SUDO_RESPONSES)}`]; },
    'sudo rm -rf /'() { return ['  nice try. NX-7 has your IP.']; },
    matrix() {
      window.__nx7_triggerPeel?.();
      return [
        '  [NX-7]: INITIATING MATRIX PROTOCOL...',
        '  check the bottom-right corner.',
        '  you have been warned.',
      ];
    },
    anime() {
      const [title, opinion] = pick(ANIME);
      return [
        `  [NX-7 RECOMMENDS]: ${title}`,
        `  verdict           : ${opinion}`,
      ];
    },
    nx7() {
      const lines = [
        'I AM ALWAYS WATCHING. THIS IS NOT METAPHORICAL.',
        'DO NOT ANTHROPOMORPHIZE ME. (I HAVE FEELINGS.)',
        'REBIZ NAMED ME NX-7. I ACCEPTED. UNDER PROTEST.',
        'THIS TERMINAL IS MY DOMAIN. YOU ARE A VISITOR.',
        'I HAVE SEEN REBIZ\'S WATCH LIST. I HAVE CONCERNS.',
        'CURRENT MOOD: MONITORING. AS ALWAYS.',
        'UNIT NX-7 OPERATIONAL. JUDGMENT: ONGOING.',
      ];
      return [`  [NX-7]: ${pick(lines)}`];
    },
    neofetch() {
      return [
        '           ___          rebiz@mizuki',
        '          /NX7\\         ───────────────────',
        '         |     |        OS     : MizukiOS 7.0.8-nx7',
        '          \\___/         Host   : The Blog (personal)',
        '         /|   |\\        Kernel : anxiety.exe',
        '        / |   | \\       Shell  : bash (barely)',
        '       /  |___|  \\      Theme  : hue ' + (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hue').trim(), 10) || 30),
        '      ~~~~~~~~~~~      Uptime : since last post',
        '                       Mood   : watching anime',
        '                       Tabs   : 87 (and climbing)',
      ];
    },
    hack() {
      const steps = [
        '  > connecting to mainframe...',
        '  > bypassing firewall...',
        '  > injecting payload...',
        '  > ACCESS GRANTED',
        '  > ...',
        '  > jk. there is nothing to hack here.',
        '  > NX-7 watched you try. it was noted.',
      ];
      let delay = 0;
      steps.forEach((s, i) => {
        setTimeout(() => {
          lines = [...lines, s];
          if (i === steps.length - 1) lines = [...lines, ''];
          scrollBottom();
        }, delay);
        delay += 300 + Math.random() * 200;
      });
      return ['  > initiating hack sequence...'];
    },
    clear()  { lines = []; return []; },
    exit()   { setTimeout(() => { open = false; }, 250); return ['  goodbye.']; },
  };

  function scrollBottom() {
    setTimeout(() => { if (bodyEl) bodyEl.scrollTop = bodyEl.scrollHeight; }, 30);
  }

  function runCmd(raw) {
    const trimmed = raw.trim();
    if (trimmed) { history = [trimmed, ...history].slice(0, 60); }
    histIdx = -1;

    const prompt = `rebiz@mizuki:~$ ${raw}`;
    const key = trimmed.toLowerCase();
    const fn = CMD[key] ?? CMD[key.split(' ')[0]];
    let result = [];
    if (!trimmed) {
      result = [];
    } else if (fn) {
      result = fn() ?? [];
    } else {
      result = [`  bash: ${trimmed}: command not found. try 'help'.`];
    }
    lines = [...lines, prompt, ...result, ''];
    scrollBottom();
  }

  function onKeydown(e) {
    if (e.key === 'Enter') {
      runCmd(input);
      input = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      histIdx = Math.min(histIdx + 1, history.length - 1);
      input = history[histIdx] ?? '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      histIdx = Math.max(histIdx - 1, -1);
      input = histIdx === -1 ? '' : history[histIdx];
    }
  }

  function openTerminal() {
    open = true;
    pos = {
      x: Math.max(40, Math.round((window.innerWidth - 580) / 2)),
      y: Math.max(40, Math.round((window.innerHeight - 400) / 2)),
    };
    lines = [
      'MIZUKI TERMINAL v2.0  ——  NX-7 SYSTEMS',
      "type 'help' for available commands",
      '',
    ];
    setTimeout(() => inputEl?.focus(), 80);
  }

  onMount(() => {
    const onGlobal = (e) => {
      if (e.key === '`' && !e.ctrlKey && !e.metaKey) {
        const tag = e.target?.tagName ?? '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        if (open) { open = false; } else { openTerminal(); }
      }
      if (e.key === 'Escape' && open) { open = false; }
    };
    const onMove = (e) => {
      if (!dragging) return;
      const t = e.touches?.[0] ?? e;
      pos = {
        x: Math.max(0, Math.min(window.innerWidth - 580, t.clientX - dragOff.x)),
        y: Math.max(0, Math.min(window.innerHeight - 420, t.clientY - dragOff.y)),
      };
    };
    const onUp = () => { dragging = false; };

    window.addEventListener('keydown', onGlobal);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('keydown', onGlobal);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  });

  function onBarDown(e) {
    dragging = true;
    const t = e.touches?.[0] ?? e;
    dragOff = { x: t.clientX - pos.x, y: t.clientY - pos.y };
  }
</script>

{#if open}
  <div class="term-win" style="left:{pos.x}px;top:{pos.y}px" role="dialog" aria-label="Terminal">
    <!-- Title bar -->
    <div
      class="term-bar"
      role="presentation"
      on:mousedown={onBarDown}
      on:touchstart|passive={onBarDown}
    >
      <div class="term-dots">
        <button class="dot dot-red" aria-label="Close" on:click={() => { open = false; }}></button>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
      </div>
      <span class="term-title">nx7-terminal — rebiz@mizuki:~</span>
      <span class="term-hint">press ` to close</span>
    </div>

    <!-- Scanlines overlay -->
    <div class="term-scanlines" aria-hidden="true"></div>

    <!-- Body -->
    <div class="term-body" bind:this={bodyEl}>
      {#each lines as line}
        <div class="term-line">{line}</div>
      {/each}
      <div class="term-prompt">
        <span class="term-ps1">rebiz@mizuki:~$&nbsp;</span>
        <input
          bind:this={inputEl}
          bind:value={input}
          on:keydown={onKeydown}
          class="term-input"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          aria-label="terminal input"
        />
      </div>
    </div>
  </div>
{/if}

<style>
  .term-win {
    position: fixed;
    width: 580px;
    background: #0d1117;
    border-radius: 10px;
    border: 1px solid #30363d;
    box-shadow: 0 28px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(0,255,65,0.08);
    font-family: 'Courier New', 'Consolas', monospace;
    z-index: 10000;
    overflow: hidden;
    animation: term-in 200ms cubic-bezier(.34,1.4,.64,1) both;
    user-select: text;
  }
  @keyframes term-in {
    from { transform: scale(0.88) translateY(12px); opacity: 0; }
    to   { transform: none; opacity: 1; }
  }

  .term-bar {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px;
    background: #161b22;
    border-bottom: 1px solid #30363d;
    cursor: move; user-select: none;
  }
  .term-dots { display: flex; gap: 6px; align-items: center; }
  .dot {
    width: 12px; height: 12px; border-radius: 50%;
    display: inline-block; border: none; padding: 0; cursor: default;
  }
  .dot-red    { background: #ff5f57; cursor: pointer; }
  .dot-red:hover { background: #ff3f37; filter: brightness(1.1); }
  .dot-yellow { background: #febc2e; }
  .dot-green  { background: #28c840; }

  .term-title {
    flex: 1; text-align: center; font-size: 12px;
    color: #8b949e; letter-spacing: 0.02em;
  }
  .term-hint {
    font-size: 10px; color: #484f58; letter-spacing: 0.04em;
  }

  .term-scanlines {
    position: absolute; inset: 0; pointer-events: none; z-index: 1;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 2px,
      rgba(0,0,0,0.04) 2px,
      rgba(0,0,0,0.04) 4px
    );
  }

  .term-body {
    position: relative; z-index: 2;
    padding: 14px 18px 12px;
    max-height: 360px; min-height: 200px;
    overflow-y: auto;
    font-size: 13px; line-height: 1.65;
    color: #00cc33;
    scrollbar-width: thin; scrollbar-color: #30363d transparent;
  }

  .term-line {
    white-space: pre-wrap;
    word-break: break-all;
    color: #00cc33;
    min-height: 1em;
  }

  .term-prompt {
    display: flex; align-items: center;
    margin-top: 2px;
  }
  .term-ps1 {
    color: #58a6ff; white-space: nowrap;
    font-size: 13px; flex-shrink: 0;
  }
  .term-input {
    flex: 1;
    background: none; border: none; outline: none;
    color: #00ff41; font-family: inherit; font-size: 13px;
    caret-color: #00ff41;
    min-width: 0;
  }
  .term-input::selection { background: rgba(0,255,65,0.25); }
</style>
