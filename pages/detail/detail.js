// detail.js
var utils = require('../../utils/util.js');
var api = require('../../api/api.js');
var app = getApp()
var i = 1
var movieId 
var videotype
//var moviechildId
var movieidArray = new Array()
var collectIcons = 0
Page({
  data: {
    articleId:'',
    movieId:'',
    failHidden: true,
    failText: "",
    collectIcon:'1',
    activeClass: 0,
    hidden2:'true',
    hidden3: 'true',
  },
  onShow: function (option){

  },
  onLoad: function (option) {
    var page = this
    // if (option.movietypes == '' || option.movietypes==null){
    //   option.movietypes = 'iqiyi'
    // }
    this.setData({
      movieId: option.movieId,
      articleId: option.articleId,
     movietypes: option.movietypes,
      my: option.my
    })
    console.log("进来了")

    utils.showLoading()
    var url = api.getMoviesDetailUrl
    var key = app.globalData.key
    var ccsession = wx.getStorageSync("new_cksession")
    console.log(page.data.articleId)
    console.log(page.data.movieId)
    var paramsStr = { "articleId": page.data.articleId + '', "ccsession": ccsession, "movieId": page.data.movieId}
    var sign = utils.encryption(paramsStr, key)
    wx.request({
      url: url,
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
          // console.log(res)
        var data = res.data
       // console.log("data.data:")
        //console.log(data.data)
        if (data.result == true) {
          console.log("获取影视详情成功")
          // 评分
          var pingfen = data.data.videoData.base_info.score
          if (pingfen > 0 && pingfen <= 2) {
            page.setData({
              starClass0: 'true'
            })
          } else if (pingfen > 2 && pingfen <= 6) {
            page.setData({
              starClass0: 'true',
              starClass1: 'true'
            })
          } else if (pingfen > 6 && pingfen <= 8) {
            page.setData({
              starClass0: 'true',
              starClass1: 'true',
              starClass2: 'true'
            })
          } else if (pingfen > 8 && pingfen <= 9) {
            page.setData({
              starClass0: 'true',
              starClass1: 'true',
              starClass2: 'true',
              starClass3: 'true'
            })
          } else if (pingfen > 9 && pingfen <= 10) {
            page.setData({
              starClass0: 'true',
              starClass1: 'true',
              starClass2: 'true',
              starClass3: 'true',
              starClass4: 'true'
            })
          }
          var isCollectionMovie = data.data.isCollectionMovie
          var collectIcon
          if (isCollectionMovie == "yes") {
            collectIcon = '2'
            i = '2'
          }else{
            collectIcon = '1'
            i = '1'
          }
          var imagesH = data.data.videoData.show_info.images
          var imgH = new Array()
          for (var k = 0; k < imagesH.length;k++){
            if (imagesH[k].style == "h"){
              imgH.push(imagesH[k].url)
            }
          }
          page.setData({
            loadData:data.data,
            clooectList:data.data,
            movieData: data.data.videoData.base_info,
            contentData: data.data.videoData.show_info,
            aboutArtical: data.data.articleContactList,
            collectIcon: collectIcon,
            imgH: imgH
          })      
          if (option.movietypes == '' || option.movietypes == null){
            if (data.data.videoData.base_info.source == 'qq'){
              data.data.videoData.base_info.source = 'tencent'
            }
            page.setData({
              movietypes: data.data.videoData.base_info.source
            })
          }
          console.log("movietypes")
          console.log(page.data.movietypes)
          if (page.data.movieData != null && page.data.movieData!=undefined){
            var tags = page.data.movieData.video_tags
            if (tags != null && tags.length>0){
              tags = tags.split(",")[0]
            }
          }
          page.setData({
            tags: tags
          })    

          console.log("信息")
          console.log(data.data)     
        }
        utils.hideLoading()
      },
      fail: function () {
        utils.showFailToast(page, "加载失败，请重试")
        console.log("获取影视详情失败")
      }
    })
  },
  onShow: function () {
    
  },
  formSubmit: function (e) {
    console.log("formid：")
    console.log(e.detail.formId)
    wx.setStorageSync("formid", e.detail.formId)
  },
  collectMovie: function (e) {
    movieidArray = []
    //判断ccsession是否为空
    if (utils.ccsessionIs() == null) return
    if (utils.coocaaLogin() == null) return
    var that = this
    collectIcons ++
    if (collectIcons=='1'){
      var url = api.appletCollectVideoUrl
      var key = app.globalData.key
      var ccsession = wx.getStorageSync("new_cksession")
      //var moviesId = e.currentTarget.dataset.moviesid
      console.log(" getApp().globalData.movieIdsList:")
      console.log(getApp().globalData.movieIdsList)
      var newZu = ''
      var newZu2 = ''

      if (that.data.my == 'my' && that.data.movietypes == '') {
        newZu = '[' + that.data.movieId + ']'
      } else {
        if (getApp().globalData.movieIdsList != null && getApp().globalData.movieIdsList != undefined) {
          for (var j = 0; j < getApp().globalData.movieIdsList.length; j++) {
            movieidArray.push(getApp().globalData.movieIdsList[j].movieId)
            newZu2 += getApp().globalData.movieIdsList[j].movieId + ',';
          }
        }
        newZu2 = newZu2.substr(0, newZu2.length - 1)
        if (movieidArray != null && movieidArray.length > 0) {
          for (var k = 0; k < movieidArray.length; k++) {
            newZu += "'" + movieidArray[k].toString() + "'" + ','
          }
          newZu = newZu.substr(0, newZu.length - 1)
          newZu = '[' + newZu + ']'
        }
      }
      console.log("movieidArray")
      console.log(movieidArray)

      var paramsStr = { "ccsession": ccsession, "moviesId": newZu }
      var sign = utils.encryption(paramsStr, key)
      wx.request({
        url: url,
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
          console.log("点击收藏按钮")
          console.log(res.data.result)
          if (res.data.result) {
            console.log("获取收藏影片接口成功")
            i++
            if (i % 2 == 0) {
              that.setData({
                collectIcon: "2"
              });
            }
            utils.showToastBox("收藏成功", "success")
            var type = "movieCollect"
            // console.log("从缓存中取得的formid")
            // console.log(formId)

            utils.eventCollect(type, newZu2)
          } else {
            utils.showToastBox("请重试")
          }
        },
        fail: function () {
          console.log("获取收藏影片接口失败")
        }
      })
    }

  },
  clloect: function (e) {
    console.log(`点击了${e.target.dataset.id}`)
    this.setData({
      activeClass: e.target.dataset.id
    })
  },
  pushVideo: function (e) {
    var that = this
    //判断ccsession是否为空
    if (utils.ccsessionIs() == null) return
    if (utils.coocaaLogin() == null) return
    console.log("获取设备列表")
    movieId = e.currentTarget.dataset.movieid
    var allcount = e.currentTarget.dataset.allcount
    var nowcount = e.currentTarget.dataset.nowcount
    //var movietypes = e.currentTarget.dataset.movietypes
    videotype = e.currentTarget.dataset.videotype
    var tvCount = new Array()
    console.log("nowcount:" + nowcount)
    if (videotype != "电影") {
      for (var i = 0; i < nowcount; i++) {
        tvCount.push(i)
      }
    }
    console.log(tvCount)
    console.log("影片编码：" + movieId)
    that.setData({
      tvCount: tvCount,
      username: wx.getStorageSync('username'),
     // movietypes: movietypes
    })
    var cksession = wx.getStorageSync("new_cksession")
    if (cksession != null && cksession != undefined && cksession !== '') {
      serviceList(this)
    } else {
      utils.showToastBox("登录未授权，返回点击我的", "loading")
    }
  },
  closeList: function (e) {
    console.log("关闭设备列表")
    var that = this
    that.setData({
      hidden2: 'true',

    })
  },
  chioceService: function (e) {
    var that = this
    //传每一集的id给到推送按钮
    // moviechildId = e.currentTarget.dataset.index
    that.setData({
      tvChioced: e.currentTarget.dataset.index
    })
  },
  pushMovies: function (e) {
    var that = this
    var source = e.currentTarget.dataset.source
    console.log("source")
    console.log(source)
    if (getApp().globalData.movieIdsList != null && getApp().globalData.movieIdsList != undefined && getApp().globalData.movieIdsList != '') {
      for (var j = 0; j < getApp().globalData.movieIdsList.length; j++) {
        if (getApp().globalData.movieIdsList[j].source == source) {
          movieId = getApp().globalData.movieIdsList[j].movieId
        }
      }
    }else{
      movieId = that.data.movieId
    }
    

    if (videotype != '电影' && (that.data.tvChioced == null || that.data.tvChioced == undefined || that.data.tvChioced === '')) {
      utils.showToastBox("请先选择集数", "loading")
      return
    }
    //接收选中id
    var deviceId = e.currentTarget.dataset.id
    //var id = e.currentTarget.dataset.id
    var serviceidspare = e.currentTarget.dataset.serviceidspare
    //判断serviceid是否激活
    if ((e.currentTarget.dataset.serviceid == null || e.currentTarget.dataset.serviceid == undefined) && (serviceidspare == null || serviceidspare == undefined)) {
      // utils.showToastBox("电视不支持播放", "loading")
      that.setData({
        hidden3: 'false',
        // hidden:'true',
        hidden2: 'true'
      })
    } else {
      pushMovies(this, movieId, deviceId)
    }
  },
   closeFailBox: function () {
    var that = this
    that.setData({
      hidden3: 'true'
    })
  },
})



