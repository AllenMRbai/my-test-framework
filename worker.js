const fs = require("fs");
const expect = require("expect");
const mock = require("jest-mock");
const { describe, it, run, resetState } = require("jest-circus");
// 很幸运，node提供了vm模块，可以用来做沙盒
const vm = require("vm");

exports.runTest = async function(testFile) {
  const code = await fs.promises.readFile(testFile, "utf8");
  const testResult = {
    success: false,
    errorMessage: null,
  };
  try {
    resetState();
    // 用vm来替代eval
    // 但运行 node index.mjs circus 时会报错 ReferenceError: setTimeout is not defined
    const context = { describe, it, expect, mock };
    vm.createContext(context);
    vm.runInContext(code, context);

    const { testResults } = await run();
    testResult.testResults = testResults;
    testResult.success = testResults.every((result) => !result.errors.length);
  } catch (error) {
    testResult.errorMessage = error.message;
  }
  return testResult;
};
