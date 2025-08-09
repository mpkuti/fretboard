/**
 * @fileoverview Centralized event names and tiny event bus helpers
 */
export const EVENTS = Object.freeze({
  BASE_NOTE_CHANGED: 'baseNoteChanged',
  HIGHLIGHT_MODE_CHANGED: 'highlightModeChanged',
  STATE_CHANGED: 'stateChanged' // generic (key, oldValue, newValue)
});

export function emit(type, detail) {
  document.dispatchEvent(new CustomEvent(type, { detail }));
}
export function on(type, handler) {
  document.addEventListener(type, handler);
}
export function off(type, handler) {
  document.removeEventListener(type, handler);
}
