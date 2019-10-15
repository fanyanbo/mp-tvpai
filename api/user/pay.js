//支付相关api
const util_fyb = require('../../utils/util_fyb')
const util = require('../../utils/util')
const md5_fyb = require('../../utils/md5_fyb.js')
const config = require('../../config/index');
const mock = require('./mock.js');

const app = getApp()

//module scope variable
const is_fake_data = true;//用mock data测试

const url_genOrder = config.baseUrl_sz + 'v3/order/genOrder.html'
const url_prePay = config.baseUrl_pay + 'MyCoocaa/wechat_applet/pay.action'

mock.pay_genorder_data = {//生成订单mock data
  "user_id": "8151266f4ede11e6987500505687790a", //_userId,
  "user_flag": 2,  //_userFlag,
  "third_user_id": "o-G_Ut1fckL5fBMyygPT1eE5-grM",   //cOpenId //腾讯的openid
  "product_id": 1685,
  "movie_id": "",
  "client_type": 3,//就下单传3,其它都传4
  "title": "12个月",
  "business_type": 1,  //-1:all 0:movie 1:education
  "price":  1,
  "count":  1,
  "discount_price": 1,
  "coupon_codes": "",
  "extend_info": "", //扩展参数，非必填项，字符型数据，默认空；
                              // 影视中心3.19之后版本需要上传的值目前有login_type: 0表示手机登陆，1表示QQ登陆，2表示微信登陆；
                              // wx_vu_id：微信帐号对应的vuserid，login_type为2时需要传此值；
                              // 格式为json，如{ "login_type": 1, "wx_vu_id": "wxvuuserid" }
  "allowance_act_id":"",
  "discount_product_id":"",
  "license":""
}

function genOrder() {//生成订单接口
  return new Promise((resolve, reject) => {
    let header = is_fake_data ? mock.package_header : {};
    let data = is_fake_data ? encodeURIComponent(JSON.stringify(mock.pay_genorder_data)) : {};
    let url = url_genOrder + "?data=" + data;
    console.log("genOrder url: " + url);
    wx.request({
      url: url,
      header: header,
      method: 'GET',
      dataType: 'json',
      success(data) {
        console.log(data)
        if (data.data.code == 0) {
          resolve(data)
        } else {
          reject(data)
        }
      },
      fail(err) {
        console.log(err)
        reject(err)
      },
      complete(res) {
        // console.log(res)
      }
    })
  })
}

mock.pay_prepay_data = {//请求支付mock data
  "app_code": "7873",
  "trade_id": "PAY20191010LHTW01AF",
  // "product_name": JSON.stringify('{"discount":"497.99","kpn":"","kpop":"","kpp":"","kppu":"","kps":"","notifyUrl":"","payNum":0,"productId":1685,"selectModel":0,"t":"奇异果VIP-12个月","tip":"","type":"simple"}'),//这里需要注意：要把字符串双引号转义
  "product_name": JSON.stringify({"discount":"497.99","kpn":"","kpop":"","kpp":"","kppu":"","kps":"","notifyUrl":"","payNum":0,"productId":1685,"selectModel":0,"t":"奇异果VIP-12个月","tip":"","type":"simple"}),//这里需要注意：要把字符串双引号转义
  "amount": 0.01,
  "notify_url": "http://dev.business.video.tc.skysrt.com/v1/open/notifyOrderPayDone.html", //todo 确认下小程序是否需要 要怎么处理
  "pay_type": "WECHAT_SMALL_PROGRAM",
  "sign": "",
  "sign_type": "MD5",
  "random_str": _getRandomStr32(),
  "open_id": "o2qQA0V42DEWdzlExnD2LRBQ7B38",
  "app_id": "wx35b9e9a99fd089a9"
}
function _getRandomStr32() {//获取32位随机字符串
  const alphabeta = 'abcdefghijklmnopqstuvwxyz' + 'abcdefghijklmnopqstuvwxyz'.toUpperCase() + '0123456789'
  let a = '', i = 0;
  while(i++ < 32) {
    a += alphabeta.charAt(Math.floor(Math.random() * 32)) 
  }
  return a
}
//1.将参数为空和为null的去除
// 将参数名按字母顺序升序排序
// 将排序好的参数按照 参数名1 = 参数值1 & 参数名2=参数值2 的方式连接字符串, 除了sign
// 将分配给的 key 加到第3步获取的字符串后面
// 将第4步的结果进行md5 加密, 并输出32位小写字符结果.
//   sign即为第5步的结果.
const key_test = '2814d3aa2ab7298502d3d237bc4c0c67' //测试key
function _trimOject(param = {}) {
  let t = Object.assign({}, param)
  for (let key in t) {
    if (t.hasOwnProperty(key)) {
      if (!t[key]) {
        delete t[key]
      }
    }
  }
  delete t['sign_type'] //后端加密要求不要sign及sign_type
  return t
}
function _getSign(param, type = 1)//获取签名sign
{
  let obj = _trimOject(param)
  let target = Object.keys(obj).sort()
  target = target.map( item => {
    item = item + '=' + obj[item]
    return item
  })
  target = target.join('&')
  if(type == 1) {
    target += key_test
  }else if(type == 2) {
    target += '&key=' + app.globalData.key
  }

  let sign = md5_fyb.MD5(target).toLowerCase()
  console.log(sign)
  return sign
}
function prePay() {//请求支付接口
  return new Promise((resolve, reject) => {
    mock.pay_prepay_data["sign"] = _getSign(mock.pay_prepay_data)
    wx.request({
      url: url_prePay,
      method: 'POST', 
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: util.json2Form(mock.pay_prepay_data),
      success(data) {
        console.log(data)
        if (data.data.success) {
          resolve(data.data.data)
        } else {
          reject(data)
        }
      },
      fail(err) {
        console.log(err)
        reject(err)
      },
      complete(res) {
        // console.log(res)
      }
    })
  })
}

function startPay(data) { //发起微信小程序支付
  let nonceStr = data.random_str,
    pack = `prepay_id=${data.prepay_id}`, 
    signType = data.sign_type,
    timeStamp = data.time_stamp,
    paySign = data.paySign;

  wx.requestPayment({
    timeStamp: timeStamp,
    nonceStr: nonceStr,
    package: pack,
    signType: signType,
    paySign: paySign,
    success(res) {
      console.log(res)
    },
    fail(res) {
      console.log(res)
    },
    complete(res) {
      console.log(res)
    }
  })
}

module.exports = {
  genOrder,
  prePay,
  startPay
}