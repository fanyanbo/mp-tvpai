// pages/movieDetail.js

let utils = require('../../utils/util.js');
let api = require('../../api/api.js');
const utils_fyb = require('../../utils/util_fyb');
let appJs = require('../../app');
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowTips: true,
    proInfoWindow: false,
    flag: true,
    flagOpen: false,
    opens: true,
    length: 0,
    movieType: "",
    prompt_info: "",
    movieId: "",
    chioced: '',
    title:'',
    moviepush: false,
    video_url:'',
    coocaa_m_id:''
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
  chooseSezi: function (e) {
    var that = this;
    const tap = e.currentTarget.dataset.tap;
    console.log(tap)
    var animation = wx.createAnimation({
      // 动画持续时间
      duration: 500,
      timingFunction: 'linear'
    })
    that.animation = animation
    animation.translateY(200).step()
    if (tap == "description") {
      that.setData({
        animationData: animation.export(),
        chooseSize: true,
        proInfoWindow: true
      })
    } else {
      that.setData({
        animationData: animation.export(),
        pushSize: true,
        proInfoWindow: true
      })
    }

    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export()
      })
    }, 200)
  },
  hideModal: function (e) {
    var that = this;
    const tap = e.currentTarget.dataset.tap;
    console.log(tap)
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear'
    })
    that.animation = animation
    animation.translateY(200).step()
    that.setData({
      animationData: animation.export()

    })
    setTimeout(function () {
      animation.translateY(0).step()
      if (tap == "description") {
        that.setData({
          animationData: animation.export(),
          chooseSize: false,
          proInfoWindow: false
        })
      } else {
        that.setData({
          animationData: animation.export(),
          pushSize: false,
          proInfoWindow: false
        })
      }
    }, 200)
  },
  bindGetUserInfo(e) {
    if (!e.detail.userInfo) {
      // 如果用户拒绝直接退出，下次依然会弹出授权框
      return;
    }
    var index = e.currentTarget.dataset.index
    var tvid = e.currentTarget.dataset.tvid
    console.log(index+"=====coocaa_m_id===========")
    var that = this
    that.setData({
      moviechildId: index,//剧集
      movieId: e.currentTarget.dataset.movieid
    })

    var ccsession = wx.getStorageSync("cksession")
    var deviceid = wx.getStorageSync("deviceId")
    console.log("检测ccsession:" + ccsession);
    console.log("检测deviceid:" + deviceid);
    if (ccsession != null && ccsession != undefined && ccsession !== '') {
      if (deviceid != null && deviceid != undefined && deviceid !== ''){
        push(that, that.data.movieId, deviceid, that.data.moviechildId, that.data.movieType, tvid)
      }else{
        getDevices(that, '获取设备中', tvid);
      }      
    } else {
      wx.login({
        success: function (res) {
          console.log('code', res);
          utils_fyb.getSessionByCode(res.code, function (res) {
            console.log('success', res);
            if (res.data.result && res.data.data) {
              let ccsession = res.data.data.ccsession;
              let wxopenid = res.data.data.wxopenid;
              wx.setStorageSync('cksession', ccsession);
              wx.setStorageSync('wxopenid', wxopenid);
              console.log('setStorage, session = ' + ccsession + ',openid = ' + wxopenid);
              if (deviceid != null && deviceid != undefined && deviceid !== '') {
                push(that, that.data.movieId, deviceid, that.data.moviechildId, that.data.movieType, tvid)
              } else {
                getDevices(that, '获取设备中', tvid);
              }   
            }
          }, function (res) {
            console.log('error', res)
          });
        }
      });
    }
  }, 
  
  like: function (event) {
    let that = this
    var video_title = e.currentTarget.title
    var video_poster = e.currentTarget.poster
    var third_album_id = e.currentTarget.id
    const secret = app.globalData.secret
    const params = { "appkey": app.globalData.appkey, "video_type": 1, "video_title": video_title, "video_poster": video_poster, "third_album_id": third_album_id, "time": app.globalData.time(), "tv_source": app.globalData.tvSource, "version_code": app.globalData.version_code }
    console.log(params);
    const sign = utils.encryptionIndex(params, secret)
    const url = api.addUrl + "add=1"
    let data = {
      appkey: app.globalData.appkey,
      video_type: 1,
      video_title: video_title,
      video_poster: video_poster,
      third_album_id: third_album_id,
      time: app.globalData.time(),
      tv_source: app.globalData.tvSource,
      version_code: app.globalData.version_code,
      sign: sign
    }
    utils.postLoading(url, 'GET', data, function (res) {
      console.log(res)
      if (res.data.code == 200) {
        wx.showToast({
          title: '添加成功',
        })
      } else {
        console.log('streams fail:')
        wx.showToast({
          title: '添加失败',
        })
      }
    }, function (res) {
      console.log('streams fail:', res)
      wx.showToast({
        title: '添加失败',
      })
    }, function (res) {
      console.log('streams complete:', res)
    }, "")
  },
  boxshdawclick: function () {
    this.setData({
      flag: true,
    })
  }
})

