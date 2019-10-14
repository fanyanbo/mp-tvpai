const utils_old = require('../../utils/util')
const utils = require('../../utils/util_fyb')
const api_old = require('../../api/api')
const api = require('../../api/api_fyb')
const app = getApp();

Page({
  data: {
    isShowDoc: false,
    isShowTips: false,
    bIphoneFullScreenModel:false,
    errIconUrl: '../../images/close_icon.png',
    devices: "",
    mydevices: [],
    block: ['block'],
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    bIphoneFullScreenModel: false,
  },

  bindDevice: function (qrUrl) {
    let ccsession = wx.getStorageSync('new_cksession');
    let srcParams = { "ccsession": ccsession, "qrUrl": qrUrl };
    let desParams = utils.paramsAssemble_wx(srcParams);
    console.log(desParams);
    utils.requestP(api.bindDeviceUrl, desParams).then(res => {
      console.log("绑定设备信息:", res)
      if (res.data.code === 200) {
        utils.showSuccessToast('设备绑定成功');
        setTimeout(() => {
          this.getDeviceList();
        }, 2000)
      } else {
        utils.showFailedToast('设备绑定失败', this.data.errIconUrl);
      }
    })
  },

  onLoad: function () {
  
  },

  onShow: function () {
    console.log("onshow")
    this.setData({
      isShowTips: app.globalData.isShowTips,
      bIphoneFullScreenModel: app.globalData.bIphoneFullScreenModel
    });
    this.getDeviceList();
  }, 

  scanQRCode: function () {
    utils.showLoadingToast('扫码绑定中...')
    wx.scanCode({
      success: (res) => {
        console.log("扫码结果", res.result);
        this.setData({
          qrUrl: res.result
        });
        this.bindDevice(res.result)
      },
      fail: (res) => {
        console.log(res);
      //  utils.showFailedToast('扫码失败', '../../images/close_icon.png');
      }
    })
  },

  // 授权校验，授权或拒绝都会执行
  bindGetUserInfo(e) {
    console.log('canIUse', this.data.canIUse, e)
    if (!e.detail.userInfo) {
      // 如果用户拒绝直接退出，下次依然会弹出授权框
      return;
    }
    let encryptedData = e.detail.encryptedData;
    let iv = e.detail.iv;
    let rawData = e.detail.rawData;
    let signature = e.detail.signature;
    console.log('encryptedData:' + encryptedData)
    console.log('iv:' + iv)
    console.log('rawData:' + rawData)
    console.log('signature:' + signature)

    let ccsession = wx.getStorageSync("new_cksession");
    console.log('bindGetUserInfo ccsession', ccsession);

    if (ccsession == null || ccsession === '') {
      utils.showLoadingToast()
      utils.wxLogin().then(res => {
        console.log('wxLogin res=', res)
        return utils.getSessionByCodeP(res.code)
      }).then(res => {
        console.log('getSessionByCode res=', res)
        if (res.data.result && res.data.data) {
          let ccsession = res.data.data.ccsession;
          let wxopenid = res.data.data.wxopenid;
          wx.setStorageSync('new_cksession', ccsession);
          wx.setStorageSync('wxopenid', wxopenid);
          console.log('setStorage, session = ' + ccsession + ',openid = ' + wxopenid);
          let url = api_old.getuserinfoUrl
          rawData = encodeURI(rawData, 'utf-8')
          let paramsStr = { "ccsession": ccsession, "encryptedData": encryptedData, "iv": iv, "rawData": rawData, "signature": signature }
          let sign = utils_old.encryption(paramsStr, '9acd4f7d5d9b87468575b240d824eb4f')
          let dataStr = utils_old.json2Form({ client_id: 'applet', sign: sign, param: '{"ccsession":"' + ccsession + '","encryptedData":"' + encryptedData + '","iv":"' + iv + '","rawData":"' + rawData + '","signature":"' + signature + '"}' })
          return utils.requestP(url, dataStr, 'post');
        }
      }).then(res => {
        console.log('解密用户信息成功', res)
        this.scanQRCode();
      }).catch(res => {
        console.log('catch res = ', res)
      })
    } else {
      this.scanQRCode();
    }
  },

  // 跳转教程页面
  navigateto() {
    utils.navigateTo('../course/course' )
  },

  // 跳转删除页面
  deleteto(e) {
    let deviceId = e.currentTarget.dataset.id;
    let bindStatus = e.currentTarget.dataset.status;
    let deviceName = e.currentTarget.dataset.name;
    wx.navigateTo({url: '../delete/delete?deviceId=' + deviceId + '&bind=' + bindStatus + '&deviceName=' + deviceName})
  },

  handleGobackClick: function () {
    console.log('handleGobackClick')
    utils.navigateBack()
  },
  
  // 切换绑定时触发
  handleBindTap: function (event) {
    let that = this;
    let ccsession = wx.getStorageSync('new_cksession');
    let deviceid = event.currentTarget.dataset.deviceid + '';
    console.log('切换绑定设备：', ccsession, deviceid);
    let srcParams = { bind: "1", "ccsession": ccsession, "deviceId": deviceid };
    let desParams = utils.paramsAssemble_wx(srcParams);
    console.log(desParams);
    utils.showLoadingToast();
    utils.requestP(api.changeDeviceStatusUrl, desParams).then( res => {
      console.log('handleBindTap success', res);
      if (res.data.code === 200) {
        utils.showSuccessToast('绑定成功');
        setTimeout(() => {
          this.getDeviceList();
        }, 2000);
      } else {
        utils.showFailedToast('绑定失败', this.data.errIconUrl);
      }
    }).catch( res => {
      console.log('handleBindTap error', res);
      utils.showFailedToast('绑定失败', this.data.errIconUrl);
    })
  },

  // 获取绑定设备列表
  getDeviceList: function() {
    let that = this;
    const ccsession = wx.getStorageSync('new_cksession');
    console.log("ccsession:", ccsession);
    if (ccsession == null || ccsession === '') {
      this.setData({ isShowDoc: true });
      return;
    }
    let srcParams = { "ccsession": ccsession };
    let desParams = utils.paramsAssemble_wx(srcParams);
    console.log(desParams);
    utils.showLoadingToast('获取设备中');
    utils.request(api.getBindDeviceListUrl, 'GET', desParams, function (res) {
      utils.showLoadingToast('', false);
      console.log("获取设备信息:", res)
      if (res.data.result && res.data.data && res.data.data.length != 0) {
        that.setData({
          devices: true,
          mydevices: res.data.data
        })
        wx.setStorageSync('deviceId', '');
        app.globalData.activeId = null;
        app.globalData.deviceId = null;
        for (let i = 0; i < res.data.data.length; i++) {
          if (res.data.data[i].bindStatus === 1) {
            console.log(res.data.data[i].deviceId);
            wx.setStorageSync('deviceId', res.data.data[i].deviceId + '');
            // 是否一定使用globaldata，用storage方案如何？
            app.globalData.activeId = res.data.data[i].device.serviceId;//激活ID
            app.globalData.deviceId = res.data.data[i].deviceId + '',//设备ID
              console.log(res.data.data[i].deviceId+"已绑定设备激活id-设备源:" + res.data.data[i].device.serviceId + res.data.data[i].device.source);
            if (res.data.data[i].device.source == "tencent") {
              wx.setStorageSync('tvSource', 'qq')
            } else {
              wx.setStorageSync('tvSource', 'iqiyi')
            }
            app.globalData.sourceChanged = true; //值不一定变化，但假定源被改变了，首页会刷新一次
          }

        }
      }else{
        that.setData({
          devices: false,
          mydevices: res.data.data
        })
        wx.setStorageSync('deviceId', '');
        app.globalData.activeId = null;
        app.globalData.deviceId = null;
      }
      utils.refreshBindedTVStatus(app.globalData.activeId);
    }, function () {
      console.log('getDeviceList error');
    }, function () {
      that.setData({ isShowDoc: true });
    })
  }
})

