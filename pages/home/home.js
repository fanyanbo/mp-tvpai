// home.js
import utils from '../../utils/util';
const api = require('../../config/config.js');
export {
  utils,
}
const app = getApp()
var ccsession = wx.getStorageSync('cksession')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatar: '../../images/man.png',
    username: '你好',
    devices: false,
    mydevices: [],
    block:['block'],
    moretop:['moretop'],
    showModal: false,
    ccsession: wx.getStorageSync('cksession')
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
    console.log("---ccsession----"+ccsession)
    this.getDevices('获取设备中')

  },
  getDevices: function(message) {
    let that = this
    const ccsession = wx.getStorageSync('cksession')
    const url = api.getDevicesUrl
    const key = app.globalData.key
    var paramsStr = { "ccsession": ccsession}
    const sign = utils.encryption(paramsStr, key)
    console.log("------client_id-----" + app.globalData.client_id)
    let data = {
      client_id: app.globalData.client_id,
      sign: sign,
      param: paramsStr
    }

    utils.postLoading(url, 'GET', data, function (res) {
      console.log("---获取设备-----"+JSON.stringify(res.data))
      if(res.data.result){
        if(res.data.data){
          that.setData({
            devices: true,
            mydevices: res.data.data
          })
        }
      }
    }, function (res) {

    }, function (res) {
    //  console.log(res)
    }, message)
  },
  howbind: function(e){
    wx.navigateTo({
      url: '../course/course',
    })
  },
  moreBind: function(){
    wx.navigateTo({
      url: '../course/course',
    })
  },
  moreLess: function(e){
    let that = this
    let index = e.currentTarget.dataset.index
    let moretop = that.data.moretop
    let blocks = that.data.block
    if (blocks[index] == 'block'){
      blocks[index] = ''
      moretop[index] = ''
    }else{
      blocks[index] = 'block'
      moretop[index] = 'moretop'
    }
    that.setData({
      block: blocks,
      moretop: moretop
    })

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getDevices('')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    that.setData({
      ccsession: wx.getStorageSync("cksession")
    })
    this.getDevices('获取设备中')
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
    this.getDevices('');
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
    const params = { "ccsession": ccsession}
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
      success: function(res){
        console.log(res)
        if (res.data.result){
          that.hideModal();
          try {
            wx.clearStorageSync()
            app.globalData.username = '未登录'
           
            wx.switchTab({
              url: '../index/index',
            })
          } catch (e) {
            // Do something when catch error
            console.log(e)
          }
          that.onLoad();
        }else{
         
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
      fail: function(res){
        console.log(res)
      }
    })
  }
})