//推送接口
function pushMovies(that, movieId, deviceId) {
  var url = api.devicesPushUrl
  var key = app.globalData.key
  var ccsession = wx.getStorageSync("new_cksession")
  var paramsStr
  if (that.data.tvChioced == undefined || that.data.tvChioced == null){
    paramsStr = { "ccsession": ccsession, "deviceId": deviceId + '', "movieId": movieId}
  }else{
    paramsStr = { "ccsession": ccsession, "deviceId": deviceId + '', "movieId": movieId, "moviechildId": that.data.tvChioced + '' }
  }
  var sign = utils.encryption(paramsStr, key)
  console.log("deviceId:" + deviceId)
  console.log("ccsession:" + ccsession)
  console.log("that.data.tvChioced:" + that.data.tvChioced)
  console.log("movieId:" + movieId)
  console.log("sign")
  console.log(sign)
  wx.request({
    url: url,
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
        console.log("推送成功")
        utils.showToastBox("推送成功", "success")
        var type = "moviePush"
        // console.log("从缓存中取得的formid")
        // console.log(formId)
        utils.eventCollect(type, movieId)
      } else {
        console.log(res)
        console.log("推送失败")
        utils.showToastBox(res.data.message, "loading")
      }
    },
    fail: function () {
      utils.showFailToast(that, "操作失败，请重试")
      console.log("获取推送接口失败")
    }
  })

}

