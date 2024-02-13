// Import everything from common.js
import * as common from './common.js';

// Import the functions from the other files
import { drawBackground, showAllNotes, hideAllNotes } from './background.js';
import { drawSlider, moveSlider, setColor, setOpacity, colorNotes, setAllColor } from './slider.js';

// Set a default setting for the base note and highlight mode
var defaultBaseNote = "C";
var defaultHighlightMode = "BASENOTE";

window.toggleNoteNames = toggleNoteNames;
window.changeBaseNote = changeBaseNote;
window.selectHighlightMode = selectHighlightMode;


// Select the SVG container
var svg = d3.select("#container")
            .append("svg")
            .attr("width", common.G_WIDTH)
            .attr("height", common.G_HEIGHT);

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

  // Default opacity
  setOpacity(0.4);

  // NOTE LABEL TEXT VISIBILITY
  var showNoteNames = localStorage.getItem('showNoteNames');
  if (showNoteNames === 'false') {
      // Value is 'false'
      hideAllNotes();
  } else {
      // Value is either 'true' or null
      showAllNotes();
      showNoteNames = 'true';
  }
  // Set the checked property of the checkbox based on storedShowNoteNames
  document.getElementById('noteNamesCheckbox').checked = (showNoteNames === 'true');

  // BASE NOTE
  // Get _base_note from localStorage
  var storedBaseNote = localStorage.getItem('baseNote');
  if (storedBaseNote) {
    changeBaseNote(storedBaseNote);
  } else {
    changeBaseNote(defaultBaseNote);
  }

  // HIGHLIGHT MODE
  // Get the highlight mode from localStorage
  var storedHighlightMode = localStorage.getItem('highlightMode');
  if (storedHighlightMode) {
    selectHighlightMode(storedHighlightMode);
  } else {
    selectHighlightMode(defaultHighlightMode);
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
  console.log("Highlight mode: " + highlightMode);
  common.setHighlightMode(highlightMode);
  if (highlightMode == "BASENOTE") {
    setAllColor("red");
    colorNotes(common.getBaseNote(), "blue")
  } else if (highlightMode == "PENTATONIC") {
    let pentatonicNotes = common.pentatonic(common.getBaseNote());
    setAllColor("red");
    colorNotes(pentatonicNotes, "blue");
  }
};