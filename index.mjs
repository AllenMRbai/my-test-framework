import JestHasteMap from "jest-haste-map";
import fs from "fs";
import { cpus } from "os";
import { dirname } from "path";
import { fileURLToPath } from "url";

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
// We built a virtual filesystem of all `.js` files, so we need to apply a filter to limit ourselves to `.test.js` files.
const testFiles = hasteFS.matchFilesWithGlob(["**/*.test.js"]);

await Promise.all(
  Array.from(testFiles).map(async (testFile) => {
    const code = await fs.promises.readFile(testFile, "utf8");
    console.log(testFile + ":\n" + code);
  })
);
