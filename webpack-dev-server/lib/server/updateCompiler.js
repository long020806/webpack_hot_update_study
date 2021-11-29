/**
 * 为了实现客户端和服务段实现通信
 * 向入口文件注入两个文件
 * (webpack)-dev-server/client/index.js
 * (webpack)/hot/dev-server.js webpack源码
 * ./src/index.js 
 * @param {*} compiler 
 */
const path = require("path")

function updateCompiler(compiler) {
    const config = compiler.options;
    config.entry = {
        main: [
            path.resolve(__dirname, "../client/index.js"),
            path.resolve(__dirname, "../hot/dev-server.js"),
            config.entry, //src/index.js
        ]
    }

}
module.exports = updateCompiler