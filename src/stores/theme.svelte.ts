import { THEME } from "../config";

const initDark =
  typeof window !== "undefined"
    ? localStorage.getItem("dark") === "true"
    : false;

const initHue =
  typeof window !== "undefined"
    ? parseInt(localStorage.getItem("hue") ?? String(THEME.defaultHue), 10) ||
      THEME.defaultHue
    : THEME.defaultHue;

class ThemeStore {
  dark = $state(initDark);
  hue = $state(initHue);
}

export const theme = new ThemeStore();

$effect.root(() => {
  $effect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme.dark);
    localStorage.setItem("dark", String(theme.dark));
  });

  $effect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty("--hue", String(theme.hue));
    localStorage.setItem("hue", String(theme.hue));
  });
});
