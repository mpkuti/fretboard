/**
 * @fileoverview Utility functions for note calculations and guitar fretboard data generation
 * Contains pure functions for musical note manipulation and coordinate calculations
 * @author Mika Kutila
 */

import { NOTES, INTERVALS, STRING_TUNING, SLIDER_LENGTH } from './constants.js';
import { padding, noteScale, stringScale, sliderLength, getFretCount, openNoteX } from './layout.js';

/**
 * Raises a note by one semitone
 * @param {string} note - The note to raise
 * @returns {string} The raised note
 */
export function raiseNote(note) {
    let index = NOTES.indexOf(note);
    if (index === 11) {
        return NOTES[0];
    } else {
        return NOTES[index + 1];
    }
}

/**
 * Lowers a note by one semitone
 * @param {string} note - The note to lower
 * @returns {string} The lowered note
 */
export function lowerNote(note) {
    let index = NOTES.indexOf(note);
    if (index === 0) {
        return NOTES[11];
    } else {
        return NOTES[index - 1];
    }
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
 * Get the interval between two notes
 * @param {string} basenote - The base note
 * @param {string} note - The target note
 * @returns {string} The interval representation
 */
export function getIntervalFromNotes(basenote, note) {
    if (NOTES.includes(basenote) && NOTES.includes(note)) {
        let baseIndex = NOTES.indexOf(basenote);
        let noteIndex = NOTES.indexOf(note);
        return INTERVALS[(noteIndex - baseIndex + 12) % 12];
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
 * Get the note on the guitar neck at specific string and fret
 * @param {number} stringNumber - The string number (0-5)
 * @param {number} fretNumber - The fret number
 * @returns {string} The note at that position
 */
export function getNote(stringNumber, fretNumber) {
    if (stringNumber < 0 || stringNumber > 5) {
        throw new Error("Invalid string number " + stringNumber);
    }
    if (fretNumber < 0 || fretNumber > sliderLength()) {
        throw new Error("Invalid fret number " + fretNumber);
    }
    return all_guitar_notes[stringNumber][fretNumber];
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
    // use STRING_TUNING instead of stringNotes
    const guitarNotes = [];
    for (let i = 0; i < STRING_TUNING.length; i++) {
        const startNote = STRING_TUNING[i];
        const startIndex = NOTES.indexOf(startNote);
        const currentNotes = [];
        for (let f = 0; f < SLIDER_LENGTH + 1; f++) { // +1 to safely cover wrap interval
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
    const all_note_coordinates = [];

    for (let i = 0; i < 6; i++) {
        // Use sliderLength directly (already a multiple of 12 >= NO_FRETS + 2)
        for (let j = 0; j < sliderLength(); j++) {
            const noteObject = {
                x: j === 0 ? openNoteX() : padding + noteScale(j),
                y: padding + stringScale(i),
                string: i,
                fret: j,
                note: guitarNotes[i][j]
            };
            all_note_coordinates.push(noteObject);
        }
    }

    return all_note_coordinates;
}

// Create immutable guitar notes data structure FIRST
export let all_guitar_notes = generateGuitarNotes();

// Then generate coordinates based on the created notes structure (mutable for zoom)
export let all_note_coordinates = generateNoteCoordinates(all_guitar_notes);
export function recalcAllNoteCoordinates() {
  all_guitar_notes = generateGuitarNotes();
  all_note_coordinates = generateNoteCoordinates(all_guitar_notes);
  return all_note_coordinates;
}
