/**
 * @fileoverview State management and localStorage handling for the guitar fretboard application
 * Manages base note, highlight mode, and UI visibility settings with persistence
 * @author Mika Kutila
 */

import { NOTES, DEFAULT_BASE_NOTE, DEFAULT_HIGHLIGHT_MODE, validHighlightModes, STORAGE_KEYS, DEFAULTS, PERSISTED_SETTINGS } from './constants.js';
import { raiseNote, lowerNote, getIntervalFromNotes } from './utils.js';
import { EVENTS, emit } from './events.js';

// Private state variables
let STORE_OK = true;
try { const t='__test__'; localStorage.setItem(t,'1'); localStorage.removeItem(t); } catch { STORE_OK = false; }
const memStore = {};
function safeGetRaw(key){ if(!STORE_OK) return Object.prototype.hasOwnProperty.call(memStore,key)? memStore[key] : null; try { return localStorage.getItem(key); } catch { return null; } }
function safeSetRaw(key,val){ if(!STORE_OK){ memStore[key]=val; return; } try { localStorage.setItem(key,val); } catch { /* ignore */ } }
function loadPref(key, fallback) {
  const raw = safeGetRaw(key);
  if (raw === null) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}
function savePref(key, value) {
  safeSetRaw(key, JSON.stringify(value));
}
export function initializeAllSettings(){
  Object.values(PERSISTED_SETTINGS).forEach(({storageKey, def}) => {
    if (safeGetRaw(storageKey) === null) {
      safeSetRaw(storageKey, JSON.stringify(def));
    }
  });
}

let _base_note = loadPref(STORAGE_KEYS.BASE_NOTE, DEFAULTS.BASE_NOTE);
let _highlight_mode = loadPref(STORAGE_KEYS.HIGHLIGHT_MODE, DEFAULTS.HIGHLIGHT_MODE);
let _showNoteNames = loadPref(STORAGE_KEYS.SHOW_NOTES, DEFAULTS.SHOW_NOTES);
let _showIntervals = loadPref(STORAGE_KEYS.SHOW_INTERVALS, DEFAULTS.SHOW_INTERVALS);
let _highlight_set = loadPref(STORAGE_KEYS.HIGHLIGHT_SET, DEFAULTS.HIGHLIGHT_SET);

/**
 * Set the base note and update localStorage
 * @param {string} newNote - The new base note
 */
export function setBaseNote(newNote) {
    if (!NOTES.includes(newNote)) {
        throw new Error("Invalid note: " + newNote);
    }
    if (newNote === _base_note) return;
    const oldValue = _base_note;
    _base_note = newNote;
    savePref(STORAGE_KEYS.BASE_NOTE, _base_note);
    emit(EVENTS.BASE_NOTE_CHANGED, { oldValue, newValue: _base_note });
    emit(EVENTS.STATE_CHANGED, { key: 'baseNote', oldValue, newValue: _base_note });
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
    if (newMode === _highlight_mode) return;
    const oldValue = _highlight_mode;
    _highlight_mode = newMode;
    savePref(STORAGE_KEYS.HIGHLIGHT_MODE, _highlight_mode);
    emit(EVENTS.HIGHLIGHT_MODE_CHANGED, { oldValue, newValue: _highlight_mode });
    emit(EVENTS.STATE_CHANGED, { key: 'highlightMode', oldValue, newValue: _highlight_mode });
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

/**
 * Set the highlight set and update localStorage
 * @param {string} val - The new highlight set
 */
export function setHighlightSet(val){
  if (!val || (val !== 'BASIC' && val !== 'ADVANCED')) return;
  if (val === _highlight_set) return;
  const oldValue = _highlight_set;
  _highlight_set = val;
  savePref(STORAGE_KEYS.HIGHLIGHT_SET, _highlight_set);
  emit(EVENTS.STATE_CHANGED, { key:'highlightSet', oldValue, newValue:_highlight_set });
}

/**
 * Get the current highlight set
 * @returns {string} The current highlight set
 */
export function getHighlightSet(){ return _highlight_set; }

export function getAllSettings(){
  return {
    baseNote: _base_note,
    highlightMode: _highlight_mode,
    highlightSet: _highlight_set,
    showNoteNames: _showNoteNames,
    showIntervals: _showIntervals
  };
}
