var packager = require("electron-packager");
var options = {
  arch: "x64",
  platform: process.platform,
  dir: "./",
  "app-copyright": "Professional Tools",
  "app-version": "0.0.1",
  asar: true,
  icon: "./logo.ico",
  name: "ProfessionalToolsBrowser",
  ignore: [
    "releases",
    ".git",
    "yarn-error.log",
    "yarn.lock",
    "test.json",
    "dist",
    ".babelrc",
    ".gitignore",
    "LICENSE",
    "README.md",
    "README.md",
    "src/browser",
    ".vscode",
    "src/components",
    "src/modal",
    "src/scene",
  ],
  out: "./build/releases",
  overwrite: true,
  prune: true,
  version: "0.0.1",
  "version-string": {
    CompanyName: "Professional Tools",
    FileDescription:
      "Tools for Professional clients" /*This is what display windows on task manager, shortcut and process*/,
    OriginalFilename: "ProfessionalToolsBrowser",
    ProductName: "Professional Tools Browser",
    InternalName: "ProfessionalToolsBrowser",
  },
};
packager(options, function done_callback(err, appPaths) {
  console.log(err);
  console.log(appPaths);
});
