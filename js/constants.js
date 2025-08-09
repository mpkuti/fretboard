/**
 * @fileoverview Constants and configuration values for the guitar fretboard application
 * Contains visual parameters, musical data, coordinate systems, and D3 scales
 * Centralized storage keys and default user preferences.
 * @author Mika Kutila
 */

// Import the D3 library
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Export D3 so it can be used in other files
export { d3 };

// Visual Configuration Parameters
export const ZOOM_LEVEL = 0.9;
export const NO_FRETS = 12; // number of frets
export const G_WIDTH = 500 * ZOOM_LEVEL; // width of the guitar neck
export const G_HEIGHT = 200 * ZOOM_LEVEL; // height of the guitar neck
export const G_COLOR = "brown"; // color of the guitar neck
export const C_WIDTH = 50 * ZOOM_LEVEL; 
export const C_HEIGHT = 50 * ZOOM_LEVEL;
export const C_COLOR = "blue";
export const padding = 60 * ZOOM_LEVEL;
export const containerWidth = G_WIDTH + 1 * padding;
export const containerHeight = G_HEIGHT + 2 * padding;

// Colors
export const fretboard_color = "BurlyWood"; // color of the guitar neck
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
export const validHighlightModes = ["NONE", "BASENOTE", "PENTATONIC"];

// Centralized localStorage key names
export const STORAGE_KEYS = Object.freeze({
  BASE_NOTE: 'baseNote',
  HIGHLIGHT_MODE: 'highlightMode',
  SHOW_NOTES: 'showNoteNames',
  SHOW_INTERVALS: 'showIntervals',
  OPACITY: 'opacity'
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

// Calculate note row length - smallest multiple of 12 that is greater than or equal to NO_FRETS + 2
export const sliderLength = Math.ceil((NO_FRETS + 2) / 12) * 12;

// Scales and Coordinate Systems

/**
 * Calculates the x-coordinate of a fret on the guitar neck
 * @param {number} i - The fret number (0-based)
 * @returns {number} The x-coordinate in pixels
 */
export const fretScale = function(i) {
    return 2 * G_WIDTH * (1 - Math.pow(2, -i / NO_FRETS));
}

/**
 * Calculates the x-coordinate of a note position on the guitar neck
 * @param {number} i - The note position (0-based)
 * @returns {number} The x-coordinate in pixels
 */
export const noteScale = function(i) {
    return 2 * G_WIDTH * (1 - Math.pow(2, -(i - 0.5) / NO_FRETS));
}

/**
 * D3 scale for mapping string numbers to y-coordinates
 * Maps string numbers (0-5) to their vertical positions on the fretboard
 */
export const stringScale = d3.scaleLinear()
    .domain([0, 5])
    .range([G_HEIGHT/12, G_HEIGHT-G_HEIGHT/12]);

// Position Arrays
export const noteXPositions = d3.range(sliderLength);
export const noteXCoordinates = noteXPositions.map(noteScale);
export const noteYCoordinates = d3.range(G_HEIGHT/12, G_HEIGHT, G_HEIGHT/6);

// Calculate dot size
export const DOT_SIZE = Math.min(G_HEIGHT/6, fretScale(NO_FRETS+1) - fretScale(NO_FRETS));
export const dot_radius = (fretScale(NO_FRETS+1) - fretScale(NO_FRETS))/3;
