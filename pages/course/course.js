// course.js
import utils from '../../utils/util';
const api = require('../../api/api.js');
export {
  utils,
}
const app = getApp()
Page({
  data: {
    winWidth: 0,
    winHeight:0,
    // tab切换  
    currentTab: 0,
  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        console.log(res.windowHeight)
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
          // clientHeight: res.windowHeight

        });
      }
    });
  }, bindDevice: function (qrUrl) {
    let that = this
    const ccsession = wx.getStorageSync('cksession')
    const url = api.bindDeviceUrl
    const key = app.globalData.key
    var paramsStr = { "ccsession": ccsession, "qrUrl": qrUrl }
    const sign = utils.encryption(paramsStr, key)
    console.log("client_id:" + app.globalData.client_id)
    console.log(ccsession);
    let data = {
      client_id: app.globalData.client_id,
      sign: sign,
      param: paramsStr,
      ccsession: ccsession,
      qrUrl: qrUrl
    }
    utils.postLoading(url, 'GET', data, function (res) {
      console.log("绑定设备信息:")
      console.log(res)
      if (res.data.code == 200) {
        wx.showToast({
          title: '设备绑定中...',
        })
        setTimeout(function () {
          wx.navigateTo({
            url: '../../pages/home/home',
          })
        }, 2000)
      } else {
        wx.showToast({
          title: '设备绑定失败',
        })
      }
    }, function (res) {

    }, function (res) {

    }, qrUrl)
  },
  scan() {
    wx.scanCode({
      success: (res) => {
        console.log("扫码结果");
        console.log(res.result);
        wx.hideToast();
        this.setData({
          qrUrl: res.result
        });
        this.bindDevice(res.result)
      },
      fail: (res) => {
        console.log(res);
      }
    })
  },
  // back:function(){
  //   var pages = getCurrentPages();
  //   var currPage = pages[pages.length - 1];   //当前页面
  //   var prevPage = pages[pages.length - 2];  //上一个页面

  //   //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
  //   prevPage.setData({
  //     mydata: { a: 1, b: 2 }
  //   })
  //   wx.navigateBack({
      
  //   })
  // }
})  