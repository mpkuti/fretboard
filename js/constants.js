/**
 * @fileoverview Immutable constants (no layout / zoom logic here).
 * Naming convention:
 *  - UPPER_SNAKE_CASE for immutable exported constants / maps.
 *  - camelCase for functions & runtime / derived values in other modules.
 */
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
export { d3 };
// Pure constants
export const MIN_FRETS = 2;
export const MAX_FRETS = 15;
export const DEFAULT_FRETS = 6; // used as initial unless user overrides
export const SCALE_SEMITONES = 12;
export const NOTES = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"]; 
export const INTERVALS = ["1","p2","S2","p3","S3","4","-5","5","p6","S6","p7","S7"]; 
// Dynamic tuning support
export const MIN_STRINGS = 2;
export const MAX_STRINGS = 8; // supports 4..8 string instruments
export const DEFAULT_TUNING = ["E","B","G","D","A","E"]; // high to low existing order
export const DEFAULT_BASE_NOTE = "C";
export const DEFAULT_HIGHLIGHT_MODE = "BASENOTE";

export const HIGHLIGHT_MODE_INTERVAL_MAP = Object.freeze({
NONE: '',
BASENOTE: '0',
PENTATONIC_SCALE: '0,2,4,7,9',

// Triads and basic variants
MAJOR_CHORD: '0,4,7',
MINOR_CHORD: '0,3,7',
DIMINISHED_CHORD: '0,3,6',
AUGMENTED_CHORD: '0,4,8',
SUSPENDED_2_CHORD: '0,2,7',
SUSPENDED_4_CHORD: '0,5,7',
POWER_CHORD: '0,7',

// Six chords / adds
SIX_CHORD: '0,4,7,9',          // maj6
MINOR_SIX_CHORD: '0,3,7,9',     // m6
ADD9_CHORD: '0,2,4,7',
MINOR_ADD9_CHORD: '0,2,3,7',
SIX_NINE_CHORD: '0,2,4,7,9',

// Sevenths
MAJOR_SEVEN_CHORD: '0,4,7,11',
DOMINANT_SEVEN_CHORD: '0,4,7,10',
MINOR_SEVEN_CHORD: '0,3,7,10',
HALF_DIMINISHED_SEVEN_CHORD: '0,3,6,10',   // m7b5
DIMINISHED_SEVEN_CHORD: '0,3,6,9',         // dim7
MINOR_MAJOR_SEVEN_CHORD: '0,3,7,11',       // mMaj7

// Extended (9 / 11 / 13) chords
MAJOR_NINE_CHORD: '0,2,4,7,11',
DOMINANT_NINE_CHORD: '0,2,4,7,10',
MINOR_NINE_CHORD: '0,2,3,7,10',
MINOR_MAJOR_NINE_CHORD: '0,2,3,7,11',
DOMINANT_ELEVEN_CHORD: '0,2,4,5,7,10',        // 11 includes 9 (2) + 11 (5)
MAJOR_ELEVEN_CHORD: '0,2,4,5,7,11',
MINOR_ELEVEN_CHORD: '0,2,3,5,7,10',
DOMINANT_THIRTEEN_CHORD: '0,2,4,7,9,10',      // 9=2, 13=9
MAJOR_THIRTEEN_CHORD: '0,2,4,7,9,11',
MINOR_THIRTEEN_CHORD: '0,2,3,7,9,10',

// Suspended / altered dominants
DOMINANT_SEVEN_SUS4_CHORD: '0,5,7,10',
DOMINANT_FLAT_NINE_CHORD: '0,1,4,7,10',
DOMINANT_SHARP_NINE_CHORD: '0,3,4,7,10',      // alt #9
DOMINANT_FLAT_THIRTEEN_CHORD: '0,4,7,8,10',
DOMINANT_SHARP_ELEVEN_CHORD: '0,4,6,7,10',    // #11 = +6
ALTERED_DOMINANT_CHORD: '0,1,3,4,6,8,10',     // altered scale chord-tones set

// Color / add chords
MAJOR_ADD11_CHORD: '0,4,5,7',
MAJOR_ADD13_CHORD: '0,4,7,9',                 // same as 6 chord

// Scales (non-chord highlighting)
MAJOR_SCALE: '0,2,4,5,7,9,11',
NATURAL_MINOR_SCALE: '0,2,3,5,7,8,10',
HARMONIC_MINOR_SCALE: '0,2,3,5,7,8,11',
MELODIC_MINOR_SCALE: '0,2,3,5,7,9,11',
BLUES_SCALE: '0,3,5,6,7,10',
WHOLE_TONE_SCALE: '0,2,4,6,8,10',
DIMINISHED_HALF_WHOLE_SCALE: '0,1,3,4,6,7,9,10',
DIMINISHED_WHOLE_HALF_SCALE: '0,2,3,5,6,8,9,11',

// Existing altered color
DOMINANT_SEVEN_SHARP_NINE_CHORD: '0,3,4,7,10'
});

