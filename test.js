(function(modules) {
    // 缓存模块
    var installedModules = {};

    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) {
            // 如果已经缓存模块Id，直接返回
            return installedModules[moduleId];
        }
        // 创建并缓存
        let module = installedModules[moduleId] = {
            i: moduleId, //id标识符
            l: false, //loading 是否成功
            exports: {} //导出对象
        };
        // 执行并给module.exports赋值
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.l = true; //loading 完成
        console.log(`${moduleId} :\n ${module.exports}`)
        return module.exports;
    }
    return __webpack_require__("./src/index.js");
})({
    "./src/index.js": function(module, exports, __webpack_require__) {
        let render = () => {
            let title = __webpack_require__("./src/title.js");
        }
        render();
    },
    "./src/title.js": function(module, exports, __webpack_require__) {
        module.exports = "title";
    },
})