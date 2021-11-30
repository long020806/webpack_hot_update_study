class EventEmitter{
    constructor(){
        this.events = {};
    }
    on(eventName,fn){
        this.events[eventName] = fn;
    }
    emit(eventName,...args){
        this.events[eventName](...args);
    }
}
let hotEmitter = new EventEmitter();
let currentHash;
let lastHash;

(function(modules){
    let cache={};
    function hotCreateRequire(parentModuleId){//parenModuleId = "./src/index.js"
        let parentModule = cache[parentModuleId];//加载子模块时父模块必然加载过，可以通过id获取父模块
        // 如果缓存中没有此父模块对象，说明这是一个顶级模块则直接加载
        if(!parentModule) return __webpack_require__;
        let hotRequire = function(childModuleId){//./src/title.js   
            // 加载子模块
            __webpack_require__(childModuleId)//如果require则子模块会存在于缓存
            let childModule = cache[childModuleId];//从缓存获取子module
            childModule.parents.push(parentModule);//给子模块的parent添加
            parentModule.children.push(childModule)//靶子模块id添加到父模块children中
            console.log(childModule)
            return childModule.exports;//返回子模块的导出对象
        }
        return hotRequire;
    }
    function __webpack_require__(moduleName){
        if(cache[moduleName]){
            return cache[moduleName]
        }
        let module =  cache[moduleName] = {
            i:moduleName,
            l:false,
            exports:{},
            parents:[],//父模块
            children:[]//子模块
        }
        modules[moduleName].call(module.exports,module,module.exports,hotCreateRequire(moduleName));
        l=true;
        return module.exports;
    }
    return hotCreateRequire("./src/index.js")("./src/index.js");
    // return __webpack_require__("./src/index.js");
    
})({
    "./src/index.js":function(module,exports,__webpack_require__){
        //监听webpackHotUpdate消息
        __webpack_require__("./lib/client/hot/dev-server.js")
        // 发送更新通知
        __webpack_require__("./lib/client/index.js")
        let input = document.createElement("input")
        document.body.appendChild(input);
        let div = document.createElement("div")
        document.body.appendChild(div);
        let render = () => {
            let title = __webpack_require__("./src/title.js");
            div.innerHTML = title;
        }
        render();
        if (module.hot) {
            module.hot.accept(["./title.js"], render);
        }
    },
    "./src/title.js":function(module,exports){
        module.exports = "title";
    },
    "./lib/client/index.js":function(module,exports){
       
        const socket = window.io("/");
        socket.on("hash", (hash) => {
            currentHash = hash;
        })
        socket.on("ok", () => {
            console.log("ok")
            reloadApp();
        })

        function reloadApp(){
            hotEmitter.emit("webpackHotUpdate");
        }
    },
    "./lib/client/hot/dev-server.js":function(module,exports){
        hotEmitter.on("webpackHotUpdate",()=>{
            console.log("hotCheck");
        
        });

    },
})