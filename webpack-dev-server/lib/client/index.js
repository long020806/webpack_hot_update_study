// 链接socket服务器
//  <script src="/socket.io/socket.io.js"></script>给window.io赋值
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
const socket = window.io("/");
// 客户端记录当前hash值
let currentHash;
socket.io("hash", (hash) => {
    currentHash = hash;
})
socket.io("ok", () => {
    console.log("ok")
    reloadApp();
})

function reloadApp(){
    hotEmitter.emit("webpackHotUpdate");
}