const utils_fyb = require('../../utils/util_fyb');
const api_fyb = require('../../api/api_fyb');
const app = getApp();


Page({
  data: {

  },

  bindDevice: function (qrUrl) {
    let ccsession = wx.getStorageSync('cksession');
    let srcParams = { "ccsession": ccsession, "qrUrl": qrUrl };
    let desParams = utils_fyb.paramsAssemble_wx(srcParams);
    console.log(desParams);
    utils_fyb.request(api_fyb.bindDeviceUrl, 'GET', desParams, function (res) {
      console.log("绑定设备信息:", res)
      if (res.data.code == 200) {
        utils_fyb.showSuccessToast('设备绑定成功');
        setTimeout(function () {
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        }, 2000)
      } else {
        utils_fyb.showFailedToast('设备绑定失败', '../../images/close_icon.png');
      }
    })
  },

  scanQRCode() {
    wx.showLoading({ title: '绑定设备中' });
    wx.scanCode({
      success: (res) => {
        console.log("scanQRCode result", res.result);
        this.bindDevice(res.result);
      },
      fail: (res) => {
        console.log('scanQRCode error', res);
      }
    })
  }
})  