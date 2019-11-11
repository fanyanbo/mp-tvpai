const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
const app = getApp()

Page({
  data: {
    scrollHeight: '',
    topicDetail: [],
    customNavStyle: 'opacity: 0;',
    collectionList: [], //片单影片收藏列表
    movieCollectedList: {},
    isCollected: false, //当前片单是否收藏
    isShowNavBack: true, //导航栏是否显示返回
    isShowNavHome: false, //导航栏是否显示首页
    errIconUrl: '../../images/close_icon.png',
    title: '' //片单名称

    // customBackground: 'rgba(255,255,255,0)'
  },

  onLoad: function (options) {
    console.log("进入片单详情 options:", options)
    // 从分享进入，导航栏显示首页，隐藏返回
    if (options.from === 'share') {
      this.setData({ isShowNavBack: false, isShowNavHome: true })
    }
    this.data.topicId = options.id
    this.getTopicDetailById(options.id)
    this.getTopicFavorite(options.id)
    this.getMovieFavorite()
  },

  onPageScroll: utils.throttle(function (e) {
    let _scrollTop = e.scrollTop
    console.log('onPageScroll', _scrollTop)

    if (_scrollTop >= 270) { //移动高度270后再逐渐显示(改成立即显示)) 
      // let customNavStyle = `opacity: ${0.5 + 0.5 * (_scrollTop - 270)/ 202};`
      this.data.isSettingHide = false
      if (!this.data.isSettingShow) {
        let customNavStyle = `opacity: 1;`
        this.setData({
          customNavStyle: customNavStyle,
          // scrollTop: _scrollTop
          // customBackground: `rgba(255,255,255,${_opacity})`
        })
        // 改变胶囊样式
        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: '#ffffff',
        })
        this.data.isSettingShow = true
      }
    } else {
      this.data.isSettingShow = false
      if (!this.data.isSettingHide) {
        this.setData({
          customNavStyle: 'opacity: 0;'
        })
        wx.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: '#0000000',
        })
        this.data.isSettingHide = true
      }
    }
  }, 200),

  onShow: function () {
    // this.setData({
    //   customNavStyle: 'opacity: 0;'
    // })
  },

  onReady: function () {
    console.log('search onReady监听页面初次渲染完成');
    const {
      pxNavBarHeight,
      rpxNavBarHeight,
      ratio
    } = utils.getNavBarHeight();
    console.log(pxNavBarHeight, rpxNavBarHeight, ratio)
    // let _rpxHeaderHeight = 540
    // let _pxScrollHeight = (_rpxHeaderHeight - rpxNavBarHeight) / ratio
    // console.log(_pxScrollHeight)
    // let fixedBarStyle = `position: fixed; top: ${rpxNavBarHeight}rpx`
    // this.setData({
    //   fixedBarStyle: fixedBarStyle,
    //   pxScrollHeight: _pxScrollHeight
    // })
  },

  // 页面分享
  onShareAppMessage: function (res) {
    console.log(res)
    wx.reportAnalytics('topic_detail_clicked', {
      topic_name: this.data.title,
      button_name: 'topic_share',
      params: '',
    });
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '电视派',
      path: `pages/topicDetail/topicDetail?id=${this.data.topicId}&from=share`
    }
  },

  //根据不同设备和型号获取不同内容高度
  getContentHeight: function ({ platform, model }) {
    if (platform.match(/ios/i)) {
      if (model.match(/iPhone8/i)) {
        return 600;
      } else if (model.match(/iPhone10/i)) {
        return 630
      } else if (model.match(/iPhone11/i)) {
        return 700;
      } else {
        return 650;
      }
    } else {
      return 0;
    }
  },

  // 处理导航返回点击事件
  handleGobackClick: function () {
    console.log('handleGobackClick')
    utils.navigateBack()
  },

  // 处理导航点击主页事件
  handleGoHomeClick: function () {
    console.log('handleGoHomeClick')
    wx.switchTab({
      url: '../index/index'
    })
  },

  // 添加影片/片单收藏
  handleCollectionClick: function (e) {
    console.log('handleCollectionClick')
    let { type, movieid } = e.currentTarget.dataset
    console.log(type, movieid)
    if (type === 'movie') {
      wx.reportAnalytics('topic_detail_clicked', {
        topic_name: this.data.title,
        button_name: 'movie_collection',
        params: movieid,
      });
      this.addMovieFavorite(movieid)
    } else {
      wx.reportAnalytics('topic_detail_clicked', {
        topic_name: this.data.title,
        button_name: 'topic_collection',
        params: '',
      });
      this.addTopicFavorite(this.data.topicId)
    }
  },

  // 取消影片/片单收藏
  handleUnCollectionClick: function (e) {
    console.log('handleUnCollectionClick')
    let { type, movieid } = e.currentTarget.dataset
    console.log(type, movieid)
    if (type === 'movie') {
      // let _collectionList = this.data.collectionList
      // let _collectionSet = new Set(_collectionList)
      // if (!_collectionSet.has(id)) return
      // else _collectionSet.delete(id)
      // _collectionList = Array.from(_collectionSet)
      // console.log(_collectionList)
      // this.setData({ collectionList: _collectionList }) 
      wx.reportAnalytics('topic_detail_clicked', {
        topic_name: this.data.title,
        button_name: 'movie_uncollection',
        params: movieid,
      });
      this.delMovieFavorite(movieid)
    } else {
      wx.reportAnalytics('topic_detail_clicked', {
        topic_name: this.data.title,
        button_name: 'topic_uncollection',
        params: '',
      });
      this.delTopicFavorite(this.data.topicId)
    }
  },

  // 进入影片详情页
  handleItemClick: function (e) {
    console.log('handleItemClick')
    let { movieid } = e.currentTarget.dataset
    wx.reportAnalytics('topic_detail_clicked', {
      topic_name: this.data.title,
      button_name: 'enter_movie_detail',
      params: movieid,
    });
    wx.navigateTo({
      url: `../movieDetail/movieDetail?id=${movieid}&from=topicDetail`,
    })
  },

  // 处理影片推送点击事件
  handlePushClick: function (e) {
    console.log('点击推送影片')
    let _deviceId = app.globalData.deviceId
    console.log("校验参数 deviceId:" + _deviceId);
    if (_deviceId == null) {
      // 跳转设备绑定页面
      return wx.redirectTo({
        url: "../home/home"
      })
    }
    let { movieid, title, type } = e.currentTarget.dataset
    wx.reportAnalytics('topic_detail_clicked', {
      topic_name: this.data.title,
      button_name: 'movie_push',
      params: movieid,
    });
    if (type !== "电影") {
      return wx.navigateTo({
        url: `../movieDetail/movieDetail?id=${movieid}&from=topicDetail`
      })
    }
    let _session = wx.getStorageSync("new_cksession")
    console.log("校验参数 session:" + _session);
    wx.showLoading({ title: '推送中...' })
    let params = {
      "ccsession": _session,
      "deviceId": _deviceId + '',
      "movieId": movieid
    }
    console.log("推送参数:", params)
    let desParams = utils.paramsAssemble_wx(params);
    console.log('推送参数(组装后):', desParams);
    utils.requestP(api.pushMediaUrl, desParams).then(res => {
      console.log('推送成功', res.data);
      if (res.data && res.data.code === 200) {
        utils.showSuccessToast('推送成功')
        this.addPushHistory(movieid, title, movieid)
      } else {
        console.log('推送失败');
        let errMsg = res.data.message + (res.data.code == null ? "" : "[" + res.data.code + "]");
        utils.showFailedToast(errMsg, this.data.errIconUrl)
      }
    }).catch(res => {
      console.log('推送发生错误', res);
      utils.showFailedToast('推送失败', this.data.errIconUrl)
    })
  },

  // 获取片单详情数据，片单不区分源
  getTopicDetailById: function (id) {
    utils.requestP(api.getTopicUrl, utils.paramsAssemble_tvpai({ "id": id })).then(res => {
      console.log('获取片单详情数据:', res)
      if (res.data.data) {
        this.setData({
          topicDetail: res.data.data[0],
          title: res.data.data[0].title
        })
      }
    }).catch(res => {
      console.log('获取片单详情发生错误', res)
      utils.showFailedToast('加载数据失败', this.data.errIconUrl)
    })
  },

  // 添加影片推送历史
  addPushHistory: function (movieId, title, videoId) {
    let urlParams = { "vuid": wx.getStorageSync("wxopenid") };
    let url = utils.urlAssemble_tvpai(api.addPushHistoryUrl, utils.paramsAssemble_tvpai(urlParams));
    let data = {
      album_id: movieId,
      title: title,
      video_id: videoId, //null会导致获取历史列表数据缺失
      video_type: "1"
    }
    utils.requestP(url, data, 'POST', 'application/json; charset=utf-8').then(res => {
      console.log('添加历史成功', res);
    }).catch(res => {
      console.log('添加历史失败', res);
    })
  },

  // 添加片单收藏
  addTopicFavorite: function (topicId) {
    // 片单不需要跳转登录，但为了和影片/文章收藏逻辑统一，后续让产品优化这块交互
    if (wx.getStorageSync('ccUserInfo') == "") {
      return wx.navigateTo({ url: '../login/login' })
    }
    console.log('添加片单id', topicId)
    let params = { "id": topicId, "vuid": wx.getStorageSync("wxopenid"), "collect": 1 }
    let url = utils.urlAssemble_tvpai(api.setFavoriteTopicUrl, utils.paramsAssemble_tvpai(params))
    utils.requestP(url, null, 'POST').then(res => {
      console.log('添加片单收藏成功:', res)
      this.setData({ isCollected: true })
    }).catch(res => {
      console.log('添加片单收藏发生错误', res)
    })
  },

  // 取消片单收藏
  delTopicFavorite: function (topicId) {
    console.log('删除片单id', topicId)
    let params = { "id": topicId, "vuid": wx.getStorageSync("wxopenid"), "collect": 0 }
    let url = utils.urlAssemble_tvpai(api.setFavoriteTopicUrl, utils.paramsAssemble_tvpai(params))
    utils.requestP(url, null, 'POST').then(res => {
      console.log('取消片单收藏成功:', res)
      this.setData({ isCollected: false })
    }).catch(res => {
      console.log('取消片单收藏发生错误', res)
    })
  },

  // 获取片单收藏列表
  getTopicFavorite: function () {
    let params = { "vuid": wx.getStorageSync("wxopenid") }
    let url = utils.urlAssemble_tvpai(api.getFavoriteTopicUrl, utils.paramsAssemble_tvpai(params))
    utils.requestP(url, null).then(res => {
      console.log('获取片单收藏列表成功:', res)
      if (res.data.data) {
        for (let i = 0; i < res.data.data.length; i++) {
          // 注意类型的不同，this.data.topicId是string类型
          if (+this.data.topicId === res.data.data[i].topic_id) {
            this.setData({ isCollected: true })
            break
          }
        }
      }
    }).catch(res => {
      console.log('获取片单收藏列表发生错误', res)
    })
  },

  // 添加影片收藏
  addMovieFavorite: function (movieId) {
    // utils.checkCoocaaUserLogin()
    if (wx.getStorageSync('ccUserInfo') == "") {
      return wx.navigateTo({ url: '../login/login' })
    }
    let ccsession = wx.getStorageSync('new_cksession')
    if (ccsession == "") return
    let _movieid = `['${movieId}']`
    let params = { "ccsession": ccsession, "moviesId": _movieid }
    utils.requestP(api.addMovieFavoriteUrl, utils.paramsAssemble_wx(params)).then(res => {
      if (res.data && res.data.data && res.data.code === 200) {
        console.log('添加影片收藏成功', res)
        let _collectionList = this.data.movieCollectedList
        _collectionList[movieId] = res.data.data[0].collectId
        console.log(_collectionList)
        this.setData({ movieCollectedList: _collectionList })
      } else {
        console.log('添加影片收藏失败', res)
      }
    }).catch(res => {
      console.log('添加影片收藏发生错误', res)
    })
  },

  // 删除影片收藏
  delMovieFavorite: function (movieId) {
    let ccsession = wx.getStorageSync('new_cksession')
    if (ccsession == "") return
    let _collectIds = `[${this.data.movieCollectedList[movieId]}]`
    console.log(_collectIds)
    let params = { "ccsession": ccsession, "collectIds": _collectIds }
    utils.requestP(api.delMovieFavoriteUrl, utils.paramsAssemble_wx(params)).then(res => {
      if (res.data && res.data.code === 200) {
        console.log('删除影片收藏成功', res)
        let _collectionList = this.data.movieCollectedList
        delete _collectionList[movieId]
        console.log(_collectionList)
        this.setData({ movieCollectedList: _collectionList })
      } else {
        console.log('删除影片收藏失败', res)
      }
    }).catch(res => {
      console.log('删除影片收藏发生错误', res)
    })
  },

  // 获取收藏的影片列表
  getMovieFavorite: function () {
    let ccsession = wx.getStorageSync('new_cksession')
    if (ccsession == "") return
    let params = { "ccsession": ccsession }
    utils.requestP(api.getFavoriteVideosUrl, utils.paramsAssemble_wx(params)).then(res => {
      console.log('获取影片收藏列表结果', res)
      if (res.data.data) {
        let _list = {}, list = res.data.data.list
        for (let i = 0; i < list.length; i++) {
          console.log(list[i].movieId, list[i].collectId)
          _list[list[i].movieId] = list[i].collectId
        }
        console.log(_list)
        this.setData({ movieCollectedList: _list })
      } else {
        console.log('获取影片收藏列表失败', res)
      }
    }).catch(res => {
      console.log('获取影片收藏列表发生错误', res)
    })
  }
})  