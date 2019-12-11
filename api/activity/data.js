let activityData = {
    activeId: '0001',
    startTime: 1574784000000, //2019-11-27 00:00:00
    // startTime: 1579276800000, //2020-01-18 00:00:00
    endTime: 1580140800000, //2020-01-28 00:00:00
    commentTask: {
        taskType: 'jump', //任务分类，后台需要
        count: 3, //需要提交三篇不同影片的评论才算完成任务
        isComplete: false, //一天一次完成机会
        movieList: [],
        curTime: +new Date()
    },
    shareTask: {
        taskType: 'video',
        isComplete: false, //一天一次完成机会
        curTime: +new Date()
    }
}

export default activityData