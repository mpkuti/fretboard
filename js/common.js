// Parameters:
export const NO_FRETS = 4; // number of frets
export const G_WIDTH = 200; // width of the guitar neck
export const G_HEIGHT = 200; // height of the guitar neck
export const G_COLOR = "brown"; // color of the guitar neck
export const C_WIDTH = 50; 
export const C_HEIGHT = 50;
export const C_COLOR = "blue";
export const padding = 15;

// COLORS
export const fretboard_color = "BurlyWood"; // color of the guitar neck
export const fret_color = "DimGray";
//export const string_color = "DarkGoldenRod";
export const string_color = "black";

// Notes
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

// Global variable for base note, has to be visible to all functions
let _base_note = "C";

export function setBaseNote(newNote) {
    console.log("Setting base note to " + newNote);
    // Check if the note is valid
    if (!notes.includes(newNote)) {
        throw new Error("Invalid note");
    }
    else
    _base_note = newNote;
    // You can use JavaScript to set the selected option like this:
    document.getElementById('baseNoteSelectDropdown').value = _base_note;
}

export function raiseBaseNote() {
    console.log("Raising base note");
    let index = notes.indexOf(_base_note);
    if (index === 11) {
        setBaseNote(notes[0]);
    }
    else {
        setBaseNote(notes[index + 1]);
    }
    console.log("New basenote: " + _base_note);
}

export function lowerBaseNote() {
    console.log("Lowering base note");
    let index = notes.indexOf(_base_note);
    if (index === 0) {
        setBaseNote(notes[11]);
    }
    else {
        setBaseNote(notes[index - 1]);
    }
    console.log("New basenote: " + _base_note);
}

export function getBaseNote() {
    return _base_note;
}

// Global variable for highlight mode, has to be visible to all functions
let _highlight_mode = "BASENOTE";

export function setHighlightMode(newMode) {
    // Check if the mode is valid
    if (!["NONE", "BASENOTE", "PENTATONIC"].includes(newMode)) {
        throw new Error("Invalid mode");
    }
    else
    _highlight_mode = newMode;
}

export function getHighlightMode() {
    return _highlight_mode;
}

// Show note names
let _showNoteNames = true; // default is true
export function showNoteNames() {
    _showNoteNames = true;
}
export function hideNoteNames() {
    _showNoteNames = false;
}
export function get__noteNamesVisibility() {
    return _showNoteNames;
}
export function toggle_noteNamesVisibility() {
    _showNoteNames = !_showNoteNames;
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

export const all_guitar_notes = all_guitar_notes_work;

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
            note: all_guitar_notes[i][j]
        };
        currentNotePositions.push(noteObject);
    }
    all_note_coordinates.push(currentNotePositions);
}
// console.log("all_note_coordinates: ", all_note_coordinates);
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