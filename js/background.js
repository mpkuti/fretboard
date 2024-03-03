// Import everything from common.js
import * as common from './common.js';

// Function to convert numbers to roman numerals
// Source: https://stackoverflow.com/questions/9083037/convert-a-number-into-a-roman-numeral-in-javascript
function romanize(num) {
    var lookup = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1,
      },
      roman = "",
      i;
    for (i in lookup) {
      while (num >= lookup[i]) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman;
}

// Function to draw the background
export function drawBackground(svg) {
    // Draw the background here
    
    // Create guitarneck rectangle
    var guitarneck = svg.append("rect")
        .attr("x", common.padding) // x position of the guitar neck
        .attr("y", common.padding) // y position of the guitar neck
        .attr("width", common.G_WIDTH) // width of the guitar neck
        .attr("height", common.G_HEIGHT) // height of the guitar neck
        .attr("fill", common.fretboard_color); // color of the guitar neck
    
    // Draw the frets according to the number of frets data
    const fretNumbers = d3.range(0, common.NO_FRETS+1);
    svg.selectAll("line")
        .data(fretNumbers)
        .enter()
        .append("line")
        .attr("x1", function(d) { return common.padding + common.fretScale(d); }) // x position of the start of the line
        .attr("y1", common.padding) // y position of the start of the line
        .attr("x2", function(d) { return common.padding +  common.fretScale(d); }) // x position of the end of the line
        .attr("y2", common.padding + common.G_HEIGHT) // y position of the end of the line
        .attr("stroke", common.fret_color) // color of the line
        .attr("stroke-width", 3); // width of the line
    
    // Create a group for all the decotation dots 
    var dots_group = svg.append("g")

    // SINGLE DOTS
    dots_group.selectAll(".single-dots")
        .data(common.dots)
        .enter()
        .append("circle")
        .attr("class", "single-dots")
        .attr("r", common.dot_radius)
        .attr("cy", common.padding + common.G_HEIGHT/2)
        .attr("cx", function(d) { return common.padding + common.noteScale(d); });

    // DOUBLE DOTS 1
    dots_group.selectAll(".double-dots-1")
        .data(common.double_dots)
        .enter()
        .append("circle")
        .attr("class", "double-dots-1")
        .attr("r", common.dot_radius)
        .attr("cy", common.padding + common.G_HEIGHT / 3)
        .attr("cx", function(d) { return common.padding + common.noteScale(d); });

    // DOUBLE DOTS 2
    dots_group.selectAll(".double-dots-2")
        .data(common.double_dots)
        .enter()
        .append("circle")
        .attr("class", "double-dots-2")
        .attr("r", common.dot_radius)
        .attr("cy", common.padding + 2 * common.G_HEIGHT / 3)
        .attr("cx", function(d) { return common.padding + common.noteScale(d); });
    
    // Draw the strings
    const stringNumbers = d3.range(0, 6);
    // console.log(stringNumbers);
    svg.selectAll(".string")
        .data(stringNumbers)
        .enter()
        .append("line")
        .attr("class", "string")
        .attr("x1", 0) // x position of the start of the line
        .attr("y1", (d) => common.padding + common.G_HEIGHT/12 + common.G_HEIGHT * d/6) // y position of the start of the line
        .attr("x2", common.padding + common.G_WIDTH) // x position of the end of the line
        .attr("y2", (d) => common.padding + common.G_HEIGHT/12 + common.G_HEIGHT * d/6) // y position of the end of the line
        .attr("stroke", common.string_color) // color of the line
        .attr("stroke-width", (d) => common.stringThicknesses[d]); // width of the line
    
    // Fret numbers in roman numerals
    svg.selectAll(".fret-numbers")
        .data(fretNumbers)
        .enter()
        .append("text")
        .attr("class", "fret-numbers")
        .text((d) => romanize(d))
        .attr("x", (d) => common.padding + common.noteScale(d))
        .attr("y", common.padding + common.G_HEIGHT + 20)
        .attr("text-anchor", "middle");
    
    // Add text labels for each note using all_note_coordinates
    // x: all_note_coordinates[i][j].x
    // y: all_note_coordinates[i][j].y
    // note: all_note_coordinates[i][j].note
    svg.selectAll(".note-labels")
        .data(common.all_note_coordinates)
        .enter()
        .append("text")
        .attr("class", "note-labels")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)
        .attr("dy", "0.35em") // vertical alignment
        .text((d) => d.note)
        .attr("text-anchor", "middle");
}

// Function to make text labels for each note visible or invisible instantly
function setNoteTextOpacity(opacity) {
    d3.selectAll("text.note-labels")
        .transition()
        .duration(0)
        .style("opacity", opacity);
}
export function showAllNotes() {
    common.showNoteNames();
    setNoteTextOpacity(1);
}
export function hideAllNotes() {
    common.hideNoteNames();
    setNoteTextOpacity(0);
}
export function setNoteNamesVisibility() {
    // This needs a boolean value
    if (common.getNoteNamesVisibility()) {
        console.log("showing notes");
        showAllNotes();
    } else {
        console.log("hiding notes");
        hideAllNotes();
    }
}