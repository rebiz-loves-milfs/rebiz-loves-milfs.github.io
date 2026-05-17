// Text scramble effect for post titles — katakana + latin chaos
(function () {
	const CHARS =
		"アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	const DURATION = 600; // ms total scramble duration
	const FRAME_RATE = 40; // ms per frame

	function scramble(el) {
		const original = el.textContent;
		const len = original.length;
		let frame = 0;
		const totalFrames = Math.ceil(DURATION / FRAME_RATE);

		if (el._scrambleTimer) {
			clearInterval(el._scrambleTimer);
			el.textContent = el._scrambleOriginal || original;
		}

		el._scrambleOriginal = original;

		el._scrambleTimer = setInterval(() => {
			frame++;
			const progress = frame / totalFrames;
			// Reveal from left as progress increases
			const revealed = Math.floor(progress * len);

			let result = "";
			for (let i = 0; i < len; i++) {
				if (original[i] === " ") {
					result += " ";
				} else if (i < revealed) {
					result += original[i];
				} else {
					result += CHARS[Math.floor(Math.random() * CHARS.length)];
				}
			}
			el.textContent = result;

			if (frame >= totalFrames) {
				clearInterval(el._scrambleTimer);
				el._scrambleTimer = null;
				el.textContent = original;
			}
		}, FRAME_RATE);
	}

	function restore(el) {
		if (el._scrambleTimer) {
			clearInterval(el._scrambleTimer);
			el._scrambleTimer = null;
		}
		if (el._scrambleOriginal) {
			el.textContent = el._scrambleOriginal;
		}
	}

	function attachScramble() {
		document.querySelectorAll("[data-scramble]").forEach((el) => {
			if (el._scrambleAttached) return;
			el._scrambleAttached = true;
			el.addEventListener("mouseenter", () => scramble(el));
			el.addEventListener("mouseleave", () => restore(el));
		});
	}

	document.addEventListener("DOMContentLoaded", attachScramble);
	document.addEventListener("astro:page-load", attachScramble);
	document.addEventListener("mizuki:page:loaded", attachScramble);
	attachScramble();
})();
