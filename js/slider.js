// Import everything from common.js
import * as common from './common.js';

// Define slider_group in a common scope
var slider_group;

function createSliderDots(group, stringNumber, stringNotes, className) {
    // Create the circles
    group.selectAll(className)
        .data(stringNotes)
        .enter()
        .append("circle")
        .attr("class", "slider " + className)
        .attr("cx", function(_, i) { return common.noteXCoordinates[i]; }) // x position of the circle
        .attr("cy", common.noteYCoordinates[stringNumber]) // y position of the circle
        .attr("r", common.DOT_SIZE/2) // radius of the circle
        .attr("fill", "red")
        .attr("x_index", function(_, i) { return i; }) // x_index attribute
        .attr("note", function(d) { return d; }) // note attribute
        ;
}

export function drawSlider(svg) {

    slider_group = svg.append("g")

    // createSliderDots(slider_group, 0, common.all_guitar_notes[0], "string1");
    // createSliderDots(slider_group, 1, common.all_guitar_notes[1], "string2");
    // createSliderDots(slider_group, 2, common.all_guitar_notes[2], "string3");
    // createSliderDots(slider_group, 3, common.all_guitar_notes[3], "string4");
    // createSliderDots(slider_group, 4, common.all_guitar_notes[4], "string5");
    // createSliderDots(slider_group, 5, common.all_guitar_notes[5], "string6");

    // let stringClass = ".string1";
    // slider_group.selectAll("stringClass")
    //     .data(common.all_note_coordinates[0])
    //     .enter()
    //     .append("circle")
    //     .attr("class", "slider")
    //     .attr("class", stringClass)
    //     .attr("cx", function(d, i) { return d.x; }) // x position of the circle
    //     .attr("cy", function(d, i) { return d.y; }) // y position of the circle
    //     .attr("r", common.DOT_SIZE/2) // radius of the circle
    //     .attr("fill", "red")
    //     .attr("string", function(_, i) { return i; }) // string number
    //     .attr("note", function(d, i) { return d.note; }) // note attribute
    //     ;

    // Create the circles
    // i: string number (0-5)
    for (let i = 0; i < common.all_note_coordinates.length; i++) {
        let stringClass = "string" + (i+1);
        // console.log("stringClass: ", stringClass);

        // Create a new group for each set of circles
        // Append the group to the slider_group
        let oneStringCircleGroup = slider_group.append("g");

        oneStringCircleGroup.selectAll("circle")
            .data(common.all_note_coordinates[i])
            .enter()
            .append("circle")
            .attr("cx", function(d) { return d.x; }) // x position of the circle
            .attr("cy", function(d) { return d.y; }) // y position of the circle
            .attr("r", common.DOT_SIZE/2) // radius of the circle
            .attr("fill", "red")
            .attr("string", function(_, i) { return i; }) // string number
            .attr("note", function(d) { return d.note; }) // note attribute
            ;
    }

    // Define an array of objects to store circle data
    var circleData = common.noteXPositions.map(function(d, i) {
        return {
            x: common.noteXCoordinates[i], // x coordinate of the circle
            label: common.intervals[i], // label of the circle
            color: "blue" // color of the circle
        };
    });

    // Create the circles (1st version, dots for development purposes)
    var circles = svg.selectAll(".slider")
        .data(circleData)
        .enter()
        .append("circle")
        .attr("class", "slider")
        .attr("cx", function(d) { return d.x; }) // x position of the circle
        .attr("cy", 250) // y position of the circle
        .attr("r", common.DOT_SIZE/2) // radius of the circle
        .attr("fill", function(d) { return d.color; });

    // Create the text labels
    var labels = svg.selectAll(".slider-text")
    .data(circleData)
    .enter()
    .append("text")
    .attr("class", "slider-text")
    .attr("class", "slider")
    .attr("x", function(d) { return d.x; })
    .attr("y", 250)
    .text(function(d) { return d.label; })
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("fill", "white");
}

// Flag to indicate whether a transition is in progress
var transitionInProgress = false;

// Function to handle click event
export function moveSlider(event) {
    // Get the x position of the click
    var x = event.pageX;
    // Determine the direction based on the click position
    var direction = x < common.G_WIDTH/2 ? -1 : 1;

    // Select all the objects with the .slider class
    // var sliders = d3.selectAll(".slider");
    // Select all the objects in the slider_group
    var objectsInSliderGroup = slider_group.selectAll("*");

    // Move everything in the class .slider
    // Direction is determined by the position of the click
    // Movement is determined according to list noteXCoordinates
    // Old x position is the current x position of each circle
    // New x position is the next or previous x position of the circle in the list noteXCoordinates

    // Animate the objects
    
    if (!transitionInProgress) {
        transitionInProgress = true;

        objectsInSliderGroup.transition()
        .duration(1000) // duration of the animation in milliseconds
        .attr("cx", function(d, i, nodes) {

            // Get the current cx value
            var currentCx = d3.select(nodes[i]).attr("cx");

            // Round currentCx up or down based on the direction
            var roundedCx;

            if (direction < 0) {
            // If moving to the left, round up
            roundedCx = common.noteXCoordinates.reduce((prev, curr) =>
                curr >= currentCx && (prev < currentCx || curr < prev) ? curr : prev
            );
            } else {
            // If moving to the right, round down
            roundedCx = common.noteXCoordinates.reduce((prev, curr) =>
                curr <= currentCx && (prev > currentCx || curr > prev) ? curr : prev
            );
            }
    
            // Calculate the new cx value
            var newCx;
            if (x < common.G_WIDTH / 2) {
                // If the click was on the left half, move to the left
                var index = common.noteXCoordinates.indexOf(roundedCx) - 1;
                if (index < 0) {
                // If the object is at the left edge, wrap it around to the right edge
                newCx = common.noteXCoordinates[common.noteXCoordinates.length - 1];
                } else {
                newCx = common.noteXCoordinates[index];
                }
            } else {
                // If the click was on the right half, move to the right
                var index = common.noteXCoordinates.indexOf(roundedCx) + 1;
                if (index >= common.noteXCoordinates.length) {
                // If the object is at the right edge, wrap it around to the left edge
                newCx = common.noteXCoordinates[0];
                } else {
                newCx = common.noteXCoordinates[index];
                }
            }
    
            return newCx;
        })
        .on("end", function() {
            transitionInProgress = false;
        });
        
    }
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

// Function to select base note and set the color of the circles
// Arguments:
// note: the note to select, should be included in common.notes
// color_all: the color to set for all circles
// color_selected: the color to set for the selected note
export function colorBasenote(note, color_all, color_selected) {
    // Set the color of all circles
    setAllColor(color_all);
    // Set the color of the selected note
    setColor(note, color_selected);
}

// Function to color the circles based on the argument list
// Arguments:
// notes: an array of notes to color
// color: the color to set
export function colorNotes(notes, color) {
    // Set the color of the selected notes
    console.log("notes: ", notes);
    notes.forEach(function(note) {
        setColor(note, color);
    });
}

// Function to color the circles for pentatonic scale
// Arguments:
// base: the base note
// colorHighlight: the color to set for the highlighted notes
// colorAll: the color to set for all circles
export function colorPentatonic(base, colorHighlight, colorAll) {
    // Set the color of all circles
    setAllColor(colorAll);
    // Set the color of the selected notes
    colorNotes(common.pentatonic(base), colorHighlight);
}