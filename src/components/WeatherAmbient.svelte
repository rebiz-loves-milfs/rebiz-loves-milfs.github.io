<script>
  import { onMount } from 'svelte';

  let weatherEmoji = '';
  let temperature = null;
  let overlayType = null; // null | 'rain' | 'snow' | 'fog' | 'storm'
  let drops = [];
  let snowflakes = [];
  let reducedMotion = false;

  const DROP_COUNT = 20;
  const SNOW_COUNT = 15;

  function getOverlayType(code) {
    if (code <= 1) return null;
    if (code <= 3) return 'cloudy';
    if (code === 45 || code === 48) return 'fog';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
    if (code >= 95 && code <= 99) return 'storm';
    return null;
  }

  function getEmoji(code) {
    if (code <= 1) return '☀️';
    if (code <= 3) return '⛅';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code === 85 || code === 86) return '❄️';
    if (code >= 95 && code <= 99) return '⛈️';
    return '🌡️';
  }

  function applyFogEffect(active) {
    if (active) {
      document.body.style.filter = 'saturate(0.85)';
    } else {
      document.body.style.filter = '';
    }
  }

  function generateDrops() {
    drops = Array.from({ length: DROP_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.6 + Math.random() * 0.8,
      height: 10 + Math.random() * 15,
    }));
  }

  function generateSnowflakes() {
    snowflakes = Array.from({ length: SNOW_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 6,
      size: 4 + Math.random() * 6,
    }));
  }

  let flashInterval = null;
  let flashEl = null;

  function startStormFlash() {
    if (reducedMotion) return;
    flashEl = document.createElement('div');
    flashEl.style.cssText = 'position:fixed;inset:0;background:white;pointer-events:none;z-index:9;opacity:0;';
    document.body.appendChild(flashEl);
    flashInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        flashEl.style.transition = 'opacity 0.05s';
        flashEl.style.opacity = '0.08';
        setTimeout(() => {
          if (flashEl) flashEl.style.opacity = '0';
        }, 80);
      }
    }, 3000);
  }

  function stopStormFlash() {
    clearInterval(flashInterval);
    flashInterval = null;
    if (flashEl) { flashEl.remove(); flashEl = null; }
  }

  onMount(() => {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!navigator.geolocation) return;

    const controller = new AbortController();

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=weather_code,temperature_2m&timezone=auto`,
            { signal: controller.signal },
          );
          if (!res.ok) return;
          const json = await res.json();
          const code = json.current?.weather_code ?? 0;
          const temp = json.current?.temperature_2m ?? null;

          weatherEmoji = getEmoji(code);
          temperature = temp !== null ? Math.round(temp) : null;
          overlayType = getOverlayType(code);

          if (overlayType === 'fog') {
            applyFogEffect(true);
          }
          if (!reducedMotion) {
            if (overlayType === 'rain' || overlayType === 'storm') generateDrops();
            if (overlayType === 'snow') generateSnowflakes();
            if (overlayType === 'storm') startStormFlash();
          }
        } catch(err) {
          if (err.name === 'AbortError') return;
        }
      },
      () => { /* denied — no effect */ },
      { timeout: 8000 },
    );

    return () => {
      controller.abort();
      applyFogEffect(false);
      stopStormFlash();
    };
  });
</script>

{#if overlayType === 'rain' || overlayType === 'storm'}
  <div class="weather-overlay rain-overlay" aria-hidden="true">
    {#each drops as d (d.id)}
      <div
        class="rain-drop"
        style="left:{d.left}%;animation-delay:{d.delay}s;animation-duration:{d.duration}s;height:{d.height}px;"
      ></div>
    {/each}
  </div>
{/if}

{#if overlayType === 'snow'}
  <div class="weather-overlay snow-overlay" aria-hidden="true">
    {#each snowflakes as f (f.id)}
      <div
        class="snowflake"
        style="left:{f.left}%;animation-delay:{f.delay}s;animation-duration:{f.duration}s;width:{f.size}px;height:{f.size}px;"
      ></div>
    {/each}
  </div>
{/if}

{#if weatherEmoji}
  <div class="weather-badge" aria-label="Current weather">
    <span class="weather-icon">{weatherEmoji}</span>
    {#if temperature !== null}
      <span class="weather-temp">{temperature}°</span>
    {/if}
  </div>
{/if}

<style>
  .weather-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 8;
    opacity: 0.4;
    overflow: hidden;
  }

  /* Rain drops */
  .rain-drop {
    position: absolute;
    top: -20px;
    width: 1.5px;
    background: linear-gradient(to bottom, transparent, rgba(150, 180, 220, 0.8));
    border-radius: 1px;
    animation: rain-fall linear infinite;
  }

  @keyframes rain-fall {
    from { transform: translateY(-20px); }
    to   { transform: translateY(110vh); }
  }

  /* Snowflakes */
  .snowflake {
    position: absolute;
    top: -10px;
    border-radius: 50%;
    background: rgba(220, 235, 255, 0.85);
    animation: snow-float linear infinite;
  }

  @keyframes snow-float {
    0%   { transform: translateY(-10px) translateX(0); }
    33%  { transform: translateY(33vh) translateX(15px); }
    66%  { transform: translateY(66vh) translateX(-10px); }
    100% { transform: translateY(110vh) translateX(5px); }
  }

  /* Ambient badge */
  .weather-badge {
    position: fixed;
    bottom: 84px;
    left: 24px;
    z-index: 200;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--card-bg, rgba(255,255,255,0.85));
    border: 1px solid var(--border, rgba(0,0,0,0.1));
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    font-size: 13px;
    font-family: var(--font-mono, monospace);
    color: var(--fg-2, #555);
    backdrop-filter: blur(6px);
    pointer-events: none;
  }

  .weather-icon { font-size: 14px; }
  .weather-temp { font-size: 11px; color: var(--fg-3, #888); }

  @media (prefers-reduced-motion: reduce) {
    .rain-drop, .snowflake { animation: none !important; }
  }
</style>
