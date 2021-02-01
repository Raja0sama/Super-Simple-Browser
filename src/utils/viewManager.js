import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import App from "../scene/browser";

// View Manager is for creation of multiwindows with query parameters.

class ViewManager extends Component {
  static Views() {
    return {
      browser: <App />,
    };
  }

  static View(props) {
    let name = props.location.search.substr(1);
    if (name.includes("=")) {
      name = name.slice(0, name.indexOf("="));
    }
    let view = ViewManager.Views()[name];
    if (view == null) throw new Error("View '" + name + "' is undefined");
    return view;
  }

  render() {
    return (
      <Router>
        <div>
          <Route path="/" component={ViewManager.View} />
        </div>
      </Router>
    );
  }
}

export default ViewManager;
