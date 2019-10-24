/**
 * 计算n的阶乘问题
 */

// 


function factorial(n) {
    if(n === 1) return BigInt(1);
    return BigInt(n) * factorial(n-1)
}

/**
 * 从整数n乘到m
 * @param {*} n 
 * @param {*} m 
 */
function rangePower(n, m) {
    // console.log(n,m)
    let s = BigInt(1);
    for (let i = n; i < m+1; i++) {
        s *= BigInt(i)
    }
    return s;
}

// 存放1-10000, 10001-20000，20001-30000 的数乘积，依次类推
let cacheList = []
let cacheMap = {}   // 缓存cacheList前n项的积

function subCacheFactor(n) {
    // 使用缓存
    if(n == 1) {
        return cacheList[0];
    }
    if(cacheMap[n]) return cacheMap[n]
    cacheMap[n] = cacheList[n-1] * subCacheFactor(n-1);
    return cacheMap[n];
}

// n大于11378
function smartFactor(n) {
    if(n < 1e4) {
        return factorial(n)
    }
    let origin = n;
    let rangeNum = 0;   // 表示有多少个一万
    while(n >= 1e4) {
        rangeNum ++;
        n -= 1e4;
    }
    let remainIndex = origin % 1e4;        // 取10000的余数，剩余的数字起始值
    // 使用cache缓存
    if(cacheList.length < rangeNum) {
        // 超过了cache的范围，补充进去
        for (let i = cacheList.length; i < rangeNum; i++) {
            cacheList.push(rangePower(i * 1e4 +1, (i+1)*1e4))
        }
    }
    let remains = BigInt(1);
    if(remainIndex > 0) {
        remains = rangePower(rangeNum*1e4+remainIndex+1, origin)
    }

    // 计算1-n的乘积
    // for (let i = 0; i < rangeNum; i++) {
    //     remains *= cacheList[i]
    // }
    if(rangeNum>0 ) {
        remains = remainIndex > 0 ? remains * subCacheFactor(rangeNum) : subCacheFactor(rangeNum)
    }
    return remains
}


function testOriginCost(n, debug) {
    let start1 = new Date().getTime()
    let result = factorial(n);  // stack will overflow in 11378
    let end1 = new Date().getTime()
    if(debug) {
        console.log(n+'的阶乘结果位数：'+ result.toString().length)
        // console.log(result.toString())
    }
    console.log('costs ' + (end1 - start1) + ' ms')
}

function testSmartCost(n, debug) {
    /**
     * 100001阶乘   耗时9693-9777
     * 90000阶乘    耗时
     */
    let start1 = new Date().getTime()
    let result2 = smartFactor(n);
    let start2 = new Date().getTime()
    if(debug) {
        let res = result2.toString()
        console.log(n+'的阶乘结果位数：'+ res.length) // 计算length耗时严重
        console.log('结果的前30位是： ' + res.substring(0, 30))
        let end2 = new Date().getTime()
        console.log('输出打印耗时 ' + (end2 - start2) + ' ms')
    }
    console.log(n+'的阶乘耗时 ' + (start2 - start1) + ' ms')
}