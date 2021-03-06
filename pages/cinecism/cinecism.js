// pages/cinecism/cinecism.js
const api = require('../../api/api.js');
var utils = require('../../utils/util.js')
var app = getApp()
var a = 1
var voteClicknum = 1
var moviechildId
var movieId
var videotype
var starArray = new Array()
var starClass = new Array()
var contentId
var scHeight
var contentArray = new Array()
var movieidArray = new Array()
var newZu = ''
var newZu2 = ''
// 星星数组
var starClass0 = new Array()
var starClass1 = new Array()
var starClass2 = new Array()
var starClass3 = new Array()
var starClass4 = new Array()

Page({
  data: {
    allId: '',
    optionIds: [],
    voteIds: null,
    failHidden: true,
    failText: "",
    loadData: [],
    total: 0,
    page: 1,
    chioceClass: "chioceIcon",
    collectNum: '',
    img: '',
    hidden: 'true',
    hidden1: 'true',
    hidden2: 'true',
    hidden3: 'true',
    isDisabled: [],
    virtual: [],
    virtual2: [],
    topicContent: '',
    cicleMany: [],
    starArrays: [],
    lenIs: false
    // mydata:''
  },
  onLoad: function (options) {
    this.setData({
      allId: options.id
    })
    getArtical(this)
    getAboutMovie(this)
    getCommenList(this)
    wx.getSystemInfo({
      success: function (res) {
        scHeight = res.screenHeight
      }
    })
  },
  onShow: function (e) {
    if (this.data.loadData != null && this.data.loadData.length > 0) {
      this.setData({
        failHidden: true,
        failText: "",
        total: 0,
        page: 1,
        loadData: []
      });
      getCommenList(this);
    }
    // var pages = getCurrentPages();
    // var currPage = pages[pages.length - 1]; //当前页面
    // console.log("currPage") 
    // console.log(currPage.data.mydata) 
    if (wx.getStorageSync('userid') === '' || wx.getStorageSync('userid') === null) {
      utils.checkUsers()
    }
  },
  onReachBottom: function () {
    if (this.data.page > 1) {
      getCommenList(this);
    }
  },
  onPullDownRefresh: function () {
    this.setData({
      failHidden: true,
      failText: "",
      total: 0,
      page: 1
    });
    getCommenList(this);
    wx.stopPullDownRefresh();
  },
  onShareAppMessage: function () {
    var that = this
    return {
      title: that.data.articleTitle,
      path: 'pages/cinecism/cinecism?id=' + that.data.articlesId
    }
  },
  formSubmit: function (e) {
    console.log("formid：")
    console.log(e.detail.formId)
    wx.setStorageSync("formid", e.detail.formId)
  },
  collect(e) {
    movieidArray = []
    //判断ccsession是否为空
   // if (utils.ccsessionIs() == null) return
    //点击收藏时判断用户是否登录酷开账号
    if (utils.coocaaLogin() == null) return
    var that = this
    var newZu2 = ''
    var url = api.appletCollectVideoUrl
    var key = app.globalData.key
    var ccsession = wx.getStorageSync("new_cksession")
    // var moviesId = options.currentTarget.dataset.moviesid
    contentId = e.currentTarget.dataset.contentid
    var index = e.currentTarget.dataset.contentid

    console.log("contentArray")
    console.log(contentArray)
    if (that.data.starArrays[index] == 'starIcon' || that.data.starArrays[index] == undefined) {
      if (contentArray != null && contentArray != undefined) {
        for (var i = 0; i < contentArray.length; i++) {
          if (contentArray[i].contentId == contentId) {
            if (contentArray[i].movieIdsList != null && contentArray[i].movieIdsList != undefined) {
              for (var j = 0; j < contentArray[i].movieIdsList.length; j++) {
                movieidArray.push(contentArray[i].movieIdsList[j].movieId)
                newZu2 += contentArray[i].movieIdsList[j].movieId + ',';
              }
            }

          }
        }
      }
      newZu2 = newZu2.substr(0, newZu2.length - 1)
      console.log("movieidArray")
      console.log(movieidArray)
      console.log("newZu2")
      console.log(newZu2)

      if (movieidArray != null && movieidArray.length > 0) {
        newZu = []
        for (var k = 0; k < movieidArray.length; k++) {
          newZu += "'" + movieidArray[k].toString() + "'" + ','
        }
        newZu = newZu.substr(0, newZu.length - 1)
        newZu = '[' + newZu + ']'
      }

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
          console.log("res==========")
          console.log(res)
          if (res.data.result) {
            console.log("获取收藏影片接口成功")
            // var index = e.currentTarget.dataset.contentid
            that.data.starArrays[index] = 'starIcon1'
            that.data.isDisabled[index] = true
            that.setData({
              starArrays: that.data.starArrays,
              isDisabled: that.data.isDisabled
            })
            utils.showToastBox("收藏成功", "success")
            var type = "movieCollect"
            //  console.log("从缓存中取得的formid")
            //  console.log(formId)

            utils.eventCollect(type, newZu2)
          } else {
            //  utils.showFailToast(this, "操作失败，请重试")
            utils.showToastBox(res.data.message, "loading")
          }
        },
        fail: function () {
          console.log("获取收藏影片接口失败")
        }
      })
    }

  },
  handClick(e) {
    //判断ccsession是否为空
  //  if (utils.ccsessionIs() == null) return
    var commentid = e.currentTarget.dataset.commentid
    console.log("commentId:" + commentid)
    var that = this
    var url = api.clickLikeUrl
    var key = app.globalData.key
    var ccsession = wx.getStorageSync("new_cksession")
    var paramsStr = { "ccsession": ccsession, "commentId": commentid + '' }
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
          console.log("获取点赞接口成功")
          var data = res.data.data
          if (data != null && data != undefined) {
            var id = e.currentTarget.dataset.id
            // 点赞数组
            var praiseNum = that.data.praiseNum
            var add = parseInt(praiseNum[id]) + 1
            var reduice = parseInt(praiseNum[id]) - 1
            //点赞图标数组
            var str = that.data.likeClass
            if (data.type == 'sure') {
              str[id] = 'true'
              praiseNum[id] = add
            } else if (data.type == 'cancel') {
              str[id] = 'false'
              praiseNum[id] = reduice
            }

            that.setData({
              likeClass: str,
              praiseNum: praiseNum
            })
            var type = "commentEmp"
            // console.log("从缓存中取得的formid")
            // console.log(formId)
            utils.eventCollect(type, commentid)

          }
        }
      },
      fail: function () {
        console.log("获取点赞接口失败")
      }
    })
  },
  closeBar: function (e) {
    var that = this
    that.setData({
      hidden: 'true',
      scHeight: 'auto',
      isTrue: 'false'
    })
  },
  clickBar: function (e) {
    var that = this
    that.setData({
      hidden: 'false',
      scHeight: scHeight,
      isTrue: 'hidden'
    })
  },
  clickLike: function (e) {
    //判断ccsession是否为空
  //  if (utils.ccsessionIs() == null) return
    console.log("收藏文章按钮")
    a++
    var that = this

    var index = parseInt(that.data.collectNum)
    var indexAdd = index + 1
    var indexRediuce = index - 1
    var url = api.appletEmpCollectArticleUrl
    var key = app.globalData.key
    var ccsession = wx.getStorageSync("new_cksession")
    var articleId = e.currentTarget.dataset.articleid
    var paramsStr = { "articleId": articleId + '', "ccsession": ccsession }
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
        if (res.data.result) {
          console.log("获取收藏文章接口成功")
          if (res.data.data != null && res.data.data != undefined) {
            if (res.data.data.type == 'sure') {
              utils.showToastBox("已喜欢", "success")
            } else if (res.data.data.type == 'cancel') {
              utils.showToastBox("已取消喜欢", "success")
            } else {
              utils.showToastBox("失败", "loading")
            }
          }
          if (a % 2 == 0) {
            that.setData({
              img: 2,
              collectNum: indexAdd
            })
          } else {
            that.setData({
              img: 1,
              collectNum: indexRediuce
            })
          }
          var type = "articleCollect"
          // console.log("从缓存中取得的formid")
          // console.log(formId)
          utils.eventCollect(type, articleId)

        } else {
          utils.showToastBox("请重试", "loading")
        }
      },
      fail: function () {
        utils.showFailToast(that, "操作失败,请重试")
        console.log("获取收藏文章接口失败")
      }
    })
  },
  commentClick: function (e) {
    var that = this
  //  if (utils.ccsessionIs() == null) return
    that.setData({
      hidden1: 'false',
      focus: true
    })

  },
  bindconfirm: function (e) {
    var likeClass = new Array()
    var praiseNum = new Array()
    var createTime = new Array()
    var that = this
    // that.queryMultipleNodes()
    var content = e.detail.value
    content = encodeURI(content, 'utf-8')
    var articleId = e.currentTarget.dataset.id
    var url = api.saveArticleCommentByUserUrl
    var key = app.globalData.key
    var ccsession = wx.getStorageSync("new_cksession")
    var paramsStr = { "articleId": articleId + '', "ccsession": ccsession, 'content': content }
    var sign = utils.encryption(paramsStr, key)

    if (content == "" || content == null) {
      utils.showToastBox("输入的评论为空", "loading")
    } else {
      var dataStr = utils.json2Form({ client_id: 'applet', sign: sign, param: '{"articleId":"' + articleId + '","ccsession":"' + ccsession + '","content":"' + content + '"}' })

      console.log('dataStr======================')
      console.log(dataStr)
      wx.request({
        url: url,
        data: dataStr,
        method: 'post',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: res => {
          if (res.data.result) {
            //获取评论高度

            // console.log("scrollsTop:")
            // console.log(scrollsTop)
            // var selfHeight = winHeight - scrollsTop
            // wx.pageScrollTo({
            //   scrollTop: selfHeight
            // })
            that.data.loadData = []
            that.data.page = 1
            console.log("获取评论成功")
            var data = res.data.data
            if (data != null && data != undefined) {
              var list = data.list
              if (that.data.page == 1) {
                if (list != null && list != undefined) {
                  for (var i = 0; i < list.length; i++) {
                    if (list[i].commentEmp == null) {
                      likeClass.push("")
                    } else {
                      likeClass.push("true")
                    }
                    praiseNum.push(list[i].praiseNum)
                    createTime.push(utils.getDateDiff(list[i].createTime * 1000))
                  }
                }

                that.setData({
                  total: data.pager.totalNum,
                  page: that.data.page + 1,
                  loadData: data.list
                })
              } else {
                that.setData({
                  total: data.pager.totalNum,
                  page: that.data.page + 1,
                  loadData: that.data.loadData.concat(data.list)
                });
                for (var i = 0; i < that.data.loadData.length; i++) {
                  if (that.data.loadData[i].commentEmp == null) {
                    likeClass.push("")
                  } else {
                    likeClass.push("true")
                  }
                  praiseNum.push(that.data.loadData[i].praiseNum)
                  createTime.push(utils.getDateDiff(that.data.loadData[i].createTime * 1000))
                }
              }
            }
            that.setData({
              commentData: data,
              likeClass: likeClass,
              praiseNum: praiseNum,
              createTime: createTime,
              inInput: ""
            })
            utils.showToastBox("评论成功", "success")

            var type = "articleComment"
            // console.log("从缓存中取得的formid")
            // console.log(formId)
            utils.eventCollect(type, articleId)

          } else {
            utils.showToastBox("评论失败，请重试", "loading")
          }
          that.setData({
            hidden1: 'true'
          })
        },
        fail: function () {
          console.log("获取保存接口失败")
          utils.showFailToast(that, "加载失败，请重试")
          that.setData({
            hidden1: 'true'
          })
        }
      })
    }

  },
  closeGray: function () {
    var that = this
    that.setData({
      hidden: 'true',
      scHeight: 'auto',
      isTrue: 'scroll'
    })
  },
  closeGray1: function () {
    var that = this
    that.setData({
      hidden1: 'true',
      scHeight: 'auto',
      isTrue: 'scroll'
    })
  },
  closeGray2: function () {
    var that = this
    that.setData({
      hidden2: 'true',
      scHeight: 'auto',
      isTrue: 'scroll'
    })
  },
  chioceClick: function (e) {
    var that = this
    //选项id
    var optionId = e.currentTarget.dataset.optionid
    console.log("选项id:" + optionId)
    var voteId = e.currentTarget.dataset.voteid
    that.data.optionIds = []
    for (var key in that.data.cicleMany) { // 将其他投票选项置空
      that.data.cicleMany[key] = ""
    }
    that.data.optionIds.push(optionId)
    that.data.cicleMany[optionId] = "chioced"
    that.data.voteIds = voteId
    that.setData({
      cicleMany: that.data.cicleMany,
      optionIds: that.data.optionIds
    })
    console.log(that.data.optionIds)
  },
  chioceClick2: function (e) {
    var that = this
    var cicleMany = that.data.cicleMany
    //选项id
    var optionId = e.currentTarget.dataset.optionid
    var voteId = e.currentTarget.dataset.voteid
    if (that.data.voteIds != null && that.data.voteIds != voteId) {
      that.data.optionIds = []
      console.log(that.data.cicleMany)
      for (var key in that.data.cicleMany) { // 将其他投票选项置空
        that.data.cicleMany[key] = ""
      }
    }
    that.data.voteIds = voteId
    console.log("选项id:" + optionId)
    if (cicleMany[optionId] == "chioced") {
      utils.removeByValue(that.data.optionIds, optionId)
      cicleMany[optionId] = ""
    } else {
      that.data.optionIds.push(optionId)
      cicleMany[optionId] = "chioced"
    }
    that.setData({
      cicleMany: cicleMany,
      optionIds: that.data.optionIds
    })
    console.log(that.data.optionIds)
  },
  voteVs: function (e) {
  //  if (utils.ccsessionIs() == null) return
    var that = this
    that.data.optionIds = []
    for (var key in that.data.cicleMany) { // 将其他投票选项置空
      that.data.cicleMany[key] = ""
    }
    console.log(that.data.cicleMany)
    var optionid = e.currentTarget.dataset.optionid
    that.data.optionIds.push(optionid)
    that.voteArray(e)
    console.log("正反方")
    that.setData({
      cicleMany: that.data.cicleMany,
      optionIds: that.data.optionIds
    })
  },
  voteArray: function (e) {
    console.log("投票2")
    console.log(utils.ccsessionIs() == null)
  //  if (utils.ccsessionIs() == null) return
    var that = this
    var url = api.saveUserVoteUrl
    var key = app.globalData.key
    var ccsession = wx.getStorageSync("new_cksession")
    var voteId = e.currentTarget.dataset.vote
    console.log("voteId:" + voteId)

    var optionId = that.data.optionIds
    var optionIdStr = '[' + optionId.join(",") + ']'
    console.log(optionIdStr)
    if (optionIdStr == null || optionIdStr === "" || optionIdStr == undefined || optionIdStr == "[]") {
      utils.showToastBox("请选择投票选项", "loading")
      return
    }

    var paramsStr = { "articleId": that.data.allId, "ccsession": ccsession, "optionId": optionIdStr, "voteId": voteId + '' }
    console.log(paramsStr)
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
          console.log("获取投票接口成功")
          if (res.data.data != null && res.data.data != undefined) {
            var votesList = res.data.data
            console.log(votesList)
            that.setData({
              votesList: votesList,
            })
          }
          utils.showToastBox("投票成功", "success")
          var type = "articleVote"
          // console.log("从缓存中取得的formid")
          // console.log(formId)
          utils.eventCollect(type, voteId)
        } else {
          console.log(res.data.message)
          utils.showToastBox(res.data.message, "loading")
        }
      },
      fail: function () {
        utils.showFailToast(that, "操作失败，请重试")
        console.log("获取投票接口失败")
      }
    })

  },
  collectEvent: function (e) {
    console.log("触发了1");
  },
  pushVideo: function (e) {
    contentId = e.currentTarget.dataset.contentid
    var that = this
    moviechildId = null
    //判断ccsession是否为空
  //  if (utils.ccsessionIs() == null) return
  //  if (utils.coocaaLogin() == null) return
    console.log("获取设备列表")
    // movieId = e.currentTarget.dataset.movieid
    var allcount = e.currentTarget.dataset.allcount

    var nowcount = e.currentTarget.dataset.nowcount
    console.log("nowcount:")
    console.log(nowcount)
    var movietypes = e.currentTarget.dataset.movietypes
    videotype = e.currentTarget.dataset.videotype

    var tvCount = new Array()

    if (videotype != "电影") {
      for (var i = 0; i < nowcount; i++) {
        tvCount.push(i)
      }
    } else {
      videotype = 'dianying'
    }
    console.log("videotype:")
    console.log(videotype)
    console.log("tvCount:")
    console.log(tvCount)
    //console.log("影片编码：" + movieId)
    that.setData({
      tvCount: tvCount,
      username: wx.getStorageSync('username'),
      movietypes: movietypes,
      videotype: videotype,
      scHeight: scHeight,
      isTrue: 'hidden',
      tvChioced: 'zzzzz'
    })
    var cksession = wx.getStorageSync("new_cksession")
    //console.log(cksession != null && cksession != undefined && cksession !== '');
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
      scHeight: 'auto',
      isTrue: 'false'
    })
  },
  chioceService: function (e) {
    var that = this
    //传每一集的id给到推送按钮
    moviechildId = e.currentTarget.dataset.index
    console.log(moviechildId)
    that.setData({
      tvChioced: moviechildId
    })
  },
  pushMovies: function (e) {
    var that = this
    var source = e.currentTarget.dataset.source
    console.log("source")
    console.log(source)
    if (contentArray != null && contentArray != undefined) {
      for (var i = 0; i < contentArray.length; i++) {
        if (contentArray[i].contentId == contentId) {
          if (contentArray[i].movieIdsList != null && contentArray[i].movieIdsList != undefined) {
            for (var j = 0; j < contentArray[i].movieIdsList.length; j++) {
              if (contentArray[i].movieIdsList[j].source == source) {
                movieId = contentArray[i].movieIdsList[j].movieId
                break
              }
            }
          }

        }
      }
    }
    console.log("movieId===========================")
    console.log(movieId)
    if (videotype != 'dianying' && (moviechildId == null || moviechildId == undefined || moviechildId === '')) {
      utils.showToastBox("请先选择集数", "loading")
      return
    }
    //接收选中id
    var deviceId = e.currentTarget.dataset.id
    var serviceidspare = e.currentTarget.dataset.serviceidspare

    //var id = e.currentTarget.dataset.id
    //判断serviceid是否激活
    if ((e.currentTarget.dataset.serviceid == null || e.currentTarget.dataset.serviceid == undefined) && (serviceidspare == null || serviceidspare == undefined)) {
      // utils.showToastBox("电视不支持播放", "loading")
      that.setData({
        hidden3: 'false',
        // hidden:'true',
        hidden2: 'true'
      })

    } else {
      pushMovies(this, movieId, deviceId, moviechildId)
    }
  },
  closeFailBox: function () {
    var that = this
    that.setData({
      hidden3: 'true'
    })
  },
  detailTo: function (e) {
    movieidArray = []
    var articleid = e.currentTarget.dataset.articleid
    contentId = e.currentTarget.dataset.contentid
    var movietypes = e.currentTarget.dataset.movietypes
    var movieID
    if (contentArray != null && contentArray != undefined) {
      for (var i = 0; i < contentArray.length; i++) {
        if (contentArray[i].contentId == contentId) {
          if (contentArray[i].movieIdsList != null && contentArray[i].movieIdsList != undefined) {
            var movieIdsArrays = new Array()
            for (var j = 0; j < contentArray[i].movieIdsList.length; j++) {
              movieIdsArrays.push(contentArray[i].movieIdsList[j])
              movieidArray.push(contentArray[i].movieIdsList[j].movieId)
              if (contentArray[i].movieIdsList[j].source == 'iqiyi') {
                movieID = contentArray[i].movieIdsList[j].movieId
              } else {
                movieID = contentArray[i].movieIdsList[0].movieId
              }
            }
          }

        }
      }
    }

    console.log("跳转movieID")
    console.log(movieID)

    getApp().globalData.movieIdsList = movieIdsArrays
    console.log("movieIdsList")
    console.log(getApp().globalData.movieIdsList)
    wx.navigateTo({
      url: '../movieDetail/movieDetail?id=' + movieID
    })
  }
})


