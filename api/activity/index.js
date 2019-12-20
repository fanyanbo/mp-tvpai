const app = getApp()
const api = require('./api')
const utils = require('../../utils/util_fyb')
import activityData from './data'

function initActivityData() {
    if (!app.globalData.activityData) {
        app.globalData.activityData = activityData
    }
}

function handleActivityTask(params) {
    console.log('handleActivityTask  params:', JSON.stringify(params))
    console.log('handleActivityTask unionid:', wx.getStorageSync('unionid'))
    if (params.type === 'comment') {
        _handleCommentTask(params.movieid)
    } else if (params.type === 'share') {
        _handleShareTask()
    }
}

// 检测是否为同一天
function _checkisSameDay(timeStampA, timeStampB) {
    let dateA = new Date(timeStampA)
    let dateB = new Date(timeStampB)
    return (dateA.setHours(0, 0, 0, 0) == dateB.setHours(0, 0, 0, 0))
}

// 检测是否在活动期
function _checkisActivityPeriod(curTimeStamp, startTimeStamp, endTimeStamp) {
    return (curTimeStamp >= startTimeStamp && curTimeStamp <= endTimeStamp)
}

// 处理评论任务
function _handleCommentTask(movieid) {
    let _activityData = app.globalData.activityData
    if (!_activityData) return
    let _commentTask = _activityData.commentTask
    let _enterTime = +new Date()
    if(!_checkisActivityPeriod(_enterTime, _activityData.startTime, _activityData.endTime)) {
        console.log('不在活动期')
        return
    }
    // 当不同天进入时，重置评论任务数据
    if (!_checkisSameDay(_commentTask.curTime, _enterTime)) {
        console.log('不同天进入重置任务数据')
        _commentTask.curTime = _enterTime
        _commentTask.count = 3
        _commentTask.isComplete = false
        _commentTask.movieList = []
    } else {
        if (_commentTask.isComplete) {
            console.log('影片评论任务已完成，请勿重复提交')
            return
        }
        if (_commentTask.movieList.indexOf(movieid) > -1) {
            console.log('该影片已评论过')
            return
        }
        // 判断是否完成任务，这里考虑提交任务失败的情况
        if (_commentTask.count === 1) {
            _submitTask(_commentTask).then((res) => {
                console.log('提交影片评论任务', res.data)
                if(res.data.code === '50100') {
                    _commentTask.count = 0
                    _commentTask.isComplete = true
                    _commentTask.movieList = []
                }
            }).catch(res => {
                console.log('影片评论任务提交失败', res)
            })
        } else {
            _commentTask.movieList.push(movieid)
            _commentTask.count--
        }
    }
    console.log(app.globalData.activityData)
}

// 处理分享任务
function _handleShareTask() {
    let _activityData = app.globalData.activityData
    if (!_activityData) return
    let _shareTask = _activityData.shareTask
    let _enterTime = +new Date()
    if(!_checkisActivityPeriod(_enterTime, _activityData.startTime, _activityData.endTime)) {
        console.log('不在活动期')
        return   
    }
    // 当不同天进入时，重置评论任务数据
    if (!_checkisSameDay(_shareTask.curTime, _enterTime)) {
        console.log('不同天进入重置任务数据')
        _shareTask.curTime = _enterTime
        _shareTask.isComplete = false
    }
    if (_shareTask.isComplete) {
        console.log('影评分享任务已完成，请勿重复提交')
        return
    }
    _submitTask(_shareTask).then((res) => {
        console.log('提交影评分享任务', res.data)
        if(res.data.code === '50100') {
            _shareTask.isComplete = true
        }  
    }).catch(res => {
        console.log('影评分享任务提交失败', res)
    })
    console.log(app.globalData.activityData)
}

function _submitTask(taskData) {
    return getUnionId().then(unionid => {
        console.log('unionid:' + unionid)
        let _params = {
            taskType: taskData.taskType,
            userKeyId: unionid
        }
        console.log('url:', api.submitTaskCompleteUrl)
        console.log('params:', JSON.stringify(_params))
        return utils.requestP(api.submitTaskCompleteUrl, _params, 'POST')
    })
}

// 不需要用户授权可以拿到unionid,仅提交任务使用
function getUnionId() {
    return new Promise((resolve, reject) => {
        let _unionid = wx.getStorageSync('unionid')
        if (!_unionid) {
            utils.wxLogin()
                .then(res => {
                    return utils.getSessionByCodeP(res.code)
                })
                .then(res => {
                    console.log('activity getSessionByCodeP:', res)
                    _unionid = res.data.data.unionid
                    resolve(_unionid)
                }).catch(res => {
                    reject(res)
                })
        } else {
            resolve(_unionid)
        }
    })
}

module.exports = {
    initActivityData,
    handleActivityTask
}