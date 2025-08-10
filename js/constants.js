/**
 * @fileoverview Immutable constants (no layout / zoom logic here).
 */
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
export { d3 };
// Pure constants
export const MIN_FRETS = 2;
export const MAX_FRETS = 24;
export const DEFAULT_FRETS = 12; // used as initial unless user overrides
export const SCALE_SEMITONES = 12;
export const notes = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"]; 
export const intervals = ["1","p2","S2","p3","S3","4","-5","5","p6","S6","p7","S7"]; 
export const stringNotes = ["E","B","G","D","A","E"];
export const defaultBaseNote = "C";
export const defaultHighlightMode = "BASENOTE";
export const HIGHLIGHT_MODE_INTERVAL_MAP = Object.freeze({
  NONE:'', BASENOTE:'0', PENTATONIC_SCALE:'0,2,4,7,9', MAJOR_CHORD:'0,4,7', MINOR_CHORD:'0,3,7'
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
