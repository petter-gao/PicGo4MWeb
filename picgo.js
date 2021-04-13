const axios = require('axios')
const fs = require('fs')

var log4js = require('log4js')
log4js.configure({
    appenders: [
        { type: 'console' },
        { type: 'file', filename: 'app.log', category: 'PicGo4MWeb' },
    ],
})
var log = log4js.getLogger('PicGo4MWeb')

/**
 * 为文件加上扩展名
 *
 * @param {String} filePath 文件路径
 * @param {String} ext 文件扩展名
 */
function addExtForFile(filePath, ext) {
    let newFilePath = filePath + '.' + ext

    fs.rename(filePath, newFilePath, (err) => {
        if (err) {
            log.error('移动文件失败' + err)
        }
        log.info('移动文件完成')
    })
    setTimeout(() => {
        log.debug('为了等待rename完成而settimeout')
    }, 1)
    return newFilePath
}

/**
 * @param  {[String]} file {picture path}
 * @return {[String]} {picture pid}
 */
async function uploadImage(file) {
    try {
        // PicGo Server地址
        let imageUrl = 'http://127.0.0.1:36677/upload'

        let filePath = file.path
        let fileName = file.name

        let extension = fileName.substring(fileName.lastIndexOf('.') + 1)
        let filePathHasExt = filePath.lastIndexOf('.' + extension) != -1
        if (!filePathHasExt) {
            // 如果文件路径没有扩展名，上传到图床会乱码，这里改名，加上扩展名
            filePath = addExtForFile(filePath, extension)
        }

        let body = {
            list: [filePath],
        }
        let upImgResp = await axios.post(imageUrl, body, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
        })
        imgUrl = upImgResp.data['result'][0]
        if (imgUrl) {
            log.info('success upload a pic to: ' + imgUrl)
            return imgUrl
        } else {
            throw 'no img url '
        }
    } catch (e) {
        log.error('upload failed with error: ' + e)
        throw 'no img url '
    }
}

module.exports = uploadImage
