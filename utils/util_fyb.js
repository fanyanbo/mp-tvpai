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

function showSuccessToast(title) {
  wx.showToast({
    title: title
  })
}

function showFailedToast(title, imgUrl) {
  wx.showToast({
    title: title,
    icon: 'none',
    image: imgUrl
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
  getTvsource()
  let orignParams = {
    "appkey": '5cc090ddad6e4544815a0026e9a735a4',
    "time": Math.round(new Date().getTime() / 1000).toString(),
    // "tv_source": 'iqiyi',
    "tv_source": wx.getStorageSync("tvSource"),
    "version_code": 33,
    // 'token': 'fanyanbo',
    // "vuid": 'fanyanbo'
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

function paramsAssemble_wx(paramsObj = {}) {
  // let ccsession = wx.getStorageSync('cksession');
  // let paramsStr = { "ccsession": ccsession };
  let paramsStr = paramsObj;
  let signedStr = sign_wx(paramsStr, '9acd4f7d5d9b87468575b240d824eb4f');
  let orignParams = {
    client_id: 'applet',
    sign: signedStr,
    param: paramsStr
    // ccsession: ccsession
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

// 参数包括rawData, code, encryptedData, iv, signature
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
  var tvSource = wx.getStorageSync("tvSource")
  if (tvSource == null || tvSource === '' || tvSource == undefined) {
    wx.setStorageSync('tvSource', 'iqiyi')
  }
}


module.exports = {
  request: request,
  paramsAssemble_tvpai: paramsAssemble_tvpai,
  paramsAssemble_wx: paramsAssemble_wx,
  getSessionByCode: getSessionByCode,
  decryptUserInfo: decryptUserInfo,
  urlAssemble_tvpai: urlAssemble_tvpai,
  showSuccessToast: showSuccessToast,
  showFailedToast: showFailedToast,
  getTvsource: getTvsource
}