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

// Import the functions from the other files
import { drawBackground, drawNoteLabels, showAllNotes, hideAllNotes, setNoteNamesVisibility } from './background.js';
import { drawSlider, moveSlider, setColor, setOpacity, colorNotes, setAllColor, updateSliderNotes, updateIntervalText, showIntervalsWithVisual, hideIntervalsWithVisual } from './slider.js';

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
  // Use state getter (already parsed) instead of raw localStorage JSON string
  changeBaseNote(getBaseNote());
  // Highlight mode via state getter
  const currentHighlight = getHighlightMode();
  const radioButton = document.querySelector(`input[name="highlightMode"][value="${currentHighlight}"]`);
  if (radioButton) radioButton.checked = true;
  selectHighlightMode(currentHighlight);

  document.addEventListener('baseNoteChanged', onBaseNoteChanged);
  document.addEventListener('highlightModeChanged', onHighlightModeChanged);
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

document.getElementById('noteNamesCheckbox').addEventListener('change', function() {
  handleCheckboxChange(this, 'noteNamesCheckbox');
});
document.getElementById('intervalNamesCheckbox').addEventListener('change', function() {
  handleCheckboxChange(this, 'intervalNamesCheckbox');
});


/**
 * Changes the base note and updates the UI accordingly
 * @param {string} newBaseNote - The new base note (e.g., 'C', 'F#', 'Bb')
 */
function changeBaseNote(newBaseNote) {
  setBaseNote(newBaseNote);
  // Change Interval text labels
  updateIntervalText();
  // Set the color of the circles
  switch (getHighlightMode()) {
    case "NONE":
      setAllColor("blue");
      break;
    case "BASENOTE":
      selectHighlightMode("BASENOTE");
      break;
    case "PENTATONIC":
      selectHighlightMode("PENTATONIC");
      break;
  }
}


/**
 * Selects and applies a highlight mode to the fretboard
 * @param {string} highlightMode - The highlight mode ('NONE', 'BASENOTE', or 'PENTATONIC')
 */
function selectHighlightMode(highlightMode) {
  setHighlightMode(highlightMode);
  // updateSliderNotes();
  setAllColor("white");
  if (highlightMode == "BASENOTE") {
    colorNotes(getBaseNote(), "green")
  } else if (highlightMode == "PENTATONIC") {
    let pentatonicNotes = pentatonic(getBaseNote());
    colorNotes(pentatonicNotes, "green");
  }
  // updatePentatonicScaleLabel();
};

function renderPentatonicLabel() {
  const label = document.getElementById('pentatonicScaleKeyLabel');
  if (!label) return;
  label.textContent = buildPentatonicLabel(getBaseNote(), getHighlightMode());
}

function applyHighlightColors() {
  setAllColor('white');
  if (getHighlightMode() === 'BASENOTE') {
    colorNotes(getBaseNote(), 'green');
  } else if (getHighlightMode() === 'PENTATONIC') {
    colorNotes(pentatonic(getBaseNote()), 'green');
  }
}

function bindUIEvents() {
  const baseSelect = document.getElementById('baseNoteSelectDropdown');
  if (baseSelect) {
    baseSelect.addEventListener('change', e => {
      changeBaseNote(e.target.value);
      renderPentatonicLabel();
      applyHighlightColors();
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
      selectHighlightMode(e.target.value);
      renderPentatonicLabel();
      applyHighlightColors();
    });
  });
}

function onBaseNoteChanged(e) {
    const base = e.detail.baseNote;
    const baseNoteDropdown = document.getElementById('baseNoteSelectDropdown');
    if (baseNoteDropdown) {
        baseNoteDropdown.value = base;
    }
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