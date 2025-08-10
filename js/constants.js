/**
 * @fileoverview Immutable constants (no layout / zoom logic here).
 */
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
export { d3 };
// Pure constants
export const MIN_FRETS = 2;
export const MAX_FRETS = 21;
export const DEFAULT_FRETS = 6; // used as initial unless user overrides
export const SCALE_SEMITONES = 12;
export const notes = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"]; 
export const intervals = ["1","p2","S2","p3","S3","4","-5","5","p6","S6","p7","S7"]; 
export const stringNotes = ["E","B","G","D","A","E"];
export const defaultBaseNote = "C";
export const defaultHighlightMode = "BASENOTE";

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
  BASE_NOTE:'baseNote', HIGHLIGHT_MODE:'highlightMode', SHOW_NOTES:'showNoteNames', SHOW_INTERVALS:'showIntervals', OPACITY:'opacity'
});
export const DEFAULTS = Object.freeze({ BASE_NOTE:defaultBaseNote, HIGHLIGHT_MODE:defaultHighlightMode, SHOW_NOTES:true, SHOW_INTERVALS:true, OPACITY:0.6 });
export const UI = Object.freeze({ ANIMATION_MS:1000, INTERVAL_LABEL_DX:'0.75em', INTERVAL_LABEL_DY:'-0.85em', NOTE_FONT_SIZE_PX:12 });
export const CHORD_PALETTE = ['#00A676', '#FF7F0E', '#1F77B4', '#D62728'];
export const fretboard_color = '#E3CDB6';
export const fret_color = 'DimGray';
export const string_color = 'black';
export const dots = [3,5,7,9,15,17,19,21];
export const double_dots = [12,24];
export const OPEN_NOTE_BASELINE = 24; // reference fret span used to anchor open string X
export const CIRCLE_OPACITY = 0.6; // uniform dot opacity
// Added UI magic number extractions
export const ZOOM_MIN = 0.4;
export const ZOOM_MAX = 1.6;
export const ZOOM_STEP = 0.1;
export const NUT_STROKE_WIDTH = 5;
export const FRET_STROKE_WIDTH = 3;
