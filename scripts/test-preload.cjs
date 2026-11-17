const Module = require("node:module");

const emptyServerOnly = require.resolve("server-only").replace(/index\.js$/, "empty.js");
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
  if (request === "server-only") {
    return emptyServerOnly;
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
