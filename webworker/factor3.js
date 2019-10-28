/*

思路：
设定函数
F(n) = n * (n-1) * (n-2)* ... * 1               // 即阶乘函数
T(n) = n * (n-2) * (n-4) * ... * (2 or 1)       // 减2的阶乘
Power(n, exp) = n ^ exp                         // 幂函数

得出等式：奇数和偶数的阶乘化简式
(2k)!  = F(2k)   = Power(2, k) * F(k) * T(2k-1)
(2k+1)! =F(2k+1) = Power(2, k) * F(k) * T(2k+1)

例如：
F(1000) = Power(2, 500) * T(999) * F(500) 
        = Power(2, 750) * T(999) * T(499) * F(250)
        = Power(2, 875) * T(999) * T(499) * T(249) * F(125)
        = Power(2, 937) * T(999) * T(499) * T(249) * T(125) * F(62)
        = Power(2, 968) * T(999) * T(499) * T(249) * T(125) * F(61) * F(31)
        = Power(2, 983) * T(999) * T(499) * T(249) * T(125) * F(61) * F(31) * F(15)
        ...

设：n,m为奇数，0 <= m <= n
P(n, m) = n * (n-2) * ...* (m+2)
T(n) = P(n, -1) = P(n, m) * P(m, -1)

则
T(999) = P(999, 499) * P(499, 249) * P(249, 125) * P(125, 61) * P(61, 31) * T(31)
T(499) =               p(499, 249) * P(249, 125) * P(125, 61) * P(61, 31) * T(31)
T(249) =                             P(249, 125) * P(125, 61) * P(61, 31) * T(31)
T(125) =                                           P(125, 61) * P(61, 31) * T(31)
T(61)  =                                                        P(61, 31) * T(31)
T(31)  =                                                                    T(31)


F(1000) = F(15) * Power(2, 983) * P(999, 499) * P(499, 249)^2 * P(249, 125)^3 * P(125, 61)^4 * P(61, 31)^5 * T(31)^6

例如：
F(100)  = T(99) * F(50) * power(50)
        = T(99) * T(49) * F(25) * power(50+25)
        = T(99) * T(49) * T(25) * F(12) * power(50+25+12)
        = T(99) * T(49) * T(25) * T(11) * F(6) * power(50+25+12+6)
        = T(99) * T(49) * T(25) * T(11) * T(5) * F(3) * power(50+25+12+6+3)
        = Tmap([99,49,25,11,5]) * F(3) * power(2, 96)

F(133)  = T(133) * F(66) * power(66)
        = T(133) * T(65) * F(33) * power(66+33)
        = T(133) * T(65) * T(33) * F(16) * power(66+33+16)
        = T(133) * T(65) * T(33) * T(15) * F(8) * power(66+33+16+8)
        = Tmap([133,65,33,15]) * F(8) * power(2, 123)

*/

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
/**
 * 
 * @param {正整数} n 
 * return n的阶乘
 */
// 得出等式：奇数和偶数的阶乘化简式
// (2k)!  = F(2k)   = Power(2, k) * F(k) * T(2k-1)
// (2k+1)! =F(2k+1) = Power(2, k) * F(k) * T(2k+1)
function F(n, debug) {
    let result = {
        power: 0,
        TList: [],
        FTail: 1
    }
    let start = new Date().getTime()
    FF(n, result)
    let end = new Date().getTime()
    debug && console.log('FF耗时：' + (end-start))
    return Power(2, result.power, debug) * optimizeTMap(result.TList) * result.FTail       // TMap优化方案
    // return Power(2, result.power, debug) * TMap(result.TList) * result.FTail            // TMap原始方案
}

/**
 * 
 * @param {*} n 
 * return {
 *      power: num,
 *      TList: [],
 *      FTail: f
 * }
 */
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
 */
function Power(base, exp, debug) {
    let start = new Date().getTime()
    let result = BigInt(1)
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
 * return n * (n-2) * (n-4) * ... * (2 or 1)
 * 
 *      设：n,m为奇数，0 <= m <= n
 *      P(n, m) = n * (n-2) * ...* (m+2)
 *      T(n) = P(n, -1) = P(n, m) * P(m, -1)
 * 
 */
function P(n, m) {
    let start = n;
    let end = m;
    let key = n+''+m
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
        if(index === cursor) return Power(T(v), index + 1)
        return Power(P(v, o[index+1]), index + 1)
    }).reduce((pre, current) => pre * current, 1n)
    let end = new Date().getTime()
    debug && console.log('optimizeTMap耗时：' + (end-start))
    return res
}


function testFastFactor(n, debug) {
    let start1 = new Date().getTime()
    let result2 = F(n, true);
    let start2 = new Date().getTime()
    if(debug) {
        let s = result2.toString();
        console.log(n+'的阶乘结果位数：'+ s.length) // 计算length耗时严重
        console.log(n+'的阶乘：'+ s)
        let end2 = new Date().getTime()
        console.log('输出打印耗时 ' + (end2 - start2) + ' ms')
    }
    console.log(n+'的阶乘计算耗时 ' + (start2 - start1) + ' ms')
}

