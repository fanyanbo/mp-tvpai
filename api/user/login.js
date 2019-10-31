//酷开登录相关api
const util = require('../../utils/util')
const util_fyb = require('../../utils/util_fyb')
const api = require('../../api/api')
const api_fyb = require('../../api/api_fyb')
const config = require('../../config/index')
const aes = require('../../utils/aes')

const app = getApp();

function vcode(mobile) { //手机注册，获取验证码
  return new Promise((resolve, reject) => {
    let that = this
    let c2 = null
    const key = app.globalData.key
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
          resolve(res)
        } else {
          reject(new Error('vcode error'))
          return !1
        }
      },
      fail: function (res) {
        console.log(res)
        reject(new Error('vcode fail'))
      }
    })
  })
}
function _storeCCUserInfo(data) {
  app.globalData.ccUserInfo = data;
  wx.setStorageSync('ccUserInfo', data)
}
function _clearCCUserInfo() {
  app.globalData.ccUserInfo = null;
  wx.removeStorageSync('ccUserInfo')
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
          reject()
          return !1
        }
      },
      fail: function (res) {
        console.log('fail: ' + res)
        reject()
      }
    })
  })
}

function acctLogin(userName, userPassword) {//账号密码登录
  return new Promise((resolve, reject) => {
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
      }
      wx.request({
        url: config.baseUrl_wx + 'ccuserlogin/login.coocaa',
        method: 'GET',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: dataStr,
        success: function (res) {
          console.log(res)
          if (res.data.result) {
            let resdata = res.data.data
            _storeCCUserInfo(resdata)
            resolve()
          } else {
            reject()
            return !1
          }
        },
        fail: function (res) {
          console.log(res)
          reject()
        }
      })
    }
  })
}

function ccloginByWechatH5(userInfo) {//小程序跳 H5微信登录页面 登录酷开系统
  _storeCCUserInfo(userInfo)
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
          "ccsession": ccsession,
          "encryptedData": params.encryptedData,
          "iv": params.iv,
          "rawData": rawData,
          "signature": params.signature
        }
        let sign = util.encryption(paramsStr, app.globalData.key);
        // console.log(sign);
        let dataStr = util.json2Form({
          client_id: 'applet',
          sign: sign,
          param: '{"ccsession":"' + ccsession + '","encryptedData":"' + params.encryptedData + '","iv":"' + params.iv + '","rawData":"' + rawData + '","signature":"' + params.signature + '"}'
        })
        console.log(dataStr);
        let url = api.getuserinfoUrl
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

function userLogout() {
  return new Promise((resolve, reject) => {
    const url = config.baseUrl_wx + 'ccuserlogin/logout.coocaa'
    const key = app.globalData.key
    const ccsession = wx.getStorageSync('new_cksession')
    const params = { "ccsession": ccsession }
    const sign = util.encryption(params, key)
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
          try {
            _clearCCUserInfo()
            app.globalData.username = '未登录'
          } catch (e) {
            // Do something when catch error
            console.log(e)
          }
          resolve()
        } else {
          reject()
        }
      },
      fail: function (res) {
        console.log(res)
        reject()
      }
    })
  })
}

function login_changeNickname(name) {//修改昵称
  return new Promise((resolve, reject) => {
    //todo 需要跟陈希光确认正式的 cliendId 和 key
    const paramsStr1 = { 
      client_id: '20030b3587ab4f9a9739185237319a46', //app.globalData.client_id, 
      open_id: !!app.globalData.ccUserInfo ? app.globalData.ccUserInfo.openid : '', 
      time: new Date().getTime().toString(),
    }
    const sign1 = util.encryption(paramsStr1, 'KSiVM12wRNu1WNN5') //app.globalData.key)
    paramsStr1["redirect_uri"] = 'http://www.baidu.com'
    paramsStr1["sign"] = sign1

    wx.request({
      url: config.baseUrl_acct + '/oauth2/weixinlogin-update-nick',
      method: 'GET',
      data: paramsStr1,
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log('fail: ' + res)
        reject()
      }
    })
  })
}

