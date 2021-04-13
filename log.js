const log4js = require('log4js')
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'app.log', category: 'PicGo4MWeb' }
  ]
})
const log = log4js.getLogger('PicGo4MWeb')

module.exports = log