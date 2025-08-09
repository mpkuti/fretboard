/**
 * @fileoverview Background rendering for the guitar fretboard
 * Handles drawing of static elements: neck, frets, strings, decorative dots, and note labels
 * @author Mika Kutila
 */

// Import from the new modular structure
import { d3, G_WIDTH, G_HEIGHT, NO_FRETS, padding, fretboard_color, fret_color, string_color, dots, double_dots, dot_radius, stringThicknesses, fretScale, noteScale, stringScale } from './constants.js';
import { all_note_coordinates } from './utils.js';
import { getNoteNamesVisibility, showNoteNames, hideNoteNames } from './state.js';

/**
 * Converts numbers to roman numerals
 * @param {number} num - The number to convert (1-4000)
 * @returns {string} The roman numeral representation
 * @source https://stackoverflow.com/questions/9083037/convert-a-number-into-a-roman-numeral-in-javascript
 */
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

/**
 * Draws the guitar fretboard background including neck, frets, strings, and decorative dots
 * @param {d3.Selection} svg - The D3 SVG selection to draw on
 */
export function drawBackground(svg) {
    // Draw the background here
    
    // Create guitarneck rectangle
    var guitarneck = svg.append("rect")
        .attr("x", padding) // x position of the guitar neck
        .attr("y", padding) // y position of the guitar neck
        .attr("width", G_WIDTH) // width of the guitar neck
        .attr("height", G_HEIGHT) // height of the guitar neck
        .attr("fill", fretboard_color); // color of the guitar neck
    
    // Draw the frets according to the number of frets data
    const fretNumbers = d3.range(0, NO_FRETS+1);
    svg.selectAll("line")
        .data(fretNumbers)
        .enter()
        .append("line")
        .attr("x1", function(d) { return padding + fretScale(d); }) // x position of the start of the line
        .attr("y1", padding) // y position of the start of the line
        .attr("x2", function(d) { return padding +  fretScale(d); }) // x position of the end of the line
        .attr("y2", padding + G_HEIGHT) // y position of the end of the line
        .attr("stroke", fret_color) // color of the line
        .attr("stroke-width", 3); // width of the line
    
    // Create a group for all the decotation dots 
    var dots_group = svg.append("g")

    // SINGLE DOTS
    dots_group.selectAll(".single-dots")
        .data(dots)
        .enter()
        .append("circle")
        .attr("class", "single-dots")
        .attr("r", dot_radius)
        .attr("cy", padding + G_HEIGHT/2)
        .attr("cx", function(d) { return padding + noteScale(d); });

    // DOUBLE DOTS 1
    dots_group.selectAll(".double-dots-1")
        .data(double_dots)
        .enter()
        .append("circle")
        .attr("class", "double-dots-1")
        .attr("r", dot_radius)
        .attr("cy", padding + G_HEIGHT / 3)
        .attr("cx", function(d) { return padding + noteScale(d); });

    // DOUBLE DOTS 2
    dots_group.selectAll(".double-dots-2")
        .data(double_dots)
        .enter()
        .append("circle")
        .attr("class", "double-dots-2")
        .attr("r", dot_radius)
        .attr("cy", padding + 2 * G_HEIGHT / 3)
        .attr("cx", function(d) { return padding + noteScale(d); });
    
    // Draw the strings
    const stringNumbers = d3.range(0, 6);
    svg.selectAll(".string")
        .data(stringNumbers)
        .enter()
        .append("line")
        .attr("class", "string")
        .attr("x1", 0) // x position of the start of the line
        .attr("y1", (d) => padding + G_HEIGHT/12 + G_HEIGHT * d/6) // y position of the start of the line
        .attr("x2", padding + G_WIDTH) // x position of the end of the line
        .attr("y2", (d) => padding + G_HEIGHT/12 + G_HEIGHT * d/6) // y position of the end of the line
        .attr("stroke", string_color) // color of the line
        .attr("stroke-width", (d) => stringThicknesses[d]); // width of the line
    
    // Fret numbers in roman numerals
    svg.selectAll(".fret-numbers")
        .data(fretNumbers)
        .enter()
        .append("text")
        .attr("class", "fret-numbers")
        .text((d) => romanize(d))
        .attr("x", (d) => padding + noteScale(d))
        .attr("y", padding + G_HEIGHT + 20)
        .attr("text-anchor", "middle");
    
}

/**
 * Draws note labels on the fretboard
 * Should be called last so that note labels appear on top of other elements
 * @param {d3.Selection} svg - The D3 SVG selection to draw on
 */
export function drawNoteLabels(svg) {
    // Add text labels for each note using all_note_coordinates
    // x: all_note_coordinates[i][j].x
    // y: all_note_coordinates[i][j].y
    // note: all_note_coordinates[i][j].note
    svg.selectAll(".note-labels")
        .data(all_note_coordinates)
        .enter()
        .append("text")
        .attr("class", "note-labels")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)
        .attr("dy", "0.35em") // vertical alignment
        .text((d) => d.note)
        .attr("text-anchor", "middle");
}

/**
 * Sets the opacity of note text labels
 * @param {number} opacity - The opacity value (0-1)
 */
function setNoteTextOpacity(opacity) {
    d3.selectAll("text.note-labels")
        .transition()
        .duration(0)
        .style("opacity", opacity);
}

/**
 * Shows all note text labels and updates state
 */
export function showAllNotes() {
    showNoteNames();
    setNoteTextOpacity(1);
}

/**
 * Hides all note text labels and updates state
 */
export function hideAllNotes() {
    hideNoteNames();
    setNoteTextOpacity(0);
}

/**
 * Sets note names visibility based on current state
 */
export function setNoteNamesVisibility() {
    // This needs a boolean value
    if (getNoteNamesVisibility()) {
        showAllNotes();
    } else {
        hideAllNotes();
    }
}