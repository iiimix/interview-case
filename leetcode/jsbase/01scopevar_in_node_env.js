// node环境下，每个js文件都是一个模块
// 虽然node环境提供全局变量global
// 但是变量定义并不是对global增加属性
// 即
/**
 * var b =7;
 * global.b依然是undefined
 * 
 * 函数执行的对象this是global，如a()
 * this === global // true
 * 
 * node 的REPL环境（交互式解释器[Read-Eval-Print Loop]）中，定义
 * var b = 1;
 * 此时b才是global的属性
 * 命令行node模式
 */

var a = function() {
  console.log(this === global);
  this.b = 1;
}
var c = new a();
a.prototype.b = 9;

var b = 7; // 定义b，
console.log(global.b); // undefined
a(); // 此时this=== global，所以global.b =1;
// console.log(global.b); // undefined
console.log(b);
console.log(c.b);