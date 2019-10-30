const F_CONST = {
    1: 1n,
    2: 2n,
    3: 6n,
    4: 24n,
    5: 120n,
    6: 720n,
    7: 5040n,
    8: 40320n,
    9: 362880n,
    10: 3628800n,
    11: 39916800n,
    12: 479001600n,
    13: 6227020800n,
    14: 87178291200n,
    15: 1307674368000n,
    16: 20922789888000n,
    17: 355687428096000n,
    18: 6402373705728000n,
    19: 121645100408832000n,
    20: 2432902008176640000n
}

async function F(n, debug) {
    let result = {
        power: 0,
        TList: [],
        FTail: 1
    }
    let start = new Date().getTime()
    FF(n, result)
    let end = new Date().getTime()
    debug && console.log('FF耗时：' + (end-start))
    return Power(2, result.power, debug) * await multiWorkerTMap(result.TList, debug) * result.FTail       // TMap优化方案
}

function FF(n, result) {
    // 如果存在最小，则直接返回
    if(F_CONST[n]) {
        result.FTail = F_CONST[n];
        return
    }

    let k = n>>1;
    result.power += k;
    result.TList.push(n & 0x01 ? n: n-1)
    FF(k, result)
}

/**
 * 
 * @param {底数} base
 * @param {幂} exp
 * @returns {}
 */
function Power(base, exp, debug) {
    let start = new Date().getTime()
    let result = 1n
    base = BigInt(base);
    while(exp) {
        if(exp % 2)
            result *= BigInt(base);
        base *= BigInt(base);
        exp >>= 1;
    }
    let end = new Date().getTime()
    debug && console.log('power耗时：' + (end-start))
    return result;
}


const T_CACHE = {}
/**
 * 
 * @param n 为奇数
 * return n * (n-2) * (n-4) * ... * (2 or 1)
 */
function T(n) {
    let origin = n;
    n = BigInt(n)
    if(T_CACHE[n]) return T_CACHE[n];
    let base = 1n;
    while(n > 0) {
        base *= n
        n -= 2n;
    }
    T_CACHE[origin] = base;
    return base;
}

let P_CACHE = {}
/**
 * 
 * @param n 为奇数
 * @return n * (n-2) * (n-4) * ... * (m + 2)
 * 
 */
function P(n, m) {
    let key = n+'_'+m
    n = BigInt(n)
    m = BigInt(m)
    if(P_CACHE[key]) return P_CACHE[key];
    let base = 1n;
    while(n > m) {
        base *= n
        n -= 2n;
    }
    P_CACHE[key] = base;
    return base;
}

/**
 * 
 * @param {*} n 
 * @param {*} exp 
 */
function promiseT(n, exp) {
    // T(n) n一般不会太大，不调用worker计算
    return new Promise((resolve) => {
        resolve(Power(T(n), exp))
    })
}

/**
 * 
 * @param {*} n 
 * @param {*} m 
 * @param {*} exp 
 * 
 * @return [n * (n-2) * (n-4) * ... * (m+2)]^exp
 * 
 */
function promiseP(n, m, exp) {
    let key = `${n}_${m}_${exp}`
    if(P_CACHE[key]){
        return new Promise((resolve) => {
            resolve(P_CACHE[key])
        })
    }
        
    if(n < 1e4) {
        // 小于1w，不用分段计算
        return new Promise((resolve) => {
            P_CACHE[key] = Power(P(n, m), exp);
            resolve(P_CACHE[key])
        })
    }
    return new Promise((resolve, reject) => {
        // 分段计算
        let promiseList = []

        let i = n - 1e4;
        let start = n;
        while(i > 1e4 && i > m) {
            promiseList.push(createPromise(start, i))
            start = i;
            i -= 1e4;
        }
        // 末尾的数
        promiseList.push(createPromise(start, m))
        
        Promise.all(promiseList).then(list => {
            P_CACHE[key] = Power(list.reduce((pre, current) => pre * current, 1n), exp)
            resolve(P_CACHE[key])
        })
    })
}

function createPromise(start, end) {
    return new Promise((resolve, reject) => {
        // 分段计算
        let worker = new Worker('/worker4.js');
        worker.postMessage({n: start, m: end})
        worker.onmessage = function(res) {
            resolve(res.data.total)
        }
    })
}

/**
 * list中的每一个数都调用函数T，返回调用结果的乘积
 * @param {*} list
 */
