// Import everything from common.js
import * as common from './common.js';

// Define slider_group in a common scope
var slider_group;

var _sliderLength;

export function drawSlider(svg) {

    slider_group = svg.append("g")

    // Create the circles
    // i: string number (0-5)
    for (let i = 0; i < common.all_note_coordinates.length; i++) {

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
            x: common.all_note_coordinates[0][i], // x coordinate of the circle
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
        .attr("cx", function(d) { return d.cx; }) // x position of the circle
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
    .attr("x", function(d) { return d.cx; })
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
    // If a transition is already in progress, return early
    if (transitionInProgress) {
        return;
    }
    transitionInProgress = true;

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

    if (direction < 0) {
        console.log("lowerBaseNote");
        common.lowerBaseNote();
    } else {
        console.log("raiseBaseNote");
        common.raiseBaseNote();
    }

    objectsInSliderGroup.transition()
    .duration(1000) // duration of the animation in milliseconds
    .attr("cx", function(d, i, nodes) {
        
        _sliderLength = common.all_note_coordinates[0].length;
        console.log("sliderLength: ", _sliderLength);

        // Get the current cx value and convert it to a number
        var _currentCx = parseFloat(d3.select(nodes[i]).attr("cx"));
        // Get the X index (fret) of the current node
        var _xIndex = common.noteXCoordinates.indexOf(_currentCx);

        var _newXIndex = (_xIndex + direction + _sliderLength) % _sliderLength;
        var _newCx = common.noteXCoordinates[_newXIndex];

        console.log("X coordinate ", _currentCx , " -> ", _newCx, " (", _xIndex, " -> ", _newXIndex, ")");

        return _newCx;
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
    console.log("color notes: ", notes);
    console.log("color: ", color);
    if (Array.isArray(notes)) {
        notes.forEach(function(note) {
            setColor(note, color);
        });
    } else {
        setColor(notes, color);
    };
}