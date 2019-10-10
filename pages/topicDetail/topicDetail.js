const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
const app = getApp()

Page({
  data: {
    scrollHeight: '',
    topicDetail: [],
    customNavStyle: 'opacity: 0;',
    collectionList: [], //片单影片收藏列表
    isCollected: false, //片单是否收藏
    errIconUrl: '../../images/close_icon.png',
    // customBackground: 'rgba(255,255,255,0)'
  },

  onLoad: function (options) {
    this.getTopicDetailById(options.id)
  },

  onPageScroll: utils.throttle(function (e) {
    let _scrollTop = e.scrollTop
    console.log('onPageScroll', _scrollTop)

    if (_scrollTop !== 0) {
      let customNavStyle = `opacity: ${0.5 + 0.5 * _scrollTop / 202};`
      // let _opacity = 0.7 + 0.3 * _scrollTop / 202
      this.setData({
        customNavStyle: customNavStyle,
        // scrollTop: _scrollTop
        // customBackground: `rgba(255,255,255,${_opacity})`
      })
    } else {
      this.setData({
        customNavStyle: 'opacity: 0;'
      })
    }
  }, 100),

  // onPageScroll: function(e) {
  //   let _scrollTop = e.scrollTop
  //   console.log('onPageScroll', _scrollTop)

  //   if (_scrollTop !== 0) {
  //     let customNavStyle = `opacity: ${0.5 + 0.5 * _scrollTop / 202};`
  //     // let _opacity = 0.7 + 0.3 * _scrollTop / 202
  //     this.setData({
  //       customNavStyle: customNavStyle,
  //       // scrollTop: _scrollTop
  //       // customBackground: `rgba(255,255,255,${_opacity})`
  //     })
  //   } else {
  //     this.setData({
  //       customNavStyle: 'opacity: 0;'
  //     })
  //   }
  // },

  onShow: function () {
    // wx.getSystemInfo({
    //   success: (res) => {
    //     let screenHeight = this.getContentHeight({ platform: res.platform, model: res.model })
    //     if (screenHeight === 0)
    //       screenHeight = res.screenHeight;
    //     console.log(screenHeight);
    //     // 状态栏高度和屏幕宽度，单位都是px
    //     this.setData({
    //       scrollHeight: screenHeight - 92,
    //     })
    //   }
    // })
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

  onShareAppMessage: function (res) {
    console.log(res)
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '电视派',
      path: 'pages/topicDetail/topicDetail'
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

  handleGobackClick: function () {
    console.log('handleGobackClick')
    utils.navigateBack()
  },

  handleCollectionClick: function (e) {
    console.log('handleCollectionClick')
    let { type, movieid, id } = e.currentTarget.dataset
    console.log(type, movieid, id)
    if (type === 'movie') {
      let _collectionList = this.data.collectionList
      let _collectionSet = new Set(_collectionList)
      if (_collectionSet.has(id)) return
      else _collectionSet.add(id)
      _collectionList = Array.from(_collectionSet)
      console.log(_collectionList)
      this.setData({ collectionList: _collectionList })
    } else {
      this.setData({ isCollected: true })
    }

  },

  handleUnCollectionClick: function (e) {
    console.log('handleUnCollectionClick')
    let { type, movieid, id } = e.currentTarget.dataset
    console.log(type, movieid, id)
    if (type === 'movie') {
      let _collectionList = this.data.collectionList
      let _collectionSet = new Set(_collectionList)
      if (!_collectionSet.has(id)) return
      else _collectionSet.delete(id)
      _collectionList = Array.from(_collectionSet)
      console.log(_collectionList)
      this.setData({ collectionList: _collectionList })
    } else {
      this.setData({ isCollected: false })
    }
  },

  handleItemClick: function (e) {
    console.log('handleItemClick')
    let { movieid } = e.currentTarget.dataset
    wx.navigateTo({
      url: `../movieDetail/movieDetail?id=${movieid}`,
    })
  },

  handlePushClick: function (e) {
    console.log('handlePushClick')
    let { movieid, title, type } = e.currentTarget.dataset
    if(type !== "电影") return
    let _session = wx.getStorageSync("new_cksession")
    let _deviceId = app.globalData.deviceId
    console.log("校验参数 session:" + _session + ", deviceId:" + _deviceId);
    wx.showLoading({ title: '推送中...' })
    if (_deviceId == null) {
      utils.showFailedToast('无设备id', this.data.errIconUrl)
      return
    }
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
    let url = `${api.getTopicUrl}?id=${id}`
    utils.requestP(url, utils.paramsAssemble_tvpai()).then(res => {
      console.log('获取片单所有影片数据:', res)
      if (res.data.data) {
        this.setData({
          topicDetail: res.data.data[0]
        })
      }
    }).catch(res => {
      console.log('获取片单数据发生错误', res)
      utils.showFailedToast('加载数据失败', this.data.errIconUrl)
    })
  },

  // 添加历史
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
})  