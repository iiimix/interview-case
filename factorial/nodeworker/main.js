
const {
  Worker
} = require('worker_threads');

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

function createPromise(start, end) {
  let begin = new Date().getTime()
  return new Promise((resolve, reject) => {
      let worker = new Worker('./worker.js');

      worker.on('message', res => {
        let finish = new Date().getTime();
        console.log(`P(${start}, ${end})耗时：${finish-begin}ms`)
        worker.terminate()
        resolve(res.total)
      });
      worker.postMessage({n: start, m: end});
  })
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

let P_CACHE = {}
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


/**
 * 
 * @param {*} n 
 * @param {*} exp 
 */
function promiseT(n, exp) {
  // T(n) n一般不会太大，不调用worker计算
  let start = new Date().getTime()
  return new Promise((resolve) => {
      let end = new Date().getTime()
      console.log('promiseT耗时：' + (end-start))
      resolve(Power(T(n), exp))
  })
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

testWorkerFastFactor(500000)