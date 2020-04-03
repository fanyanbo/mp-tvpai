const config = require('../../config/index')
const baseUrl = config.baseUrl_acti

const submitTaskCompleteUrl = baseUrl + "light/mobile/web/task/finish-task" // 完成任务
const get418ActivityInitDataUrl = baseUrl + "/light/v2/web/init" // 获取418活动初始化数据


module.exports = {
    submitTaskCompleteUrl,
    get418ActivityInitDataUrl
}