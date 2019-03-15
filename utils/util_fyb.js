let md5 = require('md5_fyb.js');
let app = getApp();

// 公共方法
function isEmptyObject(e) {
  let t;
  for (t in e)
    return !1;
  return !0
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
    var result = '';
    for (var key in params) {
      if (params[key] === null || params[key] === "") continue;
      result += key + params[key];
    }
    return result.substr(0, result.length);
  }
}
// 预处理请求参数
function paramsAssemble_tvpai(paramsObj = {}) {
  let orignParams = {
    "appkey": '5cc090ddad6e4544815a0026e9a735a4',
    "time": Math.round(new Date().getTime() / 1000).toString(),
    // "tv_source": 'iqiyi',
    "tv_source": app.globalData.tvSource,
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
  for(let i in desArray) {
    // desSortedParams[desArray[i]] = encodeURIComponent(desParams[desArray[i]]);
    desSortedParams[desArray[i]] = desParams[desArray[i]];
  }
  let signStr = sign_tvpai(desSortedParams, 'cd8a62acc6164b27a9af4d29de8eeebd');
  console.log(signStr);
  desSortedParams["sign"] = signStr;
  return desSortedParams;
}

// 以微信后台规则进行签名
function sign_wx(str, k) {
  var paramsStr = setParams_wx(str);
  var signedStr = md5.MD5(paramsStr + k);
  console.log(paramsStr + k, signedStr);
  return signedStr;
}
function setParams_wx(params){
  if ( isEmptyObject(params) ) {
    return "";
  }else {
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

module.exports = {
  request: request,
  paramsAssemble_tvpai: paramsAssemble_tvpai,
  paramsAssemble_wx: paramsAssemble_wx
}



