// 实现一个repeat函数，要求每隔3000ms执行一次alert，支持指定执行次数

// const repeatFn = repeat(console, 4, 3000);
// repeatFn('hello world');


// 解法一
let repeat = function(fn, times, wait) {
  const rescurion = function(times) {
    return function(...arg) {
      fn.apply(null, arg);
      if (times > 0) {
        setTimeout(() => {
          rescurion(times - 1).apply(null, arg);
        }, wait);
      }
    }
  }
  return rescurion(times);
}




// 解法二
const repeatFn = repeat(console.log, 4, 1000);
repeatFn('hello world', 'closet');