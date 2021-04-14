const http = require('http')
const formidable = require('formidable')
const fs = require('fs')
const log = require('./log.js')

const config = require('./config.json')
const uploadImage = require('./picgo.js')
// 默认8080端口
var port = config.port || 8080
// 默认路径 /upload
const url = config.url || '/upload'
// POST File Name
const fileName = config.fileName || 'file'
// Response URL Path
const urlPath = config.urlPath || 'url'
// 每张图片上传的等待间隔
const interval = config.interval || 200

let timeoutId = null

/**
 * 为文件加上扩展名
 *
 * @param {String} filePath 文件路径
 * @param {String} ext 文件扩展名
 */
function addExtForFile(filePath, ext) {
    let newFilePath = filePath + '.' + ext
    // 同步修改文件名字
    fs.renameSync(filePath, newFilePath)
    return newFilePath
}

var filePathArray = []
let responseArray = []

function addTask(file, response) {
    let filePath = file.path
    let fileName = file.name

    let extension = fileName.substring(fileName.lastIndexOf('.') + 1)
    let filePathHasExt = filePath.lastIndexOf('.' + extension) != -1
    if (!filePathHasExt) {
        // 如果文件路径没有扩展名，上传到图床会乱码，这里改名，加上扩展名
        filePath = addExtForFile(filePath, extension)
    }

    filePathArray.push(filePath)
    responseArray.push(response)

    if (filePathArray.length == 1) {
      // 第一次手动触发
      handleTask()
    }
}

function handleTask() {
    if (filePathArray.length == 0) return
    let filePath = filePathArray[0]
    uploadImage([filePath]).then((result) => {
        let response = responseArray.shift()
        filePathArray.shift()
        // 处理结果
        if (result) {
            response.writeHead(200, { 'Content-Type': 'text/json' })
            let res = { status: 'success' }
            res[urlPath] = result
            response.write(JSON.stringify(res))
        } else {
            response.writeHead(500, { 'Content-Type': 'text/json' })
            response.write(
                JSON.stringify({
                    status: 'false',
                })
            )
        }
        response.end()

        log.info("已处理文件：" + filePath)
        log.info("还剩" + filePathArray.length + "个")

        // 延时触发下一张图片上传，防止文件重名
        setTimeout(() => {
            handleTask()
        }, interval)
    })
}

// create server, listen to port
http.createServer(function (req, res) {
    if (req.url == url && req.method == 'POST') {
        var form = new formidable.IncomingForm()
        form.parse(req, function (err, fields, files) {
            if (err) {
                res.send(err)
                return
            }
            let file = files[fileName]

            if (!file) {
                res.writeHead(500, { 'Content-Type': 'text/json' })
                log.error('no file found')
                res.write(
                    JSON.stringify({
                        status: 'false',
                        info: 'plz upload a pic',
                    })
                )
                res.end()
                return
            }

            addTask(file, res)
        })
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.write('The URL Path is ' + url)
        res.end()
    }
}).listen(port)

// start up server
log.info(`app run at ${port}`)
