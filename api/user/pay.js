//支付相关api
const util_fyb = require('../../utils/util_fyb')
const util = require('../../utils/util')
const md5_fyb = require('../../utils/md5_fyb.js')
const config = require('../../config/index');
const mock = require('./mock.js');
const app = getApp()

//module scope variable
const is_fake_data = false;//用mock data测试

const url_genOrder = config.baseUrl_sz + '/v3/order/genOrder.html'
const url_prePay = config.baseUrl_pay + '/MyCoocaa/wechat_applet/pay.action'
const url_queryOrderDetail = config.baseUrl_sz + '/v3/order/queryOrderDetail.html'
const url_queryOrderByOpenid = config.baseUrl_pay +'/MyCoocaa/payapi/api/order-info-by-token.action'

var headerBehavior = require('./header')

module.exports = Behavior({
  behaviors: [headerBehavior],
  properties: {
    myBehaviorProperty: {
      type: String
    }
  },
  data: {
    key_test : '2814d3aa2ab7298502d3d237bc4c0c67', //测试key todo needfix---
  },
  attached: function () {
    console.log('behavior pay attached.')
  },
  methods: {
    genOrder(product) {//生成订单接口
      return new Promise((resolve, reject) => {
        let pay_genorder_data = {//生成订单mock data
          "user_id": app.globalData.ccUserInfo.openid || '',
          "user_flag": !!app.globalData.ccUserInfo ? 2 : 0, //用户没登录，传0，user_id值为空
          "third_user_id": app.globalData.ccUserInfo.wxOpenid || app.globalData.ccUserInfo.qqOpenid || '',
          "product_id": product.product_id,
          "movie_id": "",
          "client_type": 3,//就下单传3,其它都传4
          "title": product.product_name,
          // "business_type": 1,  //-1:all 0:movie 1:education
          "price": product.price, //产品单价（即产品列表接口回包中的折扣后单价discount_fee）
          "count": 1,
          "discount_price": product.discount_price, //用户实际需要支付的价格，即使用优惠劵后的价格； //todo 
          "coupon_codes": product.couponcode,    //使用优惠劵时优惠劵的编码，多个以code1+ "," + code2传过来，默认空字符串,目前只能用一张
          "extend_info": app.globalData.ccUserInfo.wxOpenid ? `{"login_type":2,"wx_vu_id":"${app.globalData.ccUserInfo.wxVuId}"}` : '', //todo need-fix
          //扩展参数，非必填项，字符型数据，默认空；  
          // 影视中心3.19之后版本需要上传的值目前有login_type: 0表示手机登陆，1表示QQ登陆，2表示微信登陆；
          // wx_vu_id：微信帐号对应的vuserid，login_type为2时需要传此值；
          // 格式为json，如{ "login_type": 1, "wx_vu_id": "wxvuuserid" }
          "allowance_act_id": product.allowance_act_id,
          "discount_product_id": product.discount_product_id,
          "license": "" // todo 
        }
        let header = is_fake_data ? mock.package_header : this.getPackageHeader();
        let data = is_fake_data ? encodeURIComponent(JSON.stringify(mock.pay_genorder_data))
                                : encodeURIComponent(JSON.stringify(pay_genorder_data));
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
              resolve(data.data.data)
            } else {
              reject(data.msg)
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
    },
    _getRandomStr32() {//获取32位随机字符串
      const alphabeta = 'abcdefghijklmnopqstuvwxyz' + 'abcdefghijklmnopqstuvwxyz'.toUpperCase() + '0123456789'
      let a = '', i = 0;
      while(i++ < 32) {
        a += alphabeta.charAt(Math.floor(Math.random() * 32))
      }
      return a
    },
    _trimOject(param = {}) {
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
    },
    _getSign(param, type = 1) {//获取签名sign
      let obj = this._trimOject(param)
      let target = Object.keys(obj).sort()
      target = target.map(item => {
          item = item + '=' + obj[item]
          return item
        })
      target = target.join('&')
      if(type == 1) {
        target += this.data.key_test
      }else if (type == 2) {
        target += '&key=' + app.globalData.key
      }
      let sign = md5_fyb.MD5(target).toLowerCase()
      console.log(sign)
      return sign
    },

    prePay(params) {//请求支付接口
      return new Promise((resolve, reject) => {
        let pay_prepay_data = {//请求支付mock data
          "app_code": params.appcode,
          "trade_id": params.orderId,
          // "product_name": JSON.stringify('{"discount":"497.99","kpn":"","kpop":"","kpp":"","kppu":"","kps":"","notifyUrl":"","payNum":0,"productId":1685,"selectModel":0,"t":"奇异果VIP-12个月","tip":"","type":"simple"}'),//这里需要注意：要把字符串双引号转义
          "product_name": params.orderTitle,  //JSON.stringify({ "discount": "497.99", "kpn": "", "kpop": "", "kpp": "", "kppu": "", "kps": "", "notifyUrl": "", "payNum": 0, "productId": 1685, "selectModel": 0, "t": "奇异果VIP-12个月", "tip": "", "type": "simple" }),//这里需要注意：要把字符串双引号转义
          "amount": params.total_pay_fee / 100,//0.01,
          "notify_url": "http://dev.business.video.tc.skysrt.com/v1/open/notifyOrderPayDone.html", //todo 确认下小程序是否需要 要怎么处理
          "pay_type": "WECHAT_SMALL_PROGRAM",
          "sign": "",
          "sign_type": "MD5",
          "random_str": this._getRandomStr32(),
          "open_id": wx.getStorageSync("wxopenid"),//"o2qQA0V42DEWdzlExnD2LRBQ7B38", //微信：用户在商户appid下的唯一标识。 todo needfix 这个openId是什么？
          "app_id": "wx35b9e9a99fd089a9"
        }
        pay_prepay_data = is_fake_data ? mock.pay_prepay_data : pay_prepay_data;
        pay_prepay_data["sign"] = this._getSign(pay_prepay_data)
        wx.request({
          url: url_prePay,
          method: 'POST',
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: util.json2Form(pay_prepay_data),
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
    },
    startPay(data) { //发起微信小程序支付
      return new Promise((resolve, reject) => {
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
            resolve(res)
          },
          fail(res) {
            console.log(res)
            reject(res)
          },
          complete(res) {
            console.log(res)
          }
        })
      })
    },
    queryOrderDetail(orderId) { //查询订单情况
      return new Promise((resolve, reject) => {
        wx.request({
            url: url_queryOrderDetail,
            data: { 
              data: {
                "order_no": orderId
                }
            },
            success(data) {
              console.log(data)
              if(data.data.code == 0) {
                resolve(data.data.data.orders[0])
              }else {
                reject(data.data.msg)
              }
            },
            fail(err) {
              console.error(err)
              reject(err)
            },
            complete(res) {
              console.log(res)
            },
        })
      })
    }, 
    queryOrderByToken(pagenum, pagecount) { //获取用户消费记录
      return new Promise((resolve, reject) => {
        let time = +new Date()
        let data = {
          token: app.globalData.ccUserInfo.ccToken || '',
          starttime: '',
          endtime: util_fyb.getFormatTime(time),
          pagenum: pagenum,
          pagecount: pagecount,
        }
        wx.request({
          url: url_queryOrderByOpenid,
          data:data,
          success(data) {
            if(data.data.success) {
              resolve(data.data.data)
            }else {
              reject(data.data.message)
            }
          },
          fail(err) {
            reject(err)
          },
          complete(res) {
            console.log(res)
          },
        })
      })

    }
  },
})
