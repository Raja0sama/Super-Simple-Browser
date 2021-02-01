const { BrowserWindow, remote, session, ipcRenderer } = require("electron");
const url = require("url");
const util = require("./utils");
const path = require("path");
const { default: Axios } = require("axios");
var fs = require("fs");

let dev;

/**
 * Return a Electron Window instance
 *
 * @param {Object} {width, height, webPreferences}
 */

const createWindow = (config) => {
  const defaultConfig = {
    width: 1024,
    height: 768,
    // title: "Authenticate",
    webPreferences: {
      devTools: global.globalOBJ.windows.includes("true"),
      webviewTag: true,
      nodeIntegration: true,
    },
  };
  return new BrowserWindow(util.Object_assign(defaultConfig, config)); // creating a window
};

/**
 * Returns a electron window if want to create from remote, not recommended since we need a track of how many windows we have, we create a window by requesting main to create one.
 *
 * @param {Object} {width, height, webPreferences}
 */
const createWindowR = ({
  width = 1024,
  height = 768,
  browserWindow = {},
  webPreferences = {},
}) => {
  const options = {
    width,
    height,
    ...browserWindow,
    webPreferences: {
      devTools: true,
      webviewTag: true,
      nodeIntegration: true,
      ...webPreferences,
    },
  };
  return new remote.BrowserWindow(options);
};

/**
 * To target a certain component of react.js
 *
 * @param {string} route
 */
const pathCreater = (route) => {
  let indexPath;

  if (isDev() && process.argv.indexOf("--noDevServer") === -1) {
    indexPath = url.format({
      protocol: "http:",
      host: `localhost:8080${"?" + route}`,
      // pathname: "index.html",
      slashes: true,
    });
  } else {
    indexPath =
      url.format({
        protocol: "file:",
        pathname: path.join(
          process.platform == "darwin"
            ? __dirname.split("/").slice(0, -2).join("/")
            : __dirname.split("\\").slice(0, -2).join("/"),
          "build",
          `index.html`
        ),
        slashes: false,
      }) + `?${route}`;
  }
  return indexPath;
};

/**
 * To check if the we are in development environment or not.
 */
