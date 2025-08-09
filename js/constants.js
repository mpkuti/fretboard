/**
 * @fileoverview Constants and configuration values for the guitar fretboard application
 * Contains visual parameters, musical data, coordinate systems, and D3 scales
 * Centralized storage keys and default user preferences.
 * (Some formerly constant layout values are now dynamic to support zoom.)
 * @author Mika Kutila
 */

// Import the D3 library
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Export D3 so it can be used in other files
export { d3 };

// Visual Configuration Parameters
export let ZOOM_LEVEL = 0.9; // was const; now mutable
// Load persisted zoom if available before deriving dimensions
try {
  const _zl = parseFloat(localStorage.getItem('zoomLevel'));
  if (!isNaN(_zl)) ZOOM_LEVEL = Math.max(0.3, Math.min(2, _zl));
} catch {}
// Fixed fret count stays constant
export const NO_FRETS = 12;
export const SCALE_SEMITONES = 12; // fixed semitone divisor for physical spacing
// Base (unscaled) logical dimensions
const BASE_G_WIDTH = 500;
const BASE_G_HEIGHT = 200;
const BASE_C_WIDTH = 50;
const BASE_C_HEIGHT = 50;
const BASE_PADDING = 60;
// Mutable derived layout variables
export let G_WIDTH = BASE_G_WIDTH * ZOOM_LEVEL;
export let G_HEIGHT = BASE_G_HEIGHT * ZOOM_LEVEL;
export let G_COLOR = "brown"; // unchanged
export let C_WIDTH = BASE_C_WIDTH * ZOOM_LEVEL;
export let C_HEIGHT = BASE_C_HEIGHT * ZOOM_LEVEL;
export let C_COLOR = "blue";
export let padding = BASE_PADDING * ZOOM_LEVEL;
export let containerWidth = G_WIDTH + 1 * padding;
export let containerHeight = G_HEIGHT + 2 * padding;

// Colors
//export const fretboard_color = "BurlyWood"; // color of the guitar neck
export const fretboard_color = "#E3CDB6"; // 
export const fret_color = "DimGray";
export const string_color = "black";

// Musical Data
export const notes = [
    "A",
    "A#",
    "B",
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
];

export const intervals = [
    "1",
    "p2",
    "S2",
    "p3",
    "S3",
    "4",
    "-5",
    "5",
    "p6",
    "S6",
    "p7",
    "S7",
];

// Guitar Configuration
export const stringNotes = ["E", "B", "G", "D", "A", "E"];

// Default Settings (static references kept for backward compatibility)
export const defaultBaseNote = "C";
export const defaultHighlightMode = "BASENOTE";

// Highlight mode interval definitions (comma-separated semitone offsets from base)
export const HIGHLIGHT_MODE_INTERVAL_MAP = Object.freeze({
  NONE: '',
  BASENOTE: '0',
  PENTATONIC_SCALE: '0,2,4,7,9',
  MAJOR_CHORD: '0,4,7',
  MINOR_CHORD: '0,3,7'
});
export const validHighlightModes = Object.keys(HIGHLIGHT_MODE_INTERVAL_MAP);

// Centralized localStorage key names
export const STORAGE_KEYS = Object.freeze({
  BASE_NOTE: 'baseNote',
  HIGHLIGHT_MODE: 'highlightMode',
  SHOW_NOTES: 'showNoteNames',
  SHOW_INTERVALS: 'showIntervals',
  OPACITY: 'opacity',
  ZOOM_LEVEL: 'zoomLevel'
});

// Centralized default preference values
export const DEFAULTS = Object.freeze({
  BASE_NOTE: defaultBaseNote,
  HIGHLIGHT_MODE: defaultHighlightMode,
  SHOW_NOTES: true,
  SHOW_INTERVALS: true,
  OPACITY: 0.6
});

// UI related tunable constants (non-persistent unless explicitly saved)
export const UI = Object.freeze({
  ANIMATION_MS: 1000,
  INTERVAL_LABEL_DX: '0.75em',
  INTERVAL_LABEL_DY: '-0.85em',
  NOTE_FONT_SIZE_PX: 8
});

