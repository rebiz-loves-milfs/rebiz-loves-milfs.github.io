// Welcome back toast using Page Visibility API
(function () {
	let hiddenAt = null;
	const AWAY_THRESHOLD = 30000; // 30 seconds away = welcome back

	function handleVisibilityChange() {
		if (document.hidden) {
			hiddenAt = Date.now();
		} else {
			if (hiddenAt && Date.now() - hiddenAt > AWAY_THRESHOLD) {
				if (typeof window.toast !== "undefined") {
					window.toast.info("Welcome back! 👋", { duration: 3000 });
				}
			}
			hiddenAt = null;
		}
	}

	document.addEventListener("visibilitychange", handleVisibilityChange);
})();
