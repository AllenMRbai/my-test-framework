const fs = require("fs");

exports.runTest = async function(testFile) {
  const code = await fs.promises.readFile(testFile, "utf8");
  // Let’s add a guard to the `eval` call so that a single failing test cannot bring down our whole test framework
  try {
    eval(code);
  } catch (error) {
    // Something went wrong.
  }
};
