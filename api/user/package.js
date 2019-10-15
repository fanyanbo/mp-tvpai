//获取产品包列表相关API
const config = require('../../config/index');
const mock = require('./mock.js');

//api zone
const url_getSourceList = config.baseUrl_sz + 'v3/source/getSourceList.html'; //获取产品源列表接口
const url_getProductList = config.baseUrl_sz + 'v3/product/getProductList.html';//获取产品包列表接口
const url_getCoupones = config.baseUrl_sz + '/v3/web/getUserCoupons.html';//获取优惠券
const url_getAllowance = config.baseUrl_allowance + '/api/subsidy/v1/query-userSubsidyInfo-byToken';//获取津贴

//module scope variable
const is_fake_data = true;//用mock data测试

//methods zone
function getProductSourceList() { //获取产品源列表（极光VIP/教育VIP/少儿VIP/电竞VIP等）
  return new Promise((resolve, reject) => {
    let header = is_fake_data ? mock.package_header : {};
    let data = is_fake_data ? encodeURIComponent(JSON.stringify(mock.package_getsourcelist_data)) : {};
    let url = url_getSourceList + "?data=" + data;
    console.log("total url: " + url);
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

function getProductPackageList() {//获取产品包列表(包年/包月/包季/连续包月等)
  return new Promise((resolve, reject) => {
    let header = is_fake_data ? mock.package_header : {}
    let data = is_fake_data ? encodeURIComponent(JSON.stringify(mock.package_getproductlist_data)) : {};
    let url = url_getProductList + '?data=' + data;
    console.log('productlist url:', url)
    wx.request({
      url: url,
      header: header,
      method: 'GET',
      dataType: 'json',
      success(data) {
        console.log(data)
        if(data.data.code == 0) {
          resolve(data)
        }else {
          reject(data)
        }
      },
      fail(err) {
        console.error(err)
        reject(data)
      },
      complete(res) {
        // console.log(res)
      }
    })
  })
}

function getCoupones() {//获取优惠券
  return new Promise((resolve, reject) => {
    let header = is_fake_data ? mock.package_header : {}
    let data = JSON.stringify({
      "user_flag": 1,
      "user_id": "2.4020ff964d0d4708a5eaa40fe59fd33c",
      "third_user_id": "o-G_Ut1fckL5fBMyygPT1eE5-grM"   
    })
    wx.request({
      url: url_getCoupones,
      data: {
        data
      },
      header: header,
      success(data) {
        console.log(data)
        if (data.data.code == 0) {
          resolve(data)
        } else {
          reject(data)
        }
      },
      fail(err) {
        console.error(err)
        reject(data)
      },
      complete(res) {
        // console.log(res)
      }
    })
  })
}

function getAllowance() {//获取津贴
  return new Promise((resolve, reject) => {
    let clientId =  'YS_BETA' //todo 分测试环境和正式环境

    wx.request({
      url: url_getAllowance,
      data: {
        clientId: clientId,
        authenticationValue: "6a8384d5ea7111e9b3f874a4b5004af8",//openid
        authenticationType: 'openid',
        currentTimestamp: new Date().getTime()
      },
      success(data) {
        console.log(data)
        if (data.data.code == 0) {
          resolve(data.data)
        } else {
          reject(data)
        }
      },
      fail(err) {
        console.error(err)
        reject(data)
      },
      complete(res) {
        // console.log(res)
      }
    })
  })
}

module.exports = {
  getProductSourceList,
  getProductPackageList,
  getCoupones,
  getAllowance
}