// Import everything from common.js
import * as common from './common.js';

// Define slider_group in a common scope
var slider_group;

export function drawSlider(svg) {
    // Create a group for the slider
    slider_group = svg.append("g")

    // Create circles for the slider group
    slider_group.selectAll("circle")
        .data(common.all_note_coordinates)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return d.x; }) // x position of the circle
        .attr("cy", function(d) { return d.y; }) // y position of the circle
        .attr("r", common.DOT_SIZE/2) // radius of the circle
        .attr("fill", "red")
        .attr("string", function(d) { return d.string; }) // string number
        .attr("fret", function(d) { return d.fret; }) // fret number (0 - common.sliderLength-1)
        .attr("note", function(d) { return d.note; }) // note attribute
        ;
}

// Function to update all notes of the slider_group position
// Get the X and Y position of every note in the slider_group
// Then update each note value using common.getNote(stringNumber, fretNumber)
export function updateSliderNotes() {
    slider_group.selectAll("circle")
        .attr("note", function(d) {
            return common.getNote(d.string, d.fret);
        });
} 

// Flag to indicate whether a transition is in progress
var transitionInProgress = false;

// Function to handle click event
export function moveSlider(event) {
    // If a transition is already in progress, return early
    if (transitionInProgress) {
        return;
    }
    transitionInProgress = true;

    // Get the x position of the click
    var _clickX = event.pageX;
    var direction = _clickX < common.G_WIDTH/2 ? -1 : 1;

    // Select all the objects in the slider_group
    var objectsInSliderGroup = slider_group.selectAll("*");

    if (direction < 0) {
        console.log("lowerBaseNote");
        common.lowerBaseNote();
        // lowerNotes();
    } else {
        console.log("raiseBaseNote");
        common.raiseBaseNote();
        // raiseNotes();
    }

    objectsInSliderGroup.transition()    .duration(1000) // duration of the animation in milliseconds
    .attr("cx", function(d, i, nodes) {
        // Determine the new x position based on the direction
        d.fret = (d.fret + direction + common.sliderLength) % common.sliderLength;
        // Update the note attribute
        var oldNote = d.note;
        // Based on the direction, call commont.raiseNote or common.lowerNote
        d.note = direction < 0 ? common.lowerNote(d.note) : common.raiseNote(d.note);
        // d.note = common.getNote(d.string, d.fret);
        // console.log("Old note: " + oldNote + ", New note: " + d.note);
        return common.noteScale(d.fret);
    })
    .on("end", function() {
        transitionInProgress = false;
    });
}

// Function to set opacity of all circles in slider_group
// Arguments:
// - opacity: the opacity value
export function setOpacity(opacity) {
    slider_group.selectAll("circle")
        .attr("fill-opacity", opacity);
}

// Set the color of a circle in slider_group
// Arguments:
// note: the note of the circle
// color: the color to set
export function setColor(note, color) {
    updateSliderNotes();
    slider_group.selectAll("circle")
        .filter(function() {
            return d3.select(this).attr("note") === note;
        })
        .attr("fill", color);
}

// Set the color of all circles in slider_group
// Arguments:
// color: the color to set
export function setAllColor(color) {
    slider_group.selectAll("circle")
        .attr("fill", color);
}

// Function to color the circles based on the argument list
// Arguments:
// notes: an array of notes to color
// color: the color to set
export function colorNotes(notes, color) {
    // Set the color of the selected notes
    // console.log("color notes: ", notes);
    // console.log("color: ", color);
    if (Array.isArray(notes)) {
        notes.forEach(function(note) {
            setColor(note, color);
        });
    } else {
        setColor(notes, color);
    };
}

// Function to change the note attribute of a circle in slider_group
// Arguments:
// oldNote: the old note of the circle
// newNote: the new note to set
export function changeNoteAttribute(oldNote, newNote) {
    console.log("changeNoteAttribute: ", oldNote, " -> ", newNote); //  DEBUG
    slider_group.selectAll("circle")
        .filter(function() {
            return d3.select(this).attr("note") === oldNote;
        })
        .attr("note", newNote);
}

// Function to rise every note in slider_group by a half step
export function raiseNotes() {
    slider_group.selectAll("circle")
        .attr("note", function(d) {
            return common.raiseNote(d.note);
        });
}

// Function to lower every note in slider_group by a half step
export function lowerNotes() {
    slider_group.selectAll("circle")
        .attr("note", function(d) {
            return common.lowerNote(d.note);
        });
}