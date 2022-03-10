const fs = require("fs");

exports.runTest = async function(testFile) {
  const code = await fs.promises.readFile(testFile, "utf8");
  // 这里暂时用eval来运行需要测试的代码
  // 现在运行它应该会报 ReferenceError: expect is not defined ,因为上下文里没有expect方法。
  eval(code);
};
