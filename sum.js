
/**
 * 
 * @param {*} a 
 * @param {*} b 
 * @param {*} format: boolean，是否格式化返回值
 */
function sum(a, b, format) {
    var big, sm, point = 0, diff, byteSum, result = [];
    a = String(a)
    b = String(b)
    if(a.length > b.length) {
        big = a.split('')
        sm = b.split('')
    } else {
        big = b.split('')
        sm = a.split('')
    }
    diff = Math.abs(big.length-sm.length)
    // 循坏较大的数
    for (let i = big.length -1; i >= 0; i--) {
        if(i >= diff) {
            // 两位直接相加
            byteSum = parseInt(big[i]) + parseInt(sm[i - diff]) + point
        } else {
            // 小数不够位，直接加进位
            byteSum = parseInt(big[i]) + point
        }
        result.unshift(byteSum % 10)
        point = byteSum > 9 ? 1 : 0
    }
    if(point === 1) result.unshift(1)
    // console.log(result, result.join(''))
    return format ? result.join('').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : result.join('');
}

function multi(a, b) {
    var n1 = String(a)
    var n2 = String(b)
    var len1 = n1.length
    var len2 = n2.length
    var point, byte, res = [];
    for (let i = len2-1; i >= 0; i--) {
        var row = new Array(len2 - 1 - i).fill(0) // 乘数移位个数，第一位不补零，第二位补1个零，第三位补2个零，依次
        var point = 0;
        for (let j = len1 - 1; j >= 0; j--) {
            byte = parseInt(n1.charAt(j)) * parseInt(n2.charAt(i)) + parseInt(point)
            row.unshift(byte % 10)
            point = Math.floor(byte / 10)
        }
        if(point > 0) {
            row.unshift(point)
        }
        res.push(row.join(''))
    }
    return sumApply.call(this, res)
}

function sumApply(list) {
    factor = list;
    if(typeof list === 'string') {
        factor = Array.prototype.slice.call(arguments)
    }
    let res = factor.reduce((a,b,c) => {
        // console.log(a, b, c)
        return sum.call(this, a, b, false)
    }, 0)
    return res
}

var add = sumApply("11111111111", "222222", "33333");
console.log(add);
var s = multi("1001", "1001", true);
console.log(s);