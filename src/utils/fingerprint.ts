import murmurhash3_32_gc from "murmurhash-js/murmurhash3_gc";

// Function to get color depth. Return a string containing the color depth.
function getColorDepth(): string {
  return window.screen.colorDepth.toString();
}

// PLUGIN METHODS

// Function to get plugins. Return a string containing a list of installed plugins.
function getPlugins(): string {
  const pluginsList = Array.from(navigator.plugins).map(plugin => plugin.name).join(', ');
  return pluginsList;
}

// STORAGE METHODS

// Check if local storage is enabled.
function isLocalStorage(): boolean {
  try {
    return !!localStorage;
  } catch (e) {
    return true;  // SecurityError when referencing it means it exists
  }
}

// Check if session storage is enabled.
function isSessionStorage(): boolean {
  try {
    return !!sessionStorage;
  } catch (e) {
    return true;  // SecurityError when referencing it means it exists
  }
}

// Check if cookies are enabled.
function isCookie(): boolean {
  return navigator.cookieEnabled;
}

// TIME METHODS

// Function to get time zone. Return a string containing the time zone.
function getTimeZone(): string {
  const offset = -new Date().getTimezoneOffset() / 60;
  const formattedNumber = (`0${Math.abs(offset)}`).slice(-2);
  const result = offset < 0 ? `-${formattedNumber}` : `+${formattedNumber}`;
  return result;
}

// LANGUAGE METHODS

// Function to get language. Return a string containing the user language.
function getLanguage(): string {
  return navigator.language;
}

// Function to get system language. Return a string containing the system language.
function getSystemLanguage(): string {
  return navigator.language || window.navigator.language;
}

// Function to get canvas print. Return a string containing the canvas URI data.
function getCanvasPrint(): string {
  const canvas = document.createElement("canvas");
  try {
    canvas.getContext("2d");
  } catch (e) {
    return "";
  }
  return canvas.toDataURL();
}

// Function to generate fingerprint.
export function generateFingerprint(): string {
  const bar = "|";
  const pieces = [
    navigator.userAgent,
    window.location.hostname,
    getColorDepth(),
    getPlugins(),
    isLocalStorage(),
    isSessionStorage(),
    getTimeZone(),
    getLanguage(),
    getSystemLanguage(),
    isCookie(),
    getCanvasPrint()
  ];
  const key = pieces.join(bar);
  const seed = 256;

  return String(murmurhash3_32_gc(key, seed));
}
