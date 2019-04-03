// author:fanyanbo
// email:fanyanbo@coocaa.com
// todo:
// 1.promise化
// 2.proxy化
// 2.解构

const md5 = require('md5_fyb.js');
const api = require('../api/api_fyb');
const app = getApp();

// 公共方法
function isEmptyObject(e) {
  let t;
  for (t in e)
    return !1;
  return !0
}

// 显示成功弹窗
function showSuccessToast(title) {
  wx.showToast({
    title: title
  })
}

// 显示失败弹窗
function showFailedToast(title, imgUrl) {
  wx.showToast({
    title: title,
    icon: 'none',
    image: imgUrl
  })
}

// 显示等待弹窗
function showLoadingToast(title = '加载中', isShow = true) {
  if (isShow) {
    wx.showLoading({
      title: title
    })
  } else {
    wx.hideLoading()
  }
}

// 微信登录
function wxLogin() {
  return new Promise(function(resolve, reject) {
    wx.login({
      success: function(res) {
        resolve(res)
      },
      error: function(res) {
        reject(res)
      }
    })
  })
}

// 以电视派后台规则进行签名
function sign_tvpai(str, k) {
  let paramsStr = setParams_tvpai(str);
  let signedStr = md5.MD5(paramsStr + k);
  console.log(paramsStr + k, signedStr);
  return signedStr;
}

function setParams_tvpai(params) {
  if (isEmptyObject(params)) {
    return ""
  } else {
    let result = '';
    for (let key in params) {
      if (params[key] === null || params[key] === "") continue;
      result += key + params[key];
    }
    return result.substr(0, result.length);
  }
}
// 预处理请求参数
function paramsAssemble_tvpai(paramsObj = {}) {
  let vuid = wx.getStorageSync("wxopenid")
  if (vuid === "" || vuid == null){
    vuid = "1111";//无实际意义，传空会报错
  }
  let orignParams = {
    "appkey": '5cc090ddad6e4544815a0026e9a735a4',
    "time": Math.round(new Date().getTime() / 1000).toString(),
    "tv_source": getTvsource(),
    "version_code": 33,
    // 'token': 'fanyanbo',
    "vuid": vuid
  }
  let desParams = Object.assign(orignParams, paramsObj);
  // console.log(desParams);
  let desArray = Object.keys(desParams).sort();
  // console.log(desArray);
  let desSortedParams = {};
  // 注意中文编码
  for (let i in desArray) {
    // desSortedParams[desArray[i]] = encodeURIComponent(desParams[desArray[i]]);
    desSortedParams[desArray[i]] = desParams[desArray[i]];
  }
  let signStr = sign_tvpai(desSortedParams, 'cd8a62acc6164b27a9af4d29de8eeebd');
  console.log(signStr);
  desSortedParams["sign"] = signStr;
  return desSortedParams;
}
// 处理url参数
function urlAssemble_tvpai(url, params) {
  if (isEmptyObject(params)) {
    return url;
  } else {
    let result = '?';
    for (let key in params) {
      if (params[key] == null || params[key] === "") continue;
      result += key + '=' + params[key] + '&';
    }
    let paramsStr = result.substr(0, result.length - 1);
    return url + paramsStr;
  }
}

// 以微信后台规则进行签名
function sign_wx(str, k) {
  var paramsStr = setParams_wx(str);
  var signedStr = md5.MD5(paramsStr + k);
  console.log(paramsStr + k, signedStr);
  return signedStr;
}

function setParams_wx(params) {
  if (isEmptyObject(params)) {
    return "";
  } else {
    var result = '';
    for (var key in params) {
      if (params[key] === null || params[key] === "") continue;
      result += key + '=' + params[key] + '&';
    }
    return result.substr(0, result.length - 1);
  }
}

// 注意少军后台接口，需要对传入参数进行排序
function paramsAssemble_wx(paramsObj = {}) {
  // let paramsStr = paramsObj;
  // 需要对paramsObj进行排序
  let desArray = Object.keys(paramsObj).sort();
  let desSortedParams = {};
  for (let i in desArray) {
    desSortedParams[desArray[i]] = paramsObj[desArray[i]];
  }
  let signedStr = sign_wx(desSortedParams, '9acd4f7d5d9b87468575b240d824eb4f');
  let orignParams = {
    client_id: 'applet',
    sign: signedStr,
    param: desSortedParams
  };
  let desParams = Object.assign(orignParams, paramsObj);
  return desParams;
}