// Fretboard Decorations
export const dots = [3, 5, 7, 9, 15, 17, 19, 21];
export const double_dots = [12, 24];

// String thicknesses (multiplied by 3 for visibility)
const stringThicknesses_ = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 5].map(x => x * 3);
export const stringThicknesses = stringThicknesses_;

// Calculate note row length (displayed frets + 2 extra positions)
export const sliderLength = NO_FRETS + 2;

// Scales and Coordinate Systems

/**
 * Calculates the x-coordinate of a fret on the guitar neck
 * @param {number} i - The fret number (0-based)
 * @returns {number} The x-coordinate in pixels
 */
export const fretScale = function(i) { return 2 * G_WIDTH * (1 - Math.pow(2, -i / SCALE_SEMITONES)); };

/**
 * Calculates the x-coordinate of a note position on the guitar neck
 * @param {number} i - The note position (0-based)
 * @returns {number} The x-coordinate in pixels
 */
export const noteScale = function(i) { return 2 * G_WIDTH * (1 - Math.pow(2, -(i - 0.5) / SCALE_SEMITONES)); };

/**
 * D3 scale for mapping string numbers to y-coordinates
 * Maps string numbers (0-5) to their vertical positions on the fretboard
 */
export const stringScale = d3.scaleLinear()
    .domain([0, 5])
    .range([() => G_HEIGHT/12, () => G_HEIGHT-G_HEIGHT/12].map(f=> (typeof f === 'function'? f(): f)));

// Position arrays & sizes (mutable)
export let noteXPositions = d3.range(NO_FRETS + 2); // sliderLength = NO_FRETS + 2
export let noteXCoordinates = noteXPositions.map(noteScale);
export let noteYCoordinates = d3.range(() => G_HEIGHT/12, () => G_HEIGHT, () => G_HEIGHT/6).map(f => (typeof f === 'function'? f(): f));
export let DOT_SIZE = Math.min(G_HEIGHT/6, fretScale(NO_FRETS+1) - fretScale(NO_FRETS));
export let dot_radius = (fretScale(NO_FRETS+1) - fretScale(NO_FRETS))/3;

function recalcLayout() {
  G_WIDTH = BASE_G_WIDTH * ZOOM_LEVEL;
  G_HEIGHT = BASE_G_HEIGHT * ZOOM_LEVEL;
  C_WIDTH = BASE_C_WIDTH * ZOOM_LEVEL;
  C_HEIGHT = BASE_C_HEIGHT * ZOOM_LEVEL;
  padding = BASE_PADDING * ZOOM_LEVEL;
  containerWidth = G_WIDTH + 1 * padding;
  containerHeight = G_HEIGHT + 2 * padding;
  // Update string scale range to new height
  stringScale.range([G_HEIGHT/12, G_HEIGHT - G_HEIGHT/12]);
  // Recompute dependent arrays
  noteXPositions = d3.range(NO_FRETS + 2);
  noteXCoordinates = noteXPositions.map(noteScale);
  noteYCoordinates = d3.range(G_HEIGHT/12, G_HEIGHT, G_HEIGHT/6);
  DOT_SIZE = Math.min(G_HEIGHT/6, fretScale(NO_FRETS+1) - fretScale(NO_FRETS));
  dot_radius = (fretScale(NO_FRETS+1) - fretScale(NO_FRETS))/3;
}
export function setZoomLevel(newZoom) {
  if (typeof newZoom !== 'number' || !isFinite(newZoom)) return;
  const clamped = Math.max(0.3, Math.min(2, newZoom));
  if (Math.abs(clamped - ZOOM_LEVEL) < 1e-6) return;
  ZOOM_LEVEL = clamped;
  try { localStorage.setItem(STORAGE_KEYS.ZOOM_LEVEL, String(ZOOM_LEVEL)); } catch {}
  recalcLayout();
}
export function getZoomLevel(){ return ZOOM_LEVEL; }
// Initial calc (in case future refactors move code order)
recalcLayout();

// Chord palette constant for configurable chord tone colors
export const CHORD_PALETTE = ['#00A676', '#FF7F0E', '#1F77B4', '#D62728']; // colors applied per chord tone in order
