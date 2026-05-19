<script>
  import { READING_LIST } from '../../data/reading';

  const TYPE_BADGE = {
    'book':        '📖 book',
    'article':     '✦ article',
    'manga':       '⛩ manga',
    'light-novel': '✨ light-novel',
  };

  const TYPE_HUE = {
    'book': 250,
    'article': 145,
    'manga': 30,
    'light-novel': 300,
  };

  const currentlyReading = READING_LIST.filter(i => i.status === 'reading');
  const recentlyFinished = READING_LIST.filter(i => i.status === 'finished').slice(0, 3);
  const wantToRead      = READING_LIST.filter(i => i.status === 'want-to-read');

  function stars(rating) {
    return Array.from({ length: 5 }, (_, i) => i < rating ? '★' : '☆').join('');
  }

  function firstLetter(title) {
    return title.trim().charAt(0).toUpperCase();
  }
</script>

<div class="card">
  <div class="widget-title">
    <iconify-icon icon="material-symbols:menu-book-outline" width="11"></iconify-icon>
    Reading List
  </div>

  <!-- Currently Reading -->
  {#if currentlyReading.length > 0}
    <div class="rl-section-label">Currently Reading</div>
    <div class="rl-current">
      {#each currentlyReading as item}
        <div class="rl-current-item">
          {#if item.cover}
            <img src={item.cover} alt={item.title} class="rl-thumb" loading="lazy" />
          {:else}
            <div
              class="rl-thumb-fallback"
              style="background:oklch(0.65 0.15 {TYPE_HUE[item.type] ?? 200})"
            >
              <span class="rl-fallback-letter">{firstLetter(item.title)}</span>
            </div>
          {/if}
          <div class="rl-current-info">
            <div class="rl-type-badge">{TYPE_BADGE[item.type] ?? item.type}</div>
            <div class="rl-item-title">{item.title}</div>
            <div class="rl-item-author">{item.author}</div>
            <div class="rl-reading-indicator">
              <span class="rl-reading-dot"></span>
              <span class="rl-reading-label">Reading now</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Recently Finished -->
  {#if recentlyFinished.length > 0}
    <div class="rl-section-label" style="margin-top:14px">Recently Finished</div>
    <div class="rl-finished">
      {#each recentlyFinished as item}
        <div class="rl-finished-item">
          {#if item.cover}
            <img src={item.cover} alt={item.title} class="rl-thumb-sm" loading="lazy" />
          {:else}
            <div
              class="rl-thumb-sm rl-thumb-fallback-sm"
              style="background:oklch(0.65 0.15 {TYPE_HUE[item.type] ?? 200})"
            >
              <span class="rl-fallback-letter-sm">{firstLetter(item.title)}</span>
            </div>
          {/if}
          <div class="rl-finished-info">
            <div class="rl-type-badge-sm">{TYPE_BADGE[item.type] ?? item.type}</div>
            <div class="rl-item-title-sm">{item.title}</div>
            <div class="rl-item-author-sm">{item.author}</div>
            {#if item.rating}
              <div class="rl-stars">{stars(item.rating)}</div>
            {/if}
            {#if item.note}
              <div class="rl-note">"{item.note}"</div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Want to Read -->
  {#if wantToRead.length > 0}
    <div class="rl-section-label" style="margin-top:14px">Want to Read</div>
    <div class="rl-want">
      {#each wantToRead as item}
        {#if item.url}
          <a href={item.url} target="_blank" rel="noopener noreferrer" class="rl-want-item rl-want-link">
            <span class="rl-type-badge-sm">{TYPE_BADGE[item.type] ?? item.type}</span>
            <span class="rl-want-title">{item.title}</span>
            <iconify-icon icon="material-symbols:open-in-new" width="10" class="rl-want-ext"></iconify-icon>
          </a>
        {:else}
          <div class="rl-want-item">
            <span class="rl-type-badge-sm">{TYPE_BADGE[item.type] ?? item.type}</span>
            <span class="rl-want-title">{item.title}</span>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .rl-section-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--fg-4);
    margin-bottom: 8px;
  }

  /* Currently Reading */
  .rl-current {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .rl-current-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 10px;
    background: var(--btn-regular-bg);
    border-radius: 0.75rem;
    border: 1px solid var(--border);
  }

  .rl-thumb {
    width: 44px;
    height: 62px;
    border-radius: 0.4rem;
    object-fit: cover;
    flex-shrink: 0;
    display: block;
  }

  .rl-thumb-fallback {
    width: 44px;
    height: 62px;
    border-radius: 0.4rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rl-fallback-letter {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 24px;
    color: white;
    opacity: 0.85;
  }

  .rl-current-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .rl-type-badge {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--primary);
  }

  .rl-item-title {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 13px;
    color: var(--fg-1);
    line-height: 1.3;
  }

  .rl-item-author {
    font-size: 11px;
    color: var(--fg-3);
  }

  .rl-reading-indicator {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 2px;
  }

  .rl-reading-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: oklch(0.62 0.18 145);
    animation: rl-pulse 1.8s ease-out infinite;
    flex-shrink: 0;
  }

  @keyframes rl-pulse {
    0%, 100% { box-shadow: 0 0 0 0 oklch(0.62 0.18 145 / 0.5); }
    50%       { box-shadow: 0 0 0 4px oklch(0.62 0.18 145 / 0); }
  }

  .rl-reading-label {
    font-size: 10px;
    font-weight: 600;
    color: oklch(0.62 0.18 145);
    font-family: var(--font-mono);
  }

  /* Recently Finished */
  .rl-finished {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rl-finished-item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .rl-thumb-sm {
    width: 32px;
    height: 44px;
    border-radius: 0.35rem;
    object-fit: cover;
    flex-shrink: 0;
    display: block;
  }

  .rl-thumb-fallback-sm {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rl-fallback-letter-sm {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 16px;
    color: white;
    opacity: 0.85;
  }

  .rl-finished-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .rl-type-badge-sm {
    font-size: 9px;
    font-weight: 700;
    color: var(--fg-4);
  }

  .rl-item-title-sm {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 12px;
    color: var(--fg-1);
    line-height: 1.3;
  }

  .rl-item-author-sm {
    font-size: 10px;
    color: var(--fg-4);
  }

  .rl-stars {
    font-size: 11px;
    color: oklch(0.75 0.18 80);
    letter-spacing: 0.05em;
    margin-top: 1px;
  }

  .rl-note {
    font-size: 10.5px;
    color: var(--fg-3);
    font-style: italic;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Want to Read */
  .rl-want {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .rl-want-item {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 8px;
    border-radius: 0.5rem;
    transition: background 120ms;
  }

  .rl-want-item:hover {
    background: var(--btn-regular-bg);
  }

  .rl-want-link {
    text-decoration: none;
    color: inherit;
  }

  .rl-want-title {
    font-size: 12px;
    color: var(--fg-2);
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rl-want-ext {
    color: var(--fg-4);
    flex-shrink: 0;
  }
</style>
