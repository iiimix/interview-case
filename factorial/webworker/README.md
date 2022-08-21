## 使用说明

### 方案一支持浏览器直接打开访问index1.html
在控制台调用
```
testOriginCost(num, debug)
num: 要计算的阶乘数
debug: 是否打印结果数字和数字长度（注意：控制台输出一个几万位的数字耗时非常严重）
```
```
testSmartCost(num, debug)
参数同上
```

### 方案二需要使用服务端访问，worker线程只支持同域请求
依赖
- 本地已经安装node环境
- 执行node server.js命令启动服务

- 利用worker多线程分段计算
testMultiWorkerCost(num, debug)
参数同上

- 缓存1e4倍数的阶乘结果，快速计算余数部分的阶乘
testWorkerCacheCost(num, debug)
