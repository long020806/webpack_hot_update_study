/**
 * 村两个hash 一个是上一个hash 一个是最新hash
 */
let lastHash;
hotEmitter.on("webpackHotUpdate",()=>{
    console.log("hotCheck");
    if(lastHash!=currentHash){
        
    }
});
