import React from "react";
import { createMemoryHistory } from "history";
import ViewManager from "./utils/viewManager";
import dva from "dva";

// Creating an element to inject
let root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);
// init the dva
export const app = dva({
  history: createMemoryHistory(),
  onError() {},
});

app.model(require("./modal/app").default);

app.router(() => <ViewManager />);
// starting up dva react
app.start("#root");

// Reason why using DVA is i started up the project with DVA and make keep the business login clean
