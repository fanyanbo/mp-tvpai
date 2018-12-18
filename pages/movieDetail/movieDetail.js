// pages/movieDetail.js


var utils = require('../../utils/util.js')
var api = require('../../config/config.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag:true,
    flagOpen:false,
    opens:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    movieDetail(this, options.id)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  push:function(e){
    var index = e.currentTarget.dataset.index
    var that= this
    //判断ccsession是否为空
    if (utils.ccsessionIs() == null) return
    if (utils.coocaaLogin() == null) return
    if (that.data.movieType!='电影'){
      var moviechildId = index
    }
    that.setData({
      chioced: index,
      flag:false,
      moviechildId: moviechildId
    })
    service(that)
  },
  pushdown:function(e){
    var that = this
    console.log("tuisong");
    console.log("formid：")
    console.log(e.detail.formId)
    wx.setStorageSync("formid", e.detail.formId)
    var jishu = parseInt(that.data.moviechildId) - 1
    push(that, that.data.movieId, e.currentTarget.dataset.serviceid, jishu )
  },
  boxshdawclick:function(){
    this.setData({
      flag: true,
    })
  },
  openIt:function(e){
    console.log(e)
    if (this.data.flagOpen){
      this.setData({
        opens: true,
        flagOpen:false
      })
    }else{
      this.setData({
        opens: false,
        flagOpen: true
      })
    }
      
  }
})


function movieDetail(that,movieId){
  var paramsStr = { "ccsession": wx.getStorageSync("cksession"), "movieId": movieId, nodeType: 'res'}
  var sign = utils.encryption(paramsStr, app.globalData.key)
  wx.request({
    url: api.getVideoDetailUrl,
    data: {
      client_id: 'applet',
      sign: sign,
      param: paramsStr
    },
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'GET',
    success: function (res) {
      console.log("影片详情====")
      console.log(res.data)
      if (res.data.result&&res.data.data != null) {

        if (res.data.data.base_info != null && res.data.data.base_info!=''){
          var tags = res.data.data.base_info.video_tags
          tags = tags.toString().split(',')
        }
        var tagArr = []
        if (tags!=null&&tags.length>3){
          var temp = tags[0] + '.' + tags[1] + '.' + tags[2] 
          tagArr.push(temp)
        }
        that.setData({
          movieId: movieId,
          movieData: res.data.data,
          tags: tagArr,
          relation_column: res.data.data.control_info.requset_action.relation_column,
          movieType: res.data.data.base_info.video_type
        })
        likes(that, movieId)
        moviesItem(that, movieId)
      }
    },
    fail: function (res) {
      utils.showToastBox(res.data.msg, "loading")
    }
  })
}

function likes(that,movieId){
  var pageIndex = 0
  var pageSize = 30
  var columnIndex = that.data.relation_column
  var paramsStr = { "ccsession": wx.getStorageSync("cksession"), "columnIndex": columnIndex+'', "movieId": movieId, nodeType: 'res', "pageIndex": pageIndex+'', "pageSize": pageSize+'' }
  var sign = utils.encryption(paramsStr, app.globalData.key)
  wx.request({
    url: api.getRelateVideoListUrl,
    data: {
      client_id: 'applet',
      sign: sign,
      param: paramsStr
    },
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'GET',
    success: function (res) {
      console.log("获取设备")
      console.log(res)
      if (res.data.result && res.data.data != null) {
        var videoLike = []
        if (res.data.data.videos.length>9){
          for(var k=0;k<9;k++){
             videoLike.push(res.data.data.videos[k])
          }
        }else{
          videoLike = res.data.data.videos
        }
        that.setData({
          videoLike: videoLike
        })
      }
    },
    fail: function (res) {
      utils.showToastBox(res.data.msg, "loading")
    }
  })
}


function moviesItem(that, movieId){
  var pageIndex = 0
  var columnIndex = that.data.relation_column
  var paramsStr = { "ccsession": wx.getStorageSync("cksession"),"movieId": movieId, nodeType: 'res', "pageIndex": pageIndex + ''}
  var sign = utils.encryption(paramsStr, app.globalData.key)
  wx.request({
    url: api.getTvSegmentListUrl,
    data: {
      client_id: 'applet',
      sign: sign,
      param: paramsStr
    },
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'GET',
    success: function (res) {
      console.log("===============-------ggg")
      console.log(res.data.data.segments)
      if (res.data.result && res.data.data != null) {
      
        that.setData({
          moviesItem: res.data.data.segments
        })
      }
    },
    fail: function (res) {
      utils.showToastBox(res.data.msg, "loading")
    }
  })
}



function service(that){
  //判断ccsession是否为空
  if (utils.ccsessionIs() == null) return
  if (utils.coocaaLogin() == null) return
  var ccsession = wx.getStorageSync("cksession")
  if (ccsession != null && ccsession != undefined && ccsession !== '') {
    var paramsStr = { "ccsession": ccsession }
    var sign = utils.encryption(paramsStr, app.globalData.key)
    wx.request({
      url: api.getDevicesUrl,
      data: {
        client_id: 'applet',
        sign: sign,
        param: paramsStr
      },
      method: 'get',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: res => {
        if (res.data.result) {
          console.log("获取设备接口成功")
          console.log(res.data.data)
          //如果没有设备
          if (res.data.data == null || res.data.data == undefined || res.data.data.length == 0) {
            wx.showModal({
              title: '无法推送',
              content: '您的酷开账号未关联任何设备,请查看教程',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  //跳转教程页面
                  wx.navigateTo({
                    url: '../course/course'
                  })
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })

          } else {
            var iqiyi = [],tent = []
            for (var ii = 0; ii < res.data.data.length;ii++){
              if (res.data.data[ii].source === 'yinhe') { 
                iqiyi.push(res.data.data[ii])
              } else if (res.data.data[ii].source === 'tencent'){
                tent.push(res.data.data[ii])
                }
            }
            
           that.setData({
             iqiyi: iqiyi,
             tent: tent
           })
           console.log("iqiyi")
           console.log(iqiyi)
          }
        } else {
          utils.showToastBox("请重试", "loading")
        }
      },
      fail: function () {
        utils.showFailToast(that, "加载失败，请重试")
        console.log("获取设备接口失败")
      }
    })
  } else {
    utils.showToastBox("登录未授权，返回点击我的", "loading")
  }

 
}

// 推送影视
function push(that, movieId, deviceId, moviechildId){
  if (deviceId==null){
    utils.showToastBox('无设备id!', "loading")
    return
  }
  var paramsStr
  if (moviechildId==undefined){
    paramsStr = { "ccsession": wx.getStorageSync("cksession"), "deviceId": deviceId+'', "movieId": movieId }
  }else{
    paramsStr = { "ccsession": wx.getStorageSync("cksession"), "deviceId": deviceId+'', "movieId": movieId, "moviechildId": moviechildId + '' }
  }
  console.log("参数")
  console.log(paramsStr)
  var sign = utils.encryption(paramsStr, app.globalData.key)
  wx.request({
    url: api.devicesPushUrl,
    data: {
      client_id: 'applet',
      sign: sign,
      param: paramsStr
    },
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'GET',
    success: function (res) {

      var type = "moviePush"
      utils.eventCollect(type, movieId)
      console.log("===============-------推送影视")
      console.log(res.data.data)
      if (res.data.result) {
        utils.showToastBox("推送成功", "success")
      }else{
        utils.showToastBox(res.data.message, "loading")
      }
    },
    fail: function (res) {
      utils.showToastBox(res.data.message, "loading")
    }
  })
}