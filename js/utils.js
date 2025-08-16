/**
 * @fileoverview Utility functions for note calculations and guitar fretboard data generation
 * Contains pure functions for musical note manipulation and coordinate calculations
 * @author Mika Kutila
 */

import { NOTES, INTERVALS, SLIDER_LENGTH } from './constants.js';
import { getStringTuning } from './state.js';
import { padding, noteScale, stringScale, sliderLength, getFretCount, openNoteX } from './layout.js';
import { raiseNote, lowerNote, getIntervalFromNotes } from './noteops.js';

// Roman numeral conversion utility (moved from background.js)
// Source reference: https://stackoverflow.com/questions/9083037/convert-a-number-into-a-roman-numeral-in-javascript
const ROMAN_LOOKUP = { M:1000, CM:900, D:500, CD:400, C:100, XC:90, L:50, XL:40, X:10, IX:9, V:5, IV:4, I:1 };
const ROMAN_KEYS = Object.keys(ROMAN_LOOKUP);
/**
 * Convert an integer (1-4000) to a Roman numeral string.
 * @param {number} num
 * @returns {string}
 */
export function romanize(num){
    let roman = '';
    for (const k of ROMAN_KEYS) {
        while (num >= ROMAN_LOOKUP[k]) { roman += k; num -= ROMAN_LOOKUP[k]; }
    }
    return roman;
}

/**
 * Get the note, given the base note and interval up from it
 * @param {string} note - The base note
 * @param {number} interval - The interval (number of semitones)
 * @returns {string} The resulting note
 */
export function getNoteFromInterval(note, interval) {
    if (NOTES.includes(note)) {
        let index = NOTES.indexOf(note);
        let newIndex = (index + interval) % 12;
        return NOTES[newIndex];
    } else {
        throw new Error("Note not found in notes");
    }
}

/**
 * Returns a list of notes in a pentatonic scale
 * @param {string} baseNote - The base note for the pentatonic scale
 * @returns {string[]} Array of notes in the pentatonic scale
 */
export function pentatonic(baseNote) {
    const baseIndex = NOTES.indexOf(baseNote);
    return [0, 2, 4, 7, 9].map(x => NOTES[(baseIndex + x) % 12]);
}

/**
 * Get the note on the neck at a specific string & fret.
 * String index range is dynamic (0 .. currentStringCount-1).
 * @param {number} stringNumber - Zero-based string index (0 = highest/first displayed string)
 * @param {number} fretNumber - Fret index (0 = open). Valid 0..sliderLength() inclusive for underlying notes array.
 * @returns {string} The note at that position
 */
export function getNote(stringNumber, fretNumber) {
    const stringTotal = allGuitarNotes.length;
    if (stringNumber < 0 || stringNumber >= stringTotal) {
        throw new Error("Invalid string number " + stringNumber + " (expected 0.." + (stringTotal-1) + ")");
    }
    if (fretNumber < 0 || fretNumber > sliderLength()) {
        throw new Error("Invalid fret number " + fretNumber + " (expected 0.." + sliderLength() + ")");
    }
    return allGuitarNotes[stringNumber][fretNumber];
}

/**
 * Get the relative minor of a given major root.
 * Relative minor is 9 semitones above the major root (or 3 semitones down).
 * @param {string} majorRoot - Major key root note
 * @returns {string} Relative minor root note
 */
export function getRelativeMinor(majorRoot) {
    return getNoteFromInterval(majorRoot, 9);
}

/**
 * Build the pentatonic scale label text depending on highlight mode.
 * @param {string} baseNote - Current base note
 * @param {string} highlightMode - Current highlight mode
 * @returns {string} Label text
 */
export function buildPentatonicLabel(baseNote, highlightMode) {
    if (highlightMode === 'PENTATONIC_SCALE') {
        return `Pentatonic Scale, ${baseNote} major / ${getRelativeMinor(baseNote)} minor`;
    }
    return 'Pentatonic Scale';
}

/**
 * Generate all guitar notes for each string
 * @returns {string[][]} 2D array of notes for each string
 */
function generateGuitarNotes() {
    const tuning = getStringTuning();
    const guitarNotes = [];
    for (let i = 0; i < tuning.length; i++) {
        const startNote = tuning[i];
        const startIndex = NOTES.indexOf(startNote);
        const currentNotes = [];
        for (let f = 0; f < SLIDER_LENGTH + 1; f++) {
            currentNotes.push(NOTES[(startIndex + f) % NOTES.length]);
        }
        guitarNotes.push(currentNotes);
    }
    return guitarNotes;
}

/**
 * Generate all note coordinates for the fretboard
 * @param {string[][]} guitarNotes - 2D immutable array of guitar notes per string
 * @returns {Object[]} Array of note coordinate objects
 */
function generateNoteCoordinates(guitarNotes) {
    const allNoteCoordinates = [];
    const tuning = getStringTuning();
    for (let i = 0; i < tuning.length; i++) {
        for (let j = 0; j < sliderLength(); j++) {
            const noteObject = {
                x: j === 0 ? openNoteX() : padding + noteScale(j),
                y: padding + stringScale(i),
                string: i,
                fret: j,
                note: guitarNotes[i][j]
            };
        allNoteCoordinates.push(noteObject);
        }
    }
    return allNoteCoordinates;
}

// Create immutable guitar notes data structure FIRST
export let allGuitarNotes = generateGuitarNotes();

// Then generate coordinates based on the created notes structure (mutable for zoom)
export let allNoteCoordinates = generateNoteCoordinates(allGuitarNotes);
export function recalcAllNoteCoordinates() {
    allGuitarNotes = generateGuitarNotes();
    allNoteCoordinates = generateNoteCoordinates(allGuitarNotes);
    return allNoteCoordinates;
}

export { raiseNote, lowerNote, getIntervalFromNotes };
