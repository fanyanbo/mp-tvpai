const utils_old = require('../../utils/util')
const utils = require('../../utils/util_fyb')
const api_old = require('../../api/api')
const api = require('../../api/api_fyb')
const bind = require('../../api/user/bind')

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
    bIphoneFullScreenModel: false
  },
  onLoad: function (options) {
    console.log('onLoad')
  },
  onShow: function () {
    console.log("onshow")
    this.setData({
      isShowTips: app.globalData.isShowTips,
      bIphoneFullScreenModel: app.globalData.bIphoneFullScreenModel
    });
    bind.getDeviceList().then((data) => { //todo:wx.scanCode退出时会自动执行一次页面的onshow，回头再捋下这里流程
      this.setData({
        devices: data.devices,
        mydevices: data.mydevices,
        isShowDoc: data.isShowDoc
      })
      console.log('resolve...')
    }).catch( (err) => {
      this.setData({ 
        devices: err.devices, 
        mydevices: err.mydevices, 
        isShowDoc: err.isShowDoc
      })
      console.log('reject...')
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
      utils.wxLogin() //todo 思考怎么优化
        .then(res => {
          console.log('wxLogin res=', res)
          return utils.getSessionByCodeP(res.code)
        })
        .then(res => {
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
        })
        .then(res => {
          console.log('解密用户信息成功', res)
          bind.scanNBindNRefresh().then((data) => { //todo 
            this.setData({
              devices: data.devices,
              mydevices: data.mydevices,
              isShowDoc: data.isShowDoc
            })
            console.log('resolve...')
          }).catch((err) => {
            this.setData({
              devices: err.devices,
              mydevices: err.mydevices,
              isShowDoc: err.isShowDoc
            });
            console.log('reject...')
          })  
        })
        .catch(res => {
          console.log('catch res = ', res)
        })
    } else {
      bind.scanNBindNRefresh()
        .then((data) => { //todo 
          this.setData({
            devices: data.devices,
            mydevices: data.mydevices,
            isShowDoc: data.isShowDoc
          })
          console.log('resolve...')
        }).catch((err) => {
          this.setData({
            devices: err.devices,
            mydevices: err.mydevices,
            isShowDoc: err.isShowDoc
          });
          console.log('reject...')
        });
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
  
  // 切换绑定时触发
  handleBindTap: function (event) {
    let ccsession = wx.getStorageSync('new_cksession');
    let id = event.currentTarget.dataset.id + '';
    console.log('切换绑定设备：', ccsession, id);
    let srcParams = { bind: "1", "ccsession": ccsession, "id": id };
    let desParams = utils.paramsAssemble_wx(srcParams);
    console.log(desParams);
    utils.showLoadingToast();
    utils.requestP(api.changeDeviceStatusUrl, desParams).then( res => {
      console.log('handleBindTap success', res);
      if (res.data.code === 200) {
        utils.showSuccessToast('绑定成功');
        setTimeout(() => {
          bind.getDeviceList().then((data) => {
            this.setData({
              devices: data.devices,
              mydevices: data.mydevices,
              isShowDoc: data.isShowDoc
            })
          }).catch((err) => {
            this.setData({
              devices: err.devices,
              mydevices: err.mydevices,
              isShowDoc: err.isShowDoc
            });
          })  
        }, 2000);
      } else {
        utils.showFailedToast('绑定失败', this.data.errIconUrl);
      }
    }).catch( res => {
      console.log('handleBindTap error', res);
      utils.showFailedToast('绑定失败', this.data.errIconUrl);
    })
  }

})