<script>
  import { onMount } from 'svelte';
  import { DISCORD_USER_ID } from '../../config';

  let state = 'loading';
  let status = 'online';
  let username = 'rebiz';
  let displayName = '';
  let avatar = null;
  let customStatus = '';
  let activity = null;

  const statusColor = { online: '145', idle: '85', dnd: '25', offline: '0' };
  const statusLabel = { online: 'Online', idle: 'Idle', dnd: 'Do not disturb', offline: 'Offline' };

  onMount(() => {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 6000);
    (async () => {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message ?? 'Lanyard error');
        const d = json.data;
        status = d.discord_status ?? 'online';
        username = d.discord_user?.username ?? 'rebiz';
        displayName = d.discord_user?.global_name ?? d.discord_user?.display_name ?? '';
        if (d.discord_user?.avatar)
          avatar = `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${d.discord_user.avatar}.png?size=64`;
        customStatus = d.activities?.find(a => a.type === 4)?.state ?? '';
        activity = d.activities?.find(a => a.type !== 4) ?? null;
        state = 'live';
      } catch(err) {
        if (err.name === 'AbortError') return;
        state = 'offline';
      } finally {
        clearTimeout(tid);
      }
    })();
    return () => { clearTimeout(tid); controller.abort(); };
  });
</script>

<div class="card">
  <div class="widget-title">
    <iconify-icon icon="fa7-brands:discord" width="11"></iconify-icon>
    Discord
  </div>

  {#if state === 'loading'}
    <div class="dc-row" aria-hidden="true">
      <div class="dc-ava-wrap">
        <div class="dc-ava sk" style="border-radius:999px;flex-shrink:0"></div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:5px">
        <div class="sk-line" style="width:62%"></div>
        <div class="sk-line" style="width:40%;height:9px"></div>
      </div>
    </div>
  {:else}
    <div class="dc-row dc-reveal">
      <div class="dc-ava-wrap">
        {#if avatar}
          <img class="dc-ava" src={avatar} alt="{username}'s Discord avatar" width="38" height="38" />
        {:else}
          <div class="dc-ava dc-ava-fallback" aria-hidden="true">
            <iconify-icon icon="fa7-brands:discord" width="18"></iconify-icon>
          </div>
        {/if}
        <span
          class="dc-dot"
          role="img"
          style="background:{status === 'offline' ? 'var(--fg-4)' : `oklch(0.65 0.18 ${statusColor[status] ?? 145})`}"
          title={statusLabel[status] ?? status}
          aria-label={statusLabel[status] ?? status}
        ></span>
      </div>
      <div style="min-width:0;flex:1">
        <div class="dc-name">{displayName || username}</div>
        <div class="dc-status">
          {#if customStatus}
            {customStatus}
          {:else if activity?.name}
            playing {activity.name}
          {:else}
            {statusLabel[status] ?? status}
          {/if}
        </div>
      </div>
    </div>
    {#if activity?.type === 2 && activity.details}
      <div class="dc-spotify dc-reveal" style="animation-delay:60ms">
        <iconify-icon icon="fa7-brands:spotify" width="12" style="color:oklch(0.65 0.18 145)"></iconify-icon>
        <span style="font-size:11px;color:var(--fg-2)">{activity.details} — {activity.state}</span>
      </div>
    {/if}
  {/if}
</div>

<style>
  .dc-reveal {
    animation: sk-reveal 180ms cubic-bezier(.4,0,.2,1) both;
  }
</style>
