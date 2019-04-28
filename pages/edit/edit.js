import utils from '../../utils/util';
const api = require('../../api/api.js');
const utils_fyb = require('../../utils/util_fyb');
export {
  utils,
}
const app = getApp()
Page({
  data: {
    isShowTips: true,
    bIphoneFullScreenModel: false,
    contents: '',
    deviceId:'',
    bind:'',
  },
  editName: function (e){
  let that = this
  const key = app.globalData.key
  const _data = e.detail.value
  console.log(_data.deviceName)
  if(_data.deviceName == ""){
    utils_fyb.showFailedToast('请填写设备名称', '../../images/close_icon.png');
    return
  }
  const deviceName = encodeURI(_data.deviceName)
    const ccsession = wx.getStorageSync('new_cksession')
  var paramsStr = { "ccsession": ccsession, "deviceId": that.data.deviceId, "deviceName":deviceName}
  console.log(paramsStr);
  const sign = utils.encryption(paramsStr, key)
    console.log(sign);
  const url = api.changeDeviceStatusUrl
  let data = {
    client_id: app.globalData.client_id,
    sign: sign,
    param: paramsStr,
    ccsession: ccsession,
    deviceName: deviceName,
    deviceId: that.data.device,
  }
  utils.postLoading(url, 'GET', data, function (res) {
    console.log(res.data.code)
    if (res.data.code == 200) {
      wx.showToast({
        title: '修改成功',
      })
      setTimeout(function () {
        wx.navigateBack({
          delta: 2
        })
      }, 1000)
    } else {
      console.log('streams fail:')
      wx.showToast({
        title: '加载数据失败',
      })
    }
  }, function (res) {
    console.log('streams fail:', res)
    wx.showToast({
      title: '加载数据失败',
    })
  }, function (res) {
    console.log('streams complete:', res)
  }, "")
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
  onRCShowEvent: function (e) {
    console.log('onRCShowEvent..e:', e.detail)
    //遥控器面板显示时，宿主页面不响应上下滑动；
    this.setData({
      bWholePageFixed: (e && e.detail.brcshow) ? true : false
    })
    console.log('onRCShowEvent..bWholePageFixed:', this.data.bWholePageFixed)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.deviceId)
    let that = this;
    that.setData({
      deviceId: options.deviceId,
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