//推送接口
function pushMovies(that, movieId, deviceId, moviechildId) {
  var paramsStr
  var url = api.devicesPushUrl
  var key = app.globalData.key
  var ccsession = wx.getStorageSync("new_cksession")
  if (moviechildId == null || moviechildId == undefined || moviechildId === '') {
    paramsStr = { "ccsession": ccsession, "deviceId": deviceId + '', "movieId": movieId }
  } else {
    paramsStr = { "ccsession": ccsession, "deviceId": deviceId + '', "movieId": movieId, "moviechildId": moviechildId + '' }
  }
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
      console.log("推送res")
      console.log(res)
      if (res.data.result) {
        console.log("推送成功")
        utils.showToastBox("推送成功", "success")

        var type = "moviePush"
        // console.log("从缓存中取得的formid")
        // console.log(formId)
        utils.eventCollect(type, movieId)

      } else {
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
        //如果没有设备
        if (data == null || data == undefined || data.length == 0) {
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
          console.log("qiyi")
          console.log(qiyiList)
          console.log("tencentList")
          console.log(tencentList)

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
        utils.showToastBox("请重试", "loading")
      }
    },
    fail: function () {
      utils.showFailToast(that, "加载失败，请重试")
      console.log("获取设备接口失败")
    }
  })
}





