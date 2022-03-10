const fs = require("fs");

exports.runTest = async function(testFile) {
  const code = await fs.promises.readFile(testFile, "utf8");
  const testResult = {
    success: false,
    errorMessage: null,
  };
  try {
    // 实现expect方法
    // eval内运行的代码能够读取到worker.js的上下文，所以 ReferenceError: expect is not defined 就没了
    const expect = (received) => ({
      toBe: (expected) => {
        if (received !== expected) {
          throw new Error(`Expected ${expected} but received ${received}.`);
        }
        return true;
      },
    });
    eval(code);
    testResult.success = true;
  } catch (error) {
    testResult.errorMessage = error.message;
  }
  return testResult;
};
