"use strict";
var os = require("os");
const {
  Init,
  registerListeners,
  handleSquirrelEvent,
} = require("./src/utils/index.js");

if (require("electron-squirrel-startup")) return;

// Global Values
global.globalOBJ = {
  platform: os.platform(), // "darwin" means mac, and "win32" is window.
  homePage: "https://google.com",
  faviconGetter: "`https://www.google.com/s2/favicons?domain=",
  webview: "true",
  windows: "true",
  proxyEnable: "true",
};

Init();
// Register all the required listeners.
registerListeners();

if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}
