const banana = require("./banana.js");

// 运行这个test，会报错 require is not defined
// 因为我们没有将require和module传个沙盒
// 但我们不能只讲将worker.js内的require传给沙盒，因为worker.js和当前测试的文件不在同一个路径。
it("tastes good", () => {
  expect(banana).toBe("good");
});
