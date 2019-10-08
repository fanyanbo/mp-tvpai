const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
const app = getApp()

Page({
  data: {
    scrollHeight: '',
    topicDetail: [],
    customNavStyle: 'opacity: 0;'
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

  handleFavoriteClick: function (e) {
    console.log('handleFavoriteClick type:' + e.currentTarget.dataset.type)
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
})  