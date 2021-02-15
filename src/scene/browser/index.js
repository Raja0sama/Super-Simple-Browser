import React, { useEffect, useState } from "react";
import "../../assets/css/antd.css"; // or 'antd/dist/antd.less'
import "../../assets/css/App.css";
import { Tabs } from "antd";
import Browser from "./Browser.js";
import Plus from "../../assets/icons/Plus.svg";
import Close from "../../assets/icons/Close.svg";
import window from "../../utils/window";
import { connect } from "dva";
import {
  add,
  remove,
  setActiveKey,
  setActiveTab,
  setTabs,
  updateTab,
} from "../../modal/app";
import { BrowserTabs, Dark, Light } from "react-browser-tabs";

const App = ({ setActiveKey, add, remove, activeKey, ...props }) => {
  const tabs = [props.tabs, props.setTabs];
  const activeTab = [props.activeTab, props.setActiveTab];

  const [isDark, setisDark] = useState(true);
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <div
        style={{
          height: "100%",
          backgroundColor: isDark ? "#1c1c1c" : "#f1f3f4",
        }}
      >
        <BrowserTabs
          onAddTabPress={add} // CallBack for a Tab Add
          theme={isDark ? Dark : Light} // Theming
          injectProps={{ isDark, setisDark, updateTab: props.updateTab }} // custom props that you needed it to be injected.
          activeTab={activeTab} // keep a track of active index via state.
          tabs={tabs} // tabs
          style={{
            tabsStyle: { "-webkit-app-region": "drag" },
          }}
        />
      </div>
    </div>
  );
};

export default connect(
  ({ app }) => ({
    activeTab: app.activeTab,
    tabs: app.tabs,
  }),
  { add, remove, updateTab, setActiveKey, setActiveTab, setTabs }
)(App);
