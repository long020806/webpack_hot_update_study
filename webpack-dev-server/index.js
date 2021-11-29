const webpack = require("webpack");
// 配置对象
const config = require("../webpack.config");
const Server = require("./lib/server/server")
    // 编译器对象
const compiler = webpack(config);
const server = new Server(compiler);


server.listen(9090, "localhost", () => {
    console.log("localhost:9090")
})