function TMap(list) {
    let start = new Date().getTime()
    let res = list.map(v => T(v)).reduce((pre, current) => pre * current, 1n);
    let end = new Date().getTime()
    debug && console.log('Tmap耗时：' + (end-start))
    return res
}

/**
 * 优化版的Tmap
 * list中的每一个数都调用函数T，返回调用结果的乘积
 * @param {*} list
 * list中的数字均为奇数且由大到小出现
 * 可分段求出每段的乘积，然后再组合成对应单项的多次方
 * 
 * 如： list:[999, 499, 249, 125, 61, 31] = P(999, 499) * P(499, 249)^2 * P(249, 125)^3 * P(125, 61)^4 * P(61, 31)^5 * P(31)^6
 * 
 * 
例如：
F(100)  = T(99) * F(50) * power(50)
        = T(99) * T(49) * F(25) * power(50+25)
        = T(99) * T(49) * T(25) * F(12) * power(50+25+12)
        = optimizeTMap([99,49,25]) * F(12) * power(50+25+12)
        = P(99, 49) * p(49, 25)^2 * T(25)^3 * F(12) * power(2, 87)

F(133)  = T(133) * F(66) * power(66)
        = T(133) * T(65) * F(33) * power(66+33)
        = T(133) * T(65) * T(33) * F(16) * power(66+33)
        = optimizeTMap([133,65,33]) * F(16) * power(2, 66+33)
        = P(133, 65) * p(65, 33)^2 * T(33)^3 * F(16) * power(2, 99)

 * 
 */
function optimizeTMap(list) {
    let start = new Date().getTime()
    let cursor = list.length-1;
    let res = list.map((v, index, o) => {
        // 最后一项，直接求T(v)的长度次方
        if(index === cursor) return Power(T(v), index + 1)
        // 其他项求P(n, m)
        return Power(P(v, o[index+1]), index + 1)
    }).reduce((pre, current) => pre * current, 1n)
    let end = new Date().getTime()
    debug && console.log('optimizeTMap耗时：' + (end-start))
    return res
}

const TMap_CACHE = {}
/**
 * 
 * @param {*} list 
 * 使用worker多线程计算大数P
 */
function multiWorkerTMap(list, debug) {
    let start = new Date().getTime()
    let key = list.join(',')
    if(TMap_CACHE[key]) {
        let end = new Date().getTime()
        debug && console.log('multiWorkerTMap耗时：' + (end-start))
        return TMap_CACHE[key]
    }
    let cursor = list.length-1;
    let promiseList = []
    for (let index = 0; index < list.length; index++) {
        let promise, v = list[index];
        
        if(index === cursor) {
            // 最后一项，直接求T(v)的长度次方
            // Power(T(v), index + 1)
            promise = promiseT(v, index + 1)
        } else {
            // 其他项求 Power(P(n, m), index+1)
            promise = promiseP(v, list[index+1], index + 1)
        }
        promiseList.push(promise)
        
        
    }
    return new Promise((resolve, reject) => {
        Promise.all(promiseList).then(list => {
            let result = list.reduce((pre, current) => pre * current, 1n)
            TMap_CACHE[key] = result
            let end = new Date().getTime()
            debug && console.log('multiWorkerTMap耗时：' + (end-start))
            resolve(result)
        })
    })
}


async function testWorkerFastFactor(n, debug) {
    let start1 = new Date().getTime()
    let result2 = await F(n, true);
    let start2 = new Date().getTime()
    if(debug) {
        let s = result2.toString();
        console.log(n+'的阶乘结果位数：'+ s.length) // 计算length耗时严重
        console.log(n+'的阶乘：'+ s.substring(0, 100))
        let end2 = new Date().getTime()
        console.log('输出打印耗时 ' + (end2 - start2) + ' ms')
    }
    console.log(n+'的阶乘计算耗时 ' + (start2 - start1) + ' ms')
}


/**
 * 附阶乘的前100位
 * 100000!  = 2824229407960347874293421578024535518477494926091224850578918086542977950901063017872551771413831163
 * 200000!  = 1420225345470314404966946333682305976089965356746401622696224744629226778516099685650082553407879081
 * 300000!  = 1477391531738039094292907474935614145499320519523744087957913843765052401351703476532418899010198829
 * 500000!  = 1022801584651902365330917440571931337926286208272242484080831292070902404683458581381075725198198342..
 * 1000000! = 8263931688331240062376646103172666291135347978963873045167775885563379611035645084446530511311463973
 * 
 */
