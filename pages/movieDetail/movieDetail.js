// pages/movieDetail.js

let utils = require('../../utils/util.js');
let api = require('../../api/api.js');
let utils_fyb = require('../../utils/util_fyb');
let appJs = require('../../app');
let api_nj = require('../../api/api_nj');
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
    coocaa_m_id:'',
    isShowtitle:false,
    tvId:"",
    likeShow:false//是否收藏
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
  push(e) {
    if (app.globalData.deviceId == null) {
      return wx.navigateTo({
        url: "../home/home"
      });
    }
    let coocaamid = e.currentTarget.dataset.coocaamid
    var tvid = e.currentTarget.dataset.tvid
    var moviechildid = e.currentTarget.dataset.moviechildid
    var movieId =  e.currentTarget.dataset.movieid
    var title = e.currentTarget.dataset.title
    console.log(coocaamid + "=====coocaa_m_id===========" + moviechildid)
    var that = this
    that.setData({
      moviechildid: moviechildid,//剧集
      coocaamid: coocaamid,
      movieId: movieId
    })

    var ccsession = wx.getStorageSync("cksession")
    var deviceid = wx.getStorageSync("deviceId")
    console.log("检测ccsession:" + ccsession);
    console.log("检测deviceid:" + deviceid);

    wx.showLoading({
      title: '推送中...'
    })
    push(that, movieId, deviceid, moviechildid, that.data.movieType, tvid, coocaamid, title)


    // new Promise(function (resolve, reject) {
    //   let dataOnline = {
    //     activeid: app.globalData.activeId //获取最新绑定设备激活ID
    //   }
    //   api_nj.isTVOnline({
    //     data: dataOnline,
    //     success(res) {
    //       console.log("isTVOnline success res:" + JSON.stringify(res))
    //       if (res.status == "online") { //TV在线
    //         resolve();
    //       } else {
    //         reject(res);
    //       }
    //     },
    //     fail(res) {
    //       console.log("isTVOnline fail:" + res)
    //       reject(res)
    //     }
    //   });
    // })
    // .then(function () {
    //   wx.showLoading({
    //     title: '推送中...'
    //   })
    //   push(that, movieId, deviceid, moviechildid, that.data.movieType, tvid, coocaamid, title)
    // })
    // .catch(function (res) {
    //   console.log('catch...' + res)
    //   utils_fyb.showFailedToast('电视不在线', '../../images/close_icon.png');
    // })        

  }, 
  //收藏喜欢（未开发）
  like: function (e) {
    let that = this
    var video_title = e.currentTarget.dataset.title
    var video_poster = e.currentTarget.dataset.poster
    var third_album_id = e.currentTarget.dataset.id

    const secret = app.globalData.secret
    var paramsStr = { "appkey": app.globalData.appkey, "collect_type": 1, "time": app.globalData.time(), "token": wx.getStorageSync("wxopenid"), "version_code": app.globalData.version_code }
    var sign = utils.encryptionIndex(paramsStr, secret)
    console.log(paramsStr)
    wx.request({
      url: api.addUrl + "?collect_type=1&sign=" + sign + "&token=" + wx.getStorageSync("wxopenid") + "&version_code=" + app.globalData.version_code+"&time=" + app.globalData.time() + "&appkey=" + app.globalData.appkey,
      method: "POST",
      data: {
        third_album_id: third_album_id,
        title: video_title,
        video_poster: video_poster,
        video_type: "1",
      },
      header: {
        "Content-Type": "application/json; charset=utf-8"
      },
      success: function (res) {
        console.log(res.data);
      },
    }) 
}
})

