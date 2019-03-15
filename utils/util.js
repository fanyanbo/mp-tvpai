var md5 = require('md5.js')
const api = require('../api/api.js');
var app = getApp()



function formatTime( date ) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  
  return [ year, month, day ].map( formatNumber ).join( '/' ) + ' ' + [ hour, minute, second ].map( formatNumber ).join( ':' )
}

function formatNumber( n ) {
  n = n.toString()
  return n[ 1 ] ? n : '0' + n
}

function isFunction( obj ) {
  return typeof obj === 'function';
}

function parseInteger(val) {
  if (isNaN(val))
    return 0;
  return parseInt(val);
}
function encodeUTF8(s) {
  var i, r = [], c, x;
  for (i = 0; i < s.length; i++)
    if ((c = s.charCodeAt(i)) < 0x80) r.push(c);
    else if (c < 0x800) r.push(0xC0 + (c >> 6 & 0x1F), 0x80 + (c & 0x3F));
    else {
      if ((x = c ^ 0xD800) >> 10 == 0) //对四字节UTF-16转换为Unicode
        c = (x << 10) + (s.charCodeAt(++i) ^ 0xDC00) + 0x10000,
          r.push(0xF0 + (c >> 18 & 0x7), 0x80 + (c >> 12 & 0x3F));
      else r.push(0xE0 + (c >> 12 & 0xF));
      r.push(0x80 + (c >> 6 & 0x3F), 0x80 + (c & 0x3F));
    };
  return r;
};

// 字符串加密成 hex 字符串
function sha1(s) {
  var data = new Uint8Array(encodeUTF8(s))
  var i, j, t;
  var l = ((data.length + 8) >>> 6 << 4) + 16, s = new Uint8Array(l << 2);
  s.set(new Uint8Array(data.buffer)), s = new Uint32Array(s.buffer);
  for (t = new DataView(s.buffer), i = 0; i < l; i++)s[i] = t.getUint32(i << 2);
  s[data.length >> 2] |= 0x80 << (24 - (data.length & 3) * 8);
  s[l - 1] = data.length << 3;
  var w = [], f = [
    function () { return m[1] & m[2] | ~m[1] & m[3]; },
    function () { return m[1] ^ m[2] ^ m[3]; },
    function () { return m[1] & m[2] | m[1] & m[3] | m[2] & m[3]; },
    function () { return m[1] ^ m[2] ^ m[3]; }
  ], rol = function (n, c) { return n << c | n >>> (32 - c); },
    k = [1518500249, 1859775393, -1894007588, -899497514],
    m = [1732584193, -271733879, null, null, -1009589776];
  m[2] = ~m[0], m[3] = ~m[1];
  for (i = 0; i < s.length; i += 16) {
    var o = m.slice(0);
    for (j = 0; j < 80; j++)
      w[j] = j < 16 ? s[i + j] : rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1),
        t = rol(m[0], 5) + f[j / 20 | 0]() + m[4] + w[j] + k[j / 20 | 0] | 0,
        m[1] = rol(m[1], 30), m.pop(), m.unshift(t);
    for (j = 0; j < 5; j++)m[j] = m[j] + o[j] | 0;
  };
  t = new DataView(new Uint32Array(m).buffer);
  for (var i = 0; i < 5; i++)m[i] = t.getUint32(i << 2);

  var hex = Array.prototype.map.call(new Uint8Array(new Uint32Array(m).buffer), function (e) {
    return (e < 16 ? "0" : "") + e.toString(16);
  }).join("");

  return hex;
};
// 是否为空数组
function isEmptyObject(e) {
  var t;
  for (t in e)
    return !1;
  return !0
}  
//获取接口参数 按照“参数=参数值”的模式用“&”字符拼接成字符串
function setParams(params){
  if ( isEmptyObject(params) ) {
    return ""
  }else {
    var result = '';
    for (var key in params) {
      if (params[key] == null || params[key] === "") continue;
      result += key + '=' + params[key] + '&';
    }
    return result.substr(0, result.length - 1);
  }

}
//md5加密
function encryption(paramsStr, k) {
  var str = setParams(paramsStr)
  var sign = md5.hexMD5(str + k)
  return sign
}

