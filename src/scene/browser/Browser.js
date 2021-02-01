import React, { useEffect, useState } from "react";
import "../../assets/css/App.css";
import { connect } from "dva";
import { add, back, create, forward, go, refresh, stop } from "../../modal/app";
import webView from "../../utils/webView";
import Logo from "../../assets/icons/logo.svg";
import Back from "../../assets/icons/back.svg";
import Home from "../../assets/icons/home.svg";
import EarthSpinner from "../../assets/icons/loader.svg";
import Reload from "../../assets/icons/Reload.svg";
import Close from "../../assets/icons/Close.svg";
import Secure from "../../assets/icons/secure.svg";
import { Input } from "antd";
import { remote } from "electron";
import util, { updateTitle } from "../../utils/utils";
import * as chromiumNetErrors from "chromium-net-errors";
import electronIsDev from "electron-is-dev";
import packageJSON from "../../../package.json";
const Browser = ({
  back,
  forward,
  go,
  refresh,
  stop,
  id,
  create,
  add,
  services,
  ...props
}) => {
  const [url, seturl] = useState("");
  const [loading, setloading] = useState(true);
  const [error, seterror] = useState(false);
  const onTitlechange = (event) =>
    id != "newTab0" &&
    updateTitle(
      event.title,
      id,
      `https://www.google.com/s2/favicons?domain=${webView
        .webview(id)
        .getURL()}`
    );
  const onURLChange = ({ url }) => {
    seturl(url);
    replacingURL();
  };
  const replacingURL = () => {
    const currUrl = webView.webview(id).getURL();
    const { pathname: cPathName, hostname: cHostName } = new URL(currUrl);

    services.forEach((e) => {
      const blockedURLS = e.afp_custom_feilds.fetching_blocked_urls
        ? e.afp_custom_feilds.fetching_blocked_urls
        : [];
      blockedURLS.forEach(({ urls: url }) => {
        const { pathname: bPathName, hostname: bHostName } = new URL(url);

        if (bHostName == cHostName && cPathName.includes(bPathName)) {
          webView.webview(id).send("replace", "about:blank");
        }
      });
      const tobeblockElements = e.afp_custom_feilds.fetching_blocked_elements;
      Array.isArray(tobeblockElements) &&
        tobeblockElements.forEach((element) => {
          setTimeout(() => {
            document
              .querySelector(`#${id} webview`)
              .send("remove", element.selector);
          }, 10);
        });
    });
  };

  useEffect(() => {
    // Creates a webview

    create(id, { url: props.url });

    util.updateTitle("New Tab", id);
    const startLoading = () => {
      seterror(false);
      document.getElementById("favicon" + id).setAttribute("src", EarthSpinner);
      setloading(true);
      replacingURL();
    };
    const stopLoading = () => {
      seturl(webView.webview(id).getURL());
      setloading(false);
      document
        .getElementById("favicon" + id)
        .setAttribute(
          "src",
          `https://www.google.com/s2/favicons?domain=${webView
            .webview(id)
            .getURL()}`
        );
    };

    const call = (er) => {
      setTimeout(() => {
        webView
          .webview(id)
          .send(
            "replace",
            electronIsDev
              ? `http://localhost:8080/warning/Error.html?code=${er.code}&message=${er.message}`
              : window.location.href.split("/").slice(0, -1).join("/") +
                  `/warning/Error.html?code=${er.code}&message=${er.message}`
          );
      }, 300);
    };
    const onFail = (event) => {
      const Err = chromiumNetErrors.getErrorByCode(event.errorCode);
      const er = new Err();

      er.code != -3 && call(er);
    };

    setTimeout(() => {
      webView.addEventListener("did-start-loading", startLoading, id);
      webView.addEventListener("did-stop-loading", stopLoading, id);
      webView.addEventListener("did-finish-load", stopLoading, id);
      webView.addEventListener("did-fail-load", onFail, id);
      webView.addEventListener("page-title-updated", onTitlechange, id);
      webView.addEventListener("will-navigate", onURLChange, id);
      webView.addEventListener(
        "ipc-message",
        (event) => {
          const config = JSON.parse(event.channel);
          if (config.type == "newTab") {
            add(config.url);
          }
        },
        id
      );
    }, 300);

    return () => {
      webView
        .webview(id)
        .removeEventListener("did-start-loading", startLoading);
      webView.webview(id).removeEventListener("did-stop-loading", stopLoading);
      webView.webview(id).removeEventListener("did-finish-load", stopLoading);
      webView.webview(id).removeEventListener("did-fail-load", onFail);
      webView
        .webview(id)
        .removeEventListener("page-title-updated", onTitlechange);
      webView.webview(id).removeEventListener("will-navigate", onURLChange);
    };
  }, [props.url]);
  return (
    <div style={{}}>
      <div id="controls" style={{ paddingBottom: 7, paddingTop: 6 }}>
        <div style={{ width: 30, margin: "auto" }}>
          <img
            onClick={() => back(id)}
            id="back"
            style={{
              width: 13,
              cursor: "pointer",
            }}
            title="Go Back"
            src={Back}
          />
        </div>
        <div style={{ width: 30, margin: "auto" }}>
          <img
            onClick={() => forward(id)}
            id="forward"
            style={{
              WebkitTransform: "scaleX(-1)",
              transform: "scaleX(-1)",
              width: 13,
              cursor: "pointer",
            }}
            title="Go Forward"
            src={Back}
          />
        </div>
        <div style={{ width: 30, margin: "auto" }}>
          <img
            onClick={() => go(remote.getGlobal("globalOBJ").homePage, id)}
            // onClick={() => window.openNewTab()}
            id="home"
            style={{
              WebkitTransform: "scaleX(-1)",
              transform: "scaleX(-1)",
              width: 15,

              cursor: "pointer",
            }}
            src={Home}
            title="Go Home"
          />
        </div>
        <div style={{ width: 30, margin: "auto" }}>
          <img
            onClick={() => (loading ? stop(id) : refresh(id))}
            id="reload"
            style={{
              WebkitTransform: "scaleX(-1)",
              transform: "scaleX(-1)",
              width: 13,

              cursor: "pointer",
            }}
            src={!loading ? Reload : Close}
            title={!loading ? "Reload" : "Cancel"}
          />
        </div>
        <div
          style={{
            backgroundColor: "#161A1A",
            borderColor: "#161A1A",
            display: "flex",
            borderRadius: 4,
            padding: "0px 3px",
            marginRight: 10,
          }}
          id="center-column"
        >
          {url.includes("https://") && (
            <img style={{ padding: "0px 10px" }} src={Secure} />
          )}
          <Input
            autoFocus
            style={{
              backgroundColor: "#161A1A",
              borderColor: "#161A1A",
              color: "#ffffffad",
            }}
            onChange={({ target }) => seturl(target.value)}
            id="location"
            type="text"
            value={
              url == remote.getGlobal("globalOBJ").homePage
                ? ""
                : contains(url, ["localhost", "app.asar"])
                ? "error://failed"
                : url
            }
            onKeyPress={(e) => {
              if (e.charCode == 13) {
                if (!url.includes("https://") && !url.includes("http://")) {
                  go("https://" + url, id);
                } else {
                  go(url, id);
                }
              }
            }}
            defaultValue={url}
          />
        </div>
      </div>
      {error ? (
        <div
          style={{
            position: "absolute",
            top: 40,
            left: "0",
            right: "0",
            bottom: "0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
          }}
        >
          <h1>🔴 WOAH !</h1>
          <p>Seems Like you lost internet Connection. 🛠</p>
        </div>
      ) : (
        <div
          id={id}
          style={{
            position: "absolute",
            top: 40,
            left: "0",
            right: "0",
            bottom: "0",
          }}
        ></div>
      )}
    </div>
  );
};

export default connect(({ app }) => ({ services: app.services }), {
  back,
  forward,
  go,
  refresh,
  stop,
  create,
  add,
})(Browser);

function contains(target, pattern) {
  var value = 0;
  pattern.forEach(function (word) {
    value = value + target.includes(word);
  });
  return value === 1;
}