// 文章详情
function getArtical(that) {
  var url = api.getArticleDetailUrl
  var key = app.globalData.key
  var ccsession = wx.getStorageSync("new_cksession")
  var paramsStr = { "articleId": that.data.allId, "ccsession": ccsession }
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
      console.log(res.data)
      if (res.data.result) {
        console.log("获取详情成功")
        var data = res.data.data
        console.log(data)
        if (data != null && data != undefined) {
          var votesList = data.voteList
          var createTime = utils.toDate(data.createTime / 1000)
          var img
          var timeData
          var timeStr = new Array()
          var numberP = 0
          var endTime = new Array()
          if (data.isCollectByWxopenid == "yes") {
            img = '2'
            a = '2'
          } else {
            img = '1'
            a = '1'
          }
          var timestamp = Date.parse(new Date()) / 1000;
          console.log("当前时间")
          console.log(timestamp)
          // if (votesList != null && votesList!=undefined){
          //   endTime = []
          //   for (var i = 0; i < votesList.length;i++){
          //     // if (timestamp > votesList[i].voteEndtime){
          //     //   endTime.push('false')
          //     // }else{
          //     //   endTime.push('true')
          //     // }
          //     endTime.push(votesList[i].voteEndtime) 
          //   }
          // }


          if (data.articleContactList != null && data.articleContactList != undefined) {
            for (var j = 0; j < data.articleContactList.length; j++) {
              timeData = data.articleContactList[j].contactArticle.createTime
              timeData = utils.toDate(timeData / 1000)
              timeStr.push(timeData)
            }
          }


          //  相关文章上
          var articleUp = new Array()
          //相关文章下
          var articleDown = new Array()
          if (data.articleContactList != null || data.articleContactList != undefined) {
            for (var i = 0; i < data.articleContactList.length; i++) {
              if (data.articleContactList[i].type == '1') {
                articleUp.push(data.articleContactList[i])
                // data.articleContactList[i].contactArticle.type == '0'
              } else if (data.articleContactList[i].type == '0') {
                articleDown.push(data.articleContactList[i])
              }
            }
          }
          var progressHide = 'hide'
          that.setData({
            dataList: data,
            cTime: createTime,
            votesList: votesList,
            collectNum: data.collectNum,
            img: img,
            timeData: timeData,
            articleUp: articleUp,
            articleDown: articleDown,
            // endTime: endTime,
            timestamp: timestamp,
            articleTitle: data.articleTitle,
            articlesId: data.id
          })
        }

      }
      utils.hideLoading()
    },
    fail: function () {
      utils.showFailToast(that, "加载失败，请重试")
      console.log("获取详情失败")
    }
  })

}


