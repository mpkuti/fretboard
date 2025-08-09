/**
 * @fileoverview State management and localStorage handling for the guitar fretboard application
 * Manages base note, highlight mode, and UI visibility settings with persistence
 * @author Mika Kutila
 */

import { notes, defaultBaseNote, defaultHighlightMode, validHighlightModes, STORAGE_KEYS, DEFAULTS } from './constants.js';
import { raiseNote, lowerNote, getNoteFromInterval, getIntervalFromNotes } from './utils.js';

// Private state variables
function loadPref(key, fallback) {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}
function savePref(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let _base_note = loadPref(STORAGE_KEYS.BASE_NOTE, DEFAULTS.BASE_NOTE);
let _highlight_mode = loadPref(STORAGE_KEYS.HIGHLIGHT_MODE, DEFAULTS.HIGHLIGHT_MODE);
let _showNoteNames = loadPref(STORAGE_KEYS.SHOW_NOTES, DEFAULTS.SHOW_NOTES);
let _showIntervals = loadPref(STORAGE_KEYS.SHOW_INTERVALS, DEFAULTS.SHOW_INTERVALS);

/**
 * Set the base note and update localStorage
 * @param {string} newNote - The new base note
 */
export function setBaseNote(newNote) {
    if (!notes.includes(newNote)) {
        throw new Error("Invalid note: " + newNote);
    }
    
    _base_note = newNote;
    savePref(STORAGE_KEYS.BASE_NOTE, _base_note);
    document.dispatchEvent(new CustomEvent('baseNoteChanged', { detail: { baseNote: _base_note } }));
}

/**
 * Get the current base note
 * @returns {string} The current base note
 */
export function getBaseNote() {
    return _base_note;
}

/**
 * Raise the base note by one semitone
 */
export function raiseBaseNote() {
    setBaseNote(raiseNote(_base_note));
}

/**
 * Lower the base note by one semitone
 */
export function lowerBaseNote() {
    setBaseNote(lowerNote(_base_note));
}

/**
 * Set the highlight mode and update localStorage
 * @param {string} newMode - The new highlight mode
 */
export function setHighlightMode(newMode) {
    if (!validHighlightModes.includes(newMode)) {
        throw new Error("Invalid mode: " + newMode);
    }
    
    _highlight_mode = newMode;
    savePref(STORAGE_KEYS.HIGHLIGHT_MODE, _highlight_mode);
    document.dispatchEvent(new CustomEvent('highlightModeChanged', { detail: { highlightMode: _highlight_mode } }));
}

/**
 * Get the current highlight mode
 * @returns {string} The current highlight mode
 */
export function getHighlightMode() {
    return _highlight_mode; // already parsed via loadPref
}

/**
 * Show note names and update localStorage
 */
export function showNoteNames() { _showNoteNames = true; savePref(STORAGE_KEYS.SHOW_NOTES, true); }

/**
 * Hide note names and update localStorage
 */
export function hideNoteNames() { _showNoteNames = false; savePref(STORAGE_KEYS.SHOW_NOTES, false); }

/**
 * Set the visibility of note names
 * @param {boolean} visibility - Whether to show note names
 */
export function setNoteNamesVisibility(visibility) {
    if (visibility) {
        showNoteNames();
    } else {
        hideNoteNames();
    }
}

/**
 * Initialize note names visibility from localStorage
 */
export function initializeNoteNamesVisibility() {
  _showNoteNames = loadPref(STORAGE_KEYS.SHOW_NOTES, DEFAULTS.SHOW_NOTES);
}

/**
 * Toggle note names visibility
 */
export function toggleNoteNamesVisibility() {
    if (_showNoteNames) {
        hideNoteNames();
    } else {
        showNoteNames();
    }
}

/**
 * Get the current note names visibility
 * @returns {boolean} Whether note names are visible
 */
export function getNoteNamesVisibility() { return _showNoteNames; }

/**
 * Show intervals and update localStorage
 */
export function showIntervals() { _showIntervals = true; savePref(STORAGE_KEYS.SHOW_INTERVALS, true); }

/**
 * Hide intervals and update localStorage
 */
export function hideIntervals() { _showIntervals = false; savePref(STORAGE_KEYS.SHOW_INTERVALS, false); }
export function initializeIntervalVisibility() { _showIntervals = loadPref(STORAGE_KEYS.SHOW_INTERVALS, DEFAULTS.SHOW_INTERVALS); }

/**
 * Get the current interval visibility
 * @returns {boolean} Whether intervals are visible
 */
export function getIntervalVisibility() { return _showIntervals; }

/**
 * Get the interval from the current base note to a given note
 * @param {string} note - The target note
 * @returns {string} The interval representation
 */
export function getIntervalFromBasenote(note) {
    return getIntervalFromNotes(_base_note, note);
}
