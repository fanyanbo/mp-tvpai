import utils from '../../utils/util';
const utils_fyb = require('../../utils/util_fyb');
const api = require('../../api/api.js');
const bind = require('../../api/user/bind.js')

export {
  utils,
}
const app = getApp()
Page({
  data: {
    isShowTips: true,
    bIphoneFullScreenModel:false,
    contents: '',
    id: '',
    bind: '',
    deviceName: '',
    chooseSize: false,
    animationData: {}
  },
  handleGobackClick: function () {
    console.log('handleGobackClick')
    wx.navigateBack()
  },
  deleteName: function (e) {
    bind.changeDeviceState({ id: this.data.id, delete: 1}).then( res => {
      wx.showToast({title: '删除成功'})
      setTimeout( () => wx.navigateBack(), 1000)
    }).catch( err => {
      utils_fyb.showFailedToast('删除设备失败', '../../images/close_icon.png');
    })
  },
  chooseSezi: function (e) {
    if (this.data.bind == '1') {
      wx.showToast({
        title: '不能删除当前绑定的设备',
        icon: 'none'
      })
      return
    }
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
    console.log(options.id)
    let that = this;
    that.setData({
      id: options.id,
      bind: options.bind,
      deviceName: options.deviceName
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      chooseSize: false,
      isShowTips: app.globalData.isShowTips,
      bIphoneFullScreenModel: app.globalData.bIphoneFullScreenModel
    })
  },

})