//type: 默认undefined 用户是否登录酷开账号
//type: 1 用户是否分源登录（腾讯源：需要qq或wechat）
//type: 2 腾讯源是否同时登录了qq和wecaht
function isUserLogin({type} = {}) { //用户是否登录 
  if(type == 1) {
    if (app.globalData.boundDeviceInfo.source == "tencent") {
      return !!app.globalData.ccUserInfo && (!!app.globalData.ccUserInfo.wxOpenid || !!app.globalData.ccUserInfo.qqOpenid)
    } else {
      return !!app.globalData.ccUserInfo
    }
  }else if(type == 2) {
    return app.globalData.boundDeviceInfo.source == 'tencent' && !!app.globalData.ccUserInfo
      && !!app.globalData.ccUserInfo.wxOpenid && !!app.globalData.ccUserInfo.qqOpenid
  }
  return !!app.globalData.ccUserInfo
}

function getTencentOpenId(type) { //获取第三方（腾讯）用户当前使用的userid
  if (!!type) {
    return type == 'qq' ? { type: 'qq', openid: app.globalData.ccUserInfo.qqOpenid }
      : { type: 'wechat', openid: app.globalData.ccUserInfo.wxOpenid }
  } else {
    if (!app.globalData.ccUserInfo) return {}
    if (!!app.globalData.ccUserInfo.wxOpenid) return { type: 'wechat', openid: app.globalData.ccUserInfo.wxOpenid }
    if (!!app.globalData.ccUserInfo.qqOpenid) return { type: 'qq', openid: app.globalData.ccUserInfo.qqOpenid }
  }
  return {}
}

class formIdEventCollectClass {
  constructor() {}

  //模板消息事件，收集form-id 用于模板消息推送； 建议使用下面封装的 formMsgEventCollectAsync()函数
  collect(type, contactId) {
    return new Promise((resolve, reject) => {
      const url = api_fyb.formIdEventCollectUrl
      const key = getApp().globalData.key
      var ccsession = wx.getStorageSync("new_cksession")
      var createTime = Date.parse(new Date()) / 1000
      var appid = "wx35b9e9a99fd089a9"
      var formId = wx.getStorageSync("formid")
      var paramsStr = { "appid": appid, "ccsession": ccsession, "contactId": contactId + '', "formId": formId + '', "type": type, "wxCreateTime": createTime + '' }
      var sign = util.encryption(paramsStr, key)
      var data = {
        client_id: getApp().globalData.client_id,
        sign: sign,
        param: paramsStr
      }
      wx.request({
        url: url,
        data: {
          client_id: 'applet',
          sign: sign,
          param: paramsStr
        },
        method: 'get',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: res => {
          console.log('eventCollect: ', res.data.result)
          if (res.data.result === true) {
            resolve(res.data)
          } else {
            reject(res.data.result)
          }
        },
        fail: function () {
          console.log("提交formid失败")
          reject('提交formid失败')
        },
        complete: function () {
          console.log("事件表单接口请求完成")
        }
      })
    })
  }

  //form-id提交需要2个条件 1. 拿到form-id 2.用户授权拿到ccsession； 所以需要写成异步的确保在formSubmit之后执行
  collectAsync(type, contactId) { 
    return new Promise((resolve, reject) => {
      let ccsession = wx.getStorageSync("new_cksession")
      if (!ccsession) {
        return wxGetUserInfoP().then(res => {
          return getWXAuth(res)
        }).then(res =>
          resolve(res)
        ).catch(err =>
          reject(err)
        )
      } else {
        setTimeout(resolve, 0) //要先等form-id获取完毕
      }
    }).then(res => {
      return this.collect(type, contactId)
    })
  }

  // collectAsyncOnce(newformid) { //只提交一次：用户进入小程序有交互后提交；然后其他的交互不再提交
  //   return new Promise((resolve, reject) => {
  //     let formId = wx.getStorageSync('formid')
  //     if (!formId) {
  //       wx.setStorageSync("formid", newformid)
  //       return this.collectAsync('userInitEnter', util_fyb.getFormatTime(+new Date()))
  //     } else {
  //       console.log('event has collect, not any more...')
  //       reject()
  //     }
  //   })
  // }
}

function wxGetUserInfoP() {
  return new Promise((resolve, reject) => {
    wx.getUserInfo({
      success(res) {
        resolve(res)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}
module.exports = {
  vcode,
  getWXAuth,
  mobLogin,
  acctLogin,
  ccloginByWechatH5, //微信登录代码看如何优化，最好集中在一处
  userLogout,
  login_changeNickname,
  isUserLogin,
  getTencentOpenId,
  formIdEventCollectClass,
}