// Import everything from common.js
import * as common from './common.js';

// Import the functions from the other files
import { drawBackground, showAllNotes, hideAllNotes, setNoteNamesVisibility } from './background.js';
import { drawSlider, moveSlider, setColor, setOpacity, colorNotes, setAllColor, updateSliderNotes } from './slider.js';

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
  console.log("*****     Initializing view     *****");

  // Default opacity
  setOpacity(0.4);

  // NOTE LABEL TEXT VISIBILITY
  common.initializeNoteNamesVisibility();
  // Set the checked property of the checkbox based on storedShowNoteNames
  // console.log("Stored note names visibility (should be set to the checkbox): " + common.getNoteNamesVisibility());
  document.getElementById('noteNamesCheckbox').checked = JSON.parse(common.getNoteNamesVisibility());  // Show/hide the actual text labels on the screen
  setNoteNamesVisibility();

  // BASE NOTE
  // Get _base_note from localStorage
  var storedBaseNote = localStorage.getItem('baseNote');
  if (storedBaseNote) {
    changeBaseNote(storedBaseNote);
  } else {
    changeBaseNote(common.defaultBaseNote);
  }

  console.log("**********         HIGHLIGHT MODE START         **********");

  // HIGHLIGHT MODE
  // Get the highlight mode from localStorage
  var storedHighlightMode = localStorage.getItem('highlightMode');
  console.log("Stored highlight mode: " + storedHighlightMode);

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

  console.log("**********         HIGHLIGHT MODE END         **********");

  console.log("*****     Initializing view END     *****");

}

function handleCheckboxChange(checkbox) {
  console.log("Checkbox changed: ", checkbox.checked);
  if (checkbox.checked) {
      // Call function when checkbox is checked
      showAllNotes();
  } else {
      // Call function when checkbox is unchecked
      hideAllNotes();
  }
}


// Function to change base note
function changeBaseNote(newBaseNote) {
  console.log("Changing base note to " + newBaseNote);
  common.setBaseNote(newBaseNote);
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
  console.log("guitarneck.selectHighlightMode, new highlight mode: " + highlightMode);
  common.setHighlightMode(highlightMode);
  // updateSliderNotes();
  setAllColor("red");
  if (highlightMode == "BASENOTE") {
    console.log("Changing to BASENOTE highlight mode, basenote: ", common.getBaseNote());
    colorNotes(common.getBaseNote(), "blue")
  } else if (highlightMode == "PENTATONIC") {
    let pentatonicNotes = common.pentatonic(common.getBaseNote());
    console.log("Changing to PENTATONIC highlight mode, pentatonic notes: ", pentatonicNotes);
    colorNotes(pentatonicNotes, "blue");
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