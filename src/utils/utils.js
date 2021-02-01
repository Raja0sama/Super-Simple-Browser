/**
 * this function will merge two objects with their nesting
 *
 * @param {object} target
 * @param  {...any} sources
 */
function Object_assign(target, ...sources) {
  sources.forEach((source) => {
    Object.keys(source).forEach((key) => {
      const s_val = source[key];
      const t_val = target[key];
      target[key] =
        t_val && s_val && typeof t_val === "object" && typeof s_val === "object"
          ? Object_assign(t_val, s_val)
          : s_val;
    });
  });
  return target;
}
/**
 * To update title of the browser window just call this.
 * @param {*} title
 * @param {*} id
 * @param {*} img
 */
const updateTitle = (
  title,
  id,
  img = `https://www.google.com/s2/favicons?domain=https://atompoint.com/`
) => {
  try {
    document.getElementById("rc-tabs-0-tab-" + id).innerHTML =
      `<div style='width:188.5px;white-space: nowrap; 
  overflow: hidden;font-size: 12.5px;
  margin: auto;
  text-overflow: ellipsis;'><img id="favicon${id}" src='${img}'/>&nbsp;&nbsp;` +
      title +
      "</div>";
  } catch (error) {}
};

const injectMessageBot = () => {
  const d1 = document.createElement("div");
  d1.id = "fb-root";
  const d2 = document.createElement("div");
  d2.className = "fb-customerchat";
  d2.setAttribute("attribution", "setup_tool");
  d2.setAttribute("page_id", "102872584856597");
  d2.setAttribute("theme_color", "#FF9900");
  d2.setAttribute(
    "logged_in_greeting",
    "Welcome to Professional Tools. How can I help you today?"
  );
  d2.setAttribute(
    "logged_out_greeting",
    "Welcome to Professional Tools. How can I help you today?"
  );

  document.body.append(d1);
  window.fbAsyncInit = function () {
    FB.init({
      xfbml: true,
      version: "v8.0",
    });
  };
  (function (d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js";
    fjs.parentNode.insertBefore(js, fjs);
  })(document, "script", "facebook-jssdk");

  document.body.append(d2);
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const util = {
  Object_assign,
  updateTitle,
  injectMessageBot,
  getRandomInt,
};
module.exports = util;
