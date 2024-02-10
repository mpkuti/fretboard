// Import everything from common.js
import * as common from './common.js';

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

    // Create a group for all the slider items 
    var slider_group = svg.append("g")

    // createSliderDots(slider_group, 0, common.all_guitar_notes[0], "string1");
    // createSliderDots(slider_group, 1, common.all_guitar_notes[1], "string2");
    // createSliderDots(slider_group, 2, common.all_guitar_notes[2], "string3");
    // createSliderDots(slider_group, 3, common.all_guitar_notes[3], "string4");
    // createSliderDots(slider_group, 4, common.all_guitar_notes[4], "string5");
    // createSliderDots(slider_group, 5, common.all_guitar_notes[5], "string6");

    // Create the circles
    // i: string number
    // j: note number
    for (let i = 0; i < common.all_note_coordinates; i++) {
        slider_group.selectAll("slider")
            .data(common.all_note_coordinates)
            .enter()
            .append("circle")
            .attr("class", "slider")
            .attr("cx", function(d, j) { return d[i][j].x; }) // x position of the circle
            .attr("cy", function(d, j) { return d[i][j].y; }) // y position of the circle
            .attr("r", common.DOT_SIZE/2) // radius of the circle
            .attr("fill", "red")
            .attr("string", function(_, i) { return i; }) // string number
            .attr("note", function(d) { return d[i][j].note; }) // note attribute
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

// Function to handle click event
export function moveSlider(event) {
    // Get the x position of the click
    var x = event.pageX;
    // Determine the direction based on the click position
    var direction = x < common.G_WIDTH/2 ? -1 : 1;

    // Select all the objects with the .slider class
    var sliders = d3.selectAll(".slider");

    // Move everything in the class .slider
    // Direction is determined by the position of the click
    // Movement is determined according to list noteXCoordinates
    // Old x position is the current x position of each circle
    // New x position is the next or previous x position of the circle in the list noteXCoordinates

    // Animate the objects
    sliders.transition()
      .duration(1000) // duration of the animation in milliseconds
      .attr("cx", function(d, i, nodes) {

        // Get the current cx value
        var currentCx = d3.select(nodes[i]).attr("cx");

        var existsInAllNoteCoordinates = false;

        for (let i = 0; i < all_note_coordinates.length; i++) {
            for (let j = 0; j < all_note_coordinates[i].length; j++) {
                if (all_note_coordinates[i][j].x == currentCx) {
                    existsInAllNoteCoordinates = true;
                    break;
                }
            }
            if (existsInAllNoteCoordinates) {
                break;
            }
        }
        if (existsInAllNoteCoordinates) {
            return;
        }
  
        // Calculate the new cx value
        var newCx;
        if (x < common.G_WIDTH / 2) {
          // If the click was on the left half, move to the left
          newCx = common.noteXCoordinates[Math.max(0, common.noteXCoordinates.indexOf(parseFloat(currentCx)) - 1)];
        } else {
          // If the click was on the right half, move to the right
          newCx = common.noteXCoordinates[Math.min(common.noteXCoordinates.length - 1, common.noteXCoordinates.indexOf(parseFloat(currentCx)) + 1)];
        }
  
        return newCx;
      });
}