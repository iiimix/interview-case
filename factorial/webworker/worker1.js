
// console.log(self)
// console.log("workName::::" + self.name)
/**
 * 从整数n乘到m
 * @param {*} n 
 * @param {*} m 
 */
onmessage = function(ev) {
    let {n, m} = ev.data;
    console.log(n,m)
    let s = BigInt(1);
    for (let i = n; i < m+1; i++) {
        s *= BigInt(i)
    }
    // 返回计算结果total
    postMessage({total: s})
    // 关闭子线程，避免内存泄露
    self.close();
}

