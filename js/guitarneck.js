/**
 * @fileoverview Main application logic for the interactive guitar fretboard
 * Coordinates between all modules and handles user interactions and initialization
 * @author Mika Kutila
 */

// Import from the new modular structure
import { d3, DEFAULTS, HIGHLIGHT_MODE_INTERVAL_MAP, CHORD_PALETTE } from './constants.js';
import { getZoomLevel, setZoomLevel, containerWidth, containerHeight, padding, setFretCount, getFretCount } from './layout.js';
import { pentatonic, buildPentatonicLabel, getNoteFromInterval, recalcAllNoteCoordinates } from './utils.js';
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
import { drawSlider, moveSlider, updateIntervalText, showIntervalsWithVisual, hideIntervalsWithVisual, highlightNotes, outlineBaseNoteCircles, highlightNotesMulti } from './slider.js';

// Set a default setting for the base note and highlight mode
// var defaultBaseNote = "C";
// var defaultHighlightMode = "BASENOTE";


// Select the SVG container
var svg = d3.select("#fretboard_container")
            .append("svg")
            .attr("width", containerWidth)
            .attr("height", containerHeight)
            .classed('init-fade', true);
// New root group for scalable content
var zoomRoot = svg.append('g').attr('id','zoomRoot');

drawBackground(zoomRoot);
drawSlider(zoomRoot);
drawNoteLabels(zoomRoot);


// Attach the click event handler to the scalable root
zoomRoot.on("click", moveSlider);


// ******************** START FUNCTIONS ********************


/**
 * Initializes the application view with settings from localStorage
 * Sets up opacity, note visibility, interval visibility, base note, and highlight mode
 */
