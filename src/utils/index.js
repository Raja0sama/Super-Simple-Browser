"use strict";
const { default: Axios } = require("axios");
const { app, ipcMain } = require("electron");
const window = require("./window");

// Windows reference will be stored here, for example Login and its entire object
let win = {}; // windows
let interval = null;
let intervalRef;
/**
 * 🔥 Init function draw the very first window on the screen which is always login screen.
 */
const Init = () => {
  app.on("ready", () => {
    const data = {
      route: "browser",
      windowStyle: {
        width: 400,
        height: 500,
        frame: false,
        transparent: true,
        show: false,
        webPreferences: {},
      },
    };

    win[data.route] = window.instantWindowCreate(data);
    win[data.route].setResizable(true);
    win[data.route].maximize();
    win[data.route].once("ready-to-show", async () => {
      win[data.route].show();
      win[data.route].webContents.executeJavaScript(`
        localStorage.setItem("@pause", "false");
      `);
    });
  });
};

/**
 * ⏱ creating all the listeners needed to communicate between the main and the render process
 */
const registerListeners = () => {
  ipcMain.handle("createBrowser", (event, data) => {
    win[data.route]
      ? win[data.route].show() // if already in object,show
      : (win[data.route] = window.instantWindowCreate(data)); // if not in object, create
    if (data.route == "browser") {
      win[data.route].maximize();
      win[data.route].setMinimumSize(615, 75);
    }
    cleanUp(data.route); // 🧹 to clean the window global object
  });

  app.on("window-all-closed", () => {
    // clearing the timer we have
    clearInterval(intervalRef);
    // for IOS == darwin
    app.quit();
  });
};

/**
 * 🧹 Clean up the win object when close the window.
 */
const cleanUp = (route) => {
  win[route].on("closed", () => {
    delete win[route];
  });
};

// This will handle creation of a shortcuts.

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require("child_process");
  const path = require("path");

  const appFolder = path.resolve(process.execPath, "..");
  const rootAtomFolder = path.resolve(appFolder, "..");
  const updateDotExe = path.resolve(path.join(rootAtomFolder, "Update.exe"));
  const exeName = path.basename(process.execPath);

  const spawn = function (command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case "--squirrel-install":
    case "--squirrel-updated":
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(["--createShortcut", exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case "--squirrel-uninstall":
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(["--removeShortcut", exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case "--squirrel-obsolete":
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
}

// exporting 🛫
module.exports = {
  Init,
  registerListeners,
  win,
  handleSquirrelEvent,
};
