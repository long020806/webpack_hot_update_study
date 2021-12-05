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
let self = window;
(function(modules){
    let cache={};
    function hotCreateModule(){
        let hot = {
            _acceptDependencies:{},
            accept:function(deps,callback){//on
                deps.forEach(dep=>{
                    //_acceptDependencies["title.js"] = render
                    hot._acceptDependencies[dep] = callback;
                })
            },
            check:hotCheck
        }
        return hot;
    }
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
            //console.log(childModule)
            return childModule.exports;//返回子模块的导出对象
        }
        return hotRequire;
    }
    function hotDownloadMainfest(){
        return new Promise((resolve,reject)=>{
            let xhr = new XMLHttpRequest();
            let url = `main.${lastHash}.hot-update.json`;
            xhr.open("get",url);
            xhr.onreadystatechange = function(){
                if(xhr.status>=200&&xhr.status<400&&xhr.readyState==4){
                    resolve(JSON.parse(xhr.response));
                }
            } 
            xhr.send();
        })
    }
    function hotCheck(){
        // //console.log("hotCheck")
        hotDownloadMainfest().then(update=>{
            //{"version":3,"file":"main.f748365c9aa4df7adacb.hot-update.js","mappings":";;;;;UAAA","sources":["webpack://webpack_hot_update_study/webpack/runtime/getFullHash"],"sourcesContent":["__webpack_require__.h = () => (\"0546ea40fd3c55fe6e94\")"],"names":[],"sourceRoot":""}
            let chunkIds = update.c//Object.keys(update.c) 格式已更改为{c:["main"]}//main
            //console.log("chunkIds",chunkIds)
            chunkIds.forEach(chunkId=>{
                //console.log("chunkId:"+chunkId+" :chunkIds:forEach")
                hotDownloadUpdateChunk(chunkId);
            })
            lastHash = currentHash;
        }).catch((e)=>{
            //console.log(e)
            window.location.reload();
        })
    }
    function hotDownloadUpdateChunk(chunkId){
        // //console.log("请求update文件",`${chunkId}.${lastHash}.hot-update.js`)//因为版本不一致调用方法已更改为hot_update_study 暂时以自定义main.testhash,js
        
        let script = document.createElement("script");
        script.src = `${chunkId}.${lastHash}.hot-update.js`;
        // script.src = `main.testhash.hot-update.js`;
        document.head.append(script);

    }
    window.webpackHotUpdatewebpack_hot_update_study = function(chunkId, moreModules, runtime){
        hotAddUpdateChunk(chunkId,moreModules);
    }
    window.webpackHotUpdate= function(chunkId,moreModules){
        hotAddUpdateChunk(chunkId,moreModules);
    }
    let hotUpdate = {};
    function hotAddUpdateChunk(chunkId,moreModules){
        for(let moduleId in moreModules){
            modules[moduleId]=hotUpdate[moduleId] =moreModules[moduleId];
        }
        hotApply();
    }
    function hotApply(){
        for(let moduleId in hotUpdate){//./src/title.js ./src/tilte.js
            let oldModule = cache[moduleId];//老模块
            //console.log(`cache:${cache},oldModule:${oldModule},cache[moduleId]:${cache[moduleId]}`)
            delete cache[moduleId];//从缓存删除老模块
            // 循环夫模块
            oldModule.parents.forEach(parentModule=>{
                // 如果夫模块注册回调则执行
                let cb = parentModule.hot._acceptDependencies[moduleId];
                cb&&cb();

            })
        }
    }
    function __webpack_require__(moduleName){
        if(cache[moduleName]){
            return cache[moduleName]
        }
        let module =  cache[moduleName] = {
            i:moduleName,
            l:false,
            exports:{},
            hot:hotCreateModule(moduleName),
            parents:[],//父模块
            children:[]//子模块
        }
        modules[moduleName].call(module.exports,module,module.exports,hotCreateRequire(moduleName));
        l=true;
        return module.exports;
    }
    __webpack_require__.c = cache;
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
            module.hot.accept(["./src/title.js"], render);
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
            //console.log("ok")
            reloadApp();
        })

        function reloadApp(){
            hotEmitter.emit("webpackHotUpdate");
        }
    },
    "./lib/client/hot/dev-server.js":function(module,exports){
        hotEmitter.on("webpackHotUpdate",()=>{
            // //console.log("hotCheck");
            if(!lastHash){//没有上一次的编译结果则是第一次渲染
                lastHash = currentHash;
                //console.log(`lastHash:${lastHash},currentHash:${currentHash}`)
                return ;    
            }
            //console.log(`lastHash:${lastHash},currentHash:${currentHash}`)
            //调用module.hot.check向服务器检查更新并更新代码
            module.hot.check();
        });

    },
})