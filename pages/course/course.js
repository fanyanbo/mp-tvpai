const utils = require('../../utils/util_fyb');
const api = require('../../api/api_fyb');

Page({
  data: {},

  bindDevice: function (qrUrl) {
    let ccsession = wx.getStorageSync('cksession');
    let srcParams = { "ccsession": ccsession, "qrUrl": qrUrl };
    let desParams = utils.paramsAssemble_wx(srcParams);
    console.log(desParams);
    utils.showLoadingToast('设备绑定中');
    utils.requestP(api.bindDeviceUrl, desParams).then( res => {
      console.log("绑定设备信息:", res)
      if (res.data.code === 200) {
        utils.showSuccessToast('设备绑定成功');
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1000)
      } else {
        utils.showFailedToast('设备绑定失败', '../../images/close_icon.png');
      }
    })
  },

  scanQRCode() {  
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