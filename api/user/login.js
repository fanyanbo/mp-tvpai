//酷开登录相关api
const util = require('../../utils/util')
const util_fyb = require('../../utils/util_fyb')
const api = require('../../api/api')
const config = require('../../config/index')
const aes = require('../../utils/aes')

const app = getApp();

function vcode(mobile) { //手机注册，获取验证码
  return new Promise((resolve, reject) => {
    let that = this
    let c2 = null
    const key = app.globalData.key
    const telNum = mobile
    if (!telNum) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的手机号',
        showCancel: false
      })
      return !1
      // } else if (that.c2 && that.c2.interval) { //倒计时生效中
      //   return !1
    } else {
      let paramStr = { 'mobile': mobile }
      const sign = util.encryption(paramStr, key)
      wx.request({
        url: config.baseUrl_wx + 'ccuserlogin/getCaptcha.coocaa',
        method: 'GET',
        data: {
          client_id: app.globalData.client_id,
          sign: sign,
          param: paramStr
        },
        success: function (res) {
          console.log(res)
          if (!res.data.data) {
            // that.c2 = new utils.countDown({ //todo
            //   date: +(new Date) + 60000,
            //   onEnd() {
            //     that.setData({
            //       c2: '重新获取验证码'
            //     })
            //   },
            //   render(date) {
            //     const sec = this.leadingZeros(date.sec, 2) + ' 秒后重发' //todo
            //     date.sec !== 0 && that.setData({
            //       c2: sec,
            //     })
            //   }
            // })
            resolve(res)
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.data.msg,
              showCancel: false
            })
            reject(new Error('vcode error'))
            return !1
          }
        },
        fail: function (res) {
          console.log(res)
          reject(new Error('vcode fail'))
        }
      })
    }
  })
}
function _storeCCUserInfo(data) {
  app.globalData.ccUserInfo = data;
  wx.setStorageSync('ccUserInfo', data)
}
function mobLogin(mobile, mobileCode) {//手机号登录
  return new Promise((resolve, reject) => {
    let that = this
    const ccsession = wx.getStorageSync('new_cksession')
    const key = app.globalData.key
    const paramsStr1 = { "captcha": mobileCode, "ccsession": ccsession, "mobile": mobile }
    const sign1 = util.encryption(paramsStr1, key)

    wx.request({
      url: config.baseUrl_wx + 'ccuserlogin/captchaLogin.coocaa',
      method: 'GET',
      data: {
        client_id: app.globalData.client_id,
        sign: sign1,
        param: paramsStr1
      },
      success: function (res) {
        console.log(res)
        let resdata = res.data.data
        if (resdata) {
          _storeCCUserInfo(resdata)
          resolve()
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false
          })
          reject()
          return !1
        }
        // wx.switchTab({
        //   url: '../my/my',
        //   success: function () {
        //     let page = getCurrentPages().pop()
        //     if (page == undefined || page == null) return;
        //     page.onShow()
        //   }
        // })
      },
      fail: function (res) {
        console.log('fail: ' + res)
        wx.showModal({
          title: '提示',
          content: res,
          showCancel: false
        })
        reject()
      }
    })
  })
}
function json2Form(json) {
  var str = [];
  for (var p in json) {
    if (json[p] == null || json[p] == '') continue
    str.push((p) + "=" + (json[p]));
  }
  return str.join("&");
}
function ccsubmit(userName, userPassword) {//账号密码登录
  let that = this
  const ccsession = wx.getStorageSync('new_cksession')

  if (!userName) {
    wx.showModal({
      title: '提示',
      content: '请输入酷开账号',
      showCancel: false
    })
    return !1
  }
  if (!userPassword) {
    wx.showModal({
      title: '提示',
      content: '请输入密码',
      showCancel: false
    })
    return !1
  }
  if (userName && userPassword) {
    const password = aes.encryptAES(userPassword, ccsession)
    const paramS = { "ccsession": ccsession, "mobile": userName, "password": password }
    const signS = util.encryption(paramS, app.globalData.key)
    let dataStr = {
      client_id: app.globalData.client_id,
      sign: signS,
      param: paramS
      // param: JSON.stringify(paramS) //密码解密失败
      // param: '{"ccsession":"' + ccsession + '","mobile":"' + userName + '","password":"' + password + '"}'
    }
    wx.request({
      url: config.baseUrl_wx + 'ccuserlogin/login.coocaa',
      method: 'GET',//'GET'
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: dataStr,
      success: function (res) {
        console.log(res)
        if (res.data.result) {
          let resdata = res.data.data
          _storeCCUserInfo(resdata)
          // wx.navigateTo({
          //   url: '../my/my',
          // })
          // wx.switchTab({
          //   url: '../my/my',
          //   success: function () {

          //     let page = getCurrentPages().pop()
          //     if (page == undefined || page == null) return;
          //     page.onShow()
          //   }
          // })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false
          })
          return !1
        }
      },
      fail: function (res) {
        console.log(res)
      }
    })
  }
}

