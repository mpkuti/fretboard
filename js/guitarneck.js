/**
 * @fileoverview Main application logic for the interactive guitar fretboard
 * Coordinates between all modules and handles user interactions and initialization
 * @author Mika Kutila
 */

// Import from the new modular structure
import { d3, containerWidth, containerHeight, DEFAULTS } from './constants.js';
import { pentatonic, buildPentatonicLabel } from './utils.js';
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
import { drawSlider, moveSlider, setOpacity, updateIntervalText, showIntervalsWithVisual, hideIntervalsWithVisual, highlightNotes } from './slider.js';

// Set a default setting for the base note and highlight mode
// var defaultBaseNote = "C";
// var defaultHighlightMode = "BASENOTE";


// Select the SVG container
var svg = d3.select("#fretboard_container")
            .append("svg")
            .attr("width", containerWidth)
            .attr("height", containerHeight);

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
  changeBaseNote(getBaseNote());
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
  if (mode === 'BASENOTE') {
    highlightNotes(getBaseNote(), 'green', 'white');
  } else if (mode === 'PENTATONIC') {
    highlightNotes(pentatonic(getBaseNote()), 'green', 'white');
  } else {
    highlightNotes([], 'green', 'white');
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

function onBaseNoteChanged(e) {
    const { newValue: base } = e.detail;
    const baseNoteDropdown = document.getElementById('baseNoteSelectDropdown');
    if (baseNoteDropdown) baseNoteDropdown.value = base;
    updateIntervalText();
    renderPentatonicLabel();
    applyHighlightColors();
}

function onHighlightModeChanged() {
    applyHighlightColors();
    renderPentatonicLabel();
}

window.addEventListener('DOMContentLoaded', () => {
  initializeView();
  bindUIEvents();
  renderPentatonicLabel();
  applyHighlightColors();
});