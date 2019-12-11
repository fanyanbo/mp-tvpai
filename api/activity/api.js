const config = require('../../config/index')
const baseUrl = config.baseUrl_acti

const submitTaskCompleteUrl = baseUrl + "light/mobile/web/task/finish-task" // 完成任务

module.exports = {
    submitTaskCompleteUrl,
}