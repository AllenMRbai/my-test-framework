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
    // setTimeout是worker.js的上线文内容，我们没有通过context传到vm里面，所以沙箱里访问不到。
    // 同样的，所有通过上下文访问的变量都需要传到沙箱内，所以jest作者整合里一个 jest-environment-node ，将所有要用到的变量都整合一起
    const NodeEnvironment = require("jest-environment-node");
    const environment = new NodeEnvironment({
      testEnvironmentOptions: { describe, it, expect, mock },
    });
    vm.runInContext(code, environment.getVmContext());

    const { testResults } = await run();
    testResult.testResults = testResults;
    testResult.success = testResults.every((result) => !result.errors.length);
  } catch (error) {
    testResult.errorMessage = error.message;
  }
  return testResult;
};
