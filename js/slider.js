/**
 * @fileoverview Interactive slider elements for the guitar fretboard
 * Handles moveable circles, interval labels, animations, and user interactions
 * @author Mika Kutila
 */

// Import from the new modular structure
import { d3, UI, CIRCLE_OPACITY, BASE_NOTE_STROKE_WIDTH } from './constants.js';
import { DOT_SIZE, G_WIDTH, G_HEIGHT, padding, sliderLength, noteScale, openNoteX } from './layout.js';
import { all_note_coordinates, recalcAllNoteCoordinates, raiseNote, lowerNote } from './utils.js';
import { getIntervalFromBasenote, lowerBaseNote, raiseBaseNote, showIntervals, hideIntervals, getBaseNote, getIntervalVisibility } from './state.js';

// Define slider_group in a common scope
var slider_group;
let xCenters = [];

/**
 * Draws the interactive slider elements (circles and interval labels) on the fretboard
 * @param {d3.Selection} svg - The D3 SVG selection to draw on
 */
export function drawSlider(svg) {
    svg.select('#sliderLayer').remove();
    let coords = all_note_coordinates;
    // Ensure we operate with the root SVG for defs/clipPath (zoomRoot passes a <g>)
    const rootSvg = svg.node().ownerSVGElement ? d3.select(svg.node().ownerSVGElement) : svg;
    let defs = rootSvg.select('defs');
    if (defs.empty()) defs = rootSvg.append('defs');
    defs.select('#fretboard-clip').remove();
    const LEFT_MARGIN = DOT_SIZE;
    const RIGHT_MARGIN = DOT_SIZE;
    defs.append('clipPath')
        .attr('id', 'fretboard-clip')
        .append('rect')
        .attr('x', 0)
        .attr('y', padding)
        .attr('width', padding + G_WIDTH + RIGHT_MARGIN)
        .attr('height', G_HEIGHT);

    slider_group = svg.append('g').attr('id','sliderLayer').attr('clip-path','url(#fretboard-clip)');

    // Precompute x centers for each logical fret index
    xCenters = [];
    for (let f = 0; f < sliderLength(); f++) {
        xCenters.push(f === 0 ? openNoteX() : padding + noteScale(f));
    }

    // Group coordinates by fret
    const byFret = Array.from({length: sliderLength()}, () => []);
    coords.forEach(d => { if (d.fret < sliderLength()) byFret[d.fret].push(d); });

    const col = slider_group.selectAll('g.fret-col')
        .data(byFret)
        .enter()
        .append('g')
        .attr('class','fret-col')
        .attr('data-fret',(d,i)=>i)
        .attr('transform',(d,i)=>`translate(${xCenters[i]},0)`);

    col.selectAll('circle')
        .data(d=>d)
        .enter()
        .append('circle')
        .attr('cx',0)
        .attr('cy', d=>d.y)
        .attr('r', DOT_SIZE/2)
        .attr('fill','red')
        .attr('fill-opacity', CIRCLE_OPACITY)
        .attr('string', d=>d.string)
        .attr('fret', d=>d.fret)
        .attr('note', d=>d.note);

    col.selectAll('text')
        .data(d=>d)
        .enter()
        .append('text')
        .attr('class','interval-labels')
        .attr('x',0)
        .attr('y', d=>d.y)
        .attr('text-anchor','middle')
        .attr('dx','0.75em')
        .attr('dy','-0.85em')
        .text(d=>getIntervalFromBasenote(d.note))
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
let transitionInProgress = false;

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

    const stepWidth = xCenters[1] - xCenters[0];
    const offLeftX = xCenters[0] - stepWidth;
    const groups = slider_group.selectAll('g.fret-col');

    if (direction === 1) {
        groups.filter(function(){ return +this.getAttribute('data-fret') === sliderLength()-1; })
            .attr('transform',`translate(${offLeftX},0)`);
    }

    let active = 0;
    function finalize(){
        // Snap and update logical frets / notes
        groups.each(function(){
            let fret = +this.getAttribute('data-fret');
            let newFret = (fret + direction + sliderLength()) % sliderLength();
            if (direction === -1 && fret === 0) newFret = sliderLength()-1;
            this.setAttribute('data-fret', newFret);
            this.setAttribute('transform', `translate(${xCenters[newFret]},0)`);
            d3.select(this).selectAll('circle').each(function(cd){
                cd.fret = newFret;
                cd.note = direction < 0 ? lowerNote(cd.note) : raiseNote(cd.note);
                this.setAttribute('fret', cd.fret);
                this.setAttribute('note', cd.note);
            });
            d3.select(this).selectAll('text').each(function(cd){
                cd.fret = newFret;
                this.textContent = getIntervalFromBasenote(cd.note);
                if (!getIntervalVisibility()) this.style.opacity = 0; else this.style.opacity = 1;
            });
        });
        if (direction < 0) lowerBaseNote(); else raiseBaseNote();
        transitionInProgress = false;
    }

    groups.transition()
        .duration(UI.ANIMATION_MS)
        .on('start', function(){ active++; })
        .attr('transform', function(){
            const fret = +this.getAttribute('data-fret');
            if (direction === 1) {
                if (fret === sliderLength()-1) return `translate(${xCenters[0]},0)`;
                return `translate(${xCenters[fret+1]},0)`;
            } else {
                if (fret === 0) return `translate(${offLeftX},0)`;
                return `translate(${xCenters[fret-1]},0)`;
            }
        })
        .on('end', function(){
            active--;
            if (active === 0) finalize();
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
    if (!slider_group) return;
    const baseR = DOT_SIZE / 2; // canonical outer radius
    slider_group.selectAll('circle').each(function(d) {
        this.setAttribute('r', baseR);
        if (d.note === baseNote) {
            const strokeW = BASE_NOTE_STROKE_WIDTH; // fixed px width
            const adjustedR = Math.max(1, baseR - strokeW / 2);
            this.setAttribute('r', adjustedR);
            this.setAttribute('stroke', 'black');
            this.setAttribute('stroke-width', strokeW);
            this.setAttribute('vector-effect','non-scaling-stroke');
            this.setAttribute('stroke-linejoin','round');
            this.setAttribute('stroke-linecap','round');
        } else {
            this.removeAttribute('stroke');
            this.removeAttribute('stroke-width');
            this.removeAttribute('vector-effect');
            this.removeAttribute('stroke-linejoin');
            this.removeAttribute('stroke-linecap');
        }
    });
}

// Re-export the state functions for convenience
export { showIntervals, hideIntervals };