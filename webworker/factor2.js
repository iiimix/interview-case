/**
 * worker方式处理计算
 * 
 */
function factorial(n) {
    if(n === 1) return BigInt(1);
    return BigInt(n) * factorial(n-1)
}

function testOriginalCost(n, debug) {
    let start1 = new Date().getTime()
    let res = factorial(n)
    let start2 = new Date().getTime()
    if(debug) {
        let s = res.toString();
        console.log(n+'的阶乘结果位数：'+ s.length) // 计算length耗时严重
        console.log(n+'的阶乘前30位：'+ s.substring(0,30))
        let end2 = new Date().getTime()
        console.log('输出打印耗时 ' + (end2 - start2) + ' ms')
    }
    console.log(n+'的阶乘计算耗时 ' + (start2 - start1) + ' ms')
}

/**
 * 
 * @param {*} n 
 * 实验用例100w-900w
 * 实验结果193ms - 900ms
 */
async function testMultiWorkerCost(n, debug=false) {
    let start1 = new Date().getTime()
    let result2 = await multiWorkerFactor(n);
    let start2 = new Date().getTime()
    if(debug) {
        let s = result2.toString();
        console.log(n+'的阶乘结果位数：'+ s.length) // 计算length耗时严重
        console.log(n+'的阶乘前30位：'+ s.substring(0,30))
        let end2 = new Date().getTime()
        console.log('输出打印耗时 ' + (end2 - start2) + ' ms')
    }
    console.log(n+'的阶乘计算耗时 ' + (start2 - start1) + ' ms')
}
/**
 * 
 * @param {*} n 
 * 实验数据100w-9000w
 * 实验结果大于10s
 */
async function testSingleWorkerCost(n) {
    let start1 = new Date().getTime()
    let result2 = await singleWorkerFactor(n);
    let start2 = new Date().getTime()
    let end2 = new Date().getTime()
    console.log('输出打印耗时 ' + (end2 - start2) + ' ms')
    console.log(n+'的阶乘计算耗时 ' + (start2 - start1) + ' ms')
}

async function testWorkerCacheCost(n, debug=false) {
    let start1 = new Date().getTime()
    let result2 = await cacheWorkerFactor(n);
    let start2 = new Date().getTime()
    if(debug) {
        let s = result2.toString();
        console.log(n+'的阶乘结果位数：'+ s.length) // 计算length耗时严重
        console.log(n+'的阶乘前30位：'+ s.substring(0,30))
        let end2 = new Date().getTime()
        console.log('输出打印耗时 ' + (end2 - start2) + ' ms')
    }
    console.log(n+'的阶乘计算耗时 ' + (start2 - start1) + ' ms')
}

const GLOBAL_NUM_SPAN = 1e4;

function multiWorkerFactor(num, span){
    if(num < 11378) {
        return new Promise(resolve=> {
            resolve(factorial(num))
        })
    }
    // 取总数量的算术平方根最相近的整数，尽量减少计算次数??? 答案是否定的
    return new Promise((resolve, reject) => {
        let promiseList = [];
        const LOCAL_NUM_SPAN = span || GLOBAL_NUM_SPAN // Math.floor(Math.sqrt(num))
        let times = Math.floor(num / LOCAL_NUM_SPAN);
        console.log(times)
        for (let i = 0; i <= times; i++) {
            let start = i * LOCAL_NUM_SPAN +1, end = (i+1)*LOCAL_NUM_SPAN;
            if(i === times) {
                // 剩余数的乘积
                start = times*LOCAL_NUM_SPAN+1;
                end = num;
            }
            let promise = new Promise((resolve, reject) => {
                // 分段计算
                let worker = new Worker('/work.js');
                worker.postMessage({n: start, m: end})
                worker.onmessage = function(res) {
                    resolve(res.data.total)
                }
            })
            promiseList.push(promise);
        }
        Promise.all(promiseList).then(list => {
            // list数组结果相乘即为阶乘结果
            let s = BigInt(1);
            resolve(list.reduce((pre, curr) => pre * curr, s))
        })
    })
}

// 存放1-10000, 10001-20000，20001-30000... 的数乘积，依次类推
let cacheList = []
// 缓存cacheList前n项的积
let cacheMap = {}

/**
 * 取n得阶乘结果的缓存
 * @param {*} n 
 */
function subCacheFactor(n) {
    // 使用缓存
    if(n == 1) {
        return cacheList[0];
    }
    if(cacheMap[n]) return cacheMap[n]
    cacheMap[n] = cacheList[n-1] * subCacheFactor(n-1);
    return cacheMap[n];
}

function cacheWorkerFactor(num, span) {
    // 11378以内，原始方法计算最快
    if(num < 11378) {
        return new Promise(resolve=> {
            resolve(factorial(num))
        })
    }
    
    return new Promise((resolve, reject) => {
        let promiseList = [];
        const LOCAL_NUM_SPAN = span || GLOBAL_NUM_SPAN
        let times = Math.floor(num / LOCAL_NUM_SPAN);
        // 1e4取模余数
        let modRemainIndex = num % LOCAL_NUM_SPAN;
        console.log(times)
        // 判断缓存数据是否已经覆盖
        if(cacheList.length < times) {
            // 超过了cache的范围，补充进去
            for (let i = cacheList.length; i < times; i++) {
                promiseList.push(createPromiseWorker(i * LOCAL_NUM_SPAN +1, (i+1)*LOCAL_NUM_SPAN))
            }
        }
        if(modRemainIndex > 0) {
            promiseList.push(createPromiseWorker(times*LOCAL_NUM_SPAN +1, num))
        }

        if(promiseList.length > 0) {
            Promise.all(promiseList).then(list => {
                let tailValue = BigInt(1);
                if(modRemainIndex > 0) {
                    // 末尾乘积
                    tailValue = list.pop()
                    cacheList = cacheList.concat(list)
                    resolve(tailValue * subCacheFactor(times))
                } else {
                    cacheList = cacheList.concat(list)
                    resolve(subCacheFactor(times))
                }
            })
        } else {
            // 完全命中缓存
            resolve(subCacheFactor(times))
        }
    })
}

function singleWorkerFactor(num) {
    return new Promise((resolve, reject) => {
        //开启计算独立子线程，充分利用cpu资源
        let worker = new Worker('/work.js');
        worker.postMessage({n: 1, m: num})
        worker.onmessage = function(res) {
            resolve(res.data.total)
        }
    })
}

function createPromiseWorker(start, end) {
    return new Promise((resolve, reject) => {
        // 分段计算
        let worker = new Worker('/work.js');
        worker.postMessage({n: start, m: end})
        worker.onmessage = function(res) {
            resolve(res.data.total)
        }
    })
}