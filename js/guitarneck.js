/**
 * @fileoverview Main application logic for the interactive guitar fretboard
 * Coordinates between all modules and handles user interactions and initialization
 * @author Mika Kutila
 */

// Import from the new modular structure
import { d3, containerWidth, containerHeight, DEFAULTS, HIGHLIGHT_MODE_INTERVAL_MAP, CHORD_PALETTE } from './constants.js';
import { pentatonic, buildPentatonicLabel, getNoteFromInterval } from './utils.js';
import { 
    getBaseNote, 
    setBaseNote, 
    getHighlightMode, 
    setHighlightMode, 
    initializeNoteNamesVisibility, 
    getNoteNamesVisibility, 
    initializeIntervalVisibility, 
    getIntervalVisibility 
} from './state.js';
import { EVENTS, on } from './events.js';

// Import the functions from the other files
import { drawBackground, drawNoteLabels, showAllNotes, hideAllNotes, setNoteNamesVisibility } from './background.js';
import { drawSlider, moveSlider, setOpacity, updateIntervalText, showIntervalsWithVisual, hideIntervalsWithVisual, highlightNotes, outlineBaseNoteCircles, highlightNotesMulti } from './slider.js';

// Set a default setting for the base note and highlight mode
// var defaultBaseNote = "C";
// var defaultHighlightMode = "BASENOTE";


// Select the SVG container
var svg = d3.select("#fretboard_container")
            .append("svg")
            .attr("width", containerWidth)
            .attr("height", containerHeight)
            .classed('init-fade', true);

drawBackground(svg);
drawSlider(svg);
drawNoteLabels(svg);


// Attach the click event handler to the SVG container
svg.on("click", moveSlider);


// ******************** START FUNCTIONS ********************


/**
 * Initializes the application view with settings from localStorage
 * Sets up opacity, note visibility, interval visibility, base note, and highlight mode
 */
export function initializeView() {
  setOpacity(DEFAULTS.OPACITY);
  initializeNoteNamesVisibility();
  const noteNamesChecked = getNoteNamesVisibility();
  const noteCb = document.getElementById('noteNamesCheckbox');
  if (noteCb) noteCb.checked = noteNamesChecked;
  setNoteNamesVisibility();
  initializeIntervalVisibility();
  const intervalChecked = getIntervalVisibility();
  const intCb = document.getElementById('intervalNamesCheckbox');
  if (intCb) intCb.checked = intervalChecked;
  if (intervalChecked) {
    showIntervalsWithVisual();
  } else {
    hideIntervalsWithVisual();
  }
  // Ensure dropdown reflects persisted base note (event will not fire if unchanged)
  const persistedBase = getBaseNote();
  const baseSelectEl = document.getElementById('baseNoteSelectDropdown');
  if (baseSelectEl) baseSelectEl.value = persistedBase;
  changeBaseNote(persistedBase); // no-op if same, keeps logic consistent
  const currentHighlight = getHighlightMode();
  const radioButton = document.querySelector(`input[name="highlightMode"][value="${currentHighlight}"]`);
  if (radioButton) radioButton.checked = true;
  selectHighlightMode(currentHighlight);

  on(EVENTS.BASE_NOTE_CHANGED, onBaseNoteChanged);
  on(EVENTS.HIGHLIGHT_MODE_CHANGED, onHighlightModeChanged);
}

/**
 * Handles checkbox state changes for note names and intervals
 * @param {HTMLInputElement} checkbox - The checkbox element that changed
 * @param {string} checkboxType - The type of checkbox ('noteNamesCheckbox' or 'intervalNamesCheckbox')
 */
function handleCheckboxChange(checkbox, checkboxType) {
  if (checkbox.checked) {
    // Call different functions based on checkbox type
    if (checkboxType === 'noteNamesCheckbox') {
      showAllNotes();
    } else if (checkboxType === 'intervalNamesCheckbox') {
      showIntervalsWithVisual();
    }
  } else {
    // Call different functions based on checkbox type
    if (checkboxType === 'noteNamesCheckbox') {
      hideAllNotes();
    } else if (checkboxType === 'intervalNamesCheckbox') {
      hideIntervalsWithVisual();
    }
  }
}

/**
 * Changes the base note and updates the UI accordingly
 * @param {string} newBaseNote - The new base note (e.g., 'C', 'F#', 'Bb')
 */
