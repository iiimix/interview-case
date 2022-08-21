

let http = require('http')
let fs = require('fs')

let server = http.createServer(function(req, resp) {
    let url = req.url.substr(1);
    console.log(url)
    if(/\w+\d{1}\.html$/.test(url)) {
        resp.setHeader('content-type', 'text/html;charset=utf8')
        let file = fs.readFileSync(url, {encoding: 'utf-8'})
        resp.write(file)
    } else if(/\w+\.js$/.test(url)) {
        resp.setHeader('content-type', 'text/javascript;charset=utf8')
        let file = fs.readFileSync(url, {encoding: 'utf-8'})
        resp.write(file)
    }
    resp.end();
})


server.listen(8899, () => {
    console.log('server is listening on port 8899')
})