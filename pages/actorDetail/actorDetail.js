const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
const app = getApp()

Page({
  data: {
    scrollHeight: '',
    name: '',
    birth: '',
    area: '',
    height: '',
    occupation: '',
    majorList: []
  },

  onLoad: function (options) {
    let { birthday, birth_place, id, height, desc, name, occupation, image_list } = JSON.parse(options.info)
    console.log(JSON.parse(options.info))
    this.setData({
      name: name,
      birth: birthday,
      area: birth_place,
      height: height,
      occupation: occupation || '演员',
      poster: image_list[4].url,
      desc: desc
    })
    this.getActorInfo(id)
  },

  onShow: function () {
    wx.getSystemInfo({
      success: (res) => {
        let screenHeight = this.getContentHeight({ platform: res.platform, model: res.model })
        if (screenHeight === 0)
          screenHeight = res.screenHeight;
        console.log(screenHeight);
        // 状态栏高度和屏幕宽度，单位都是px
        this.setData({
          scrollHeight: screenHeight - 92,
        })
      }
    })
  },

  onReady: function () {
    const {
      pxNavBarHeight,
      rpxNavBarHeight
    } = utils.getNavBarHeight();
    console.log(pxNavBarHeight, rpxNavBarHeight)
    let titleStyle = `top:${rpxNavBarHeight}rpx`
    this.setData({
      titleStyle
    });
  },

  getActorInfo: function (actorid) {
    let params = { "actor_id": actorid };
    let url = utils.urlAssemble_tvpai(api.getRelatedVideoByActorUrl, utils.paramsAssemble_tvpai(params));
    console.log("获取影人信息url:" + url)
    utils.requestP(url, null).then(res => {
      console.log("获取影人信息:", res.data.data)
      let _data = res.data.data
      if (_data && _data.video_category_list) {
        let _majorWorksList = _data.video_category_list[0].videos.length > 9 ? _data.video_category_list[0].videos.slice(0, 9) : _data.video_category_list[0].videos
        console.log("主要作品信息:", _majorWorksList)
        this.setData({
          majorList: _majorWorksList
        })
      }
    }).catch(res => {
      console.log('获取影人信息失败:', res)
      utils.showFailedToast('加载数据失败', this.data.errIconUrl)
    })
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

  handleWorksClick: function (e) {
    let { id } = e.currentTarget.dataset
    wx.redirectTo({
      url: `../movieDetail/movieDetail?id=${id}`,
    })
  },
  // 显示浮窗
  showPopup: function (e) {
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear'
    })
    animation.translateY(500).step()

    this.setData({
      animationData: animation.export(),
      isShowPopup: true,
      isFixedWindow: true
    })

    setTimeout(() => {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }, 200)
  },

  // 隐藏浮窗
  hidePopup: function (e) {
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear'
    })
    animation.translateY(500).step()
    this.setData({
      animationData: animation.export()
    })
    setTimeout(() => {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        isShowPopup: false,
        isFixedWindow: false
      })
    }, 200)
  },
})  