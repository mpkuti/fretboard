// Parameters:
export const NO_FRETS = 12; // number of frets
export const G_WIDTH = 600; // width of the guitar neck
export const G_HEIGHT = 200; // height of the guitar neck
export const G_COLOR = "brown"; // color of the guitar neck
export const C_WIDTH = 50; 
export const C_HEIGHT = 50;
export const C_COLOR = "blue";
export const padding = 15;

// COLORS
export const fretboard_color = "BurlyWood"; // color of the guitar neck
export const fret_color = "DimGray";
// export const string_color = "DarkGoldenRod";
export const string_color = "black";

// Notes in ascending list
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

// ******************** GLOBAL VARIABLES ********************
// Set the default values
let _base_note = "C";
let _highlight_mode = "BASENOTE";
let _showNoteNames = true;
// **********************************************************


// ******************** BASE NOTE SETTERS/GETTERS ********************

export function setBaseNote(newNote) {
    // Check if the note is valid
    if (!notes.includes(newNote)) {
        throw new Error("Invalid note");
    }
    else {
        _base_note = newNote;
        localStorage.setItem('baseNote', _base_note);

        // Set the HTTP dropdown menu to new base note:
        document.getElementById('baseNoteSelectDropdown').value = _base_note;
        console.log("New basenote: " + _base_note);
    }
}

export function raiseBaseNote() {
    setBaseNote(raiseNote(_base_note));
}

export function lowerBaseNote() {
    setBaseNote(lowerNote(_base_note));
}

export function getBaseNote() {
    return _base_note;
}

export function raiseNote(note) {
    let index = notes.indexOf(note);
    if (index === 11) {
        return notes[0];
    }
    else {
        return notes[index + 1];
    }
}

export function lowerNote(note) {
    let index = notes.indexOf(note);
    if (index === 0) {
        return notes[11];
    }
    else {
        return notes[index - 1];
    }
}


// ******************** HIGHLIGHT MODE SETTERS/GETTERS ********************

export function setHighlightMode(newMode) {
    // Check if the mode is valid
    if (!["NONE", "BASENOTE", "PENTATONIC"].includes(newMode)) {
        throw new Error("Invalid mode");
    }
    else
    _highlight_mode = newMode;
    localStorage.setItem('highlightMode', _highlight_mode);
}

export function getHighlightMode() {
    return _highlight_mode;
}


// ******************** NOTENAME VISIBILITY SETTERS/GETTERS ********************

export function showNoteNames() {
    // Set the local and storage variable to true
    _showNoteNames = true;
    localStorage.setItem('showNoteNames', 'true');
    console.log("showNoteNames 1: ", _showNoteNames);
    console.log("showNoteNames 2: ", localStorage.getItem('showNoteNames'));
}

export function hideNoteNames() {
    _showNoteNames = false;
    localStorage.setItem('showNoteNames', 'false');
    console.log("hideNoteNames 1: ", _showNoteNames);
    console.log("hideNoteNames 2: ", localStorage.getItem('showNoteNames'));
}

export function setNoteNamesVisibility(visibility) {
    if (visibility) {
        showNoteNames();
    } else {
        hideNoteNames();
    }
}

export function initializeNoteNamesVisibility() {
    // Get the value from localStorage
    // let showNoteNames = localStorage.getItem('showNoteNames');
    if (localStorage.getItem('showNoteNames') === 'false') {
        hideNoteNames();
    } else {
        // Value is either 'true' or null
        showNoteNames();
    }
}

export function toggleNoteNamesVisibility() {
    if (_showNoteNames) {
        hideNoteNames();
    } else {
        showNoteNames();
    }
}

export function getNoteNamesVisibility() {
    // If there is value in localStorage, return it as a string,
    // otherwise return the default value (local variable) as a string
    if (localStorage.getItem('showNoteNames')) {
        // Return a boolean value
        return JSON.parse(localStorage.getItem('showNoteNames'));
    } else {
        return _showNoteNames;
    }
}


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

// Calculate the smallest multiple of 12 that is greater than or equal to NO_FRETS + 2
let note_row_length = Math.ceil((NO_FRETS + 2) / 12) * 12;
export const sliderLength = note_row_length;
console.log("sliderLength: ", note_row_length);

// Create lists of all the notes in every string
// Range is from 0 to NO_FRETS
// after notes length, notes repeat
let notes_e_work = [];
let notes_a_work = [];
let notes_d_work = [];
let notes_g_work = [];
let notes_b_work = [];
let all_guitar_notes_work = []
const stringNotes = ["E", "B", "G", "D", "A", "E"];

for (let j = 0; j < stringNotes.length; j++) {
    const stringNote = stringNotes[j];
    const startIndex = notes.indexOf(stringNote);
    const currentNotes = [];

    for (let i = 0; i < note_row_length; i++) {
        currentNotes.push(notes[(startIndex + i) % 12]);
    }

    all_guitar_notes_work[j] = currentNotes;
}

