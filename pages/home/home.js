const utils_old = require('../../utils/util')
const utils = require('../../utils/util_fyb')
const api_old = require('../../api/api')
const bind = require('../../api/user/bind')
const app = getApp()

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
    bIphoneFullScreenModel: false
  },
  onLoad: function (options) {
    console.log('onLoad')
  },
  _updatePageShow(data) { //刷新页面显示
    this.setData({
      devices: data.devices,
      mydevices: data.mydevices,
      isShowDoc: data.isShowDoc
    })
  },
  _getDeviceList() { //页面自用的获取设备列表
    utils.showLoadingToast('刷新设备中~');
    bind.getDeviceList().then((data) => { 
      utils.showLoadingToast('', false);
      this._updatePageShow(data)
      console.log('resolve...')
    }).catch((err) => {
      utils.showLoadingToast('', false);
      this._updatePageShow(err)
      console.log('reject...')
    })
  },
  _scanNBindNRefresh() {//页面自用的扫码、绑定、刷新设备列表
    bind.scanNBindNRefresh().then((data) => { //todo 
      this._updatePageShow(data)
      wx.reportAnalytics('device_connect_result', { //数据采集
        result: '成功',
      });
      console.log('resolve...')
    }).catch((err) => {
      this._updatePageShow(err)
      wx.reportAnalytics('device_connect_result', { //数据采集
        result: '失败',
      });
      console.log('reject...')
    })  
  },
  onShow: function () {
    console.log("onshow")
    this.setData({
      isShowTips: app.globalData.isShowTips,
      bIphoneFullScreenModel: app.globalData.bIphoneFullScreenModel
    });
    this._getDeviceList() //todo:wx.scanCode退出时会自动执行一次页面的onshow，回头再捋下这里流程
  },
  // 授权校验，授权或拒绝都会执行
  bindGetUserInfo(e) {
    console.log('canIUse', this.data.canIUse, e)
    if (!e.detail.userInfo) {// 如果用户拒绝直接退出，下次依然会弹出授权框
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
      utils.wxLogin() 
        .then(res => {
          console.log('wxLogin res=', res)
          return utils.getSessionByCodeP(res.code) //todo 优化复用微信登录代码
        })
        .then(res => {
            console.log('getSessionByCode res:', res)
          if (res.data.result && res.data.data) {
            let ccsession = res.data.data.ccsession
            let wxopenid = res.data.data.wxopenid
            let unionid = res.data.data.unionid
            wx.setStorageSync('new_cksession', ccsession)
            wx.setStorageSync('wxopenid', wxopenid)
            wx.setStorageSync('unionid', unionid)
            console.log('session:' + ccsession + ',openid:' + wxopenid + ',unionid:' + unionid)
            let url = api_old.getuserinfoUrl
            rawData = encodeURI(rawData, 'utf-8')
            let paramsStr = { "ccsession": ccsession, "encryptedData": encryptedData, "iv": iv, "rawData": rawData, "signature": signature }
            let sign = utils_old.encryption(paramsStr, '9acd4f7d5d9b87468575b240d824eb4f')
            let dataStr = utils_old.json2Form({ client_id: 'applet', sign: sign, param: '{"ccsession":"' + ccsession + '","encryptedData":"' + encryptedData + '","iv":"' + iv + '","rawData":"' + rawData + '","signature":"' + signature + '"}' })
            return utils.requestP(url, dataStr, 'post');
          }
        })
        .then(res => {
          console.log('解密用户信息成功', res)
          this._scanNBindNRefresh()
        })
        .catch(res => {
          console.log('catch res = ', res)
        })
    } else {
      this._scanNBindNRefresh()
    }
  },

  // 跳转教程页面
  navigateto() {
    utils.navigateTo('../course/course' )
  },

  // 跳转删除页面
  deleteto(e) {
    let id = e.currentTarget.dataset.id;
    let bindStatus = e.currentTarget.dataset.status;
    let deviceName = e.currentTarget.dataset.name;
    wx.navigateTo({ url: '../delete/delete?id=' + id + '&bind=' + bindStatus + '&deviceName=' + deviceName})
  },

  handleGobackClick: function () {
    console.log('handleGobackClick')
    utils.navigateBack()
  },
  
  handleBindTap: function (event) {  // 切换绑定时触发
    utils.showLoadingToast()
    let that = this
    let id = event.currentTarget.dataset.id + '';
    bind.changeDeviceState({id, bind: 1}).then(data => {
      utils.showSuccessToast('绑定成功');
      setTimeout(() => {
        that._getDeviceList()
      }, 500);
    }).catch(err => {
      utils.showFailedToast('绑定失败', this.data.errIconUrl);
    })
  }

})