//首页调用
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

function encryptionIndex(paramsStr, k) {
  var str = setParamsIndex(paramsStr)
  var sign = md5.hexMD5(str + k)
  return sign
}


//数组查找操作
function contains(a, obj) {
  for (var i = 0; i < a.length; i++) {
    if (a[i] === obj) {
      return true;
    }
  }
  return false;
}

//删除指定数组操作
function removeByValue(arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == val) {
      arr.splice(i, 1);
      break
    }
  }
}


//时间戳转换时间
function toDate(number,type) {
  var type = type || '/'
  var n = number * 1000;
  var date = new Date(n);
  var Y = date.getFullYear() + type;
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + type;
  var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  return (Y + M + D)
}



//几种显示的框
function showToastBox(title,load) {
  wx.showToast({
    title: title,
    icon: load,
    mask: true,
    duration: 1000
  })
}

function showLoading() {
  wx.showToast({
    title: '加载中',
    icon: 'loading',
    mask: true,
    duration: 10000
  })
}
function hideLoading() {
  wx.hideToast()
}
function showFailToast(that, text) {
  that.setData({
    failHidden: false,
    failText: text
  })
  setTimeout(function () {
    that.setData({
      failHidden: true,
      failText: ""
    })
  }, 3000)
}

//使用post方法时转化data格式
function json2Form(json) {
  var str = [];
  for (var p in json) {
    if (json[p] == null || json[p] == '') continue
    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
  }
  return str.join("&");
}

//checkUsers
function checkUsers() {
  let key = getApp().globalData.key
  let ccsession = wx.getStorageSync('cksession')
  let paramsStr = { "ccsession": ccsession }
  let sign = encryption(paramsStr, key)
  console.log(getApp().globalData.client_id + sign + paramsStr);
  wx.request({
    url: api.checkUserUrl,
    method: 'GET',
    data: {
      client_id: getApp().globalData.client_id,
      sign: sign,
      param: paramsStr
    },
    success: function (res) {
      
      if (res.data && res.data.result) {
        console.log("checkUser:")
        console.log(res)
        wx.setStorageSync('userid', res.data.data.userid)
        wx.setStorageSync('username', res.data.data.username)
        wx.setStorageSync('mobile', res.data.data.mobile)
      }
    },
    error:function(){
    
    }
  })
}


function coocaaLogin() {
  var mobile = wx.getStorageSync('mobile')
  var userid = wx.getStorageSync('userid')
  console.log("mobile" + mobile)
  if (userid != null && userid != '') {
    return true
  } else {
    showToastBox("去登陆酷开账号", "loading")
    //去登陆酷开账号
    setTimeout(function(){
      wx.navigateTo({
        url: '../login/coocaa'
      });
    },1000)
    return null
  }
}

//操作前判断ccsession是否为空
function ccsessionIs(){
  var ccsession = wx.getStorageSync("cksession")
  var userInfo = wx.getStorageSync("userInfo")
  //console.log(ccsession == null || ccsession === '' || ccsession == undefined)
  if (ccsession == null || ccsession === '' || ccsession == undefined) {  
  //  if (userInfo == null || userInfo == undefined || userInfo == ''){
     if (!getApp().globalData.auhtSetting && getApp().globalData.onLine){        
          getApp().getUserInfo()
          // showToastBox("去授权登录！", "loading")
          // wx.switchTab({
          //   url: '../index/index',
          // })
     } else{
          showToastBox("去授权登录！", "loading")
          wx.switchTab({
            url: '../my/my',
          })
        }
    //  return null
  //  }
  //  showToastBox("返回点我的", "loading")
    return null
  }
  return true
}