// Create a list of all the notes in the guitar neck
// The first dimension represents the string number
// The second dimension represents the fret number
// The value represents the note
// This is immutable, and should not be changed.
export const all_guitar_notes = Object.freeze(all_guitar_notes_work.map(Object.freeze));

// Create a scale to map fret numbers to positions
// fretScale(i) returns the x-coordinate of the ith fret
export const fretScale = function(i) {
    return 2 * G_WIDTH * (1 - Math.pow(2, -i / NO_FRETS));
}

// Create a scale to map fret numbers to  note positions
// noteScale(i) returns the x-coordinate of the ith note
export const noteScale = function(i) {
    return 2 * G_WIDTH * (1 - Math.pow(2, -(i - 0.5) / NO_FRETS));
}

// Create a scale to map string numbers to positions
export const stringScale = d3.scaleLinear()
    .domain([0, 5])
    .range([G_HEIGHT/12, G_HEIGHT-G_HEIGHT/12]);

// Create a list of x positions for notes using 3d.range
// export const noteXPositions = d3.range(NO_FRETS+2);
export const noteXPositions = d3.range(note_row_length);

// Create a list of x coordinates for notes using 3d.range
export const noteXCoordinates = noteXPositions.map(noteScale);

export const noteYCoordinates = d3.range( G_HEIGHT/12, G_HEIGHT, G_HEIGHT/6 );

// Create a two-dimensional list of all the note coordinates and note values
// The first dimension represents the string number
// The second dimension represents the fret number
// The value represents the coordinates of the note and the note
//     x: X Coordinate
//     y: Y Coordinate
//     note: Note
export const all_note_coordinates = [];

// Create a list of all the note positions
// The first dimension represents the string number
// The second dimension represents the fret number
// The value represents the coordinates of the note and the note
for (let i = 0; i < 6; i++) {
    const currentNotePositions = [];
    // Create noteObjects for each fret
    // There should be a multiple of 12 notes,
    // minimum should be NO_FRETS + 2

    // Calculate the smallest multiple of 12 that is greater than or equal to NO_FRETS + 2
    let iterations = Math.ceil((NO_FRETS + 2) / 12) * 12;

    for (let j = 0; j < iterations; j++) {
        // Create the note object
        const noteObject = {
            x: noteScale(j),
            y: stringScale(i),
            string: i,
            fret: j,
            note: all_guitar_notes[i][j]
        };
        all_note_coordinates.push(noteObject);
        // currentNotePositions.push(noteObject);
    }
    // all_note_coordinates.push(currentNotePositions);
}
console.log("all_note_coordinates: ", all_note_coordinates);
// console.log(all_note_coordinates[1][1].x);

// Find the smallest distance between the frets
export const DOT_SIZE = Math.min(G_HEIGHT/6, fretScale(NO_FRETS+1) - fretScale(NO_FRETS));

export const dots = [3, 5, 7, 9, 15, 17, 19, 21];
export const double_dots = [12, 24];
export const dot_radius = (fretScale(NO_FRETS+1) - fretScale(NO_FRETS))/3;

// List of string thicknesses
var stringThicknesses_ = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 5];
// multiply stringThicknesses by 3 to make them more visible
stringThicknesses_ = stringThicknesses_.map(x => x * 3);
export const stringThicknesses = stringThicknesses_;

// Function to return a list of notes in a pentatonic scale
// The parameter is the base note
// The function returns a list of notes in the pentatonic scale
export function pentatonic(baseNote) {
    console.log("pentatonic base: ", baseNote);
    const baseIndex = notes.indexOf(baseNote);
    return [0, 2, 4, 7, 9].map(x => notes[(baseIndex + x) % 12]);
}

// Function to return the note on the guitar neck
// The parameters are the string number and the fret number
export function getNote(stringNumber, fretNumber) {
    // console.log("getNote (string, fret): ", stringNumber, ", ", fretNumber);
    // Iterate through the two-dimensional array all_guitar_notes
    // and return the note of the string and fret number
    // Check if the inputs are valid
    if (stringNumber < 0 || stringNumber > 5) {
        throw new Error("Invalid string number ", stringNumber);
    }
    if (fretNumber < 0 || fretNumber > note_row_length) {
        throw new Error("Invalid fret number ", fretNumber);
    }
    return all_guitar_notes[stringNumber][fretNumber];
}

// Function to return all the notes of a string
// The parameter is the string number
export function getStringNotes(stringNumber) {
    return all_note_coordinates[stringNumber].map(x => x.note);
}

// Function to return all note coordinates and notes of a string
// The parameter is the string number
export function getStringNoteCoordinates(stringNumber) {
    return all_note_coordinates[stringNumber];
}