function changeBaseNote(newBaseNote) {
  setBaseNote(newBaseNote);
}


/**
 * Selects and applies a highlight mode to the fretboard
 * @param {string} highlightMode - The highlight mode ('NONE', 'BASENOTE', or 'PENTATONIC')
 */
function selectHighlightMode(highlightMode) {
  setHighlightMode(highlightMode);
};

function renderPentatonicLabel() {
  const label = document.getElementById('pentatonicScaleKeyLabel');
  if (!label) return;
  label.textContent = buildPentatonicLabel(getBaseNote(), getHighlightMode());
}

function applyHighlightColors() {
  const mode = getHighlightMode();
  const base = getBaseNote();
  const def = HIGHLIGHT_MODE_INTERVAL_MAP[mode];
  if (!def || def === '') { highlightNotes([], 'green', 'white'); return; }
  if (mode === 'PENTATONIC_SCALE') {
    highlightNotes(pentatonic(base), 'green', 'white');
    return;
  }
  const semis = def.split(',').filter(s => s.length).map(s => parseInt(s,10));
  const notes = semis.map(semi => getNoteFromInterval(base, semi));
  if (mode.endsWith('_CHORD')) {
    const map = {};
    notes.forEach((n,i)=>{ map[n]=CHORD_PALETTE[i%CHORD_PALETTE.length]; });
    highlightNotesMulti(map,'white');
  } else {
    highlightNotes(notes,'green','white');
  }
}

function bindUIEvents() {
  const baseSelect = document.getElementById('baseNoteSelectDropdown');
  if (baseSelect) {
    baseSelect.addEventListener('change', e => {
      changeBaseNote(e.target.value); // event will trigger UI updates
    });
  }
  document.getElementById('noteNamesCheckbox')?.addEventListener('change', function() {
    handleCheckboxChange(this, 'noteNamesCheckbox');
  });
  document.getElementById('intervalNamesCheckbox')?.addEventListener('change', function() {
    handleCheckboxChange(this, 'intervalNamesCheckbox');
  });
  document.querySelectorAll('input[name="highlightMode"]').forEach(r => {
    r.addEventListener('change', e => {
      selectHighlightMode(e.target.value); // event will trigger UI updates
    });
  });
}

function updateHeader() {
  const el = document.getElementById('fretboardHeader');
  if (!el) return;
  const base = getBaseNote();
  const mode = getHighlightMode();
  let text = '';
  switch(mode) {
    case 'NONE':
      text = `Note ${base}`; break;
    case 'BASENOTE':
      text = `Note ${base}`; break;
    case 'PENTATONIC_SCALE': {
      // Determine major/minor pentatonic label: major root is base; minor relative base is 3 semitones down
      const majorRoot = base;
      // Compute minor relative (base - 3 semitones)
      const notesOrder = ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'];
      const idx = notesOrder.indexOf(base);
      const minorIdx = (idx - 3 + notesOrder.length) % notesOrder.length;
      const minorRoot = notesOrder[minorIdx];
      text = `${majorRoot} Major / ${minorRoot} Minor Pentatonic Scale`;
      break;
    }
    case 'MAJOR_CHORD':
      text = `${base} Major Chord`; break;
    case 'MINOR_CHORD':
      text = `${base} Minor Chord`; break;
    default:
      text = base;
  }
  el.textContent = text;
}

function onBaseNoteChanged(e) {
    const { newValue: base } = e.detail;
    const baseNoteDropdown = document.getElementById('baseNoteSelectDropdown');
    if (baseNoteDropdown) baseNoteDropdown.value = base;
    updateIntervalText();
    renderPentatonicLabel();
    applyHighlightColors();
    outlineBaseNoteCircles(base);
    updateHeader();
}

function onHighlightModeChanged() {
    applyHighlightColors();
    renderPentatonicLabel();
    outlineBaseNoteCircles(getBaseNote());
    updateHeader();
}

window.addEventListener('DOMContentLoaded', () => {
  initializeView();
  bindUIEvents();
  renderPentatonicLabel();
  applyHighlightColors();
  outlineBaseNoteCircles(getBaseNote());
  updateHeader();
  // Reveal SVG after everything drawn
  svg.classed('ready', true).classed('init-fade', false);
});