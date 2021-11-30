// 链接socket服务器
//  <script src="/socket.io/socket.io.js"></script>给window.io赋值
const socket = io("/");
// 客户端记录当前hash值
let currentHash;
socket.io("hash", (hash) => {
    currentHash = hash;
})
socket.io("ok", () => {
    reloadApp();
})