const { remote, ipcRenderer } = require("electron");
const CryptoJS = require("crypto-js");
document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 The Magic Happens here 🔥");
  window.addEventListener("click", (e) => {
    const anchor = e.srcElement.closest("a");
    if (anchor.getAttribute("target") == "_blank") {
      const href = anchor.href;

      ipcRenderer.sendToHost(
        JSON.stringify({
          type: "newTab",
          url: href,
        })
      );
    }
  });
});
setTimeout(() => {
  ipcRenderer.on("replace", (e, url) => {
    window.location.replace(url);
  });
}, 400);
ipcRenderer.on("remove", (e, url) => {
  document.querySelector(url).style.display = "none";
});

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
