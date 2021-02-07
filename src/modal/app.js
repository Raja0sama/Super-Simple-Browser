import Axios from "axios";
import React from "react";

import { ipcRenderer, remote } from "electron";

import win from "../utils/window";
import webView from "../utils/webView";
import Browser from "../scene/browser/Browser";
import { getRandomInt } from "../utils/utils";

const namespace = "app";

const startLoading = (loadingType) => ({ type: "startLoading", loadingType });
const stopLoading = (loadingType) => ({ type: "stopLoading", loadingType });

export const back = (id) => ({ type: `${namespace}/back`, id });
export const forward = (id) => ({ type: `${namespace}/forward`, id });
export const refresh = (id) => ({ type: `${namespace}/refresh`, id });
export const stop = (id) => ({ type: `${namespace}/stop`, id });
export const go = (url, id) => ({ type: `${namespace}/go`, url, id });
export const setActiveKey = (key) => ({
  type: `${namespace}/setState`,
  activeKey: key,
});
export const setTabs = (tabs) => ({
  type: `${namespace}/setState`,
  tabs,
});
export const setActiveTab = (key) => ({
  type: `${namespace}/setState`,
  activeTab: key,
});
export const add = (url) => ({ type: `${namespace}/add`, url });
export const remove = (targetKey) => {
  return {
    type: `${namespace}/remove`,
    targetKey,
  };
};
export const create = (id, props = {}) => {
  return {
    type: `${namespace}/create`,
    id,
    webviewProps: props,
  };
};

export default {
  namespace,
  state: {
    url: undefined,
    tabs: [],
    activeTab: 0,
    activeKey: undefined,
    props: undefined,
    services: undefined,
    loading: {
      reload: false,
      initial: false,
    },
  },

  effects: {
    *add({ url }, { select, put }) {
      const { tabs } = yield select(({ app }) => ({ tabs: app.tabs }));
      const props = url && { url };
      const newKey = `newTab${tabs.length + getRandomInt(1000)}`;
      console.log({ tabs });
      yield put({ type: "setState", activeTab: tabs.length });
      yield put({
        type: "setState",
        tabs: [
          ...tabs,
          {
            title: "New Tab ",
            url: url,
            id: newKey,
            content: (props) => <Browser {...props} id={newKey} />,
          },
        ],
      });
    },

    *remove({ targetKey }, { select, put }) {
      const { activeTab, activeKey, tabs } = yield select(({ app }) => ({
        activeTab: app.activeTab,
        activeKey: app.activeKey,
        tabs: app.tabs,
      }));
      let newActiveKey = activeKey;
      let lastIndex;
      tabs.forEach((tab, i) => {
        if (tab.key === targetKey) {
          lastIndex = i - 1;
        }
      });
      const newTabs = tabs.filter((tab) => tab.key !== targetKey);
      if (newTabs.length && newActiveKey === targetKey) {
        if (lastIndex >= 0) {
          newActiveKey = newTabs[lastIndex].key;
        } else {
          newActiveKey = newTabs[0].key;
        }
      }
      yield put({
        type: "setState",
        tabs: newTabs,
      });

      yield put({ type: "setState", activeKey: newActiveKey });
    },

    *back({ id }, {}) {
      webView.back(id);
    },
    *forward({ id }, {}) {
      webView.forward(id);
    },
    *refresh({ id }, {}) {
      webView.refresh(id);
    },
    *stop({ id }, {}) {
      webView.stop(id);
    },
    *go({ url, id }, {}) {
      try {
        webView.webview(id).loadURL(url);
      } catch (error) {
        console.log({ error });
      }
    },
    *create({ id = "webviewContainer", webviewProps }, { select }) {
      const services = yield select(({ app }) => app.services); // fetch services
      webView.createWebview({
        ...webviewProps,
        parentContainerId: id,
        url: webviewProps.url || remote.getGlobal("globalOBJ").homePage,
      });
    },
  },

  subscriptions: {
    async onLoad({ dispatch }) {
      if (win.getURL().includes("browser")) {
        dispatch({
          type: "setState",
          tabs: [
            ...[
              {
                title: "Google",
                url: "https://google.com/", // auto fetch url
                id: "tab1",
                content: (props) => (
                  <Browser url="https://google.com/" id={"firstTab"} />
                ),
              },
            ],
          ],
        });
      }
    },
  },

  reducers: {
    setState(state, newState) {
      return { ...state, ...newState };
    },
    startLoading(state, { loadingType }) {
      return { ...state, loading: { ...state.loading, [loadingType]: true } };
    },
    stopLoading(state, { loadingType }) {
      return { ...state, loading: { ...state.loading, [loadingType]: false } };
    },
  },
};