export function initializeView() {
  // setOpacity(DEFAULTS.OPACITY); // removed: opacity now fixed via CIRCLE_OPACITY constant
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
  const fretInput = document.getElementById('fretCountInput');
  if (fretInput) {
    fretInput.value = getFretCount();
    fretInput.addEventListener('change', e => {
      setFretCount(e.target.value);
    });
  }
  document.getElementById('noteNamesCheckbox')?.addEventListener('change', function() {
    handleCheckboxChange(this, 'noteNamesCheckbox');
  });
  document.getElementById('intervalNamesCheckbox')?.addEventListener('change', function() {
    handleCheckboxChange(this, 'intervalNamesCheckbox');
  });
  const select = document.getElementById('highlightModeSelect');
  if (select) {
    select.value = getHighlightMode();
    select.addEventListener('change', e => selectHighlightMode(e.target.value));
  }
  const basicModes = [
    'NONE','BASENOTE','PENTATONIC_SCALE','MAJOR_SCALE','NATURAL_MINOR_SCALE',
    'MAJOR_CHORD','MINOR_CHORD','DOMINANT_SEVEN_CHORD','MAJOR_SEVEN_CHORD','MINOR_SEVEN_CHORD','POWER_CHORD'
  ];
  const advancedGroups = [
    {label:'Basic', modes:basicModes},
    {label:'Triads / Power / Sus', modes:['DIMINISHED_CHORD','AUGMENTED_CHORD','SUSPENDED_2_CHORD','SUSPENDED_4_CHORD']},
    {label:'6 / Add / 7', modes:['SIX_CHORD','MINOR_SIX_CHORD','ADD9_CHORD','MINOR_ADD9_CHORD','SIX_NINE_CHORD','HALF_DIMINISHED_SEVEN_CHORD','DIMINISHED_SEVEN_CHORD','MINOR_MAJOR_SEVEN_CHORD']},
    {label:'Extended (9/11/13)', modes:['MAJOR_NINE_CHORD','DOMINANT_NINE_CHORD','MINOR_NINE_CHORD','MINOR_MAJOR_NINE_CHORD','DOMINANT_ELEVEN_CHORD','MAJOR_ELEVEN_CHORD','MINOR_ELEVEN_CHORD','DOMINANT_THIRTEEN_CHORD','MAJOR_THIRTEEN_CHORD','MINOR_THIRTEEN_CHORD']},
    {label:'Altered / Susp', modes:['DOMINANT_SEVEN_SUS4_CHORD','DOMINANT_FLAT_NINE_CHORD','DOMINANT_SHARP_NINE_CHORD','DOMINANT_FLAT_THIRTEEN_CHORD','DOMINANT_SHARP_ELEVEN_CHORD','ALTERED_DOMINANT_CHORD','DOMINANT_SEVEN_SHARP_NINE_CHORD']},
    {label:'Scales', modes:['HARMONIC_MINOR_SCALE','MELODIC_MINOR_SCALE','BLUES_SCALE','WHOLE_TONE_SCALE','DIMINISHED_HALF_WHOLE_SCALE','DIMINISHED_WHOLE_HALF_SCALE']}
  ];
  function labelFor(mode){
    const map = {
      NONE:'None', BASENOTE:'Basenote', PENTATONIC_SCALE:'Pentatonic Scale', MAJOR_SCALE:'Major Scale', NATURAL_MINOR_SCALE:'Natural Minor Scale', HARMONIC_MINOR_SCALE:'Harmonic Minor Scale', MELODIC_MINOR_SCALE:'Melodic Minor Scale', BLUES_SCALE:'Blues Scale', WHOLE_TONE_SCALE:'Whole Tone Scale', DIMINISHED_HALF_WHOLE_SCALE:'Half-Whole Diminished', DIMINISHED_WHOLE_HALF_SCALE:'Whole-Half Diminished',
      MAJOR_CHORD:'Major Chord', MINOR_CHORD:'Minor Chord', DIMINISHED_CHORD:'Diminished Chord', AUGMENTED_CHORD:'Augmented Chord', SUSPENDED_2_CHORD:'Sus2 Chord', SUSPENDED_4_CHORD:'Sus4 Chord', POWER_CHORD:'Power Chord',
      SIX_CHORD:'6 Chord', MINOR_SIX_CHORD:'Minor 6 Chord', ADD9_CHORD:'Add9 Chord', MINOR_ADD9_CHORD:'Minor Add9 Chord', SIX_NINE_CHORD:'6/9 Chord',
      MAJOR_SEVEN_CHORD:'Maj7 Chord', DOMINANT_SEVEN_CHORD:'7 Chord', MINOR_SEVEN_CHORD:'m7 Chord', HALF_DIMINISHED_SEVEN_CHORD:'m7b5 Chord', DIMINISHED_SEVEN_CHORD:'dim7 Chord', MINOR_MAJOR_SEVEN_CHORD:'mMaj7 Chord',
      MAJOR_NINE_CHORD:'Maj9 Chord', DOMINANT_NINE_CHORD:'9 Chord', MINOR_NINE_CHORD:'m9 Chord', MINOR_MAJOR_NINE_CHORD:'mMaj9 Chord', DOMINANT_ELEVEN_CHORD:'11 Chord', MAJOR_ELEVEN_CHORD:'Maj11 Chord', MINOR_ELEVEN_CHORD:'m11 Chord', DOMINANT_THIRTEEN_CHORD:'13 Chord', MAJOR_THIRTEEN_CHORD:'Maj13 Chord', MINOR_THIRTEEN_CHORD:'m13 Chord',
      DOMINANT_SEVEN_SUS4_CHORD:'7sus4 Chord', DOMINANT_FLAT_NINE_CHORD:'7b9 Chord', DOMINANT_SHARP_NINE_CHORD:'7#9 Chord', DOMINANT_FLAT_THIRTEEN_CHORD:'7b13 Chord', DOMINANT_SHARP_ELEVEN_CHORD:'7#11 Chord', ALTERED_DOMINANT_CHORD:'Altered 7 Chord', DOMINANT_SEVEN_SHARP_NINE_CHORD:'7#9 (Alt) Chord'
    };
    return map[mode] || mode;
  }
  function rebuildSelect(modeSet){
    if (!select) return;
    const current = getHighlightMode();
    select.innerHTML='';
    if (modeSet === 'BASIC') {
      basicModes.forEach(m=>{
        const opt=document.createElement('option'); opt.value=m; opt.textContent=labelFor(m); select.appendChild(opt);
      });
    } else {
      advancedGroups.forEach(group=>{
        const og = document.createElement('optgroup'); og.label = group.label; select.appendChild(og);
        group.modes.forEach(m=>{ const opt=document.createElement('option'); opt.value=m; opt.textContent=labelFor(m); og.appendChild(opt); });
      });
    }
    // Restore selection if present else fallback
    if ([...select.options].some(o=>o.value === current)) select.value = current; else select.value = 'BASENOTE';
    selectHighlightMode(select.value);
  }
  document.querySelectorAll('input[name="highlightSet"]').forEach(r=>{
    r.addEventListener('change', e=>{ rebuildSelect(e.target.value); });
  });
  rebuildSelect(document.querySelector('input[name="highlightSet"]:checked')?.value || 'BASIC');
}

