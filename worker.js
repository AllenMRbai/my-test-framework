const fs = require("fs");
const expect = require("expect");
const mock = require("jest-mock");
// 同样的，我们将 describe 和 it 封装成一个模块
const { describe, it, run } = require("jest-circus");

exports.runTest = async function(testFile) {
  const code = await fs.promises.readFile(testFile, "utf8");
  const testResult = {
    success: false,
    errorMessage: null,
  };
  try {
    eval(code);
    // node index.mjs circus
    const { testResults } = await run();
    testResult.testResults = testResults;
    testResult.success = testResults.every((result) => !result.errors.length);
  } catch (error) {
    testResult.errorMessage = error.message;
  }
  return testResult;
};
