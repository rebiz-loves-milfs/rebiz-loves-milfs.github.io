// Glitch effect on navbar brand title — random burst every 8-20s
(function () {
	const CSS = `
@keyframes glitch-clip-1 {
	0%   { clip-path: inset(40% 0 50% 0); transform: translate(-4px, 0); }
	20%  { clip-path: inset(70% 0 15% 0); transform: translate(4px, 0); }
	40%  { clip-path: inset(10% 0 80% 0); transform: translate(-2px, 0); }
	60%  { clip-path: inset(60% 0 25% 0); transform: translate(2px, 0); }
	80%  { clip-path: inset(30% 0 55% 0); transform: translate(-3px, 0); }
	100% { clip-path: inset(40% 0 50% 0); transform: translate(0, 0); }
}
@keyframes glitch-clip-2 {
	0%   { clip-path: inset(20% 0 70% 0); transform: translate(4px, 0); color: hsl(var(--hue,30) 100% 60%); }
	25%  { clip-path: inset(55% 0 30% 0); transform: translate(-4px, 0); color: oklch(70% 0.25 200); }
	50%  { clip-path: inset(80% 0 5%  0); transform: translate(3px, 0);  color: hsl(var(--hue,30) 100% 60%); }
	75%  { clip-path: inset(15% 0 65% 0); transform: translate(-2px, 0); color: oklch(70% 0.25 200); }
	100% { clip-path: inset(20% 0 70% 0); transform: translate(0, 0);    color: inherit; }
}
.glitch-active {
	position: relative;
	animation: none;
}
.glitch-active::before,
.glitch-active::after {
	content: attr(data-text);
	position: absolute;
	inset: 0;
	pointer-events: none;
}
.glitch-active::before {
	animation: glitch-clip-1 0.18s steps(1) 3;
	color: hsl(var(--hue,30) 100% 60%);
}
.glitch-active::after {
	animation: glitch-clip-2 0.18s steps(1) 3;
}
`;

	function injectCSS() {
		if (document.getElementById("glitch-styles")) return;
		const style = document.createElement("style");
		style.id = "glitch-styles";
		style.textContent = CSS;
		document.head.appendChild(style);
	}

	function triggerGlitch() {
		const el = document.getElementById("navbar-brand-text");
		if (!el) return;

		el.setAttribute("data-text", el.textContent);
		el.classList.add("glitch-active");

		setTimeout(() => {
			el.classList.remove("glitch-active");
		}, 600);

		scheduleNext();
	}

	function scheduleNext() {
		// Random interval between 8s and 22s
		const delay = 8000 + Math.random() * 14000;
		setTimeout(triggerGlitch, delay);
	}

	function init() {
		injectCSS();
		scheduleNext();
	}

	document.addEventListener("DOMContentLoaded", init);
	document.addEventListener("mizuki:page:loaded", () => {
		// Re-init on page navigation (glitch timer resets naturally)
	});

	init();
})();