const isDev = () => {
  if (
    process.defaultApp ||
    /[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
    /[\\/]electron[\\/]/.test(process.execPath)
  ) {
    return true;
  }
  return false;
};
dev = isDev();
/**
 * Insert a Proxy to a browser instance when given proxy ip and port and a window Instance
 *
 * @param {BrowserWindow} window
 * @param {string} proxyIp
 * @param {string} port
 */
const proxyInsertion = (window, proxyIp, port) => {
  Axios.get("https://amzsoftwares.com/wp-json/afp_tools/v1/get_host")
    .then((d) => {
      let a = [];
      d.data.forEach((y, i) => {
        const host = new URL(y.host).host;
        a.push(`host == '${host}'`);
      });
      a.push(`host == 'www.amazon.com'`);
      a.push(`host == 'whatismyipaddress.com'`);
      a.push(`host == 'wooshop.tk'`);

      const pac = pacScript(proxyIp + ":" + port, a.join(" || "));
      insert(pac);
    })
    .catch((e) => {
      // return e;
      console.log("Problem", e);
      insert();
    });

  const insert = (pac) => {
    if (proxyIp.trim() == "noproxy") {
      var my_proxy = "direct://";
      session
        .fromPartition("persist:webviewsession")
        .setProxy({ proxyRules: my_proxy }, function () {});
    } else {
      // var my_proxy = "http://18.222.150.26:3000";
      var my_proxy = "http://" + proxyIp + ":" + port;
      session.fromPartition("persist:webviewsession").setProxy(
        {
          pacScript:
            "data:text/plain;base64," +
            Buffer.from(pac, "utf8").toString("base64"),
        },
        // { proxyRules: my_proxy },
        function () {}
      );
    }
  };
  const url = () => {
    return isDev
      ? process.platform == "darwin"
        ? "file:///" + path.resolve(`./src/utils/proxy.pac`)
        : "" + path.resolve(`./src/utils/proxy.pac`)
      : window.location.href.split("/").slice(0, -2).join("/") +
          `/src/utils/proxy.pac`;
  };
};

function pacScript(p, h) {
  return (
    "function FindProxyForURL(url, host) {\n" +
    `  if (${h}){\n` +
    `    return 'PROXY ${p};';}\n` +
    "  return 'DIRECT';\n" +
    "}"
  );
}

const BrowseractionInert = () => {
  const wind = remote.getCurrentWindow();
  const ios = toElement(` <div style="padding:0 10px;width:84px" class="focus">
      <div class="traffic-lights">
        <button class="traffic-light traffic-light-close" id="close-button"></button>
        <button
          class="traffic-light traffic-light-minimize"
          id="min-button"
        ></button>
        <button
          class="traffic-light traffic-light-maximize"
          id="max-button"
        ></button>
      </div>
    </div>`);
  const win = toElement(` <div style='width:144px' class="ui-titlecontrols">
		<button id="min-button" class="ui-btn minimize">
			<svg x="0px" y="0px" viewBox="0 0 10.2 1"><rect x="0" y="50%" width="10.2" height="1" /></svg>
		</button><button id="max-button" class="ui-btn maximize">
			<svg viewBox="0 0 10 10"><path d="M0,0v10h10V0H0z M9,9H1V1h8V9z" /></svg>
		</button><button id="close-button" class="ui-btn close">
			<svg viewBox="0 0 10 10"><polygon points="10.2,0.7 9.5,0 5.1,4.4 0.7,0 0,0.7 4.4,5.1 0,9.5 0.7,10.2 5.1,5.8 9.5,10.2 10.2,9.5 5.8,5.1" /></svg>
		</button>
	</div>`);
  if (remote.getGlobal("globalOBJ").platform == "win32") {
    document.getElementsByClassName("ant-tabs-nav")[0].appendChild(
      win
      // document.getElementsByClassName("ant-tabs-nav-wrap")[0]
    );
  } else {
    document
      .getElementsByClassName("ant-tabs-nav")[0]
      .insertBefore(
        ios,
        document.getElementsByClassName("ant-tabs-nav-wrap")[0]
      );
  }

  document.getElementById("min-button").addEventListener("click", (event) => {
    wind.minimize();
  });

  document.getElementById("max-button").addEventListener("click", (event) => {
    wind.maximize();
  });

  // document
  //   .getElementById("restore-button")
  //   .addEventListener("click", (event) => {
  //     win.unmaximize();
  //   });

  document.getElementById("close-button").addEventListener("click", (event) => {
    wind.close();
  });
};

/**
 *
 * @param {BrowserWindow} window
 * @param {Object} {route,proxy,port,windowStyle}
 */

const instantWindowCreate = ({
  route = "Browser",
  proxy = "83.97.23.90",
  port = "18080",
  windowStyle = {},
  remote = false,
  enableProxy = false,
  propsToPass,
}) => {
  let window;
  window = remote
    ? createWindowR({ ...windowStyle })
    : createWindow({ ...windowStyle });
  window.loadURL(pathCreater(route));
  enableProxy && proxyInsertion(window, proxy, port);
  console.log("a window of route " + route + " has been created.");
  window.webContents.addListener("did-finish-load", () => {
    propsToPass && window.webContents.send("props", propsToPass);
  });
  return window;
};

const getURL = () => {
  const url = remote.getCurrentWindow().webContents.getURL();
  return url.slice(url.indexOf("?") + 1);
};
function toElement(
  s = "",
  c,
  t = document.createElement("template"),
  l = "length"
) {
  t.innerHTML = s.trim();
  c = [...t.content.childNodes];
  return c[l] > 1 ? c : c[0] || "";
}

const openNewTab = async () => {
  ipcRenderer.invoke("createBrowser", {
    route: "browser=" + Math.abs(Math.random() * 10),
    windowStyle: { width: 500, height: 600, frame: false },
  });
};

const window = {
  createWindow,
  isDev,
  pathCreater,
  proxyInsertion,
  dev,
  BrowseractionInert,
  openNewTab,
  getURL,
  instantWindowCreate,
};
module.exports = window;
