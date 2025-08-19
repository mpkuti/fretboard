/**
 * @fileoverview Dynamic layout & geometry derived from zoom level.
 * Exports live bindings so other modules see updated values after setZoomLevel.
 */
import { d3, SCALE_SEMITONES, DEFAULT_FRETS, MIN_FRETS, MAX_FRETS, OPEN_NOTE_BASELINE, DEFAULTS, STORAGE_KEYS, ZOOM_MIN, ZOOM_MAX, SLIDER_LENGTH, FRETBOARD_MAX_DISPLAY_WIDTH, RESPONSIVE_MARGIN_PX, FRETBOARD_MIN_DISPLAY_WIDTH } from './constants.js';
import { getStringTuning } from './state.js';
import { EVENTS, on } from './events.js';

// Base logical dimensions (unscaled)
const BASE = Object.freeze({ G_WIDTH: 500, G_HEIGHT: 200, C_WIDTH: 50, C_HEIGHT: 50, PADDING: 60 });

// Zoom state (logical user zoom). Re-enabled for manual control; resets to 1.0 after responsive adjustment.
let zoomLevel = 1.0; // baseline
let autoZoomActive = true;       // automatic stretch active
let autoBaselineZoom = null;     // display baseline (still for UI label)
export let stretchScale = 1; // multiplied to outer SVG width/height via viewBox

function computeTargetWidth(viewportWidth){
  const clampedVp = Math.max(FRETBOARD_MIN_DISPLAY_WIDTH, Math.min(viewportWidth, FRETBOARD_MAX_DISPLAY_WIDTH));
  return clampedVp;
}
export function isAutoZoomActive(){ return autoZoomActive; }

// Derived geometry (live bindings init placeholders; filled in recalc())
export let G_WIDTH, G_HEIGHT, C_WIDTH, C_HEIGHT, padding, containerWidth, containerHeight, neckWidth;
export let MIN_FRET_SPACING = 0;
export let stringCount = getStringTuning().length;
export const stringScale = d3.scaleLinear();
let fretCount = DEFAULTS.FRET_COUNT;
try { const raw = localStorage.getItem(STORAGE_KEYS.FRET_COUNT); const storedFrets = parseInt(raw,10); if(!isNaN(storedFrets)) fretCount = Math.max(MIN_FRETS, Math.min(MAX_FRETS, storedFrets)); } catch {}
export function getFretCount(){ return fretCount; }
export function setFretCount(n){ const requested = Math.round(Number(n)); const v = Math.max(MIN_FRETS, Math.min(MAX_FRETS, requested)); if(!v||v===fretCount) return; fretCount=v; try{localStorage.setItem(STORAGE_KEYS.FRET_COUNT,String(fretCount));}catch{} recalc(); document.dispatchEvent(new CustomEvent('fretCountChanged',{detail:{fretCount}})); }
export const sliderLength = () => SLIDER_LENGTH;
export let stringThicknesses = [];
function updateStringThicknesses(){ stringThicknesses=[]; const base=[0.5,0.6,0.7,0.8,0.9,1.0,1.1,1.2]; for(let i=0;i<stringCount;i++){ const idx=Math.min(i,base.length-1); stringThicknesses.push(base[idx]*3*zoomLevel); } }

function rawFretPos(i){ return 1 - Math.pow(2, -i / SCALE_SEMITONES); }
function normDenom(){ return rawFretPos(fretCount); }
export const fretScale = (i)=> G_WIDTH * rawFretPos(i) / normDenom();
export const noteScale = (i)=> G_WIDTH * rawFretPos(i - 0.5) / normDenom();
export function openNoteX(){ return padding + G_WIDTH * rawFretPos(-0.5) / rawFretPos(OPEN_NOTE_BASELINE); }

export function getZoomLevel(){ return zoomLevel; }
export function setZoomLevel(z){ const val=Number(z); if(isNaN(val)) return; const clamped=Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, val)); if(clamped===zoomLevel) return; zoomLevel=clamped; recalc(); document.dispatchEvent(new CustomEvent('zoomChanged',{detail:{zoom:zoomLevel}})); }
export function getDisplayZoom(){ return zoomLevel; }

export function autoAdjustZoomToViewport(){
  if(!autoZoomActive) return;
  const vp = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const targetWidth = computeTargetWidth(vp);
  const baseWidth = (BASE.G_WIDTH) + 2 * (BASE.PADDING); // geometry at zoom=1
  const newScale = targetWidth / baseWidth;
  let changed = false;
  if (Math.abs(newScale - stretchScale) > 1e-4){ stretchScale = newScale; changed = true; }
  if (zoomLevel !== 1.0){ zoomLevel = 1.0; changed = true; document.dispatchEvent(new CustomEvent('zoomReset',{detail:{reason:'viewportResize'}})); }
  if (changed) recalc();
  autoBaselineZoom = 1.0;
}

try { // initial stretch fit
  const vp = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const targetWidth = computeTargetWidth(vp);
  const baseWidth = (BASE.G_WIDTH) + 2 * (BASE.PADDING);
  stretchScale = targetWidth / baseWidth;
  zoomLevel = 1.0; autoBaselineZoom = 1.0;
} catch {}

function recalc(){
  G_WIDTH = BASE.G_WIDTH * zoomLevel;
  G_HEIGHT = BASE.G_HEIGHT * zoomLevel;
  C_WIDTH = BASE.C_WIDTH * zoomLevel;
  C_HEIGHT = BASE.C_HEIGHT * zoomLevel;
  padding = BASE.PADDING * zoomLevel;
  neckWidth = G_WIDTH;
  const baseW = neckWidth + 2 * padding;
  const baseH = G_HEIGHT + 2 * padding;
  containerWidth = baseW * stretchScale;
  containerHeight = baseH * stretchScale;
  stringScale.domain([0,stringCount-1]).range([G_HEIGHT/(2*stringCount), G_HEIGHT - G_HEIGHT/(2*stringCount)]);
  let minSpacing; if(fretCount<=1){ minSpacing = fretScale(1)-fretScale(0); } else { minSpacing=Infinity; for(let i=1;i<=fretCount;i++){ const s=fretScale(i)-fretScale(i-1); if(s<minSpacing) minSpacing=s; } }
  MIN_FRET_SPACING = minSpacing;
  updateStringThicknesses();
}
recalc();

on(EVENTS.TUNING_CHANGED, ()=>{ stringCount = getStringTuning().length; recalc(); document.dispatchEvent(new CustomEvent('layoutChanged',{detail:{stringCount}})); });

export function getLayout(){ return { zoom:zoomLevel, fretCount, stringCount, G_WIDTH, G_HEIGHT, C_WIDTH, C_HEIGHT, neckWidth, padding, containerWidth, containerHeight, fretScale, noteScale, stringScale, MIN_FRET_SPACING, sliderLength: sliderLength(), openNoteX: openNoteX() }; }
export function fitZoomToViewport(vpWidth){ autoAdjustZoomToViewport(); recalc(); return stretchScale; }
