let md5 = require('md5_fyb.js');
let app = getApp();

function setParamsIndex(params) {
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

function isEmptyObject(e) {
  let t;
  for (t in e)
    return !1;
  return !0
}  

// 签名
function sign(paramsStr, k) {
  let str = setParamsIndex(paramsStr);
  console.log(str);
  console.log(str + k);
  // let signedStr = md5.hexMD5(str + k);
  let signedStr = md5.MD5(str + k);
  console.log(signedStr);
  return signedStr;
}

// 接口请求参数预处理
function paramsHandler(paramsObj = {}) {
  let orignParams = {
    "appkey": '5cc090ddad6e4544815a0026e9a735a4',
    "time": Math.round(new Date().getTime() / 1000).toString(),
    "tv_source": 'iqiyi',
    "version_code": 33,
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
  let signStr = this.sign(desSortedParams, 'cd8a62acc6164b27a9af4d29de8eeebd');
  console.log(signStr);
  desSortedParams["sign"] = signStr;
  return desSortedParams;
}

// 接口请求
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
  sign: sign,
  request: request,
  paramsHandler: paramsHandler
}



