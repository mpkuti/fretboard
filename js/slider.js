// Import everything from common.js
import * as common from './common.js';

// Define slider_group in a common scope
var slider_group;

export function drawSlider(svg) {
    // Create a group for the slider
    slider_group = svg.append("g")

    // Create circles for the slider group
    var circles = slider_group.selectAll("circle")
        .data(common.all_note_coordinates)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return d.x; }) // x position of the circle
        .attr("cy", function(d) { return d.y; }) // y position of the circle
        .attr("r", common.DOT_SIZE/2) // radius of the circle
        .attr("fill", "red")
        .attr("string", function(d) { return d.string; }) // string number
        .attr("fret", function(d) { return d.fret; }) // fret number (0 - common.sliderLength-1)
        .attr("note", function(d) { return d.note; });

        // Create text labels for the circles
    var labels = slider_group.selectAll("text")
        .data(common.all_note_coordinates)
        .enter()
        .append("text")
        .attr("class", "interval-labels")
        .attr("x", function(d) { return d.x; }) // x position of the text
        .attr("y", function(d) { return d.y; }) // y position of the text
        .attr("text-anchor", "middle") // horizontal alignment
        .attr("dx", "0.75em") // horizontal alignment 0em is center
        .attr("dy", "-0.85em") // vertical alignment 0.35em below center is an approximation
        .text(function(d) { return common.getIntervalFromBasenote(d.note); }) // text content
        .attr("font-family", "sans-serif")
        .attr("font-size", "8px")
        .attr("fill", "black");
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

// Function to set the text of an interval labels after basenote change
export function updateIntervalText() {
    slider_group.selectAll("text")
        .text(function(d) {
            return common.getIntervalFromBasenote(d.note);
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
        common.lowerBaseNote();
    } else {
        common.raiseBaseNote();
    }
    
    ////////// DATA UPDATE
    
    // "circle" and "text" are the elements to be updated.
    // The data is the same for both elements.
    // Therefore, the data is updated only once.
    slider_group.selectAll("circle").each(function(d) {
        d.fret = (d.fret + direction + common.sliderLength) % common.sliderLength;
        d.note = direction < 0 ? common.lowerNote(d.note) : common.raiseNote(d.note);
    });

    ////////// TRANSITIONS

    // Create a transition for the circle elements and return a promise that resolves when the transition ends
    var circleTransition = slider_group.selectAll("circle").transition()
        .duration(1000)
        .attr("cx", function(d) {
            return common.padding + common.noteScale(d.fret);
        })
        .end(); // The end method returns a promise that resolves when the transition ends

    // Create a transition for the text elements and return a promise that resolves when the transition ends
    var textTransition = slider_group.selectAll("text").transition()
        .duration(1000)
        .attr("x", function(d) {
            return common.padding + common.noteScale(d.fret);
        })
        .end(); // The end method returns a promise that resolves when the transition ends

    // Use Promise.all to wait for both transitions to complete
    Promise.all([circleTransition, textTransition]).then(function() {
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

// HANDLE CHECKBOX CHANGE, SHOW/HIDE INTERVAL LABELS

function setIntervalTextOpacity(opacity) {
    d3.selectAll("text.interval-labels")
        .transition()
        .duration(0)
        .style("opacity", opacity);
}
export function showIntervals() {
    common.showIntervals();
    setIntervalTextOpacity(1);
}
export function hideIntervals() {
    common.hideIntervals();
    setIntervalTextOpacity(0);
}