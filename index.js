const http = require('http')
const formidable = require('formidable')
const config = require('./config.json')
const uploadImage = require('./picgo.js')
// 默认8080端口
var port = config.port || 8080
// 默认路径 /upload
const url = config.url || '/upload'
var log4js = require('log4js')
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'app.log', category: 'PicGo4MWeb' }
  ]
})
var log = log4js.getLogger('PicGo4MWeb')

var tasks = []
function addTask(file, response) {
  tasks.push({
    "file":file,
    "response":response
  })

  // 第一个任务手动执行
  if(tasks.length==1) {
    handleTask()
  }
}

function handleTask() {
  if(tasks.length) {
    let file = tasks[0]["file"]
    let response = tasks[0]["response"]
    uploadImage(file).then((result)=>{
      // 处理结果
      if (result) {
        response.writeHead(200, {"Content-Type": "text/json"})
        response.write(JSON.stringify({
          status:'success',
          url:result
        }))
      } else {
        response.writeHead(500, {"Content-Type": "text/json"})
        response.write(JSON.stringify({
          status:'false'
        }))
      }
      response.end()

      // 第一个任务退出
      tasks.shift()
      // 自动执行队列中的任务
      handleTask()
    })
  }
}

// create server, listen to port
http.createServer(function (req, res) {
  if (req.url == url && req.method == 'POST') {
    var form = new formidable.IncomingForm()
    form.parse(req, function (err, fields, files) {
      if(err) {
        res.send(err)
        return
      }
      if (!files.file) {
        res.writeHead(500, {"Content-Type": "text/json"})
        log.error('no file found')
        res.write(JSON.stringify({
          status: 'false',
          info: 'plz upload a pic'
        }))
        res.end()
        return
      }

      addTask(files.file, res)
    })
  } else {
      res.writeHead(404, {"Content-Type": "text/plain"})
      res.write('not fonud')
      res.end()
  }
}).listen(port)

// start up server
log.info(`app run at ${port}`)