//设备展示
function serviceList(that) {
  var url = api.getDevicesUrl
  var key = app.globalData.key
  var ccsession = wx.getStorageSync("new_cksession")
  console.log("ccsession" + ccsession)
  var paramsStr = { "ccsession": ccsession }
  var sign = utils.encryption(paramsStr, key)
  wx.request({
    url: url,
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
        var data = res.data.data
        var qiyiList = new Array()
        var tencentList = new Array()
        var skyList = new Array()
        var vooleList = new Array()
        if (data != null || data != undefined){
          for (var i = 0, len = data.length; i < len; i++) {
            if (data[i].source == 'yinhe') {
              qiyiList.push(data[i])
            } else if (data[i].source == 'tencent') {
              tencentList.push(data[i])
            } else if (data[i].source == 'sky') {
              skyList.push(data[i])
            } else if (data[i].source == 'voole') {
              vooleList.push(data[i])
            }
          }
        }
        console.log("qiyiList")
        console.log(qiyiList)
        console.log("tencentList")
        console.log(tencentList)
        //如果没有设备
        if (data == null || data == undefined || data.length == 0 ) {

          //跳转教程页面
          wx.navigateTo({
            url: '../course/course'
          })
        } else {
          that.setData({
            hidden: 'true',
            hidden2: 'false',
            qiyiList: qiyiList,
            tencentList: tencentList,
            skyList: skyList,
            vooleList: vooleList
          })
        }
      } else {
      //  utils.showToastBox("请重试", "loading")
      }
    },
    fail: function () {
      utils.showFailToast(that, "加载失败，请重试")
      console.log("获取设备接口失败")
    }
  })
}


module.exports = {

}