function updateHeader() {
  const el = document.getElementById('fretboardHeader');
  if (!el) return;
  const base = getBaseNote();
  const mode = getHighlightMode();
  let text;
  const simpleMap = {
    NONE: `Note ${base}`,
    BASENOTE: `Note ${base}`,
    PENTATONIC_SCALE: `${base} Pentatonic Scale`,
    MAJOR_SCALE: `${base} Major Scale`,
    NATURAL_MINOR_SCALE: `${base} Natural Minor Scale`,
    HARMONIC_MINOR_SCALE: `${base} Harmonic Minor Scale`,
    MELODIC_MINOR_SCALE: `${base} Melodic Minor Scale`,
    BLUES_SCALE: `${base} Blues Scale`,
    WHOLE_TONE_SCALE: `${base} Whole Tone Scale`,
    DIMINISHED_HALF_WHOLE_SCALE: `${base} Half-Whole Diminished`,
    DIMINISHED_WHOLE_HALF_SCALE: `${base} Whole-Half Diminished`
  };
  if (simpleMap[mode]) { text = simpleMap[mode]; }
  else if (mode.endsWith('_CHORD')) {
    // Format chord name from mode constant
    const name = mode.replace(/_CHORD$/, '')
      .replace(/^MAJOR_SEVEN/, 'Maj7')
      .replace(/^DOMINANT_SEVEN/, '7')
      .replace(/^MINOR_SEVEN/, 'm7')
      .replace(/^MINOR_MAJOR_SEVEN/, 'mMaj7')
      .replace(/^HALF_DIMINISHED_SEVEN/, 'm7b5')
      .replace(/^DIMINISHED_SEVEN/, 'dim7')
      .replace(/^MAJOR_NINE/, 'Maj9')
      .replace(/^DOMINANT_NINE/, '9')
      .replace(/^MINOR_NINE/, 'm9')
      .replace(/^MINOR_MAJOR_NINE/, 'mMaj9')
      .replace(/^DOMINANT_ELEVEN/, '11')
      .replace(/^MAJOR_ELEVEN/, 'Maj11')
      .replace(/^MINOR_ELEVEN/, 'm11')
      .replace(/^DOMINANT_THIRTEEN/, '13')
      .replace(/^MAJOR_THIRTEEN/, 'Maj13')
      .replace(/^MINOR_THIRTEEN/, 'm13')
      .replace(/^DOMINANT_SEVEN_SUS4/, '7sus4')
      .replace(/^DOMINANT_FLAT_NINE/, '7b9')
      .replace(/^DOMINANT_SHARP_NINE/, '7#9')
      .replace(/^DOMINANT_FLAT_THIRTEEN/, '7b13')
      .replace(/^DOMINANT_SHARP_ELEVEN/, '7#11')
      .replace(/^ALTERED_DOMINANT/, 'Alt7')
      .replace(/^DOMINANT_SEVEN_SHARP_NINE/, '7#9');
    text = `${base} ${name.replace(/_/g,' ').replace(/MAJOR/g,'Maj').replace(/MINOR/g,'m')}`;
  } else {
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

function updateZoomUI(){
  const el = document.getElementById('zoomLevelDisplay');
  if (el) el.textContent = `Zoom: ${getZoomLevel().toFixed(1)}`;
}
function rebuildAll(){
  // No longer rebuild everything on zoom; leave for fret count changes only
  // This function retained for fretCount changes
  const container = d3.select('#fretboard_container');
  container.select('svg').remove();
  svg = container.append('svg')
    .attr('width', containerWidth)
    .attr('height', containerHeight)
    .classed('ready', true);
  zoomRoot = svg.append('g').attr('id','zoomRoot');
  drawBackground(zoomRoot);
  drawSlider(zoomRoot);
  drawNoteLabels(zoomRoot);
  zoomRoot.on('click', moveSlider);
  applyHighlightColors();
  outlineBaseNoteCircles(getBaseNote());
}
function changeZoom(delta){
  const current = getZoomLevel();
  const next = +(current + delta).toFixed(1);
  if (next < 0.4 || next > 1.6) return;
  setZoomLevel(next);
  recalcAllNoteCoordinates();
  updateZoomUI();
  rebuildAll();
}
function bindZoomButtons(){
  document.getElementById('zoomInBtn')?.addEventListener('click', ()=> changeZoom(0.1));
  document.getElementById('zoomOutBtn')?.addEventListener('click', ()=> changeZoom(-0.1));
  updateZoomUI();
}

window.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('fretCountChanged', () => {
    recalcAllNoteCoordinates();
    const container = d3.select('#fretboard_container');
    container.select('svg').remove();
    svg = d3.select('#fretboard_container').append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .classed('ready', true);
    zoomRoot = svg.append('g').attr('id','zoomRoot');
    drawBackground(zoomRoot);
    drawSlider(zoomRoot);
    drawNoteLabels(zoomRoot);
    zoomRoot.on('click', moveSlider);
    applyHighlightColors();
    outlineBaseNoteCircles(getBaseNote());
    if (getNoteNamesVisibility()) { showAllNotes(); } else { hideAllNotes(); }
    if (getIntervalVisibility()) { showIntervalsWithVisual(); } else { hideIntervalsWithVisual(); }
  });
  initializeView();
  bindUIEvents();
  bindZoomButtons();
  renderPentatonicLabel();
  applyHighlightColors();
  outlineBaseNoteCircles(getBaseNote());
  updateHeader();
  svg.classed('ready', true).classed('init-fade', false);
});