export const validHighlightModes = Object.keys(HIGHLIGHT_MODE_INTERVAL_MAP);
export const STORAGE_KEYS = Object.freeze({
  BASE_NOTE:'baseNote', HIGHLIGHT_MODE:'highlightMode', SHOW_NOTES:'showNoteNames', SHOW_INTERVALS:'showIntervals', HIGHLIGHT_SET:'highlightSet', ZOOM_LEVEL:'zoomLevel', FRET_COUNT:'fretCount', THEME:'theme', STRING_TUNING:'stringTuning'
});
export const DEFAULTS = Object.freeze({ BASE_NOTE:DEFAULT_BASE_NOTE, HIGHLIGHT_MODE:DEFAULT_HIGHLIGHT_MODE, SHOW_NOTES:true, SHOW_INTERVALS:false, HIGHLIGHT_SET:'BASIC', ZOOM_LEVEL:1.0, FRET_COUNT:DEFAULT_FRETS, THEME:'light', STRING_TUNING:DEFAULT_TUNING });
// Central schema listing persisted settings and their defaults
export const PERSISTED_SETTINGS = Object.freeze({
  BASE_NOTE: { storageKey: STORAGE_KEYS.BASE_NOTE, def: DEFAULTS.BASE_NOTE },
  HIGHLIGHT_MODE: { storageKey: STORAGE_KEYS.HIGHLIGHT_MODE, def: DEFAULTS.HIGHLIGHT_MODE },
  HIGHLIGHT_SET: { storageKey: STORAGE_KEYS.HIGHLIGHT_SET, def: DEFAULTS.HIGHLIGHT_SET },
  SHOW_NOTES: { storageKey: STORAGE_KEYS.SHOW_NOTES, def: DEFAULTS.SHOW_NOTES },
  SHOW_INTERVALS: { storageKey: STORAGE_KEYS.SHOW_INTERVALS, def: DEFAULTS.SHOW_INTERVALS },
  ZOOM_LEVEL: { storageKey: STORAGE_KEYS.ZOOM_LEVEL, def: DEFAULTS.ZOOM_LEVEL },
  FRET_COUNT: { storageKey: STORAGE_KEYS.FRET_COUNT, def: DEFAULTS.FRET_COUNT },
  THEME: { storageKey: STORAGE_KEYS.THEME, def: DEFAULTS.THEME },
  STRING_TUNING: { storageKey: STORAGE_KEYS.STRING_TUNING, def: DEFAULTS.STRING_TUNING }
});
export const CHORD_PALETTE = ['#00A676', '#FF7F0E', '#1F77B4', '#D62728'];
export const FRETBOARD_COLOR = '#E3CDB6';
export const FRET_COLOR = 'DimGray';
export const STRING_COLOR = 'black';
export const DOT_FRETS = [3,5,7,9,15,17,19,21];
export const DOUBLE_DOT_FRETS = [12,24];
// Slider span configuration (2 octaves) centralizes prior magic number 24
export const SLIDER_OCTAVES = 2; // number of octaves represented by slider columns
export const SLIDER_LENGTH = SCALE_SEMITONES * SLIDER_OCTAVES; // total logical fret positions (open + fretted span) used by slider wrapping
export const OPEN_NOTE_BASELINE = SLIDER_LENGTH; // reference span used to anchor open string X independent of current visible fretCount
export const CIRCLE_OPACITY = 0.6; // uniform dot opacity
// Added UI magic number extractions
export const ZOOM_MIN = 0.6;
export const ZOOM_MAX = 1.2;
export const ZOOM_STEP = 0.1;
export const NUT_STROKE_WIDTH = 5;
export const FRET_STROKE_WIDTH = 3;
// Replaced ratio-based stroke with fixed pixel width for base note outline
export const UI = Object.freeze({
  ANIMATION_MS: 500,
  INTERVAL_LABEL_DX: '0.75em',
  INTERVAL_LABEL_DY: '-0.85em',
  NOTE_FONT_SIZE_PX: 12
});
