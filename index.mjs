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

// 我们都知道javascript是单线程的，Promise只是异步，并不是真正的多线程
// 我们需要尽可能多的利用CPU来提高我们的运行效率。我们可以用node的工作线程 worker_threads
// const worker = require('worker_threads');
// 这里用的是 jest-worker，一个基于worker_threads封装的包，使用更便捷
// 运行后，发现打印的内容是乱序的
await Promise.all(
  Array.from(testFiles).map(async (testFile) => {
    const { success, errorMessage } = await worker.runTest(testFile);
    // 为了便于阅读，我们用chalk将输出内容进行美化
    const status = success
      ? chalk.green.inverse.bold(" PASS ")
      : chalk.red.inverse.bold(" FAIL ");

    console.log(status + " " + chalk.dim(relative(root, testFile)));
    if (!success) {
      console.log("  " + errorMessage);
    }
  })
);

worker.end(); // Shut down the worker.
