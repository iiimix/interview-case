/**
 * 计算n * (n-2) * (n - 4) * ... * m+2
 * @param {*} n 
 * @param {*} m 
 */
onmessage = function(ev) {
    let {n, m} = ev.data;
    // console.log(n, m)
    n = BigInt(n);
    let s = 1n;
    while(n > m) {
        s *= n;
        n -= 2n;
    }
    // 返回计算结果total
    postMessage({total: s})
    // 关闭子线程，避免内存泄露
    self.close();
}