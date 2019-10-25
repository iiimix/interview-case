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
T(999) = P(999, 499) * P(499, 249) * P(249, 125) * P(125, 61) * P(61, 31) * P(31)
T(499) =               p(499, 249) * P(249, 125) * P(125, 61) * P(61, 31) * P(31)
T(249) =                             P(249, 125) * P(125, 61) * P(61, 31) * P(31)
T(125) =                                           P(125, 61) * P(61, 31) * P(31)
T(61)  =                                                        P(61, 31) * P(31)
T(31)  =                                                                    P(31)


F(1000) = F(15) * Power(2, 983) * P(999, 499) * P(499, 249)^2 * P(249, 125)^3 * P(125, 61)^4 * P(61, 31)^5 * P(31)^6


*/

const F_CONST = {
    1: 1,
    3: 6,
    5: 120,
    7: 5040,
    9: 362880,
    11: 39916800,
    13: 6227020800,
    15: 1307674368000
}
/**
 * 
 * @param {正整数} n 
 * return n的阶乘
 */
// 得出等式：奇数和偶数的阶乘化简式
// (2k)!  = F(2k)   = Power(2, k) * F(k) * T(2k-1)
// (2k+1)! =F(2k+1) = Power(2, k) * F(k) * T(2k+1)
function F(n) {
    // 如果存在最小，则直接返回
    if(F_CONST[n]) return F_CONST[n];

    if(n & 0x01) {
        // 奇数
        let k = n>>1;
        return Power(2, k) * F(k) * T(n)
    } else {
        // 偶数
        let k = n>>1;
        return Power(2, k) * F(k) * T(n-1)
    }

}

/**
 * 
 * @param {底数} base
 * @param {幂} exp 
 */
function Power(base, exp, debug=false) {
    // let start = new Date().getTime()
    let result = BigInt(1)
    base = BigInt(base);
    while(exp) {
        if(exp % 2)
            result *= BigInt(base);
        base *= BigInt(base);
        exp >>= 1;
    }
    // let end = new Date().getTime()
    // debug && console.log('耗时：' + (end-start))
    return result;
}

/**
 * 
 * return n * (n-2) * (n-4) * ... * (2 or 1)
 */
function T(n) {
    
}