import path from "path";
import isDev from "electron-is-dev";
import { remote } from "electron";

// Helper functions for the webview injection.

let container;
let webview;

/**
 * To create a web view
 *
 * @param {Object} {preload = file name or url (string), url = default url (string), inspect = dev tools(boolean)}
 */
const createWebview = ({
  preload = "preload",
  url = "https://google.com/",
  inspect = true,
  parentContainerId = "webviewContainer",
}) => {
  // Creating a webview Element
  webview = document.createElement("webview");
  webview.setAttribute("partition", "persist:view");
  webview.setAttribute("src", url);
  webview.disablewebsecurity = true;
  webview.setAttribute("partition", "persist:webviewsession");
  // creating a preload path for dev and non dev enviroment
  const preloadLink = () => {
    return isDev
      ? process.platform == "darwin"
        ? "file:///" + path.resolve(`./src/utils/${preload}.js`)
        : "" + path.resolve(`./src/utils/${preload}.js`)
      : window.location.href.split("/").slice(0, -2).join("/") +
          `/src/utils/${preload}.js`;
  };
  webview.setAttribute("preload", preloadLink());

  //Styling that element
  webview.style.width = "100%";
  webview.style.height = "100%";

  // appending the webview element inside the webviewContainer
  container = document.getElementById(parentContainerId);
  container.appendChild(webview);
  if (inspect) {
    // connecting element to the doms take time therefore a slight delay
    setTimeout(() => {
      remote.getGlobal("globalOBJ").webview.includes("true") &&
        isDev &&
        ref(parentContainerId).openDevTools();
    }, 10);
  }
};
/**
 * ref for the injected webview
 */
const ref = (id = "#webviewContainer") =>
  document.querySelector(`${id.includes("#") ? id : "#" + id} webview`);

/**
 * Navigating to another url
 *
 * @param {string} url
 */
const navigateToUrl = (url, id) => {
  ref(id).loadURL(url);
};

/**
 * Refresh the browser
 */
const refresh = (id) => {
  ref(id).reload();
};
/**
 * Go Back
 */
const back = (id) => {
  ref(id).canGoBack() && ref(id).goBack();
};
/**
 * Stop the reloading
 */
const stop = (id) => {
  ref(id).stop();
};
/**
 * Go forward
 */
const forward = (id) => {
  ref(id).canGoForward() && ref(id).goForward();
};

/**
 * short reference to create a event listener for the webview
 *
 * @param {string = string name} prop
 * @param {function} prop1
 */
const addEventListener = (prop, prop1, id) =>
  ref(id).addEventListener(prop, prop1);

// exporting functions.
let WebView;
export default WebView = {
  createWebview,
  webview: ref,
  forward,
  back,
  refresh,
  navigateToUrl,
  addEventListener,
  stop,
};
