import { writable } from 'svelte/store';
import { THEME } from '../config';

// Initialize directly from localStorage — no two-step that causes a dark→light flash
const initDark = typeof window !== 'undefined'
  ? localStorage.getItem('dark') === 'true'
  : false;

const initHue = typeof window !== 'undefined'
  ? (parseInt(localStorage.getItem('hue') ?? String(THEME.defaultHue), 10) || THEME.defaultHue)
  : THEME.defaultHue;

export const dark = writable(initDark);
export const hue  = writable(initHue);

dark.subscribe(val => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', val);
  localStorage.setItem('dark', String(val));
});

hue.subscribe(val => {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--hue', String(val));
  localStorage.setItem('hue', String(val));
});
