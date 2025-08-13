/**
 * @fileoverview Dynamic layout & geometry derived from zoom level.
 * Exports live bindings so other modules see updated values after setZoomLevel.
 */
import { d3, SCALE_SEMITONES, DEFAULT_FRETS, MIN_FRETS, MAX_FRETS, OPEN_NOTE_BASELINE, DEFAULTS, STORAGE_KEYS, ZOOM_MIN, ZOOM_MAX, SLIDER_LENGTH } from './constants.js';
import { getStringTuning } from './state.js';
import { EVENTS, on } from './events.js';

// Base logical dimensions (unscaled)
const BASE = Object.freeze({
  G_WIDTH: 500,
  G_HEIGHT: 200,
  C_WIDTH: 50,
  C_HEIGHT: 50,
  PADDING: 60
});

// Zoom state (persisted in localStorage)
let zoomLevel = DEFAULTS.ZOOM_LEVEL;
try {
  const stored = parseFloat(localStorage.getItem(STORAGE_KEYS.ZOOM_LEVEL));
  if (!isNaN(stored)) zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, stored));
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
// Constant open string center independent of current fretCount (baseline = 24 frets)
// OPEN_NOTE_BASELINE imported from constants.js
export function openNoteX(){
  return padding + G_WIDTH * rawFretPos(-0.5) / rawFretPos(OPEN_NOTE_BASELINE);
}
// Initialize string count from persisted tuning (honors saved custom tuning length on reload)
export let stringCount = getStringTuning().length;
export const stringScale = d3.scaleLinear().domain([0,stringCount-1]).range([G_HEIGHT/12, G_HEIGHT - G_HEIGHT/12]);

// Slider related
let fretCount = DEFAULTS.FRET_COUNT; // dynamic number of frets (excluding open string)
try {
  const raw = localStorage.getItem(STORAGE_KEYS.FRET_COUNT);
  const storedFrets = parseInt(raw, 10);
  if (!isNaN(storedFrets)) fretCount = Math.max(MIN_FRETS, Math.min(MAX_FRETS, storedFrets));
} catch {}
export function getFretCount(){ return fretCount; }
export function setFretCount(n){
  const requested = Math.round(Number(n));
  const v = Math.max(MIN_FRETS, Math.min(MAX_FRETS, requested));
  if (!v || v === fretCount) return;
  fretCount = v;
  try { localStorage.setItem(STORAGE_KEYS.FRET_COUNT, String(fretCount)); } catch {}
  recalc();
  document.dispatchEvent(new CustomEvent('fretCountChanged',{detail:{fretCount}}));
}
// Fixed slider length (derived from constants)
export const sliderLength = () => SLIDER_LENGTH;

// Neutral spacing unit (min distance between adjacent visible frets)
export let MIN_FRET_SPACING = 0; // used by other modules to size their visuals independently

// String thicknesses (base, then scaled with zoom)
export let stringThicknesses = [];
function updateStringThicknesses() {
  stringThicknesses = [];
  const base = [0.5,0.6,0.7,0.8,0.9,1.0,1.1,1.2];
  for (let i=0;i<stringCount;i++) {
    const idx = Math.min(i, base.length-1);
    stringThicknesses.push(base[idx] * 3 * zoomLevel);
  }
}
updateStringThicknesses();

export function getZoomLevel(){ return zoomLevel; }
export function setZoomLevel(z){
  if (typeof z !== 'number' || !isFinite(z)) return;
  const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
  if (Math.abs(clamped - zoomLevel) < 1e-6) return;
  zoomLevel = clamped;
  try { localStorage.setItem(STORAGE_KEYS.ZOOM_LEVEL, String(zoomLevel)); } catch {}
  recalc();
}

function recalc(){
  G_WIDTH = BASE.G_WIDTH * zoomLevel;
  G_HEIGHT = BASE.G_HEIGHT * zoomLevel;
  C_WIDTH = BASE.C_WIDTH * zoomLevel;
  C_HEIGHT = BASE.C_HEIGHT * zoomLevel;
  padding = BASE.PADDING * zoomLevel;
  neckWidth = G_WIDTH;
  containerWidth = neckWidth + padding;
  containerHeight = G_HEIGHT + 2 * padding;
  stringScale.domain([0,stringCount-1]).range([G_HEIGHT/12, G_HEIGHT - G_HEIGHT/12]);
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
  MIN_FRET_SPACING = minSpacing;
  updateStringThicknesses();
}

// Perform an initial recalc so spacing is correct on first load
recalc();

// Listen for tuning changes to update string count and recalculate layout
on(EVENTS.TUNING_CHANGED, ()=>{ stringCount = getStringTuning().length; recalc(); document.dispatchEvent(new CustomEvent('layoutChanged',{detail:{stringCount}})); });

// Convenience layout snapshot
export function getLayout(){
  return {
    zoom: zoomLevel,
    fretCount,
    stringCount,
    G_WIDTH, G_HEIGHT, C_WIDTH, C_HEIGHT,
    neckWidth,
    padding, containerWidth, containerHeight,
    fretScale, noteScale, stringScale,
    MIN_FRET_SPACING,
    sliderLength: sliderLength(),
    openNoteX: openNoteX()
  };
}