function movieDetail(that, movieId) {
  const secret = app.globalData.secret
  var paramsStr = { "appkey": app.globalData.appkey, "third_album_id": movieId, "time": app.globalData.time(), "tv_source": app.globalData.tvSource, "version_code": app.globalData.version_code }
  console.log(paramsStr);
  const sign = utils.encryptionIndex(paramsStr, secret)
  console.log("签名" + sign);
  const url = api.getVideoDetailUrl
  let data = {
    appkey: app.globalData.appkey,
    third_album_id: movieId,
    time: app.globalData.time(),
    tv_source: app.globalData.tvSource,
    version_code: app.globalData.version_code,
    sign: sign,
  }
  utils.postLoading(url, 'GET', data, function (res) {
    console.log("影片详情====")
    console.log(res)
    var ccsession = wx.getStorageSync("cksession")
    console.log("检测ccsession：" + ccsession);
    if (res.data.data) {
      var tags = res.data.data.video_tags
      tags = tags.toString().split(',')
      var tagArr = []
      if (tags != null && tags.length > 3) {
        var temp = tags[0] + '.' + tags[1] + '.' + tags[2]
        tagArr.push(temp)
      }
      that.setData({
        movieData: res.data.data,
        tags: tagArr,
        movieType: res.data.data.video_type,
        title: res.data.data.album_title,
        prompt_info: res.data.data.prompt_info,
        coocaa_m_id:res.data.data.play_source.coocaa_m_id
      })
      likes(that, movieId)
      moviesItem(that, movieId)
    }
  }, function (res) {
    console.log('streams fail:')
    console.log(res)
    utils.showToastBox("加载数据失败", "loading")
  }, function (res) {
    console.log('streams complete:')
    console.log(res)
  }, "")
}

function likes(that, movieId) {
  const secret = app.globalData.secret
  var paramsStr = { "appkey": app.globalData.appkey, "third_album_id": movieId, "time": app.globalData.time(), "tv_source": app.globalData.tvSource, "version_code": app.globalData.version_code }
  var sign = utils.encryptionIndex(paramsStr, secret)
  var url = api.relatelongUrl
  let data = {
    appkey: app.globalData.appkey,
    third_album_id: movieId,
    time: app.globalData.time(),
    tv_source: app.globalData.tvSource,
    version_code: app.globalData.version_code,
    sign: sign,
  }
  utils.postLoading(url, 'GET', data, function (res) {
    console.log("相关联")
    console.log(res.data.data)
    if (res.data.data) {
      var videoLike = []
      if (res.data.data.length > 9) {
        for (var k = 0; k < 9; k++) {
          videoLike.push(res.data.data[k])
        }
      } else {
        videoLike = res.data.data
      }
      that.setData({
        videoLike: videoLike
      })
    }
  }, function (res) {
    console.log('streams fail:')
    console.log(res)
    utils.showToastBox("加载数据失败", "loading")
  }, function (res) {
    console.log('streams complete:')
    console.log(res)
  }, ""
  )
}

