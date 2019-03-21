const utils = require('../../utils/util');
const utils_fyb = require('../../utils/util_fyb');
const api = require('../../api/api.js');
const api_fyb = require('../../api/api_fyb');
const app = getApp();

Page({
  data: {
    isShowDoc: false,
    isShowTips: false,
    devices: "",
    mydevices: [],
    block: ['block'],
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  bindDevice: function (qrUrl) {
    let that = this;
    let ccsession = wx.getStorageSync('cksession');
    let srcParams = { "ccsession": ccsession, "qrUrl": qrUrl };
    let desParams = utils_fyb.paramsAssemble_wx(srcParams);
    console.log(desParams);
    utils_fyb.request(api_fyb.bindDeviceUrl, 'GET', desParams, function (res) {
      console.log("绑定设备信息:", res)
      if (res.data.code == 200) {
        utils_fyb.showToast('success', '设备绑定成功');
        setTimeout(function () {
          that.getDeviceList();
        }, 2000)
      } else {
        utils_fyb.showToast('failed', '设备绑定失败');
      }
    })
  },

  onLoad: function () {
    this.getDeviceList();
  },

  scanQRCode: function () {
    wx.showLoading({ title: '绑定设备中' });
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
    let that = this;
    let ccsession = wx.getStorageSync("cksession");
    console.log('bindGetUserInfo ccsession', ccsession);
    if (ccsession == null || ccsession === '') {
      wx.login({
        success: function (res) {
          console.log('code', res);
          utils_fyb.getSessionByCode(res.code, function (res) {
            console.log('success', res);
            if (res.data.result && res.data.data) {
              let ccsession = res.data.data.ccsession;
              let wxopenid = res.data.data.wxopenid;
              wx.setStorageSync('cksession', ccsession);
              wx.setStorageSync('wxopenid', wxopenid);
              console.log('setStorage, session = ' + ccsession + ',openid = ' + wxopenid);
              that.scanQRCode();
            }
          }, function (res) {
            console.log('error', res)
          });
        }
      });
    } else {
      this.scanQRCode();
    }
  },

  //跳转教程页面
  navigateto() {
    wx.navigateTo({ url: '../course/course' })
  },

  // 切换绑定时触发
  handleBindTap: function (event) {
    let that = this;
    let ccsession = wx.getStorageSync('cksession');
    let deviceid = event.currentTarget.dataset.deviceid + '';
    console.log('handleBindTap', ccsession, deviceid);
    let srcParams = { bind: "1", "ccsession": ccsession, "deviceId": deviceid };
    let desParams = utils_fyb.paramsAssemble_wx(srcParams);
    console.log(desParams);
    utils_fyb.request(api_fyb.changeDeviceStatusUrl, 'GET', desParams, 
      function (res) {
        console.log('handleBindTap success', res);
        if (res.data.code === 200) {
          utils_fyb.showToast('success', '绑定成功');
          setTimeout(function () {
            that.getDeviceList();
          }, 2000);
        } else {
          utils_fyb.showToast('failed', '绑定失败');
        }
      }, 
      function (res) {
        console.log('handleBindTap error', res);
        utils_fyb.showToast('failed', '绑定失败');
      }
    )
  },

  // 获取绑定设备列表
  getDeviceList: function() {
    let that = this;
    const ccsession = wx.getStorageSync('cksession');
    console.log("ccsession:", ccsession);
    if (ccsession == null || ccsession === '') {
      this.setData({ isShowDoc: true });
      return;
    }
    let srcParams = { "ccsession": ccsession };
    let desParams = utils_fyb.paramsAssemble_wx(srcParams);
    console.log(desParams);
    wx.showLoading({ title: '获取设备中' });
    utils_fyb.request(api_fyb.getBindDeviceListUrl, 'GET', desParams, function (res) {
      wx.hideLoading();
      console.log("获取设备信息:", res)
      if (res.data.result && res.data.data && res.data.data.length != 0) {
        that.setData({
          devices: true,
          mydevices: res.data.data
        })
        for (let i = 0; i < res.data.data.length; i++) {
          if (res.data.data[i].bindStatus === 1) {
            console.log(res.data.data[i].deviceId);
            wx.setStorageSync('deviceId', res.data.data[i].deviceId + '');
            // 是否一定使用globaldata，用storage方案如何？
            app.globalData.activeId = res.data.data[i].device.serviceId;
            app.globalData.deviceId = res.data.data[i].deviceId + '',
              console.log("已绑定设备激活id-设备源:" + res.data.data[i].device.serviceId + res.data.data[i].device.source);
          }
          if (res.data.data[i].device.source == "tencent") {
            app.globalData.tvSource = 'qq';
            wx.setStorageSync('tvSource', 'qq')
          } else {
            app.globalData.tvSource = 'iqiyi';
            wx.setStorageSync('tvSource', 'iqiyi')
          }
        }
      }
    }, function () {
      console.log('getDeviceList error');
    }, function () {
      that.setData({ isShowDoc: true });
    })
  }
})

