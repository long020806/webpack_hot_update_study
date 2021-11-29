const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const { HotModuleReplacementPlugin } = require("webpack");
const webpack = require("webpack");
module.exports = {
    mode: "development",
    devtool: "source-map",
    // entry里可以配置多个入口，每个入口有一个名称默认时main
    // 从入口文件出现进行编译，找到他们的依赖，打包在一起，就会i成为chalk代码块
    entry: "./src/index.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist")
    },
    devServer: {
        hot: true
    },
    plugins: [
        new HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin(), //产出html文件插件自动插入生成的脚本
    ]
}