function moviesItem(that, movieId) {
  const secret = app.globalData.secret
  var paramsStr = { "appkey": app.globalData.appkey, "page_size": 100, "third_album_id": movieId, "time": app.globalData.time(), "tv_source": app.globalData.tvSource, "version_code": app.globalData.version_code }
  var sign = utils.encryptionIndex(paramsStr, secret)
  var url = api.getTvSegmentListUrl
  let data = {
    appkey: app.globalData.appkey,
    third_album_id: movieId,
    time: app.globalData.time(),
    tv_source: app.globalData.tvSource,
    version_code: app.globalData.version_code,
    page_size:100,
    sign: sign,
  }
  utils.postLoading(url, 'GET', data, function (res) {
    console.log("===============-------剧集")
    console.log(res.data.data)
    if (res.data.data) {
      console.log(res.data.data.length)
      that.setData({
        moviesItem: res.data.data,
        length: res.data.data.length,
      })
      for (let i = 0; i < res.data.data.length; i++){
        that.setData({
          video_url: JSON.parse(res.data.data[i].video_url)
        })  
      }
    }
  }, function (res) {
    console.log('streams fail:')
    console.log(res)
    utils.showToastBox("加载数据失败", "loading")
  }, function (res) {
    console.log('streams complete:')
    console.log(res)
  }, ""
  )
}

// 推送影视
function push(that, movieId, deviceId, moviechildId, _type, tvid) {
  if (deviceId == null) {
    utils.showToastBox('无设备id!', "loading")
    return
  }
  var paramsStr
  if (moviechildId == undefined) {
    paramsStr = { "ccsession": wx.getStorageSync("cksession"), "deviceId": deviceId + '', "movieId": movieId }
  } else {
    paramsStr = { "ccsession": wx.getStorageSync("cksession"), "deviceId": deviceId + '', "movieId": movieId, "moviechildId": moviechildId + '' }
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
      console.log("===============-------推送影视" + tvid)
      console.log(res)
      if (res.data.result) {
        that.setData({
          chioced: moviechildId,
          moviepush: true
        })
        addpushhistory(that, movieId,that.data.title, tvid);//保存推送历史
        utils.showToastBox("推送成功", "success")
      } else {
        utils.showToastBox(res.data.message)
      }
    },
    fail: function (res) {
      utils.showToastBox(res.data.message)
    }
  })
}

function addpushhistory(that, movieId, title, video_id) {
  const secret = app.globalData.secret
  var paramsStr = { "appkey": app.globalData.appkey, "time": app.globalData.time(), "version_code": app.globalData.version_code, "vuid": wx.getStorageSync("wxopenid") }
  var sign = utils.encryptionIndex(paramsStr, secret)
  console.log("album_id：" + movieId + "===video_id:==" + video_id +"增加历史")
  console.log(paramsStr)
  console.log(sign)
  wx.request({
    url: api.addpushhistoryUrl + "?sign=" + sign + "&vuid=" + wx.getStorageSync("wxopenid") + "&version_code=33&time=" + app.globalData.time() + "&appkey=" + app.globalData.appkey,
    method: "POST",
    data: {
      album_id: movieId,
      title: title,
      video_id: video_id,
      video_type: "1",
    },
    header: {
      "Content-Type": "application/json; charset=utf-8"
    },
    success: function (res) {
      console.log(res.data);
      // wx.navigateBack({
      //   delta: 1  //小程序关闭当前页面返回上一页面
      // })
      // wx.showToast({
      //   title: '评教成功！',
      //   icon: 'success',
      //   duration: 2000
      // })
    },
  })
}



function getDevices(that, message,tvid) {
  const ccsession = wx.getStorageSync('cksession')
  const url = api.bindDeviceListUrl
  const key = app.globalData.key
  var paramsStr = { "ccsession": ccsession }
  const sign = utils.encryption(paramsStr, key)
  let data = {
    client_id: app.globalData.client_id,
    sign: sign,
    param: paramsStr,
    ccsession: ccsession
  }
  console.log(data)
  utils.postLoading(url, 'GET', data, function (res) {
    console.log("获取设备信息:" + tvid)
    console.log(res)
    if (res.data.result && res.data.data) {
      for (var ii = 0; ii < res.data.data.length; ii++) {
        if (res.data.data[ii].bindStatus === 1) {
          console.log("有绑定中的设备")
          console.log(res.data.data[ii].deviceId);
          wx.setStorageSync('deviceId', res.data.data[ii].deviceId)
          push(that, that.data.movieId, res.data.data[ii].deviceId, that.data.moviechildId, that.data.movieType,tvid)
        }
      }
    } else {
      wx.showModal({
        title: '无法推送',
        content: '您未关联任何设备,请查看教程',
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
    }
  }, function (res) {

  }, function (res) {

  }, message)
}