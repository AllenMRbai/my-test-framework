import JestHasteMap from "jest-haste-map";
import { cpus } from "os";
import { dirname, relative } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { Worker } from "jest-worker";
import { join } from "path";
import chalk from "chalk";

// Get the root path to our project (Like `__dirname`).
const root = dirname(fileURLToPath(import.meta.url));

// Need to use `.default` as of Jest 27.
// it is a powerful package to analyze projects and retrieve a list of files within it
const hasteMap = new JestHasteMap.default({
  extensions: ["js"],
  maxWorkers: cpus().length,
  name: "best-test-framework",
  platforms: [],
  rootDir: root,
  roots: [root],
});

const { hasteFS } = await hasteMap.build();
// 让我们的测试框架支持自定义过滤文件
// node index.mjs mock.test.js
const testFiles = hasteFS.matchFilesWithGlob([
  process.argv[2] ? `**/${process.argv[2]}*` : "**/*.test.js",
]);

const worker = new Worker(join(root, "worker.js"), {
  enableWorkerThreads: true,
});

let hasFailed = false;

await Promise.all(
  Array.from(testFiles).map(async (testFile) => {
    const { success, testResults, errorMessage } = await worker.runTest(
      testFile
    );
    const status = success
      ? chalk.green.inverse.bold(" PASS ")
      : chalk.red.inverse.bold(" FAIL ");

    console.log(status + " " + chalk.dim(relative(root, testFile)));
    if (!success) {
      hasFailed = true;
      // Make use of the rich testResults and error messages.
      if (testResults) {
        testResults
          .filter((result) => result.errors.length)
          .forEach((result) =>
            console.log(
              // Skip the first part of the path which is an internal token.
              result.testPath.slice(1).join(" ") + "\n" + result.errors[0]
            )
          );
        // If the test crashed before `jest-circus` ran, report it here.
      } else if (errorMessage) {
        console.log("  " + errorMessage);
      }
    }
  })
);

worker.end();

if (hasFailed) {
  console.log(
    "\n" + chalk.red.bold("Test run failed, please fix all the failing tests.")
  );
  // Set an exit code to indicate failure.
  // 非正常退出，后面的pipeline会停止运行
  process.exitCode = 1;
}
