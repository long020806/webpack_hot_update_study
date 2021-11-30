const express = require("express");
const http = require("http");
const path = require("path")
const socketIO = require("socket.io")
    // const MemoryFileSystem = require("memory-fs");暂时存在问题先用fs模块
    // var fs = new MemoryFileSystem();
const fs = require("fs")
const mime = require("mime")
const updateCompiler = require("./updateCompiler.js")
class Server {
    constructor(compiler) {
        this.compiler = compiler; //保存编译对象
        updateCompiler(compiler)
        this.setupApp(); // 创建app
        this.currentHash; //当前hash值，每次编译都会产生一个hash值
        this.currentSocketList = []; //存放所有的通过websocket链接到服务器的客户端
        this.setupHooks(); //建立 钩子函数
        this.setupDevMiddleware(); //建立开发中间件
        this.routes(); //配置路由
        this.createServer(); //创建http服务器 以app作为路由
        this.createSocketServer(); //创建socket服务器

    }
    createSocketServer() {
        const io = socketIO(this.server); //websocket依赖http服务器
        // 服务端监听客户端链接，当客户端链接 socket代表客户端的链接对象
        io.on("connettion", (socket) => {
            console.log("一个客户端已经连接")
            this.currentSocketList.push(socket); //把新的socket放入socketList触发钩子函数时才能完成操作
            socket.emit("hash", this.currentHash); //将最新的hash发给客户端
            socket.emit("ok"); //给客户端发送ok
            //如果客户端断开链接从socketList移除
            socket.on("disconenct", (socket) => {
                let idx = this.currentSocketList.indexOf(socket);
                this.currentSocketList.splice(idx, 1)
            })
        });

    }
    routes() {
        let { compiler } = this;
        let config = compiler.options;
        this.app.use(this.middleware(config.output.path));
    }
    setupDevMiddleware() {
        this.middleware = this.webpackDevMiddleware(); //返回express中间件
    }
    webpackDevMiddleware() {
        const { compiler } = this;
        compiler.watch({}, () => {
            console.log("以监听模式启动编译")
        });
        // const fs = new MemoryFs(); //内存文件系统实例 memory-fs 暂时无法读到文件
        // 以后打包的文件写入内存文件系统
        this.fs = compiler.ouputFileSystem = fs;
        // 返回一个中间件，响应客户端产出的文件请求 index.html,main.js,json
        return (staticDir) => { //静态文件根目录，他其实是输出目录dist
            return (req, res, next) => {
                let { url } = req; //得到请求路径
                if (url === '/favicon.icon') {
                    return res.sendStatus("404")
                }
                url === '/' ? url = "/index.html" : null;
                //得到要访问的静态路径 /html  e:\....\index.html
                let filePath = path.join(staticDir + url);
                try {
                    // 返回文件的描述对象,如果文件不存在会抛异常
                    let statObject = this.fs.statSync(filePath);
                    // console.log(statObject)
                    if (statObject.isFile()) {
                        // 读取内容
                        let content = this.fs.readFileSync(filePath);
                        // 设置响应头 此文件内容是什么
                        res.setHeader("Content-Type", mime.getType(filePath)); //mime.getType(filePath);mime暂时报错先手动写
                        // 把内容发送给浏览器
                        res.send(content);
                    } else {
                        return res.sendStatus("404")
                    }
                } catch (err) {
                    console.log(err)
                    return res.sendStatus("404")
                }
            }
        }
    }
    setupApp() {
        this.app = express(); //执行express函数得到this.app 代表应用对象

    }
    createServer() {
        // this.app是路由中间件
        this.server = http.createServer(this.app);
    }
    listen(port, host, callback) {
        this.server.listen(port, host, callback);
    }
    setupHooks() {
        let { compiler } = this;
        // 编译完成事件 当编译完成会调用此钩子函数
        compiler.hooks.done.tap("webpack-dev-server", (stats) => {
            // stats是描述对象，里面放着打包的结果 hash chunkHash contentHash 产生了哪些代码块产生了哪些模块
            console.log("hash", stats.hash);
            this.currentHash = stats.hash;
            // 向所有客户段广播，告诉客户端编译成功，模块生成完毕，拉取代码
            this.currentSocketList.forEach(socket => {
                socket.emit("hash", this.currentHash); //将最新的hash发给客户端
                socket.emit("ok"); //给客户端发送ok
            })

        });
    }
}
module.exports = Server