// 封装接口请求
function request(url, method, params, success, fail, complete) {
  wx.request({
    url: url,
    data: params,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: method,
    success: function (res) {
      if (res.statusCode == 200) {
        return typeof success == 'function' && success(res)
      }
    },
    fail: function () {
      return typeof fail == 'function' && fail()
    },
    complete: function (res) {
      return typeof complete == 'function' && complete(res)
    },
  })
}

function requestP(url, params, method = 'GET', contentType = 'application/x-www-form-urlencoded') {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: url,
      data: params,
      header: {
        'Content-Type': contentType
        // 这里可定义访问令牌和登录令牌
      },
      method: method,
      success: function (res) {
        if (res.statusCode != 200) {
          reject({ error: '服务器忙，请稍后重试', code: 500});
          return;
        }
        resolve(res);
      },
      fail (res) {
        reject(res);
      },
      complete: function (res) {
        // noimplement
      }
    })
  })
}

// 获取session和openid
function getSessionByCode(code, success, fail, complete) {
  console.log("getSession code", code);
  let srcParams = {
    "appid": "wx35b9e9a99fd089a9",
    "jscode": code
  }
  let desParams = paramsAssemble_wx(srcParams);
  this.request(api.getSessionUrl, 'GET', desParams,
    function (res) {
      return typeof success == 'function' && success(res)
    },
    function (res) {
      return typeof fail == 'function' && fail(res)
    },
    function (res) {
      return typeof complete == 'function' && complete(res)
    }
  );
}

function getSessionByCodeP(code) {
  console.log("getSession code", code);
  let srcParams = {
    "appid": "wx35b9e9a99fd089a9",
    "jscode": code
  }
  return this.requestP(api.getSessionUrl, paramsAssemble_wx(srcParams));
}

const utils = require('./util')
// 解密用户数据,改版的实现有问题，衡炎炎的版本是ok的
function decryptUserInfo(params) {
  console.log('decryptUserInfo', params);
  let rawData = encodeURI(params.rawData, 'utf-8');
  let paramsStr = {
    "ccsession": params.ccsession,
    "encryptedData": params.encryptedData,
    "iv": params.iv,
    "rawData": rawData,
    "signature": params.signature
  }
  let sign = utils.encryption(paramsStr, getApp().globalData.key);
  console.log(sign);
  let dataStr = utils.json2Form({
    client_id: 'applet',
    sign: sign,
    param: '{"ccsession":"' + params.ccsession + '","encryptedData":"' + params.encryptedData + '","iv":"' + params.iv + '","rawData":"' + rawData + '","signature":"' + params.signature + '"}'
  })
  console.log(dataStr);
  // let rawData = encodeURI(params.rawData, 'utf-8');
  // let srcParams = { "ccsession": params.ccsession, "encryptedData": params.encryptedData, "iv": params.iv, "rawData": rawData, "signature": params.signature };
  // let desParams = paramsAssemble_wx(srcParams);
  // console.log(desParams.sign)
  // let dataStr = utils.json2Form({ client_id: 'applet', sign: desParams.sign, param: '{"ccsession":"' + params.ccsession + '","encryptedData":"' + params.encryptedData + '","iv":"' + params.iv + '","rawData":"' + rawData + '","signature":"' + params.signature + '"}' });
  // console.log(dataStr);
  wx.request({
    url: api.getUserInfoUrl,
    data: dataStr,
    method: 'post',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: res => {
      console.log('解密用户信息成功', res)
    },
    fail: function () {
      console.log("解密用户信息失败")
    }
  })
}

//判断设备源是否为空
function getTvsource() {
  let tvSource = wx.getStorageSync("tvSource")
  if (tvSource == null || tvSource === '') {
    tvSource = "iqiyi"
  }
  return tvSource;
}

module.exports = {
  request: request,
  requestP: requestP,
  wxLogin: wxLogin,
  paramsAssemble_tvpai: paramsAssemble_tvpai,
  paramsAssemble_wx: paramsAssemble_wx,
  getSessionByCode: getSessionByCode,
  getSessionByCodeP: getSessionByCodeP,
  decryptUserInfo: decryptUserInfo,
  urlAssemble_tvpai: urlAssemble_tvpai,
  showSuccessToast: showSuccessToast,
  showFailedToast: showFailedToast,
  showLoadingToast: showLoadingToast,
  getTvsource: getTvsource
}