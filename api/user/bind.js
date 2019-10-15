//设备绑定相关api
const util_fyb = require('../../utils/util_fyb')
const api_fyb = require('../../api/api_fyb')
const app = getApp()

function scanQRCode() { //扫电视二维码绑定
  return new Promise( (resolve, reject) => {
    console.log('1.扫描')
    util_fyb.showLoadingToast('扫码绑定中...')
    wx.scanCode({
      success: (res) => {
        console.log("扫码结果", res.result);
        resolve(res.result)
      },
      fail: (res) => {
        console.log(res);
        //  util_fyb.showFailedToast('扫码失败', '../../images/close_icon.png');
        reject(res)
      }
    })
  })
}

function bindDevice(qrUrl) { //绑定设备
  return new Promise( (resolve, reject) => {
    console.log('2.绑定')
    let ccsession = wx.getStorageSync('new_cksession');
    let srcParams = { "ccsession": ccsession, "qrUrl": qrUrl };
    let desParams = util_fyb.paramsAssemble_wx(srcParams);
    console.log(desParams);
    util_fyb.requestP(api_fyb.bindDeviceUrl, desParams).then(res => {
      console.log("绑定设备信息:", res)
      if (res.data.code === 200) {
        util_fyb.showSuccessToast('设备绑定成功');
        console.log('2.1 绑定成功')
        resolve('设备绑定成功')
      } else {
        util_fyb.showFailedToast('设备绑定失败', '../../images/close_icon.png');
        reject('设备绑定失败')
      }
    })
  })
}
function getDeviceList() {  //获取绑定设备列表
  return new Promise((resolve, reject) => {
    console.log('3.刷新')
    const ccsession = wx.getStorageSync('new_cksession');
    console.log("ccsession:", ccsession);
    if (ccsession == null || ccsession === '') {
      reject({ isShowDoc: true })
      return;
    }
    let srcParams = { "ccsession": ccsession };
    let desParams = util_fyb.paramsAssemble_wx(srcParams);
    console.log(desParams);
    util_fyb.showLoadingToast('获取设备中');
    util_fyb.request(api_fyb.getBindDeviceListUrl, 'GET', desParams, function (res) {
      util_fyb.showLoadingToast('', false);
      console.log("获取设备信息:", res)
      if (res.data.result && res.data.data && res.data.data.length != 0) {
        wx.setStorageSync('deviceId', '');
        app.globalData.activeId = null;
        app.globalData.deviceId = null;
        for (let i = 0; i < res.data.data.length; i++) {
          if (res.data.data[i].bindStatus === 1) {//当前绑定设备
            console.log(res.data.data[i].deviceId);
            wx.setStorageSync('deviceId', res.data.data[i].deviceId + '');
            // 是否一定使用globaldata，用storage方案如何？
            app.globalData.activeId = res.data.data[i].device.serviceId;//激活ID
            app.globalData.deviceId = res.data.data[i].deviceId + '',//设备ID
              console.log(res.data.data[i].deviceId + "已绑定设备激活id-设备源:" + res.data.data[i].device.serviceId + res.data.data[i].device.source);
            if (res.data.data[i].device.source == "tencent") {
              wx.setStorageSync('tvSource', 'qq')
            } else {
              wx.setStorageSync('tvSource', 'iqiyi')
            }
            app.globalData.sourceChanged = true; //值不一定变化，但假定源被改变了，首页会刷新一次
          }
        }
        util_fyb.refreshBindedTVStatus(app.globalData.activeId);
        resolve({
          isShowDoc: false,
          devices: true,
          mydevices: res.data.data
        })
      } else {
        wx.setStorageSync('deviceId', '');
        app.globalData.activeId = null;
        app.globalData.deviceId = null;
        util_fyb.refreshBindedTVStatus(app.globalData.activeId);
        reject({
          isShowDoc: true,
          devices: false,
          mydevices: res.data.data
        })  
      }
    }, function () {
      console.log('getDeviceList error');
      reject({
        isShowDoc: true,
        devices: false,
        mydevices: []
      })
    }, function () {
      // that.setData({ isShowDoc: true }); //无论如何都要showDoc??
    })
    console.log('request end')
  })
}

function scanNBindNRefresh() { //扫描，绑定，刷新
  return scanQRCode()
          .then((data) => {
              console.log('2.start 绑定')
              bindDevice(data)
            })
          .then(() => {
              console.log('3.start 刷新')
              getDeviceList();
            })
          .catch(err => {
              console.error(err)
            })
}

module.exports = {
  scanNBindNRefresh,
  getDeviceList
}