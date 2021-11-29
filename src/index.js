let input = document.createElement("input")
document.body.appendChild(input);


let div = document.createElement("div")
document.body.appendChild(div);

let render = () => {
    let title = require("./title.js");
    div.innerHTML = title;
}
render();
// 如果当前模块支持热更新的话
if (module.hot) {
    // 注册回调 当前的index.js模块接收title.js 变更，当title.js改变会调用render
    module.hot.accept(["./title.js"], render);
}