// 评论
function getCommenList(that) {
  var likeClass = new Array();
  var praiseNum = new Array();
  var createTime = new Array();
  if (that.data.page > 1 && (that.data.page - 1) * 10 >= that.data.total) {
    return false;
  }
  utils.showLoading();
  var url = api.getArticleCommentUrl
  var key = app.globalData.key
  var ccsession = wx.getStorageSync("new_cksession");
  var page = that.data.page;

  var paramsStr = { "articleId": that.data.allId, "ccsession": ccsession, "page": page + '', "pageSize": "10" };
  console.log("paramsStr:")
  console.log(utils.setParams(paramsStr))
  var sign = utils.encryption(paramsStr, key);
  console.log("sign:")
  console.log(sign)
  var dataStr = utils.json2Form({ client_id: 'applet', sign: sign, param: '{"articleId":"' + that.data.allId + '","ccsession":"' + ccsession + '","page":"' + page + '","pageSize":"10"}' });
  // console.log(dataStr);
  wx.request({
    url: url,
    data: dataStr,
    method: 'post',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: res => {
      ///console.log(res)
      if (res.data.result) {
        console.log("获取评论成功")
        var data = res.data.data
        var list = data.list
        if (that.data.page == 1) {
          console.log("第一页")
          if (list != null && list != undefined) {
            for (var i = 0; i < list.length; i++) {
              if (list[i].commentEmp == null) {
                likeClass.push("")
              } else {
                likeClass.push("true")
              }
              praiseNum.push(list[i].praiseNum)
              createTime.push(utils.getDateDiff(list[i].createTime * 1000))
            }
            that.setData({
              total: data.pager.totalNum,
              page: that.data.page + 1,
              loadData: data.list
            });
          }

        } else {
          console.log("大于一页")
          that.setData({
            total: data.pager.totalNum,
            page: that.data.page + 1,
            loadData: that.data.loadData.concat(data.list)
          });
          for (var i = 0; i < that.data.loadData.length; i++) {
            if (that.data.loadData[i].commentEmp == null) {
              likeClass.push("")
            } else {
              likeClass.push("true")
            }
            praiseNum.push(that.data.loadData[i].praiseNum)
            createTime.push(utils.getDateDiff(that.data.loadData[i].createTime * 1000))
          }
          console.log("评论数组：")
          console.log(that.data.loadData)
        }
        that.setData({
          commentData: data,
          likeClass: likeClass,
          praiseNum: praiseNum,
          createTime: createTime
        })
      }
      utils.hideLoading()
    },
    fail: function () {
      utils.showFailToast(that, "加载失败，请重试")
      console.log("获取评论失败")
    }
  })
}
//获取相关影片 
function getAboutMovie(that) {
  var url = api.getArticleMoviesUrl
  var key = app.globalData.key
  var ccsession = wx.getStorageSync("new_cksession")
  var paramsStr = { "articleId": that.data.allId, "ccsession": ccsession }
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
        console.log("获取收藏列表成功")
        var data1 = res.data.data
        var imgH = new Array()
        var imgV = new Array()
        var movieType
        var clooectList = new Array()
        console.log("data1:")
        console.log(data1)
        if (data1 != null && data1 != undefined) {
          starArray = []
          var tags = []
          for (var i = 0; i < data1.length; i++) {
            contentArray.push(data1[i])

            if (data1[i].moviesDetail != null) {
              that.setData({
                lenIs: true
              })
              var pingfen = data1[i].moviesDetail.videoData.base_info.score
              //评分
              utils.starGrade(pingfen, i, starClass0, starClass1, starClass2, starClass3, starClass4)
              starArray.push(data1[i])
              if (data1[i].moviesDetail.videoData != null && data1[i].moviesDetail.videoData != undefined) {
                tags[i] = data1[i].moviesDetail.videoData.base_info.video_tags
                if (tags[i] != null && tags[i] != undefined) {
                  tags[i] = tags[i].split(",")[0]
                }
                //评分

                clooectList.push(data1[i])

                if (data1[i].moviesDetail.videoData.base_info.video_type == '电影') {
                  movieType = data1[i].moviesDetail.videoData.base_info.video_type
                }
                // console.log("movieType:")
                // console.log(movieType)
                var haveVImg = false;
                for (var k = 0; k < data1[i].moviesDetail.videoData.show_info.images.length; k++) {
                  if (data1[i].moviesDetail.videoData.show_info.images[k].style == "v") {
                    haveVImg = true
                    imgV.push(data1[i].moviesDetail.videoData.show_info.images[k])
                    break
                  }
                }
                // 如果影片中没有树图，将填充一个undefined填位，防止图片串位
                if (!haveVImg) imgV.push("undefined")
              }

              if (starArray != null && starArray != undefined) {
                for (var n = 0; n < starArray.length; n++) {
                  if (starArray[n].moviesDetail.isCollectionMovie == "yes") {
                    starClass.push('starIcon1')
                  } else if (starArray[n].moviesDetail.isCollectionMovie == "no") {
                    starClass.push('starIcon')
                  }
                }
              }
            } else {
              imgV.push("undefined")
            }

          }
          console.log("imgV")
          console.log(imgV)
          console.log("tags")
          console.log(tags)

          console.log("starClass:")
          console.log(that.data.starClass)
          that.setData({
            clooectList: clooectList,
            moviesData: data1,
            imgV: imgV,
            movieType: movieType,
            starArray: starArray,
            starClass: starClass,
            starClass0: starClass0,
            starClass1: starClass1,
            starClass2: starClass2,
            starClass3: starClass3,
            starClass4: starClass4,
            tags: tags
          })
        }
      }
      utils.hideLoading()
    },
    fail: function () {
      console.log("获取收藏列表失败")
    }
  })
}



