//设备绑定相关api
const util = require('../../utils/util')
const util_fyb = require('../../utils/util_fyb')
const api_fyb = require('../../api/api_fyb')

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
function changeDeviceState(objParam) { //更改当前绑定的设备信息（修改名称、绑定其它设备、删除等）; id:要绑定设备的关联id
  return new Promise((resolve, reject) => {
    const app = getApp() //因为app.js里引入了bind.js，所以这里不能获取到app实例，要在各个函数里自行获取
    const ccsession = wx.getStorageSync('new_cksession')
    let data = null, desParams = null, srcParams = null
    if (!!objParam.delete) { //delete
      srcParams = { "ccsession": ccsession, "delete": "1", "id": objParam.id }
      const sign = util.encryption(srcParams, app.globalData.key)
      desParams = {
        client_id: app.globalData.client_id,
        sign: sign,
        param: srcParams,
        ccsession: ccsession,
        delete: "1",
        id: objParam.id,
      }
    } else if (!!objParam.bind) { //绑定其它设备
      srcParams = { bind: "1", "ccsession": ccsession, "id": objParam.id };
      desParams = util_fyb.paramsAssemble_wx(srcParams);    
      console.log('切换绑定设备：', ccsession, objParam.id);
    } else if (!!objParam.deviceName) { //修改设备名称
      const deviceName = encodeURI(objParam.deviceName)
      srcParams = { "ccsession": ccsession, "deviceName": deviceName, "id": objParam.id }
      const sign = util.encryption(srcParams, app.globalData.key)
      desParams = {
        client_id: app.globalData.client_id,
        sign: sign,
        param: srcParams,
        ccsession: ccsession,
        deviceName: deviceName,
        id: objParam.id,
      }
    }
    console.log(desParams);
    util_fyb.requestP(api_fyb.changeDeviceStatusUrl, desParams).then(res => {
      console.log('changeDeviceState success', res);
      if (res.data.code === 200) {
        resolve()
      } else {
        reject()
      }
    }).catch(res => {
      console.log('changeDeviceState error', res);
      reject()
    })
    })
}

function bindDeviceByQR(qrUrl) { //根据二维码信息绑定新设备
  return new Promise( (resolve, reject) => {
    console.log('扫码绑定设备')
    let ccsession = wx.getStorageSync('new_cksession');
    let srcParams = { "ccsession": ccsession, "qrUrl": qrUrl };
    let desParams = util_fyb.paramsAssemble_wx(srcParams);
    console.log(desParams);
    util_fyb.requestP(api_fyb.bindDeviceUrl, desParams).then(res => {
      console.log("绑定设备信息:", res)
      if (res.data.code === 200) {
        util_fyb.showSuccessToast('设备绑定成功');
        resolve('设备绑定成功')
      } else {
        util_fyb.showFailedToast('设备绑定失败', '../../images/close_icon.png');
        reject('设备绑定失败')
      }
    })
  })
}
function getDeviceList(init=false) {  //获取绑定设备列表
  let app = null
  if (init) { //因为app.js里引入了bind.js，所以这里不能获取到app实例，要在各个函数里自行获取
    app = this
  }else {
    app = getApp()
  }
  return new Promise((resolve, reject) => {
    console.log('获取设备列表...')
    const ccsession = wx.getStorageSync('new_cksession');
    console.log("ccsession:", ccsession);
    if (ccsession == null || ccsession === '') {
      resolve({ isShowDoc: true })
      return;
    }
    let srcParams = { "ccsession": ccsession };
    let desParams = util_fyb.paramsAssemble_wx(srcParams);
    console.log(desParams);
    util_fyb.request(api_fyb.getBindDeviceListUrl, 'GET', desParams, function (res) {
      console.log("获取设备信息:", res)
      if (res.data.result && res.data.data && res.data.data.length != 0) {
        wx.setStorageSync('deviceId', '');
        app.globalData.activeId = null;
        app.globalData.deviceId = null;
        app.globalData.boundDeviceInfo = {};
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
            app.globalData.boundDeviceInfo = res.data.data[i].device
            // app.globalData.boundDeviceInfo.openid = res.data.data[i].openid
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
        resolve({
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
      //获取失败是也要复位一次信息
      app.globalData.activeId = null;
      app.globalData.deviceId = null;
      app.globalData.boundDeviceInfo = {};
      app.globalData.sourceChanged = true; //值不一定变化，但假定源被改变了，首页会刷新一次
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
              bindDeviceByQR(data)
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
  getDeviceList,
  changeDeviceState,
}