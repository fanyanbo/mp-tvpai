const utils = require('utils/util_fyb.js')
const bind = require('api/user/bind.js')

App({
  onLaunch: function () {
    console.log('app onLaunch')
    let that = this;
    wx.getSystemInfo({
      success: function(res) {
        console.log('onLaunch getSystemInfo', res)
        that.globalData.platform = utils.getFlatform({ platform: res.platform })
        that.globalData.model = res.model
        that.globalData.bIphoneFullScreenModel = utils.checkIphoneFullScreenModel({ platform: res.platform, model: res.model })
        console.log('onLaunch bIphoneFullScreenModel:', that.globalData.bIphoneFullScreenModel)
        console.log('onLaunch platform', that.globalData.platform)
      },
    })
    bind.getDeviceList.apply(that, [true]).then(() => {
      console.log('设备列表获取成功')
    }).catch(() => {
      console.log('设备列表获取失败')
    })
  },
  onShow() {
    console.log('app onshow')
  },
  globalData: {
    username: wx.getStorageSync("username"),
    ccUserInfo: wx.getStorageSync("ccUserInfo"),
    boundDeviceInfo: {},//当前绑定设备信息
    activeId: null, //语音遥控推送使用
    deviceId: null, //影片推送使用
    isShowTips: true, //遥控器提示栏
    bIphoneFullScreenModel:false,
    sourceChanged: false, //源是否被改变
    platform: 'Android', //设备平台，Android | IOS
    model: '' //设备机型
  }
})
