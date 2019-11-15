#!/usr/bin/env node
const { spawn } = require("cross-spawn");
const ipc = require("node-ipc");
ipc.config.silent = true;

let appProc;

function watchIt([command, ...rest]) {
  appProc = spawn(command, rest);

  appProc.stdout.on("data", data => {
    let stringifiedData = data.toString();
    process.stdout.write(stringifiedData);
    if (stringifiedData.match(new RegExp(process.env.WAIT_FOR_MESSAGE, "i"))) {
      console.log("Restarting cypress tests!");
      const cypressWatcherId = "cypress-rerun-with-app";
      ipc.connectTo(cypressWatcherId, function() {
        ipc.of[cypressWatcherId].emit("message", "RESTART");
      });
    }
  });

  appProc.stderr.on("data", data => {
    process.stderr.write(data.toString());
  });
}

process.on("uncaughtException", exception => {
  process.exit(appProc.pid); // switched kill to exit, else invalid pid error on windows
  throw new Error(exception);
});

const myArgs = process.argv.splice(process.execArgv.length + 2);
watchIt(myArgs);
