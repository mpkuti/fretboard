/**
 * @fileoverview Interactive slider elements for the guitar fretboard
 * Handles moveable circles, interval labels, animations, and user interactions
 * @author Mika Kutila
 */

// Import from the new modular structure
import { d3, DOT_SIZE, G_WIDTH, padding, sliderLength, noteScale, UI } from './constants.js';
import { all_note_coordinates, raiseNote, lowerNote, getNote } from './utils.js';
import { getIntervalFromBasenote, lowerBaseNote, raiseBaseNote, showIntervals, hideIntervals, getBaseNote } from './state.js';

// Define slider_group in a common scope
var slider_group;

/**
 * Draws the interactive slider elements (circles and interval labels) on the fretboard
 * @param {d3.Selection} svg - The D3 SVG selection to draw on
 */
export function drawSlider(svg) {
    // Create a group for the slider
    slider_group = svg.append("g")

    // Create circles for the slider group
    var circles = slider_group.selectAll("circle")
        .data(all_note_coordinates)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return d.x; }) // x position of the circle
        .attr("cy", function(d) { return d.y; }) // y position of the circle
        .attr("r", DOT_SIZE/2) // radius of the circle
        .attr("fill", "red")
        .attr("string", function(d) { return d.string; }) // string number
        .attr("fret", function(d) { return d.fret; }) // fret number (0 - sliderLength-1)
        .attr("note", function(d) { return d.note; });

        // Create text labels for the circles
    var labels = slider_group.selectAll("text")
        .data(all_note_coordinates)
        .enter()
        .append("text")
        .attr("class", "interval-labels")
        .attr("x", function(d) { return d.x; }) // x position of the text
        .attr("y", function(d) { return d.y; }) // y position of the text
        .attr("text-anchor", "middle") // horizontal alignment
        .attr("dx", "0.75em") // horizontal alignment 0em is center
        .attr("dy", "-0.85em") // vertical alignment 0.35em below center is an approximation
        .text(function(d) { return getIntervalFromBasenote(d.note); }) // text content
        .attr("font-family", "sans-serif")
        .attr("font-size", "8px")
        .attr("fill", "black");
}

/**
 * Updates the note attributes of all circles in the slider group
 * Recalculates note values based on current string and fret positions
 */
export function updateSliderNotes() {
    slider_group.selectAll("circle")
        .attr("note", function(d) {
            return getNote(d.string, d.fret);
        });
}

/**
 * Updates the interval text labels after a base note change
 * Recalculates all interval labels relative to the current base note
 */
export function updateIntervalText() {
    slider_group.selectAll("text")
        .text(function(d) {
            return getIntervalFromBasenote(d.note);
        });
}


// Flag to indicate whether a transition is in progress
var transitionInProgress = false;

/**
 * Handles click events on the fretboard to move the slider (change base note)
 * Determines direction based on click position and animates the transition
 * @param {Event} event - The mouse click event
 */
export function moveSlider(event) {
    if (transitionInProgress) {
        return;
    }
    transitionInProgress = true;

    var _clickX = event.pageX;
    var direction = _clickX < G_WIDTH/2 ? -1 : 1;

    // Do NOT mutate data yet; compute future fret lazily
    const futureFret = d => (d.fret + direction + sliderLength) % sliderLength;

    // Animate circles to future positions based on futureFret
    var circleTransition = slider_group.selectAll("circle").transition()
        .duration(UI.ANIMATION_MS)
        .attr("cx", function(d) { return padding + noteScale(futureFret(d)); })
        .end();

    // Animate text labels accordingly
    var textTransition = slider_group.selectAll("text").transition()
        .duration(UI.ANIMATION_MS)
        .attr("x", function(d) { return padding + noteScale(futureFret(d)); })
        .end();

    Promise.all([circleTransition, textTransition]).then(function() {
        // Now mutate underlying data & attributes
        slider_group.selectAll('circle').each(function(d) {
            d.fret = futureFret(d);
            d.note = direction < 0 ? lowerNote(d.note) : raiseNote(d.note);
            this.setAttribute('fret', d.fret);
            this.setAttribute('note', d.note);
        });
        // Apply logical base note change (triggers event/UI refresh)
        if (direction < 0) {
            lowerBaseNote();
        } else {
            raiseBaseNote();
        }
        transitionInProgress = false;
    });
}

/**
 * Sets the opacity of all circles in the slider group
 * @param {number} opacity - The opacity value (0-1)
 */
export function setOpacity(opacity) {
    slider_group.selectAll("circle")
        .attr("fill-opacity", opacity);
}

/**
 * Sets the color of circles that match a specific note
 * @param {string} note - The note to color (e.g., 'C', 'F#')
 * @param {string} color - The color to apply (CSS color string)
 */
export function setColor(note, color) {
    updateSliderNotes();
    slider_group.selectAll("circle")
        .filter(function() {
            return d3.select(this).attr("note") === note;
        })
        .attr("fill", color);
}

/**
 * Sets the color of all circles in the slider group
 * @param {string} color - The color to apply (CSS color string)
 */
export function setAllColor(color) {
    slider_group.selectAll("circle")
        .attr("fill", color);
}

/**
 * Colors specific notes with the given color
 * @param {string|string[]} notes - Single note or array of notes to color
 * @param {string} color - The color to apply (CSS color string)
 */
export function colorNotes(notes, color) {
    // Deprecated per-note loop kept for backward compatibility; prefer highlightNotes
    const arr = Array.isArray(notes) ? notes : [notes];
    updateSliderNotes();
    arr.forEach(function(note) {
        slider_group.selectAll('circle')
            .filter(function() { return d3.select(this).attr('note') === note; })
            .attr('fill', color);
    });
}

/**
 * Batch highlight helper: single pass coloring
 */
export function highlightNotes(notes, highlightColor = 'green', baseColor = 'white') {
    const arr = Array.isArray(notes) ? notes : (notes ? [notes] : []);
    const target = new Set(arr);
    slider_group.selectAll('circle')
        .each(function(d) {
            const desired = target.has(d.note) ? highlightColor : baseColor;
            const current = this.getAttribute('fill');
            if (current !== desired) {
                this.setAttribute('fill', desired);
            }
        });
}

/**
 * Changes the note attribute of circles from old note to new note
 * @param {string} oldNote - The current note to find
 * @param {string} newNote - The new note to set
 */
export function changeNoteAttribute(oldNote, newNote) {
    slider_group.selectAll("circle")
        .filter(function() {
            return d3.select(this).attr("note") === oldNote;
        })
        .attr("note", newNote);
}

/**
 * Raises every note in the slider group by one semitone
 */
export function raiseNotes() {
    slider_group.selectAll("circle")
        .attr("note", function(d) {
            return raiseNote(d.note);
        });
}

/**
 * Lowers every note in the slider group by one semitone
 */
export function lowerNotes() {
    slider_group.selectAll("circle")
        .attr("note", function(d) {
            return lowerNote(d.note);
        });
}

/**
 * Sets the opacity of interval text labels
 * @param {number} opacity - The opacity value (0-1)
 */
function setIntervalTextOpacity(opacity) {
    d3.selectAll("text.interval-labels")
        .transition()
        .duration(0)
        .style("opacity", opacity);
}

/**
 * Shows interval labels with visual update
 */
export function showIntervalsWithVisual() {
    showIntervals();
    setIntervalTextOpacity(1);
}

/**
 * Hides interval labels with visual update
 */
export function hideIntervalsWithVisual() {
    hideIntervals();
    setIntervalTextOpacity(0);
}

// Re-export the state functions for convenience
export { showIntervals, hideIntervals };