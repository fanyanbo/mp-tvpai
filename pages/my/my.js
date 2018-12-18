// pages/my/my.js
var utils = require('../../utils/util.js');
var appJs = require('../../app.js');
var api = require('../../config/config.js')
var app = getApp()

var userDebug = false
var debugCnt = 0
var i1 = 1
var i2 = 1
var i3 = 1

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      nickName: '你好',
      avatarUrl: '../../images/man.png'
    },
    username: '未登录',
    coocaaLogin: true,
    hasArticle: true,
    hasTopic: true,
    hasMovie: true,
    page: 1,
    topicPage: 1,
    moviePage: 1,
    total: '0',
    topicTotal: 0,
    movieTotal: 0,
    pageSize: 10,
    // topicPageSize: 10,
    // moviePageSize: 10,
    // articleData: [],
    // topicData: [],
    // movieData: [],
    storgeSize: 0,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  userDebug: function () {
    userDebug = true
  },
  webNavigateTo: function () {
    wx.navigateTo({
      url: '../webView/webView'
    })
  },
  bindGetUserInfo: function (e) {
    console.log('授权信息:' + this.data.coocaaLogin)
    console.log(e.detail.userInfo)
    if (e.detail.userInfo!=undefined){
      this.setData({
        userInfo: e.detail.userInfo,
        onLine:true
      })
      getApp().globalData.onLine=true
      if (this.data.coocaaLogin) {
        if (utils.ccsessionIs() == null) return
        wx.navigateTo({
          url: '../login/coocaa',
        })
      } else {
        wx.navigateTo({
          url: '../home/home',
        })
      }
    }else{
      getApp().globalData.onLine = false
      this.setData({
        onLine: false
      })
     
    }
  },
  lower: function (e) {
    var that = this
    if (i1 == that.data.page){
      console.log('lower:')
      if (that.data.page > 1 && that.data.page <= that.data.totalPageArticle) {
        this.getArticle()
      }
      i1++
    }
    return
  },
  lower1: function (e) {
    var that = this
    if (i2 == that.data.topicPage) {
      console.log('lower1:')
      if (that.data.topicPage > 1 && that.data.topicPage <= that.data.totalPageTopic) {
        this.getTopic()
      }
      i2++
    }
    return
  },
  lower2: function (e) {
    var that = this
    if (i3 == that.data.moviePage){
      console.log('lower2:')
      if (that.data.moviePage > 1 && that.data.moviePage <= that.data.totalPageMovie) {
          this.getMovie()
      }
      i3++
    }
    return
  
  },
  upper: function (e) {
    // console.log('upper:')
    // console.log(e)
  },
  scroll: function (e) {
    // console.log(e)
  },
  handler: function (e) {
    console.log("原先的点击")
    console.log(e);
    var that = this
    if (e.detail!=undefined){
      app.globalData.auhtSetting = e.detail['authSetting']['scope.userInfo'];
    }
    
 
    //判断ccsession是否为空
    if (utils.ccsessionIs() == null) return
    if (this.data.coocaaLogin) {
      wx.navigateTo({
        url: '../login/coocaa',
      })
    } else {
      wx.navigateTo({
        url: '../home/home',
      })
    }
  },
  getArticle:function(){
    var that = this
    var username = wx.getStorageSync('username')
    if (that.data.page > 1 && ((that.data.page - 1) * 10 > that.data.total || (that.data.page - 1) * 10 == that.data.total)) {
      return false;
    }
    var key = app.globalData.key
    var ccsession = wx.getStorageSync('cksession')
    var page = that.data.page
    // var pageSize = that.data.pageSize
    var paramsStr = { "ccsession": ccsession, "page": page + '', "pageSize": '10' }
    var sign = utils.encryption(paramsStr, key)
    wx.request({
      url: api.getCollectArticleUrl,
      method: 'GET',
      data: {
        client_id: app.globalData.client_id,
        sign: sign,
        param: paramsStr
      },
      success: function (res) {
        var data = res.data


        console.log("0res文章")
        console.log(res)
        if (res.data.result) {
          var data = res.data.data
          var list = data.list
          that.setData({
            totalPageArticle: data.pager.totalPage
          })
          if (data != null && data.list != null && data.list.length > 0) {
            that.setData({
              hasArticle: false
            })
          } else {
            that.setData({
              hasArticle: true
            })
          }

          console.log("获取我的文章成功")
         
          if (that.data.page == 1 && !that.data.coocaaLogin) {
            console.log("第一页")
            if (list != null && list != undefined) {
              that.setData({
                total: data.pager.totalNum,
                page: that.data.page + 1,
                articleData: data.list
              });
            }
          } else {

            if (that.data.coocaaLogin) {
              that.setData({
                total: data.pager.totalNum,
                page: 1,
                articleData: data.list
              });
            } else if (username != null && username != '') {
              console.log("大于一页")
              that.setData({
                total: data.pager.totalNum,
                page: that.data.page + 1,
                articleData: that.data.articleData.concat(data.list)
              });
            }

          }
          console.log("articleData===========")
          console.log(that.data.articleData)
          console.log(that.data.page)
          console.log("that.data.coocaaLogin..................")
          console.log(that.data.coocaaLogin)
          console.log("data.list")
          console.log(data.list)
        }


        // if (data && data.data) {
        //   if (data.data.pager.page == 1){
        //     that.setData({
        //       articleData: data.data.list,
        //       page: data.data.pager + 1 + ''
        //     })
        //   }else {
        //   that.setData({
        //     articleData: that.data.articleData.concat(data.data.list),
        //     page: data.data.pager + 1 + ''
        //   })
        // }

      },
      fail: function (res) {
        console.log('fail:' + res)
        console.log("获取我的文章失败")
        utils.showFailToast(that, "获取我的文章失败,请稍后")
      }
    })
  },
  getTopic:function(){
    var that = this
    var username = wx.getStorageSync('username')
    if (that.data.topicPage > 1 && (10 * (that.data.topicPage - 1) > that.data.topicTotal || 10 * (that.data.topicPage - 1) == that.data.topicTotal) ) {
      return false;
    }
    let key = app.globalData.key
    let ccsession = wx.getStorageSync('cksession')
    let page = that.data.topicPage
    //let pageSize = that.data.topicPageSize
    let paramsStr = { "ccsession": ccsession, "page": page + '', "pageSize": '10' }
    let sign = utils.encryption(paramsStr, key)
    wx.request({
      url: api.getEmpCommentUrl,
      method: 'GET',
      data: {
        client_id: app.globalData.client_id,
        sign: sign,
        param: paramsStr
      },
      success: function (res) {
        var data = res.data
        if (data.data != null && data.data.list != null && data.data.list.length > 0) {
          that.setData({
            hasTopic: false
          });

        } else {
          that.setData({
            hasTopic: true
          });
        }
        console.log("话题res")
        console.log(res)

        if (res.data.result) {

          that.setData({
            totalPageTopic: data.data.pager.totalPage
          })
          let list = data.data.list
          for (let i in list) {
            // createTime
            list[i].createTime = utils.toDate(list[i].createTime, '-')
            console.log(list[i].createTime)
          }
          console.log("获取参与话题成功")
          var data = res.data.data
          var list = data.list
          if (that.data.topicPage == 1 && !that.data.coocaaLogin) {
            console.log("第一页")
            if (list != null && list != undefined) {
              that.setData({
                topicTotal: data.pager.totalNum,
                topicPage: that.data.topicPage + 1,
                topicData: data.list
              });
            }

          } else {
            if (that.data.coocaaLogin) {
              that.setData({
                topicTotal: data.pager.totalNum,
                topicPage: 1,
                topicData: data.list
              });
            } else if (username != null && username != '') {
              console.log("大于一页")
              that.setData({
                topicTotal: data.pager.totalNum,
                topicPage: that.data.topicPage + 1,
                topicData: that.data.topicData.concat(data.list)
              });
            }

          }
          console.log("topicData------------")
          console.log(that.data.topicData)
          console.log(that.data.page)
        }
      },
      fail: function (res) {
        console.log('fail:' + res)
        console.log("获取我的话题失败")
        utils.showFailToast(that, "获取我的话题失败,请稍后")
      }
    })
  },
  getMovie:function(){
    var username = wx.getStorageSync('username')
    var that = this
    if (that.data.moviePage > 1 && ((that.data.moviePage - 1) * 10 > that.data.movieTotal || (that.data.moviePage - 1) * 10 == that.data.movieTotal)) {
      return false;
    }
    let key = app.globalData.key
    let ccsession = wx.getStorageSync('cksession')
    console.log("ccsession影片的")
    console.log(ccsession)
    let page = that.data.moviePage
    // let pageSize = that.data.moviePageSize
    let paramsStr = { "ccsession": ccsession, "page": page + '', "pageSize": '10' }
    let sign = utils.encryption(paramsStr, key)
    wx.request({
      url: api.getCollectMoviesUrl,
      method: 'GET',
      data: {
        client_id: app.globalData.client_id,
        sign: sign,
        param: paramsStr
      },
      success: function (res) {
        // that.onLoad();

        //  else if (data.data.list == null){
        //   that.setData({
        //     hasMovie: false
        //   })
        // }
        console.log("影片res:")
        console.log(res)
        if (res.data.result) {
         
          var data = res.data
          that.setData({
            totalPageMovie: data.data.pager.totalPage
          })
          if (data.data != null) {
            that.setData({
              hasMovie: false
            })
            let list = data.data.list

            if (list != null) {
              for (let j in list) {
                if (list[j].publish_date) {
                  list[j].publish_date = list[j].publish_date + ' | '
                }
                if (list[j].publish_area) {
                  list[j].publish_area = list[j].publish_area + ' | '
                }
                if (list[j].video_tags) {
                  let video_tags = list[j].video_tags.split(',')
                  if (video_tags.length > 3) {
                    list[j].video_tags = video_tags.splice(-3) + ' | '
                  }
                }
              }
            }

          } else {
            that.setData({
              coocaaLogin: true
            })
          }
          console.log("获取收藏影片成功")
          var data = res.data.data
          var list = data.list
          if (that.data.moviePage == 1 && !that.data.coocaaLogin) {
            console.log("第一页")
            if (list != null && list != undefined) {
              that.setData({
                movieTotal: data.pager.totalNum,
                moviePage: that.data.moviePage + 1,
                movieData: data.list
              });
            }
          } else {
            if (that.data.coocaaLogin) {
              that.setData({
                movieTotal: data.pager.totalNum,
                moviePage: 1,
                movieData: data.list
              });
            } else if (username != null && username != ''){
              console.log("大于一页")
              that.setData({
                movieTotal: data.pager.totalNum,
                moviePage: that.data.moviePage + 1,
                movieData: that.data.movieData.concat(data.list)
              });
            }
          
          }
          console.log("movieData=============")
          console.log(that.data.movieData)
          console.log("movieTotal")
          console.log(that.data.movieTotal)
          console.log(that.data.page)
          // that.onLoad()

        }


        // if (data && data.data ) {
        //   if (data.data.pager.page == 1){
        //     that.setData({
        //     movieData: data.data.list,
        //     moviePage: data.data.pager + 1 + ''
        //   })
        //   } else {
        //   that.setData({
        //     movieData: that.data.movieData.concat(data.data.list),
        //     moviePage: data.data.pager + 1 + ''
        //   })
        // }
        // }
      },
      fail: function (res) {
        console.log('fail:' + res)
        console.log("获取收藏影片失败")
        utils.showFailToast(that, "获取收藏影片失败,请稍后")
      }
    })
  },
  onLoad: function () {
    console.log('授权登陆')
    console.log(this.data.canIUse)
    var that = this
    var ccsession = app.globalData.ccsession
    // console.log("ccsession:")
    // console.log(ccsession)
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
        
              console.log(res.userInfo)
            }
          })
        }
      }
    })



    if (ccsession === null || ccsession === '') {
      //重新登录
      wx.login({
        success: function (e) {
          var code = e.code
          wx.getUserInfo({
            success: function (res) {
              var encryptedData = res.encryptedData
              var iv = res.iv;
              var rawData = res.rawData
              var signature = res.signature
              app.globalData.userInfo = res.userInfo
              wx.setStorageSync('userInfo', app.globalData.userInfo)
              typeof cb == "function" && cb(app.globalData.userInfo)
              console.log('test,11111111111111111111')
              appJs.login(rawData, code, encryptedData, iv, signature)
              getApp().globalData.onLine = true
              that.setData({
                userInfo: res.userInfo,
                onLine: true
              })
              
            }
          })
        }
      })
    } else {
  
      app.getUserInfo();
      var userInfo = app.globalData.userInfo
      if (typeof (userInfo) == "undefined") {
        console.log('get user info failed')
      } else {
        console.log('get user info success')
      }
      getApp().globalData.onLine = true
      //更新数据
      that.setData({
        userInfo: userInfo,
        username: wx.getStorageSync("username"),
        onLine: true
      })

    }

    // get coocaa login info
    // var username = wx.getStorageSync('username')
    console.log("app.globalData.username")
    console.log(app.globalData.username)
    if (app.globalData.username != '未登录' && app.globalData.username != '') {
      console.log("进来了")
      that.setData({
        username: app.globalData.username,
        coocaaLogin: false
      })
    } else if (app.globalData.username == '未登录') {
      that.setData({
        username: app.globalData.username,
        coocaaLogin: true,
      })
    } else if (app.globalData.username == '') {
      that.setData({
        username: '未登录',
        coocaaLogin: true,
      })
    }
    //tab
    /** 
     * 获取系统信息 
     */
    wx.getSystemInfo({

      success: function (res) {
        console.log("设备信息")
        console.log(res)
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
          clientHeight: res.windowHeight - 240
        });
      }
    });
    // if (this.data.movieData != null && this.data.movieData.length > 0) {
    this.setData({
      movieTotal: 0,
      moviePage: 1,
      movieData: []
    });
    this.getMovie();
    // }
    // if (this.data.articleData != null && this.data.articleData.length > 0) {
    this.setData({
      total: 0,
      page: 1,
      articleData: []
    });
    this.getArticle();
    // }
    // if (this.data.topicData != null && this.data.topicData.length > 0) {
    this.setData({
      topicTotal: 0,
      topicPage: 1,
      topicData: []
    });
    this.getTopic();
    // }

  },
  onShareAppMessage: function () {
    return {
      title: '酷影评',
      path: 'pages/my/my'
    }
  },
  onShow: function () {
    var that = this
    //var ccsession = wx.getStorageSync('cksession');
    userDebug = false
    debugCnt = 0
    console.log('onshow')
    var that = this
    wx.getStorageInfo({
      success: function (res) {
        that.setData({ storgeSize: res.currentSize })
      }
    })
    //var username = wx.getStorageSync('username')
    //checkUser
    let key = app.globalData.key
    let ccsession = wx.getStorageSync('cksession')
    let paramsStr = { "ccsession": ccsession}
    let sign = utils.encryption(paramsStr, key)
    wx.request({
      url: api.checkUserUrl,
      method: 'GET',
      data: {
        client_id: app.globalData.client_id,
        sign: sign,
        param: paramsStr
      },
      success: function (res) {
        if (res.data.result && res.data.data !=null) {
          console.log("checkUser:")
          console.log(res)
          wx.setStorageSync('userid', res.data.data.userid)
          wx.setStorageSync('username', res.data.data.username)
          wx.setStorageSync('mobile', res.data.data.mobile)

          if (res.data.data.userid === undefined || res.data.data.userid === '' || res.data.data.userid===null){
            app.globalData.username = '未登录'
            that.setData({
              username: '未登录',
              coocaaLogin: true
            })
            console.log("=======+++++++")
          }else{
           
            app.globalData.username = res.data.data.username
            that.setData({
              username: app.globalData.username,
              coocaaLogin: false
            })
          }
        }
      }})

    if (app.globalData.username != '未登录' && app.globalData.username != '') {
      console.log("进来了2")
      that.setData({
        username: app.globalData.username,
        coocaaLogin: false
      })
    } else if (app.globalData.username == '未登录') {
      that.setData({
        username: app.globalData.username,
        coocaaLogin: true
      })
    } else if (app.globalData.username == '') {
      that.setData({
        username: '未登录',
        coocaaLogin: true
      })
    }
    console.log("app.globalData.username")
    console.log(app.globalData.username)
      i1=2
      i2=2
      i3=2
      // that.onLoad()
      if (this.data.movieData != null && this.data.movieData.length > 0 && !that.data.coocaaLogin) {
        this.setData({
          movieTotal: 0,
          moviePage: 1,
          movieData: []
        });
        this.getMovie();
      }
      if (this.data.articleData != null && this.data.articleData.length > 0) {
        this.setData({
          total: 0,
          page: 1,
          articleData: []
        });
        this.getArticle();
      }
      if (this.data.topicData != null && this.data.topicData.length > 0) {
        this.setData({
          topicTotal: 0,
          topicPage: 1,
          topicData: []
        });
        this.getTopic();
      }



  },
  onPullDownRefresh: function () {
    console.log(1)
    this.setData({
      total: 0,
      page: 1,
      topicTotal: 0,
      topicPage: 1,
      movieTotal: 0,
      moviePage: 1,
      movieData: [],
      topicData: [],
      articleData: []
    })
    this.getMovie()
    this.getArticle()
    this.getTopic()

    wx.stopPullDownRefresh();
  },

  // tab
  /** 
  * 滑动切换tab 
  */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {

    var that = this;
    console.log(e.currentTarget.dataset.current)
    if (this.data.currentTab === e.currentTarget.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.currentTarget.dataset.current
      })
    }
  },
  noBinds: function (e) {
    var that = this
    //判断ccsession是否为空
    if (utils.ccsessionIs() == null) return
    wx.navigateTo({
      url: '../login/coocaa',
    })
  }

})






