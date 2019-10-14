/**
 * ABCD四个座位区域
 * 
 * 从第一排50个座位，每排递增2个座位，最后一排100个座位
 * 
 * 每次可购票1-5张，要求随机分配座位
 * 
 * TODO 变量私有化
 */
let orderList = []
let orderMap = {}
let $errorMessage;
let $history;
let $remains;
let $successTicket

$(document).ready(function() {
    let ticketNum = 5;  // 预购票数
    var btnList = $('#buttonGroup .btn')
    btnList.each((index, btn) => {
        let $btn = $(btn);
        if(index == ticketNum-1) $btn.addClass('btn-primary')
         $btn.on('click', function(ev) {
            btnList.each((i, bn) => {$(bn).removeClass('btn-primary')})
            ticketNum = $btn.attr('value')
            // console.log(ticketNum)
            $btn.addClass('btn-primary')
        })
    })

    // 初始化一个活动，使用默认票务数据ABCD四个区域，50座位递增2个，共26排
    let seller1 = new Store({init: true})

    // console.log(seller1.getRemains());
    // // 客户购票动作
    // console.log(seller1.buyTicket(5))
    // console.log(seller1.buyTicket(4))
    $successTicket = $('#successTicket')
    $remains = $('#remains')
    $remains.text(seller1.getRemains().length);
    $errorMessage = $('#errorMessage')
    $errorMessage.hide()
    $successTicket.hide()
    $history = $('#orderHistory')
    $history.bootstrapTable({
        columns: [{
            field: 'index',
            title: '序号',
            formatter: function(value, row, index) {
                return index + 1
            }
        },{
            field: 'name',
            title: '用户名'
        }, {
            field: 'list',
            title: '购票信息',
            formatter: function(value, row, index) {
                let html = ''
                value.forEach(item => {
                    html += `<span class="label label-info">${item}</span>&nbsp;&nbsp;&nbsp;&nbsp;`
                });
                return html
            }
        }]
    })
    function submitOrder() {
        $errorMessage.hide()
        $successTicket.hide()

        let cname = $('#cname').val()
        let num = ticketNum
        if(!cname) {
            $errorMessage.fadeIn()
            $errorMessage.text('用户名不能为空')
            return;
        }
        if(orderMap[cname]) {
            // 已经购票, 显示该用户购票座位
            let html = '<p>该用户已经购票</p>'
            orderMap[cname].forEach(value => {
                html += `<span class="label label-info">${value}</span>&nbsp;&nbsp;&nbsp;&nbsp;`
            })
            $successTicket.html(html)
            $successTicket.fadeIn()
            return;
        }
        let res = seller1.buyTicket(num)
        if(typeof res === 'string') {
            // 票数不够
            return
        }
        orderList.push({name: cname, list: res});
        orderMap[cname] = res;
        updateInfo();
        
    }
    function updateInfo() {
        $history.bootstrapTable('load', orderList)
        $remains.text(seller1.getRemains().length)
    }

    $('#submitOrder').on('click', function() {
        submitOrder()
    })
})
