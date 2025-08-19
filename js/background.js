/**
 * @fileoverview Background rendering for the guitar fretboard
 * Handles drawing of static elements: neck, frets, strings, decorative dots, and note labels
 * @author Mika Kutila
 */

// Import from the new modular structure
import { d3, FRETBOARD_COLOR, FRET_COLOR, STRING_COLOR, DOT_FRETS, DOUBLE_DOT_FRETS, UI, NUT_STROKE_WIDTH, FRET_STROKE_WIDTH } from './constants.js';
import { G_WIDTH, G_HEIGHT, padding, stringThicknesses, fretScale, noteScale, stringScale, getFretCount, neckWidth, MIN_FRET_SPACING, stringCount, openNoteX } from './layout.js';
import { allNoteCoordinates, romanize } from './utils.js';
import { getNoteNamesVisibility, showNoteNames, hideNoteNames } from './state.js';

// Local visual sizing for background dots (independent from slider)
const BG_DOT_MIN_PX = 3;
const BG_DOT_RATIO = 0.28; // of min fret spacing
function backgroundDotR(){
  const r = MIN_FRET_SPACING * BG_DOT_RATIO;
  return Math.max(BG_DOT_MIN_PX, r);
}


/**
 * Draws the guitar fretboard background including neck, frets, strings, and decorative dots
 * @param {d3.Selection} svg - The D3 SVG selection to draw on
 */
export function drawBackground(svg) {
    // Remove prior background layer if present (supports dynamic zoom redraw)
    svg.select('#backgroundLayer').remove();
    const layer = svg.append('g').attr('id','backgroundLayer');

    // Guitar neck rectangle
    layer.append('rect')
        .attr('x', padding)
        .attr('y', padding)
        .attr('width', neckWidth)
        .attr('height', G_HEIGHT)
        .attr('fill', FRETBOARD_COLOR);

    // Frets
    const fretNumbers = d3.range(0, getFretCount()+1);
    layer.selectAll('.fret')
        .data(fretNumbers)
        .enter()
        .append('line')
        .attr('class','fret')
        .attr('x1', d => padding + fretScale(d))
        .attr('y1', padding)
        .attr('x2', d => padding + fretScale(d))
        .attr('y2', padding + G_HEIGHT)
        .attr('stroke', FRET_COLOR)
        .attr('stroke-width', d => d === 0 ? NUT_STROKE_WIDTH : FRET_STROKE_WIDTH);

    // Decoration dots container
    const dots_group = layer.append('g').attr('class','fret-dots');

    // Single dots (only within visible fret range)
    dots_group.selectAll('.single-dots')
        .data(DOT_FRETS.filter(f => f <= getFretCount()))
        .enter()
        .append('circle')
        .attr('class','single-dots')
        .attr('r', backgroundDotR())
        .attr('cy', padding + G_HEIGHT/2)
        .attr('cx', d => padding + noteScale(d));

    // Double dots (top) within visible range
    dots_group.selectAll('.double-dots-1')
        .data(DOUBLE_DOT_FRETS.filter(f => f <= getFretCount()))
        .enter()
        .append('circle')
        .attr('class','double-dots-1')
        .attr('r', backgroundDotR())
        .attr('cy', padding + G_HEIGHT/3)
        .attr('cx', d => padding + noteScale(d));

    // Double dots (bottom) within visible range
    dots_group.selectAll('.double-dots-2')
        .data(DOUBLE_DOT_FRETS.filter(f => f <= getFretCount()))
        .enter()
        .append('circle')
        .attr('class','double-dots-2')
        .attr('r', backgroundDotR())
        .attr('cy', padding + 2 * G_HEIGHT/3)
        .attr('cx', d => padding + noteScale(d));

    // Strings
    const stringNumbers = d3.range(0,stringCount);
    layer.selectAll('.string')
        .data(stringNumbers)
        .enter()
        .append('line')
        .attr('class','string')
        .attr('x1', 0)
        .attr('y1', d => padding + stringScale(d))
        .attr('x2', padding + neckWidth)
        .attr('y2', d => padding + stringScale(d))
        .attr('stroke', STRING_COLOR)
        .attr('stroke-width', d => stringThicknesses[d] || stringThicknesses[stringThicknesses.length-1]);

    // Fret numbers
    layer.selectAll('.fret-numbers')
        .data(fretNumbers)
        .enter()
        .append('text')
        .attr('class','fret-numbers')
        .text(d => romanize(d))
        .attr('x', d => padding + noteScale(d))
        .attr('y', padding + G_HEIGHT + 20)
        .attr('text-anchor','middle');
}

/**
 * Redraws the background, useful for dynamic updates
 * @param {d3.Selection} svg - The D3 SVG selection to draw on
 */
export function redrawBackground(svg) { drawBackground(svg); }

/**
 * Draws note labels on the fretboard
 * Should be called last so that note labels appear on top of other elements
 * @param {d3.Selection} svg - The D3 SVG selection to draw on
 */
export function drawNoteLabels(svg) {
        // Only render labels within the horizontal neck (including padding bounds)
    // Extend left bound to include open string position (which lies slightly left of nut)
    const openX = openNoteX();
    const leftBound = Math.min(openX - 0.1, padding - 0.1); // allow open note label fully
    const rightBound = padding + neckWidth; // end of last visible fret
    const visibleNotes = allNoteCoordinates.filter(n => n.x >= leftBound && n.x <= rightBound + 0.1);
        svg.selectAll('.note-labels')
            .data(visibleNotes, d=> d.string + ':' + d.fret)
            .enter()
            .append('text')
            .attr('class','note-labels')
            .attr('data-note', d=>d.note)
            .attr('data-string', d=>d.string)
            .attr('data-fret', d=>d.fret)
            .attr('x', d=>d.x)
            .attr('y', d=>d.y)
            .attr('dy','0.35em')
            .text(d=>d.note)
            .attr('text-anchor','middle')
            .attr('font-size', UI.NOTE_FONT_SIZE_PX + 'px');
}

/**
 * Sets the opacity of note text labels
 * @param {number} opacity - The opacity value (0-1)
 */
function toggleAllNoteLabels(show){
    d3.selectAll('text.note-labels').classed('hidden-note', !show);
}

/**
 * Shows all note text labels and updates state
 */
export function showAllNotes() {
    showNoteNames();
    toggleAllNoteLabels(true);
}

/**
 * Hides all note text labels and updates state
 */
export function hideAllNotes() {
    hideNoteNames();
    toggleAllNoteLabels(false);
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