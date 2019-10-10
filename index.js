const http = require('http')
const url = require('url')
function createApplication() {
    //监听函数
    let app = (req, res) => {
        //获取请求的方法
        let _method = req.method.toLowerCase();
        //获取请求的路径
        let { pathname } = url.parse(req.url, true)
        //通过next方法进行迭代
        let index = 0
        function next() {
            if (index === app.routes.length) {
                res.end(`Cannot ${_method} ${pathname}`)
            }
            let { method, path, handler } = app.routes[index++] // 每次调用next就应该取出下一个layer
            if (method === 'middle') {
                if (path === '/' || path === pathname || pathname.startsWith(path + '/')) {
                    handler(req, res, next)
                } else {
                    next() //没有匹配到当前中间件 继续往下迭代
                }
            } else {
                //处理路由
                let { method, path, handler } = app.routes[i]
                if ((_method === method || method === 'all') && (path === pathname || path === '*')) {
                    handler(req, res)
                } else {
                    next()
                }
            }
        }
        next()
        //     for (let i = 0; i < app.routes.length; i++) {

        //     }
    }
    app.routes = [];
    app.use = function (path, handler) {
        if (typeof handler !== 'function') {
            handler = path
            path = '/'
        }
        let layer = {
            method: 'middle',//method中间件
            path,
            handler,
        }
        app.routes.push(layer)
    }
    app.listen = function () {
        let server = http.createServer(app)
        server.listen(...arguments)
    }
    app.all = function (path, handler) {
        let layer = {
            method: 'all',//method是all 全部匹配
            path,
            handler
        }
        app.routes.push(layer)
    }
    http.METHODS.forEach(method => {
        method = method.toLowerCase() //方法名转成小写
        app[method] = function (path, handler) {
            let layer = {
                method,
                path, 
                handler
            }
            app.routes.push(layer)
        }
    })

    return app
}
module.exports = createApplication