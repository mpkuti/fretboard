// Parameters:
export const NO_FRETS = 5; // number of frets
export const G_WIDTH = 400; // width of the guitar neck
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

    for (let i = 0; i < NO_FRETS + 2; i++) {
        currentNotes.push(notes[(startIndex + i) % 12]);
    }

    all_guitar_notes_work[j] = currentNotes;

    // switch (j) {
    //     case 0:
    //         notes_e_work = currentNotes;
    //         break;
    //     case 1:
    //         notes_a_work = currentNotes;
    //         break;
    //     case 2:
    //         notes_d_work = currentNotes;
    //         break;
    //     case 3:
    //         notes_g_work = currentNotes;
    //         break;
    //     case 4:
    //         notes_b_work = currentNotes;
    //         break;
    // }
}

// export const notes_e = notes_e_work;
// export const notes_a = notes_a_work;
// export const notes_d = notes_d_work;
// export const notes_g = notes_g_work;
// export const notes_b = notes_b_work;
export const all_guitar_notes = all_guitar_notes_work;

// Create a two-dimensional array of notes representing all the notes in the guitar neck
// The first dimension represents the string number
// The second dimension represents the fret number
// The value represents the note
// const all_guitar_notes = [notes_e, notes_b, notes_g, notes_d, notes_a, notes_e];
console.log("all_guitar_notes: ", all_guitar_notes);

// console.log(notes_e);
// console.log(notes_a);
// console.log(notes_d);
// console.log(notes_g);
// console.log(notes_b);

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

// Create a list of x positions for notes using 3d.range
export const noteXPositions = d3.range(NO_FRETS+2);

// Create a list of x coordinates for notes using 3d.range
export const noteXCoordinates = noteXPositions.map(noteScale);

export const noteYCoordinates = d3.range( G_HEIGHT/12, G_HEIGHT, G_HEIGHT/6 );

// Create a list of all the note positions
// The first dimension represents the string number
// The second dimension represents the fret number
// The value represents the coordinates of the note and the note
export const all_note_coordinates = [];
for (let i = 0; i < 6; i++) {
    const currentNotePositions = [];
    for (let j = 0; j < NO_FRETS + 2; j++) {
        // Create the note object
        const noteObject = {
            x: noteXCoordinates[j],
            y: noteYCoordinates[i],
            note: all_guitar_notes[i][j]
        };
        currentNotePositions.push(noteObject);
    }
    all_note_coordinates.push(currentNotePositions);
}
console.log("all_note_coordinates: ", all_note_coordinates);
console.log(all_note_coordinates[1][1].x);


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