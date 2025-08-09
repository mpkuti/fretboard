/**
 * @fileoverview Interactive slider elements for the guitar fretboard
 * Handles moveable circles, interval labels, animations, and user interactions
 * @author Mika Kutila
 */

// Import from the new modular structure
import { d3, DOT_SIZE, G_WIDTH, G_HEIGHT, padding, sliderLength, noteScale, UI, containerWidth } from './constants.js';
import { all_note_coordinates, raiseNote, lowerNote, getNote } from './utils.js';
import { getIntervalFromBasenote, lowerBaseNote, raiseBaseNote, showIntervals, hideIntervals, getBaseNote } from './state.js';

// Define slider_group in a common scope
var slider_group;

/**
 * Draws the interactive slider elements (circles and interval labels) on the fretboard
 * @param {d3.Selection} svg - The D3 SVG selection to draw on
 */
export function drawSlider(svg) {
    // Ensure a single <defs> exists and update (or create) clipPath
    let defs = svg.select('defs');
    if (defs.empty()) defs = svg.append('defs');
    defs.select('#fretboard-clip').remove();
    const LEFT_MARGIN = DOT_SIZE; // expose space left of nut
    const RIGHT_MARGIN = DOT_SIZE; // slight overrun on right for wrap
    defs.append('clipPath')
        .attr('id', 'fretboard-clip')
        .append('rect')
        .attr('x', 0)
        .attr('y', padding)
        .attr('width', padding + G_WIDTH + RIGHT_MARGIN)
        .attr('height', G_HEIGHT);

    // Create a group for the slider, clipped to fretboard
    slider_group = svg.append("g")
        .attr('clip-path', 'url(#fretboard-clip)');

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
    if (transitionInProgress) return;
    transitionInProgress = true;

    const _clickX = event.pageX;
    const direction = _clickX < G_WIDTH/2 ? -1 : 1; // -1 = shift left, +1 = shift right

    const futureFret = d => (d.fret + direction + sliderLength) % sliderLength;

    const stepWidthFirst = noteScale(1) - noteScale(0);
    const offLeftX = padding + noteScale(0) - stepWidthFirst; // just off left

    // Pre-position for rightward move: recycle last column to left off-screen
    if (direction === 1) {
        slider_group.selectAll('circle').each(function(d) {
            if (d.fret === sliderLength - 1) this.setAttribute('cx', offLeftX);
        });
        slider_group.selectAll('text').each(function(d) {
            if (d.fret === sliderLength - 1) this.setAttribute('x', offLeftX);
        });
    }

    // Compute target during animation explicitly per direction to avoid long travel
    const targetXDuring = (d) => {
        if (direction === 1) {
            if (d.fret === sliderLength - 1) {
                // recycled last -> slides into first position
                return padding + noteScale(0);
            }
            return padding + noteScale(d.fret + 1);
        } else { // direction === -1
            if (d.fret === 0) {
                // first slides off to left
                return offLeftX;
            }
            return padding + noteScale(d.fret - 1);
        }
    };

    const circleTransition = slider_group.selectAll('circle').transition()
        .duration(UI.ANIMATION_MS)
        .attr('cx', targetXDuring)
        .end();

    const textTransition = slider_group.selectAll('text').transition()
        .duration(UI.ANIMATION_MS)
        .attr('x', targetXDuring)
        .end();

    Promise.all([circleTransition, textTransition]).then(() => {
        // Update logical data & final snap needed only for leftward wrap
        slider_group.selectAll('circle').each(function(d) {
            const oldFret = d.fret;
            d.fret = futureFret(d);
            if (direction === -1 && oldFret === 0) {
                // wrapped to last: ensure positioned at last fret coordinate
                this.setAttribute('cx', padding + noteScale(sliderLength - 1));
            } else if (direction === 1 && oldFret === sliderLength - 1) {
                // already at first fret position from animation; ensure exact snap
                this.setAttribute('cx', padding + noteScale(0));
            }
            d.note = direction < 0 ? lowerNote(d.note) : raiseNote(d.note);
            this.setAttribute('fret', d.fret);
            this.setAttribute('note', d.note);
        });
        slider_group.selectAll('text').each(function(d) {
            const oldFret = (d.fret - direction + sliderLength) % sliderLength;
            if (direction === -1 && oldFret === 0) {
                this.setAttribute('x', padding + noteScale(sliderLength - 1));
            } else if (direction === 1 && oldFret === sliderLength - 1) {
                this.setAttribute('x', padding + noteScale(0));
            }
        });
        if (direction < 0) lowerBaseNote(); else raiseBaseNote();
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
 * Batch highlight helper: single pass coloring
 */
export function highlightNotes(notes, highlightColor = 'green', baseColor = 'white') {
    const arr = Array.isArray(notes) ? notes : (notes ? [notes] : []);
    const target = new Set(arr);
    slider_group.selectAll('circle')
        .each(function(d) {
            const desired = target.has(d.note) ? highlightColor : baseColor;
            const current = this.getAttribute('fill');
            if (current !== desired) this.setAttribute('fill', desired);
        });
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

// Private helper to set interval label opacity (restored after cleanup)
function setIntervalTextOpacity(opacity) {
    d3.selectAll('text.interval-labels')
      .transition()
      .duration(0)
      .style('opacity', opacity);
}

// Re-export the state functions for convenience
export { showIntervals, hideIntervals };