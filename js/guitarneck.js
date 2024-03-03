// Import everything from common.js
import * as common from './common.js';

// Import the functions from the other files
import { drawBackground, drawNoteLabels, showAllNotes, hideAllNotes, setNoteNamesVisibility } from './background.js';
import { drawSlider, moveSlider, setColor, setOpacity, colorNotes, setAllColor, updateSliderNotes, updateIntervalText } from './slider.js';
import { showIntervals, hideIntervals } from './slider.js';

// Set a default setting for the base note and highlight mode
// var defaultBaseNote = "C";
// var defaultHighlightMode = "BASENOTE";

window.handleCheckboxChange = handleCheckboxChange;
window.changeBaseNote = changeBaseNote;
window.selectHighlightMode = selectHighlightMode;

// Select the SVG container
var svg = d3.select("#fretboard_container")
            .append("svg")
            .attr("width", common.containerWidth)
            .attr("height", common.containerHeight);

drawBackground(svg);
drawSlider(svg);
drawNoteLabels(svg);


// Attach the click event handler to the SVG container
svg.on("click", moveSlider);


// ******************** START FUNCTIONS ********************

// After the page has loaded, check the local storage for the note names visibility
window.onload = function() {
  initializeView();
}


// Function to initialize the settings at page load and reload
// This function is called when the settings change or when the page is loaded
// It checks the local storage for the settings and applies them
function initializeView() {

  // Default opacity
  setOpacity(0.6);

  // NOTE LABEL TEXT VISIBILITY
  common.initializeNoteNamesVisibility();
  // Set the checked property of the checkbox based on storedShowNoteNames
  document.getElementById('noteNamesCheckbox').checked = JSON.parse(common.getNoteNamesVisibility());  // Show/hide the actual text labels on the screen
  setNoteNamesVisibility();

  // INTERVAL LABEL TEXT VISIBILITY
  common.initializeIntervalVisibility();
  document.getElementById('intervalNamesCheckbox').checked = JSON.parse(common.getIntervalVisibility());
  if (common.getIntervalVisibility()) {
    showIntervals();
  } else {
    hideIntervals();
  }

  // BASE NOTE
  // Get _base_note from localStorage
  var storedBaseNote = localStorage.getItem('baseNote');
  if (storedBaseNote) {
    changeBaseNote(storedBaseNote);
  } else {
    changeBaseNote(common.defaultBaseNote);
  }

  // HIGHLIGHT MODE
  // Get the highlight mode from localStorage
  var storedHighlightMode = localStorage.getItem('highlightMode');

  // Set the radio button checked state
  if (storedHighlightMode) {
    var radioButton = document.querySelector(`input[name="highlightMode"][value="${storedHighlightMode}"]`);
    if (radioButton) {
        radioButton.checked = true;
    }
  }
  
  if (storedHighlightMode) {
    selectHighlightMode(storedHighlightMode);
  } else {
    selectHighlightMode(common.defaultHighlightMode);
  }

}

function handleCheckboxChange(checkbox, checkboxType) {
  if (checkbox.checked) {
    // Call different functions based on checkbox type
    if (checkboxType === 'noteNamesCheckbox') {
      showAllNotes();
    } else if (checkboxType === 'intervalNamesCheckbox') {
      showIntervals();
    }
  } else {
    // Call different functions based on checkbox type
    if (checkboxType === 'noteNamesCheckbox') {
      hideAllNotes();
    } else if (checkboxType === 'intervalNamesCheckbox') {
      hideIntervals();
    }
  }
}

document.getElementById('noteNamesCheckbox').addEventListener('change', function() {
  handleCheckboxChange(this, 'noteNamesCheckbox');
});
document.getElementById('intervalNamesCheckbox').addEventListener('change', function() {
  handleCheckboxChange(this, 'intervalNamesCheckbox');
});


// Function to change base note
function changeBaseNote(newBaseNote) {
  common.setBaseNote(newBaseNote);
  // Change Interval text labels
  updateIntervalText();
  // Set the color of the circles
  switch (common.getHighlightMode()) {
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


// Function to select highlight mode
// NONE: no highlight
// BASENOTE: highlight the base note
// PENTATONIC: highlight the pentatonic scale
function selectHighlightMode(highlightMode) {
  common.setHighlightMode(highlightMode);
  // updateSliderNotes();
  setAllColor("white");
  if (highlightMode == "BASENOTE") {
    colorNotes(common.getBaseNote(), "green")
  } else if (highlightMode == "PENTATONIC") {
    let pentatonicNotes = common.pentatonic(common.getBaseNote());
    colorNotes(pentatonicNotes, "green");
  }
  // updatePentatonicScaleLabel();
};

function updatePentatonicScaleLabel() {
  // var highlightMode = document.querySelector('input[name="highlightMode"]:checked').value;
  var baseNote = common.getBaseNote();
  var highlightMode = common.getHighlightMode();

  var labelText;
  if (highlightMode === 'PENTATONIC') {
    labelText = 'Pentatonic Scale, ' + baseNote + ' major, ' + common.getNoteFromInterval(baseNote, 9) + ' minor';
  } else {
    // Handle other highlight modes
    labelText = 'Pentatonic Scale';
  }

  document.getElementById('pentatonicScaleKeyLabel').textContent = labelText;
}