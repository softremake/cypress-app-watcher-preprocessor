#!/usr/bin/env node
const { spawn } = require("child_process");
const ipc = require("node-ipc");
// ipc.config.silent = true;

function watchIt([command, ...rest]) {
  const appProc = spawn(myArgs[0], rest);

  appProc.stdout.on("data", data => {
    let stringifiedData = data.toString();
    process.stdout.write(stringifiedData);
    if (stringifiedData.match(process.env.WAIT_FOR_MESSAGE)) {
      console.log("Restarting cypress tests!");
      const cypressWatcherId = "cypress-rerun-with-app"
      ipc.connectTo(cypressWatcherId, function() {
        ipc.of[cypressWatcherId].emit("message", "RESTART");
      });
    }
  });

  appProc.stderr.on("data", data => {
    process.stderr.write(data.toString());
  });
}

const myArgs = process.argv.splice(process.execArgv.length + 2);
watchIt(myArgs);