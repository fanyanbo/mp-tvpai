// home.js
import utils from '../../utils/util';
const api = require('../../api/api.js');
export {
  utils,
}
const app = getApp()
Page({
  data: {
    isShowDoc: false,
    isShowTips: false,
    username: '你好',
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo');
    this.setData({
      avatar: userInfo.avatarUrl,
      username: userInfo.nickName
    })
    console.log("onLoad, ccsession:" + wx.getStorageSync('cksession'))
    getDevices(this, '获取设备中')

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      ccsession: wx.getStorageSync("cksession")
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
    * 弹窗
  */
  cancelBind: function () {
    this.setData({
      showModal: true
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    let that = this
    const url = api.logoutUrl
    const key = app.globalData.key
    const ccsession = wx.getStorageSync('cksession')
    const params = { "ccsession": ccsession }
    const sign = utils.encryption(params, key)
    let data = {
      client_id: app.globalData.client_id,
      sign: sign,
      param: params
    }
    wx.request({
      url: url,
      method: 'GET',
      data: data,
      success: function (res) {
        console.log(res)
        if (res.data.result) {
          that.hideModal();
          try {
            wx.clearStorageSync()
            app.globalData.username = '未登录'

            wx.switchTab({
              url: '../index/index',
            })
          } catch (e) {
            console.log(e)
          }
          that.onLoad();
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.message,
          })
        }
        that.setData({
          ccsession: wx.getStorageSync('cksession')
        })
        console.log("ccsession")
        console.log(ccsession)
      },
      fail: function (res) {
        console.log(res)
      }
    })
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
  binding: function (event) {
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