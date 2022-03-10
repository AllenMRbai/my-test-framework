const fs = require("fs");
const expect = require("expect");
// 我们测试的过程中可能需要用到测试框架的mock共
// 这个功能我们就不去实现了，直接使用jest作者开发的jest-mock
const mock = require("jest-mock");

exports.runTest = async function(testFile) {
  const code = await fs.promises.readFile(testFile, "utf8");
  const testResult = {
    success: false,
    errorMessage: null,
  };
  try {
    eval(code);
    testResult.success = true;
  } catch (error) {
    testResult.errorMessage = error.message;
  }
  return testResult;
};
