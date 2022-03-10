const fs = require("fs");
// expect方法内部有很多功能和特性，如果都写到这个文件里代码会变得很乱，我们将它抽取到单独模块内
// 这里的expect用到的是jest作者实现的库
const expect = require("expect");

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