function movieDetail(that, movieId) {
  let params = { "third_album_id": movieId};
  let desParams = utils_fyb.paramsAssemble_tvpai(params);
  utils_fyb.request(api.getVideoDetailUrl, 'GET', desParams, function (res) {
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
      if (res.data.data.is_collect == 1) {//是否收藏
        that.setData({
          likeShow:true
        })
      } else if (res.data.data.is_collect == 2){
        that.setData({
          likeShow: false
        })    
      }
      that.setData({
        movieData: res.data.data,
        tags: tagArr,
        movieType: res.data.data.video_type,
        prompt_info: res.data.data.prompt_info,
        coocaa_m_id:res.data.data.play_source.coocaa_m_id,
        tvId: res.data.data.play_source.video_third_id
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
  let params = { "third_album_id": movieId,"page_size":"30"};
  let desParams = utils_fyb.paramsAssemble_tvpai(params);
  utils_fyb.request(api.relatelongUrl, 'GET', desParams, function (res) {
    console.log("相关联")
    console.log(res.data.data)
    if (res.data.data.length>0) {
      var videoLike = []
      if (res.data.data.length > 9) {
        for (var k = 0; k < 9; k++) {
          videoLike.push(res.data.data[k])
        }
      } else {
        videoLike = res.data.data
      }
      that.setData({
        videoLike: videoLike,
        isShowtitle:true
      })
    }else{
      that.setData({
        isShowtitle: false
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
  let params = { "third_album_id": movieId, "page_size": "300" };
  let desParams = utils_fyb.paramsAssemble_tvpai(params);
  utils_fyb.request(api.getTvSegmentListUrl, 'GET', desParams,  function (res) {
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
function push(that, movieId, deviceId, moviechildId, _type, tvid, coocaamid, title) {
  if (deviceId == null) {
    utils.showToastBox('无设备id!', "loading")
    return
  }
  var paramsStr
  console.log(_type)
  if (_type == "电影") {
    paramsStr = { "ccsession": wx.getStorageSync("cksession"), "deviceId": deviceId + '', "movieId": movieId }
  } else {
    paramsStr = { "ccsession": wx.getStorageSync("cksession"), "coocaamid": coocaamid, "deviceId": deviceId + '', "movieId": movieId, "moviechildId": moviechildId + '' }
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
      console.log(res)
      if (res.data.result) {
        that.setData({
          chioced: coocaamid,
          moviepush: true
        })
        addpushhistory(that, movieId,title, tvid);//保存推送历史
        utils.showToastBox("推送成功", "success")
      } else {
        utils_fyb.showFailedToast(res.data.message, '../../images/close_icon.png');
      }
    },
    fail: function (res) {
      utils_fyb.showFailedToast(res.data.message, '../../images/close_icon.png');
    }
  })
}

function addpushhistory(that, movieId, title, video_id) {
  const secret = app.globalData.secret
  var paramsStr = { "appkey": app.globalData.appkey, "time": app.globalData.time(), "version_code": app.globalData.version_code, "vuid": wx.getStorageSync("wxopenid") }
  var sign = utils.encryptionIndex(paramsStr, secret)
  console.log(paramsStr)
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
    },
  })
}



//获取设备信息
function getDevices(that, message, tvid, coocaamid, title) {
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
    if (res.data.data) {
      for (var ii = 0; ii < res.data.data.length; ii++) {
        if (res.data.data[ii].bindStatus === 1) {
          console.log("有绑定中的设备")
          console.log(res.data.data[ii].deviceId);
          wx.setStorageSync('deviceId', res.data.data[ii].deviceId)
          push(that, that.data.movieId, res.data.data[ii].deviceId, that.data.moviechildId, that.data.movieType, tvid, coocaamid, title)
        }else{
          //跳转教程页面
          wx.redirectTo({
            url: '../home/home'
          })
        }
      }
    } else {
      //跳转教程页面
      wx.redirectTo({
        url: '../home/home'
      })
      // wx.showModal({
      //   title: '无法推送',
      //   content: '您未关联任何设备,请查看教程',
      //   success: function (res) {
      //     if (res.confirm) {
      //       console.log('用户点击确定')
      //       //跳转教程页面
      //       wx.redirectTo({
      //         url: '../course/course'
      //       })
      //     } else if (res.cancel) {
      //       console.log('用户点击取消')
      //     }
      //   }
      // })

    }
  }, function (res) {

  }, function (res) {

  }, message)
}