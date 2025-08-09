/**
 * @fileoverview Interactive slider elements for the guitar fretboard
 * Handles moveable circles, interval labels, animations, and user interactions
 * @author Mika Kutila
 */

// Import from the new modular structure
import { d3, UI } from './constants.js';
import { DOT_SIZE, G_WIDTH, G_HEIGHT, padding, sliderLength, noteScale } from './layout.js';
import { all_note_coordinates, recalcAllNoteCoordinates, raiseNote, lowerNote } from './utils.js';
import { getIntervalFromBasenote, lowerBaseNote, raiseBaseNote, showIntervals, hideIntervals, getBaseNote } from './state.js';

// Define slider_group in a common scope
var slider_group;

/**
 * Draws the interactive slider elements (circles and interval labels) on the fretboard
 * @param {d3.Selection} svg - The D3 SVG selection to draw on
 */
export function drawSlider(svg) {
    // Remove existing slider group if present for redraw
    svg.select('#sliderLayer').remove();
    let coords = all_note_coordinates;
    // Ensure clip path updated
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

    slider_group = svg.append('g').attr('id','sliderLayer').attr('clip-path','url(#fretboard-clip)');

    slider_group.selectAll('circle')
        .data(coords)
        .enter()
        .append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', DOT_SIZE/2)
        .attr('fill','red')
        .attr('string', d => d.string)
        .attr('fret', d => d.fret)
        .attr('note', d => d.note);

    slider_group.selectAll('text')
        .data(coords)
        .enter()
        .append('text')
        .attr('class','interval-labels')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('text-anchor','middle')
        .attr('dx','0.75em')
        .attr('dy','-0.85em')
        .text(d => getIntervalFromBasenote(d.note))
        .attr('font-family','sans-serif')
        .attr('font-size', UI.NOTE_FONT_SIZE_PX + 'px')
        .attr('fill','black');
}
export function redrawSlider(svg){ recalcAllNoteCoordinates(); drawSlider(svg); }

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
 * Multi-color highlight for chord tones
 * @param {Object} noteColorMap - Mapping of note names to color values
 * @param {string} defaultColor - Default color for notes not in the map
 */
export function highlightNotesMulti(noteColorMap, defaultColor = 'white') {
    if (!noteColorMap) return;
    slider_group.selectAll('circle').each(function(d) {
        const col = noteColorMap[d.note] || defaultColor;
        const current = this.getAttribute('fill');
        if (current !== col) this.setAttribute('fill', col);
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

/**
 * Outlines the circles of the base note with a black stroke
 * @param {string} baseNote - The note to be outlined
 */
export function outlineBaseNoteCircles(baseNote) {
    const strokeW = DOT_SIZE / 10; // diameter is DOT_SIZE
    if (!slider_group) return;
    slider_group.selectAll('circle').each(function(d) {
        if (d.note === baseNote) {
            this.setAttribute('stroke', 'black');
            this.setAttribute('stroke-width', strokeW);
        } else {
            this.removeAttribute('stroke');
            this.removeAttribute('stroke-width');
        }
    });
}

// Re-export the state functions for convenience
export { showIntervals, hideIntervals };