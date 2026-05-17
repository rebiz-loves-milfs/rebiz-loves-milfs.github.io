// Post reactions — Supabase backend, localStorage dedup
(function () {
	const SUPABASE_URL = "https://iamioawcknplsunxucem.supabase.co";
	const SUPABASE_KEY = "sb_publishable_jZ4-zpjuekptyescINIQWw_sKew3Iqf";
	const API = `${SUPABASE_URL}/rest/v1/post_reactions`;
	const HEADERS = {
		apikey: SUPABASE_KEY,
		Authorization: `Bearer ${SUPABASE_KEY}`,
		"Content-Type": "application/json",
	};

	function getStorageKey(slug) {
		return `reaction_${slug}`;
	}

	function getUserReaction(slug) {
		return localStorage.getItem(getStorageKey(slug));
	}

	function setUserReaction(slug, emoji) {
		if (emoji) {
			localStorage.setItem(getStorageKey(slug), emoji);
		} else {
			localStorage.removeItem(getStorageKey(slug));
		}
	}

	async function fetchCounts(slug) {
		try {
			const res = await fetch(
				`${API}?slug=eq.${encodeURIComponent(slug)}&select=emoji`,
				{ headers: HEADERS },
			);
			if (!res.ok) return {};
			const rows = await res.json();
			const counts = {};
			for (const row of rows) {
				counts[row.emoji] = (counts[row.emoji] || 0) + 1;
			}
			return counts;
		} catch {
			return {};
		}
	}

	async function addReaction(slug, emoji) {
		try {
			const res = await fetch(API, {
				method: "POST",
				headers: { ...HEADERS, Prefer: "return=minimal" },
				body: JSON.stringify({ slug, emoji }),
			});
			return res.ok || res.status === 201;
		} catch {
			return false;
		}
	}

	function renderCounts(container, counts, userReaction) {
		container.querySelectorAll(".reaction-btn").forEach((btn) => {
			const emoji = btn.getAttribute("data-emoji");
			const count = counts[emoji] || 0;
			btn.querySelector(".reaction-count").textContent =
				count > 0 ? count : "";
			btn.classList.toggle("reacted", userReaction === emoji);
		});
	}

	async function initCard(container) {
		const slug = container.getAttribute("data-slug");
		if (!slug || container._reactionsInited) return;
		container._reactionsInited = true;

		const counts = await fetchCounts(slug);
		const userReaction = getUserReaction(slug);
		renderCounts(container, counts, userReaction);

		container.querySelectorAll(".reaction-btn").forEach((btn) => {
			btn.addEventListener("click", async () => {
				const emoji = btn.getAttribute("data-emoji");
				const current = getUserReaction(slug);

				if (current) {
					// Already reacted — show a gentle pulse, no double-vote
					btn.classList.add("reaction-bounce");
					setTimeout(() => btn.classList.remove("reaction-bounce"), 400);
					return;
				}

				setUserReaction(slug, emoji);
				btn.classList.add("reacted");

				// Optimistic update
				const countEl = btn.querySelector(".reaction-count");
				const prev = parseInt(countEl.textContent) || 0;
				countEl.textContent = prev + 1;

				const ok = await addReaction(slug, emoji);
				if (!ok) {
					// Rollback
					setUserReaction(slug, null);
					btn.classList.remove("reacted");
					countEl.textContent = prev > 0 ? prev : "";
				}
			});
		});
	}

	function initAll() {
		document.querySelectorAll(".post-reactions").forEach((el) => {
			initCard(el);
		});
	}

	// Inject CSS
	const CSS = `
.post-reactions {
	display: flex;
	gap: 0.4rem;
	margin-top: 0.75rem;
	flex-wrap: wrap;
}

.reaction-btn {
	display: inline-flex;
	align-items: center;
	gap: 0.3rem;
	padding: 0.25rem 0.55rem;
	border-radius: 99px;
	border: 1px solid rgba(128,128,128,0.2);
	background: transparent;
	cursor: pointer;
	font-size: 0.82rem;
	transition: background 0.15s, border-color 0.15s, transform 0.15s;
	color: inherit;
	line-height: 1;
}

.reaction-btn:hover {
	background: color-mix(in srgb, hsl(var(--hue,30) 75% 55%) 12%, transparent);
	border-color: hsl(var(--hue,30) 75% 55%);
	transform: scale(1.08);
}

.reaction-btn.reacted {
	background: color-mix(in srgb, hsl(var(--hue,30) 75% 55%) 18%, transparent);
	border-color: hsl(var(--hue,30) 75% 55%);
}

.reaction-emoji { font-size: 1rem; line-height: 1; }

.reaction-count {
	font-size: 0.75rem;
	font-weight: 600;
	min-width: 0.5ch;
	color: var(--text-secondary, rgb(0 0 0 / 0.5));
}

:root.dark .reaction-count {
	color: rgb(255 255 255 / 0.5);
}

@keyframes reaction-bounce {
	0%,100% { transform: scale(1); }
	40%      { transform: scale(1.25) rotate(-6deg); }
	70%      { transform: scale(0.95) rotate(4deg); }
}

.reaction-btn.reaction-bounce {
	animation: reaction-bounce 0.4s ease;
}
`;

	if (!document.getElementById("post-reactions-css")) {
		const style = document.createElement("style");
		style.id = "post-reactions-css";
		style.textContent = CSS;
		document.head.appendChild(style);
	}

	document.addEventListener("DOMContentLoaded", initAll);
	document.addEventListener("astro:page-load", initAll);
	document.addEventListener("mizuki:page:loaded", initAll);
	initAll();
})();