//todo： 微信登录，直接跳转到后台衡炎炎页面
function wxLoginCC() {//微信号登录酷开系统 
  wx.login({
    success: function (res) {
      console.log('code', res);
      util_fyb.getSessionByCode(res.code, function (res) {
        console.log('success', res);
        if (res.data.result && res.data.data) {
          let ccsession = res.data.data.ccsession;
          let wxopenid = res.data.data.wxopenid;
          wx.setStorageSync('cksession', ccsession);
          wx.setStorageSync('wxopenid', wxopenid);
          console.log('setStorage, session = ' + ccsession + ',openid = ' + wxopenid);
          // wx.navigateTo({
          //   url: '../history/history',
          // })
        }
      }, function (res) {
        console.log('getSessionByCode error', res)
      });
    }
  });
}

function getWXAuth(params) { //酷开账号登录前先获取微信授权，并上报酷开后台
  return util_fyb.wxLogin() //todo 思考怎么优化
    .then(res => {
      console.log('wxLogin res=', res)
      return util_fyb.getSessionByCodeP(res.code)
    })
    .then(res => {
      console.log('getSessionByCode res=', res)
      if (res.data.result && res.data.data) {
        let ccsession = res.data.data.ccsession;
        let wxopenid = res.data.data.wxopenid;
        wx.setStorageSync('new_cksession', ccsession);
        wx.setStorageSync('wxopenid', wxopenid);
        console.log('setStorage, session = ' + ccsession + ',openid = ' + wxopenid);

        let rawData = encodeURI(params.rawData, 'utf-8');
        let paramsStr = {
          "ccsession": params.ccsession,
          "encryptedData": params.encryptedData,
          "iv": params.iv,
          "rawData": rawData,
          "signature": params.signature
        }
        let sign = util.encryption(paramsStr, app.globalData.key);
        // console.log(sign);
        let dataStr = utils.json2Form({
          client_id: 'applet',
          sign: sign,
          param: '{"ccsession":"' + params.ccsession + '","encryptedData":"' + params.encryptedData + '","iv":"' + params.iv + '","rawData":"' + rawData + '","signature":"' + params.signature + '"}'
        })
        console.log(dataStr);
        return util_fyb.requestP(url, dataStr, 'post');
      }
    })
}
// function decryptUserInfo(params) { //todo 这里是跟home.js里的对比，看如何处理?
//   console.log('decryptUserInfo', params);
//   let rawData = encodeURI(params.rawData, 'utf-8');
//   let paramsStr = {
//     "ccsession": params.ccsession,
//     "encryptedData": params.encryptedData,
//     "iv": params.iv,
//     "rawData": rawData,
//     "signature": params.signature
//   }
//   let sign = utils.encryption(paramsStr, getApp().globalData.key);
//   console.log(sign);
//   let dataStr = utils.json2Form({
//     client_id: 'applet',
//     sign: sign,
//     param: '{"ccsession":"' + params.ccsession + '","encryptedData":"' + params.encryptedData + '","iv":"' + params.iv + '","rawData":"' + rawData + '","signature":"' + params.signature + '"}'
//   })
//   console.log(dataStr);
//   // let rawData = encodeURI(params.rawData, 'utf-8');
//   // let srcParams = { "ccsession": params.ccsession, "encryptedData": params.encryptedData, "iv": params.iv, "rawData": rawData, "signature": params.signature };
//   // let desParams = paramsAssemble_wx(srcParams);
//   // console.log(desParams.sign)
//   // let dataStr = utils.json2Form({ client_id: 'applet', sign: desParams.sign, param: '{"ccsession":"' + params.ccsession + '","encryptedData":"' + params.encryptedData + '","iv":"' + params.iv + '","rawData":"' + rawData + '","signature":"' + params.signature + '"}' });
//   // console.log(dataStr);
//   wx.request({
//     url: api.getUserInfoUrl,
//     data: dataStr,
//     method: 'post',
//     header: {
//       'Content-Type': 'application/x-www-form-urlencoded'
//     },
//     success: res => {
//       console.log('解密用户信息成功', res)
//     },
//     fail: function () {
//       console.log("解密用户信息失败")
//     }
//   })
// }

module.exports = {
  vcode,
  getWXAuth,
  mobLogin,
  ccsubmit,
  wxLoginCC
}