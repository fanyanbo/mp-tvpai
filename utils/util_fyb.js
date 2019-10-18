// author:fanyanbo
// email:fanyanbo@coocaa.com
// todo:
// 1.promise化
// 2.proxy化
// 3.解构

const md5 = require('md5_fyb.js')
const api = require('../api/api_fyb')
const njApi = require('../api/api_nj')

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
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        resolve(res)
      },
      error: function (res) {
        reject(res)
      }
    })
  })
}

// 以电视派后台规则进行签名
function sign_tvpai(str, k) {
  let paramsStr = setParams_tvpai(str);
  let signedStr = md5.MD5(paramsStr + k);
  // console.log(paramsStr + k, signedStr);
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
  if (vuid === "" || vuid == null) {
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
  // console.log(signStr);
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
  // console.log(paramsStr + k, signedStr);
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
  return new Promise(function (resolve, reject) {
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
          reject({ error: '服务器忙，请稍后重试', code: 500 });
          return;
        }
        resolve(res);
      },
      fail(res) {
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

//判断设备源是否为空
function getTvsource() {
  let tvSource = wx.getStorageSync("tvSource")
  if (tvSource == null || tvSource === '') {
    tvSource = "iqiyi"
    // tvSource = "qq"
  }
  return tvSource
}

//检测是否iphone 全面屏手机
function checkIphoneFullScreenModel({ platform, model }) {
  return !!(platform.match(/ios/i) && model.match(/iphone x/i))
}

//获取平台信息，分为IOS和Android
function getFlatform({ platform }) {
  return !!platform.match(/ios/i) ? 'IOS' : 'Android'
}

//刷新并存储被绑定设备状态： 
function refreshBindedTVStatus(activeId) {
  console.log('refreshBindedTVStatus. activeId: ', activeId);
  return new Promise(function (resolve, reject) {
    njApi.isTVSupportMP(activeId)
      .then((res) => { storeBindedTVStatus(res); resolve(res); })
      .catch(() => console.log('refreshBindedTVStatus storage error.'));
  })
}
//存储被绑定设备状态： 小维AI版本是否支持小程序
function storeBindedTVStatus(bSupport) {
  console.log('storeBindedTVStatus. bSupport: ', bSupport);
  wx.setStorageSync('bBindedTVSupportMP', bSupport);
}
function getBindedTVStatus() {
  let res = !!wx.getStorageSync('bBindedTVSupportMP');
  console.log('getBindedTVStatus bBindedTVSupportMP:' + res);
  return res;
}

//判断字符串是否是json格式：如果parse能够转换成功，转换后类型为object且不等于null
function isJson(str) {
  if (typeof str == 'string') {
    try {
      let obj = JSON.parse(str);
      if (typeof obj == 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log('error: ' + str + '!!!' + e);
      return false;
    }
  }
  return false;
}

// 获取导航栏高度（rpx和px）
function getNavBarHeight() {
  const {
    navBarHeight,
    navBarExtendHeight,
  } = getApp().globalSystemInfo;
  let _pxNavBarHeight = navBarHeight + navBarExtendHeight
  let _winWidth = wx.getSystemInfoSync().windowWidth
  let _ratio = 750 / _winWidth
  let _rpxNavBarHeight = _pxNavBarHeight * _ratio
  return { pxNavBarHeight: _pxNavBarHeight, rpxNavBarHeight: _rpxNavBarHeight, ratio: _ratio }
}

function navigateBack(n = 1) {
  wx.navigateBack({
    delta: n
  })
}

function navigateTo(url) {
  wx.navigateTo({ url: url })
}

// 节流
function throttle(func, wait, options) {
  var timeout, context, args, result;
  var previous = 0;
  if (!options) options = {};

  var later = function () {
    previous = options.leading === false ? 0 : new Date().getTime();
    timeout = null;
    func.apply(context, args);
    if (!timeout) context = args = null;
  };

  var throttled = function () {
    var now = new Date().getTime();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
  };
  return throttled;
}

// 检查是否登录，没登录跳转至登录页面
function checkCoocaaUserLogin() {
  let _userInfo = wx.getStorageSync('ccUserInfo')
  // 注意用_userInfo == null无效
  if (_userInfo == "") {
    console.log(console.log('酷开账号信息:', _userInfo))
    wx.navigateTo({ url: '../login/login' })
  }
}

module.exports = {
  request: request,
  requestP: requestP,
  wxLogin: wxLogin,
  paramsAssemble_tvpai: paramsAssemble_tvpai,
  paramsAssemble_wx: paramsAssemble_wx,
  getSessionByCode: getSessionByCode,
  getSessionByCodeP: getSessionByCodeP,
  urlAssemble_tvpai: urlAssemble_tvpai,
  showSuccessToast: showSuccessToast,
  showFailedToast: showFailedToast,
  showLoadingToast: showLoadingToast,
  getTvsource: getTvsource,
  checkIphoneFullScreenModel: checkIphoneFullScreenModel,
  refreshBindedTVStatus: refreshBindedTVStatus,
  storeBindedTVStatus: storeBindedTVStatus,
  getBindedTVStatus: getBindedTVStatus,
  isJson: isJson,
  getNavBarHeight: getNavBarHeight,
  navigateBack: navigateBack,
  navigateTo: navigateTo,
  throttle: throttle,
  getFlatform: getFlatform,
  checkCoocaaUserLogin: checkCoocaaUserLogin
}