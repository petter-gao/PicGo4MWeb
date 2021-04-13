const axios = require('axios')
const log = require('./log.js')

/**
 * @param  {[String]} file {picture path}
 * @return {[String]} {picture pid}
 */
async function uploadImage(filePathArray) {
    try {
        // PicGo Server地址
        let picGoServer = 'http://127.0.0.1:36677/upload'

        log.info("开始上传文件：总共" + filePathArray.length + "个")
        log.debug(filePathArray.join(","))
        
        let body = {
            list: filePathArray,
        }
        let upImgResp = await axios.post(picGoServer, body, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
        })
        let imgUrlList = upImgResp.data['result']
        if (imgUrlList) {
            log.info('success upload ' + imgUrlList.length + ' pic')
            return imgUrlList
        } else {
            return null
        }
    } catch (e) {
        log.error('upload failed with error: ' + e)
        // throw 'no img url '
        return null
    }
}

module.exports = uploadImage
