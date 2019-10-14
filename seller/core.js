function Store(options = {}) {
    this.defaultOptions = {
        init: false,                // 是否初始化票务
        blockNum: 4,                // 区域数量小于等于26个
        firstRowSeats: 50,          // 第一排座位数
        lastRowSeats: 100,          // 最后一排座位数
        incrementEachRow: 2,        // 每排增加座位数
    }
    this.blockList = []             // 区域码A，B，C，D，E...
    this.ticketPool = []            // 所有票的总池子
    this.remainTicketPool = []      // 剩余票的池子
    this.options = Object.assign({}, this.defaultOptions, options)

    this.rowsAmount = (this.options.lastRowSeats - this.options.firstRowSeats) / 2 + 1        // 假定为整数  26排

    let i = 0;
    while(i++ < this.options.blockNum) {
        this.blockList.push(String.fromCharCode(64+i))
    }
    if(this.options.init) {
        this.initTicketPool()
    }
}

Store.prototype.ERROR_MAPS = {
    TICKET_NUM_ILLEGAL: '每次购票数量必须在1-5之间',
    REMAIN_TICKET_DEFICIT: '剩余票数不足',
}
/**
 * 初始化门票池子
 */
Store.prototype.initTicketPool = function() {
    // ABCD区域座位
    this.blockList.forEach((block, index) => {
        for (let i = 1; i < this.rowsAmount+1; i++) {
            for (let j = 1; j < this.options.firstRowSeats + 1 + this.options.incrementEachRow * (i-1); j++) {
                this.ticketPool.push(`${block}区 ${i}排${j}号`)
            }
        }
    })
    this.remainTicketPool = Array.from(this.ticketPool)
}

/**
 * 
 * @param {客户购票数量， 检查1-5} num , 默认一张票
 */
Store.prototype.buyTicket = function(num = 1) {
    if(parseInt(num) > 5 || parseInt(num) < 1) return this.ERROR_MAPS.TICKET_NUM_ILLEGAL;

    if(this.remainTicketPool.length < num) return this.ERROR_MAPS.REMAIN_TICKET_DEFICIT;

    let tickets = [];
    let len = []
    for (let i = 0; i < num; i++) {
        len = this.remainTicketPool.length;
        let index = Math.floor(Math.random() * len)
        tickets.push(this.remainTicketPool.splice(index, 1)[0])
    }
    return tickets;
}
/**
 * 重新开始所有购票程序
 */
Store.prototype.resetPool = function() {
    
}
Store.prototype.getRemains = function() {
    return this.remainTicketPool;
}

// 第一次活动，使用默认票务数据ABCD四个区域，50座位递增2个，共26排
let seller1 = new Store({init: true})
// console.log(seller1.getRemains());
// 客户购票动作
// console.log(seller1.buyTicket(5))
// console.log(seller1.buyTicket(4))

// 重新开始售票
// seller1.resetPool();

// 第二场活动，, 自定义初始化票务数据， 每个活动相互独立
let seller2 = new Store({init: false,                // 是否初始化票务
    blockNum: 2,                // 区域数量小于等于26个
    firstRowSeats: 10,          // 第一排座位数
    lastRowSeats: 20,           // 最后一排座位数
    incrementEachRow: 2,        // 每排增加座位数
})
seller2.initTicketPool()
// console.log(seller2.getRemains());
// console.log(seller2.buyTicket(5))
// console.log(seller2.buyTicket())