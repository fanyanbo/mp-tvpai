const utils  = require('../../utils/util');
const api = require('../../api/api.js');
const app = getApp();

Page({
  data: {
    isShowDoc: false,
    isShowTips: false,
    devices: "",
    mydevices: [],
    block: ['block'],
    moretop: ['moretop'],
    showModal: false,
    ccsession: wx.getStorageSync('cksession'),
  },
  bindDevice: function (qrUrl) {
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
      console.log("绑定设备信息:", res)
      if (res.data.code == 200) {
        wx.showToast({
          title: '设备绑定中...',
        })
        setTimeout(function () {
          getDevices(that, '获取设备中');
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
  howbind: function (e) {
    wx.navigateTo({
      url: '../course/course',
    })
  },
  moreBind: function () {
    wx.navigateTo({
      url: '../course/course',
    })
  },
  moreLess: function (e) {
    let that = this
    let index = e.currentTarget.dataset.index
    let moretop = that.data.moretop
    let blocks = that.data.block
    if (blocks[index] == 'block') {
      blocks[index] = ''
      moretop[index] = ''
    } else {
      blocks[index] = 'block'
      moretop[index] = 'moretop'
    }
    that.setData({
      block: blocks,
      moretop: moretop
    })
  },

  onLoad: function () {
    console.log("onLoad, ccsession:" + wx.getStorageSync('cksession'))
    getDevices(this, '获取设备中')
  },

  onReady: function () {

  },

  onShow: function () {
    this.setData({
      ccsession: wx.getStorageSync("cksession")
    })
  },

  onHide: function () {

  },

  onUnload: function () {

  },

  scan() {
    wx.scanCode({
      success: (res) => {
        console.log("扫码结果");
        console.log(res.result);
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
  navigateto() {
    wx.navigateTo({
      url: '../course/course'
    })
  },
  // 切换绑定时触发
  handleBindTap: function (event) {
    let that = this
    console.log(event.currentTarget.dataset.deviceid)
    const key = app.globalData.key
    const ccsession = wx.getStorageSync('cksession')
    var paramsStr = { bind: "1", "ccsession": ccsession, "deviceId": String(event.currentTarget.dataset.deviceid) }
    console.log(paramsStr);
    const sign = utils.encryption(paramsStr, key)
    console.log(sign);
    const url = api.changeDeviceStatusUrl
    let data = {
      client_id: app.globalData.client_id,
      sign: sign,
      param: paramsStr,
      ccsession: ccsession,
      bind: "1",
      deviceId: String(event.currentTarget.dataset.deviceid),
    }
    utils.postLoading(url, 'GET', data, function (res) {
      console.log(res)
      if (res.data.code == 200) {
        wx.showToast({
          title: '绑定成功',
        })
        setTimeout(function () {
          getDevices(that, '获取设备中');
        }, 1000)
      } else {
        console.log('streams fail:')
        wx.showToast({
          title: '绑定失败',
        })
      }
    }, function (res) {
      console.log('streams fail:', res)
      wx.showToast({
        title: '绑定失败',
      })
    }, function (res) {
      console.log('streams complete:', res)
    }, "")
  }
})

function getDevices(that, message) {
  const ccsession = wx.getStorageSync('cksession')
  const url = api.bindDeviceListUrl
  const key = app.globalData.key
  var paramsStr = { "ccsession": ccsession }
  const sign = utils.encryption(paramsStr, key)
  let data = {
    client_id: app.globalData.client_id,
    sign: sign,
    param: paramsStr,
    ccsession: ccsession
  }
  console.log(data)
  utils.postLoading(url, 'GET', data, function (res) {
    console.log("获取设备信息:", res)
    if (res.data.result && res.data.data && res.data.data.length != 0) {
      that.setData({
        devices: true,
        mydevices: res.data.data
      })
      for (let i = 0; i < res.data.data.length; i++) {
        if (res.data.data[i].bindStatus === 1) {
          console.log(res.data.data[i].deviceId);
          wx.setStorageSync('deviceId', res.data.data[i].deviceId);
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

  }, function () {
    that.setData({ isShowDoc: true });
  }, message)
}