import utils from '../../utils/util';
const utils_fyb = require('../../utils/util_fyb');
const api = require('../../api/api.js');
export {
  utils,
}
const app = getApp()
Page({
  data: {
    isShowTips: true,
    contents: '',
    deviceId: '',
    bind: '',
    deviceName: '',
    chooseSize: false,
    animationData: {}
  },
  deleteName: function (e) {
    let that = this
    const key = app.globalData.key
    const ccsession = wx.getStorageSync('new_cksession')
    var paramsStr = { "ccsession": ccsession, "delete": "1", "deviceId": that.data.deviceId }
    console.log(paramsStr);
    const sign = utils.encryption(paramsStr, key)
    console.log(sign);
    const url = api.changeDeviceStatusUrl
    let data = {
      client_id: app.globalData.client_id,
      sign: sign,
      param: paramsStr,
      ccsession: ccsession,
      delete: "1",
      deviceId: that.data.device,
    }
    utils.postLoading(url, 'GET', data, function (res) {
      console.log(res)
      if (res.data.code == 200) {
        wx.showToast({
          title: '删除成功',
        })
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 1000)
      } else {
        utils_fyb.showFailedToast('删除设备失败[' + res.data.code + ']', '../../images/close_icon.png');
      }
    }, function (res) {
      console.log('deleteDev fail:', res)
      utils_fyb.showFailedToast('删除设备失败', '../../images/close_icon.png');
    }, function (res) {
      console.log('deleteDev complete:', res)
    }, "")
  },
  chooseSezi: function (e) {
    var that = this;
    // 创建一个动画实例
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'linear'
    })
    that.animation = animation
    // 先在y轴偏移，然后用step()完成一个动画
    animation.translateY(200).step()
    // 用setData改变当前动画
    that.setData({
      // 通过export()方法导出数据
      animationData: animation.export(),
      // 改变view里面的Wx：if
      chooseSize: true
    })
    // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export()
      })
    }, 200)
  },
  hideModal: function (e) {
    var that = this;
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
      that.setData({
        animationData: animation.export(),
        chooseSize: false
      })
    }, 200)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.deviceId)
    let that = this;
    that.setData({
      deviceId: options.deviceId,
      bind: options.bind,
      deviceName: options.deviceName
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      chooseSize: false
    })
  },

})