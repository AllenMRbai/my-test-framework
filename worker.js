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

  let testName; // Use this variable to keep track of the current test.
  try {
    const describeFns = [];
    let currentDescribeFn;
    const describe = (name, fn) => describeFns.push([name, fn]);
    const it = (name, fn) => currentDescribeFn.push([name, fn]);
    eval(code);
    for (const [name, fn] of describeFns) {
      currentDescribeFn = [];
      testName = name;
      fn();

      currentDescribeFn.forEach(([name, fn]) => {
        testName += " " + name;
        fn();
      });
    }
    testResult.success = true;
  } catch (error) {
    testResult.errorMessage = testName + ": " + error.message;
  }

  return testResult;
};
