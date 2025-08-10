/**
 * @fileoverview Dynamic layout & geometry derived from zoom level.
 * Exports live bindings so other modules see updated values after setZoomLevel.
 */
import { d3, SCALE_SEMITONES, DEFAULT_FRETS, MIN_FRETS, MAX_FRETS } from './constants.js';

// Base logical dimensions (unscaled)
const BASE = Object.freeze({
  G_WIDTH: 500,
  G_HEIGHT: 200,
  C_WIDTH: 50,
  C_HEIGHT: 50,
  PADDING: 60
});

// Zoom state (persisted in localStorage)
let zoomLevel = 0.9;
try {
  const stored = parseFloat(localStorage.getItem('zoomLevel'));
  if (!isNaN(stored)) zoomLevel = Math.max(0.3, Math.min(2, stored));
} catch {}

// Derived geometry (live bindings)
export let G_WIDTH = BASE.G_WIDTH * zoomLevel;
export let G_HEIGHT = BASE.G_HEIGHT * zoomLevel;
export let C_WIDTH = BASE.C_WIDTH * zoomLevel;
export let C_HEIGHT = BASE.C_HEIGHT * zoomLevel;
export let padding = BASE.PADDING * zoomLevel;
export let containerWidth = G_WIDTH + padding;
export let containerHeight = G_HEIGHT + 2 * padding;
export let neckWidth = G_WIDTH; // visible neck width up to current fret count

// Scales & positional helpers (normalized so selected last fret reaches full width)
function rawFretPos(i){ return 1 - Math.pow(2, -i / SCALE_SEMITONES); }
function normDenom(){ return rawFretPos(fretCount); }
export const fretScale = (i) => G_WIDTH * rawFretPos(i) / normDenom();
export const noteScale = (i) => G_WIDTH * rawFretPos(i - 0.5) / normDenom();
// Constant open string note X (uses DEFAULT_FRETS for normalization so it does not shift when fretCount changes)
export function openNoteX(){
  return padding + G_WIDTH * rawFretPos(-0.5) / rawFretPos(DEFAULT_FRETS);
}
export const stringScale = d3.scaleLinear().domain([0,5]).range([G_HEIGHT/12, G_HEIGHT - G_HEIGHT/12]);

// Slider related
let fretCount = DEFAULT_FRETS; // dynamic number of frets (excluding open string)
try {
  const storedFrets = parseInt(localStorage.getItem('fretCount'),10);
  if (!isNaN(storedFrets)) fretCount = Math.max(MIN_FRETS, Math.min(MAX_FRETS, storedFrets));
} catch {}
export function getFretCount(){ return fretCount; }
export function setFretCount(n){
  const requested = Math.round(Number(n));
  const v = Math.max(MIN_FRETS, Math.min(21, Math.min(MAX_FRETS, requested))); // hard cap at 21
  if (!v || v === fretCount) return;
  fretCount = v;
  try { localStorage.setItem('fretCount', String(fretCount)); } catch {}
  recalc();
  document.dispatchEvent(new CustomEvent('fretCountChanged',{detail:{fretCount}}));
}
// Fixed slider length (2 octaves = 24 positions) independent of fretCount for stable wrapping
const SLIDER_LENGTH = 24; // 2 * 12
export const sliderLength = () => SLIDER_LENGTH;
// Placeholder; will be set in initial recalc() so it reflects current fretCount spacing
export let DOT_SIZE = 0;
export let dot_radius = 0;

// String thicknesses (base, then scaled with zoom)
const BASE_STRING_THICKNESSES = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 5];
export let stringThicknesses = BASE_STRING_THICKNESSES.map(x => x * 3 * zoomLevel);

export function getZoomLevel(){ return zoomLevel; }
export function setZoomLevel(z){
  if (typeof z !== 'number' || !isFinite(z)) return;
  const clamped = Math.max(0.3, Math.min(2, z));
  if (Math.abs(clamped - zoomLevel) < 1e-6) return;
  zoomLevel = clamped;
  try { localStorage.setItem('zoomLevel', String(zoomLevel)); } catch {}
  recalc();
}

function recalc(){
  G_WIDTH = BASE.G_WIDTH * zoomLevel;
  G_HEIGHT = BASE.G_HEIGHT * zoomLevel;
  C_WIDTH = BASE.C_WIDTH * zoomLevel;
  C_HEIGHT = BASE.C_HEIGHT * zoomLevel;
  padding = BASE.PADDING * zoomLevel;
  neckWidth = G_WIDTH; // full width occupied by current span
  containerWidth = neckWidth + padding;
  containerHeight = G_HEIGHT + 2 * padding;
  stringScale.range([G_HEIGHT/12, G_HEIGHT - G_HEIGHT/12]);
  // Compute minimum spacing between any two adjacent visible frets (0..fretCount)
  let minSpacing;
  if (fretCount <= 1) {
    minSpacing = fretScale(1) - fretScale(0);
  } else {
    minSpacing = Infinity;
    for (let i = 1; i <= fretCount; i++) {
      const s = fretScale(i) - fretScale(i-1);
      if (s < minSpacing) minSpacing = s;
    }
  }
  DOT_SIZE = Math.min(G_HEIGHT/6, minSpacing);
  dot_radius = DOT_SIZE/3;
  stringThicknesses = BASE_STRING_THICKNESSES.map(x => x * 3 * zoomLevel);
}

// Perform an initial recalc so DOT_SIZE / dot_radius are correct on first load
recalc();

// Convenience layout snapshot
export function getLayout(){
  return {
    zoom: zoomLevel,
    fretCount,
    G_WIDTH, G_HEIGHT, C_WIDTH, C_HEIGHT,
    neckWidth,
    padding, containerWidth, containerHeight,
    fretScale, noteScale, stringScale, DOT_SIZE, dot_radius,
    sliderLength: sliderLength(),
    openNoteX: openNoteX()
  };
}
