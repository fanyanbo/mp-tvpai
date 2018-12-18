// var utils = require('../../utils/util.js');
// var CryptoJS = require('../../utils/crypto-js/aes')
var aes = require('../../utils/aes')
var api = require('../../config/config.js')
import utils from '../../utils/util'
export {
  utils,
}
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    moblogin: true,
    account: false,
    mobile: null,
    ccsession: wx.getStorageSync('cksession')
  },
  moblogin: function(){
    this.setData({
      moblogin: true,
      account: false     
    })
  },
  account: function(){
    this.setData({
      moblogin: false,
      account: true
    })
  },
  inputMobile: function(e){
    let re = /^1[3|4|5|7|8][0-9]\d{4,8}$/
    const mobile = e.detail.value.replace(/\s/g, "");

    if(!re.test(mobile)){
      this.setData({
        mobile: null
      })      
      // wx.showModal({
      //   title: '提示',
      //   content: '请输入正确的手机号',
      //   showCancel: false
      // })
    }else{
      this.setData({
        mobile: mobile
      })
    }
  },
  vcode: function(){
    let that = this
    const key = app.globalData.key
    const mobile = that.data.mobile

    if (!mobile){
      wx.showModal({
        title: '提示',
        content: '请输入正确的手机号',
        showCancel: false
      })
      return !1
    } else if (that.c2 && that.c2.interval){
      return !1
    } else{
      const ccsession = wx.getStorageSync('cksession')
      let paramStr = { 'ccsession': ccsession,'mobile': mobile }
      const sign = utils.encryption(paramStr, key)
      const url = api.getCaptchaUrl
      const data = {
        client_id: app.globalData.client_id,
        sign: sign,
        param: paramStr
      }
      utils.postLoading(url, 'GET', data, function(res){
          if(res.data.result){
            console.log(res)
            that.c2 = new utils.countDown({
              date: +(new Date) + 60000,
              onEnd() {
                that.setData({
                  c2: '重新获取验证码'
                })
              },
              render(date) {
                const sec = '重新获取(' + this.leadingZeros(date.sec, 2) + 's)'
                date.sec !== 0 && that.setData({
                  c2: sec,
                })
              }
            })
          }else {
            console.log(res.data)
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel: false
            })

            return !1
          }
          console.log(res)
      }, function(res){}, function(res){},'')
    }

  },
  mobiletologin: function(e){
    const that = this
    const data = e.detail.value
    const mobile = data.mobile_account
    const code = data.mobile_code
    if (!mobile){
      wx.showModal({
        title: '提示',
        content: '请输入正确的手机号码',
        showCancel: false
      })

      return !1      
    }else if(!code){
      wx.showModal({
        title: '提示',
        content: '请输入验证码',
        showCancel: false
      })

      return !1
    }else {
      const key = app.globalData.key
      const url = api.getCaptchaUrl
      const paramsStr = { "captcha": code, "ccsession": wx.getStorageSync('cksession'),"mobile": mobile}
      const sign = utils.encryption(paramsStr, key)
      const data = {
        client_id: app.globalData.client_id,
        sign: sign,
        param: paramsStr  
      }
      utils.postLoading(url, 'GET', data, function(res){
        
        if(res.data.result){
          let resdata = res.data.data
          wx.setStorageSync('username', resdata.username)
          app.globalData.username = wx.getStorageSync("username")
          wx.setStorageSync('userid', resdata.userid)
          //userid
          var username = app.globalData.username
          that.setData({
            username: wx.getStorageSync("username")
          })
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false
          })
          return !1
        }
        wx.switchTab({
          url: '../my/my',
          success: function () {
            let page = getCurrentPages().pop()
            if (page == undefined || page == null) return;
            page.onShow()
          }
        })
        console.log(res)
      },function(res){},function(res){},'')
    }
  }, 
  accountlogin: function(e){
    let that = this
    let loginData = e.detail.value
    // console.log(loginData)
    const ccsession = wx.getStorageSync('cksession')
    const key = app.globalData.key 

    if (!loginData.cc_account) {
      wx.showModal({
        title: '提示',
        content: '请输入酷开账号',
        showCancel: false
      })
      return !1
    }
    if (!loginData.cc_password) {
      wx.showModal({
        title: '提示',
        content: '请输入密码',
        showCancel: false
      })
      return !1
    }
    if (loginData.cc_account && loginData.cc_password) {
      const mobile = loginData.cc_account
      const password = aes.encryptAES(loginData.cc_password, ccsession)
      const paramS = { "ccsession": ccsession,"mobile": mobile,"password": password}
      const signS = utils.encryption(paramS,key)
      const url = app.globalData.ROOTUrl + 'ccuserlogin/login.coocaa'
      const data = {
        client_id: app.globalData.client_id,
        sign: signS,
        param: paramS        
      }
      utils.postLoading(url, 'GET', data, function(res){
        console.log(res)
        
        if (res.data.result) {
          let resdata = res.data.data

          wx.setStorageSync('username', resdata.username)
          wx.setStorageSync('mobile', resdata.mobile)
          wx.setStorageSync('userid', resdata.userid)
          app.globalData.username = resdata.username

          // wx.navigateTo({
          //   url: '../my/my',
          // })
          wx.switchTab({
            url: '../my/my',
            success: function () {

              let page = getCurrentPages().pop()
              if (page == undefined || page == null) return;
              page.onShow()
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false
          })
          return !1
        }        
      },function(res){
        console.log(res)
      },function(res){},'')
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({
      userInfo: app.globalData.userInfo
    })
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
    var that = this
    that.setData({
      userInfo: app.globalData.userInfo
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
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAp: function () {
    
  }
})
