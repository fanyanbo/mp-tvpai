import utils from '../../utils/util';
const api = require('../../api/api.js');
const utils_fyb = require('../../utils/util_fyb');
const bind = require('../../api/user/bind.js')
export {
  utils,
}
const app = getApp()
Page({
  data: {
    isShowTips: true,
    bIphoneFullScreenModel: false,
    contents: '',
    id:'',
    bind:'',
  },
  editName: function (e){
    const _data = e.detail.value
    console.log(_data.deviceName)
    if (_data.deviceName == "") {
      utils_fyb.showFailedToast('请填写设备名称', '../../images/close_icon.png');
      return
    }
    bind.changeDeviceState({
      id: this.data.id, 
      deviceName: _data.deviceName 
    }).then(res => {
      wx.showToast({ title: '修改成功' })
      setTimeout( () => wx.navigateBack({ delta: 2 }), 1000)
    }).catch(err => {
      console.log('streams fail:')
      wx.showToast({ title: '加载数据失败' })
    })
},

  copyText: function (e) {
    let that = this
    wx.setClipboardData({
      data: e.currentTarget.dataset.text,
      success: function (res) {
        wx.hideToast();
        wx.getClipboardData({
          success: function (res) {            
            that.setData({
              contents: res.data
            })
          }
        })
      }
    })
  },
  handleGobackClick: function () {
    console.log('handleGobackClick')
    wx.navigateBack()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.id)
    let that = this;
    that.setData({
      id: options.id,
      bind:options.bind
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      isShowTips: app.globalData.isShowTips,
      bIphoneFullScreenModel: app.globalData.bIphoneFullScreenModel
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})