//评论点赞时间处理
function getDateDiff(dateTimeStamp) {
  var result;
  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var halfamonth = day * 15;
  var month = day * 30;
  var now = new Date().getTime();
  var diffValue = now - dateTimeStamp;
  if (diffValue < 0) {
    diffValue = 0
  }
  var monthC = diffValue / month;
  var weekC = diffValue / (7 * day);
  var dayC = diffValue / day;
  var hourC = diffValue / hour;
  var minC = diffValue / minute;
  if (monthC >= 1) {
    if (monthC <= 12)
      result = "" + parseInt(monthC) + "月前";
    else {
      result = "" + parseInt(monthC / 12) + "年前";
    }
  }
  else if (weekC >= 1) {
    result = "" + parseInt(weekC) + "周前";
  }
  else if (dayC >= 1) {
    result = "" + parseInt(dayC) + "天前";
  }
  else if (hourC >= 1) {
    result = "" + parseInt(hourC) + "小时前";
  }
  else if (minC >= 1) {
    result = "" + parseInt(minC) + "分钟前";
  } else {
    result = "刚刚";
  }

  return result;
}
//评分
function starGrade(pingfen,i, starClass0, starClass1, starClass2, starClass3, starClass4){
  if (pingfen > 0 && pingfen <= 2) {
    starClass0[i] == 'true'
  } else if (pingfen > 2 && pingfen <= 6) {
    starClass0[i] = 'true'
    starClass1[i] = 'true'
  } else if (pingfen > 6 && pingfen <= 8) {
    starClass0[i] = 'true'
    starClass1[i] = 'true'
    starClass2[i] = 'true'
  } else if (pingfen > 8 && pingfen <= 9) {
    starClass0[i] = 'true'
    starClass1[i] = 'true'
    starClass2[i] = 'true'
    starClass3[i] = 'true'

  } else if (pingfen > 9 && pingfen <= 10) {
    starClass0[i] = 'true'
    starClass1[i] = 'true'
    starClass2[i] = 'true'
    starClass3[i] = 'true'
    starClass4[i] = 'true'
  }
}

// network post data
function postLoading(url, method, params, success, fail, complete, message){
  wx.showNavigationBarLoading()
  if (message != '') {
    wx.showLoading({
      title: message,
    })
  }
  wx.request({
    url: url,
    data: params,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: method,
    success: function(res){
      wx.hideNavigationBarLoading()
      if (message != ''){
        wx.hideLoading()
      }
      if(res.statusCode == 200){
        return typeof success == 'function' && success(res)
      }
      // else{
      //   return typeof fail == 'function' && fail()
      // }
    },
    fail: function(){
      wx.hideNavigationBarLoading()
      if (message != "") {
        wx.hideLoading()
      }
      return typeof fail == 'function' && fail()
    },
    complete: function (res) {
      return typeof complete == 'function' && complete(res)
    },
  })
}

// 事件收集
function eventCollect(type, contactId){
  var that = this
  const url = api.saveEventLogUrl
  const key = getApp().globalData.key
  var ccsession = wx.getStorageSync("cksession")
  var createTime = Date.parse(new Date())/1000
  var appid = "wx35b9e9a99fd089a9"
  var formId = wx.getStorageSync("formid")
  var paramsStr = { "appid": appid, "ccsession": ccsession,"contactId": contactId +'', "formId": formId +'', "type": type, "wxCreateTime": createTime+''}
  var sign = encryption(paramsStr, key)
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
    success:res => {
      if(res.data.result === true){
        console.log('enevtCollect success!')
      }
    },
    fail: function () {
      console.log("获取formid失败")
    },
    complete:function(){
      console.log("事件表单接口请求完成")
    }
  })
}

module.exports = {
  formatTime: formatTime,
  isFunction: isFunction,
  parseInteger: parseInt,
  eventCollect: eventCollect,
  encodeUTF8: encodeUTF8,
  sha1: sha1,
  showLoading: showLoading,
  hideLoading: hideLoading,
  showFailToast: showFailToast,
  setParams: setParams,
  setParamsIndex: setParamsIndex,
  encryption: encryption,
  encryptionIndex: encryptionIndex,
  contains: contains,
  toDate: toDate,
  showToastBox: showToastBox,
  json2Form: json2Form,
  removeByValue: removeByValue,
  coocaaLogin: coocaaLogin,
  ccsessionIs: ccsessionIs,
  getDateDiff: getDateDiff,
  starGrade: starGrade,
  getDateDiff: getDateDiff,
  postLoading: postLoading,
  checkUsers: checkUsers
}

// export default CountDown


