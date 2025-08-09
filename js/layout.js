/**
 * @fileoverview Dynamic layout & geometry derived from zoom level.
 * Exports live bindings so other modules see updated values after setZoomLevel.
 */
import { d3, NO_FRETS, SCALE_SEMITONES } from './constants.js';

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

// Scales & positional helpers
export const fretScale = (i) => 2 * G_WIDTH * (1 - Math.pow(2, -i / SCALE_SEMITONES));
export const noteScale = (i) => 2 * G_WIDTH * (1 - Math.pow(2, -(i - 0.5) / SCALE_SEMITONES));
export const stringScale = d3.scaleLinear().domain([0,5]).range([G_HEIGHT/12, G_HEIGHT - G_HEIGHT/12]);

// Slider related
export const sliderLength = NO_FRETS + 2;
export let DOT_SIZE = Math.min(G_HEIGHT/6, fretScale(NO_FRETS+1) - fretScale(NO_FRETS));
export let dot_radius = (fretScale(NO_FRETS+1) - fretScale(NO_FRETS))/3;

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
  containerWidth = G_WIDTH + padding;
  containerHeight = G_HEIGHT + 2 * padding;
  stringScale.range([G_HEIGHT/12, G_HEIGHT - G_HEIGHT/12]);
  DOT_SIZE = Math.min(G_HEIGHT/6, fretScale(NO_FRETS+1) - fretScale(NO_FRETS));
  dot_radius = (fretScale(NO_FRETS+1) - fretScale(NO_FRETS))/3;
  stringThicknesses = BASE_STRING_THICKNESSES.map(x => x * 3 * zoomLevel);
}

// Convenience layout snapshot
export function getLayout(){
  return {
    zoom: zoomLevel,
    G_WIDTH, G_HEIGHT, C_WIDTH, C_HEIGHT,
    padding, containerWidth, containerHeight,
    fretScale, noteScale, stringScale, DOT_SIZE, dot_radius,
    sliderLength
  };
}
