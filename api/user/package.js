//获取产品包列表相关API
const config = require('../../config/index');
const mock = require('./mock.js');
const login = require('./login.js')
const app = getApp()
//api zone
const url_getSourceList = config.baseUrl_sz + 'v3/source/getSourceList.html'; //获取产品源列表接口
const url_getProductList = config.baseUrl_sz + 'v3/product/getProductList.html';//获取产品包列表接口
const url_getCoupones = config.baseUrl_sz + '/v3/web/getUserCoupons.html';//获取优惠券
const url_getAllowance = config.baseUrl_allowance + '/api/subsidy/v1/query-userSubsidyInfo-byToken';//获取津贴
//module scope variable
const is_fake_data = false;//用mock data测试

var headerBehavior = require('./header')

module.exports = Behavior({
  behaviors: [headerBehavior],
  properties: {
    myBehaviorProperty: {
      type: String
    }
  },
  data: {
    myBehaviorData: {}
  },
  attached: function () {
    console.log('behavior package attached.')
  },
  methods: {
    getProductSourceList(txType) { //获取产品源列表（极光VIP/教育VIP/少儿VIP/电竞VIP等）
      return new Promise((resolve, reject) => {
        let package_getsourcelist_data = { //获取产品源列表mock data
          "user_flag": !!app.globalData.ccUserInfo ? 1 : 0, //用户没登录，传0，user_id值为空; 1: token
          "user_id": !!app.globalData.ccUserInfo ? app.globalData.ccUserInfo.ccToken : '', 
          "client_type": 4,
          "business_type": -1,  //-1:all 0:movie 1:education
          "third_user_id": login.getTencentOpenId(txType).openid,
        }
        let header = is_fake_data ? mock.package_header : this.getPackageHeader();
        let data = is_fake_data ? encodeURIComponent(JSON.stringify(mock.package_getsourcelist_data))
          : encodeURIComponent(JSON.stringify(package_getsourcelist_data));
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
              data.data.data.txType = txType  //获取产品源列表，返回值里会增加获取视频源的openid类型字段(openid, qqOpenid, wxOpenid)
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
    getProductPackageList(params) {//获取产品包列表(包年/包月/包季/连续包月等)
      return new Promise((resolve, reject) => {
        let package_getproductlist_data = { //获取产品包列表mock data
          "user_flag": !!app.globalData.ccUserInfo ? 2 : 0, //用户没登录，传0，user_id值为空
          "user_id": !!app.globalData.ccUserInfo ? app.globalData.ccUserInfo.openid : '',
          "client_type": 4,//就下单传3,其它都传4
          "business_type": -1,  //-1:all 0:movie 1:education
          "third_user_id": !!app.globalData.ccUserInfo ? (app.globalData.ccUserInfo.wxOpenid || app.globalData.ccUserInfo.qqOpenid || '') : '',
          "is_support_movie": "true", //todo 这个字段作用及取值来自？
          "movie_id": "",
          "node_type": "",
          "source_id": params.source_id, //0:tencent, 1:qiyi
          "auth_type": 0 //鉴权类型，0第三方，1自有,该字段影视详情接口取 //todo 这个字段作用及取值来自？
        }
        let header = is_fake_data ? mock.package_header : this.getPackageHeader();
        let data = is_fake_data ? encodeURIComponent(JSON.stringify(mock.package_getproductlist_data))
          : encodeURIComponent(JSON.stringify(package_getproductlist_data));
        let url = url_getProductList + '?data=' + data;
        console.log('productlist url:', url)
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
            console.error(err)
            reject(data)
          },
          complete(res) {
            // console.log(res)
          }
        })
      })
    },
  getCoupones() {//获取优惠券
    return new Promise((resolve, reject) => {
      let header = is_fake_data ? mock.package_header : this.getPackageHeader();
      let data = JSON.stringify({
        "user_flag": !!app.globalData.ccUserInfo ? 2 : 0, //用户没登录，传0，user_id值为空,
        "user_id": !!app.globalData.ccUserInfo ? app.globalData.ccUserInfo.openid : '',
        "third_user_id": !!app.globalData.ccUserInfo ? (app.globalData.ccUserInfo.wxOpenid || app.globalData.ccUserInfo.qqOpenid || '') : ''
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
            resolve(data.data)
          } else {
            reject(data.data.msg)
          }
        },
        fail(err) {
          console.error(err)
          reject(err)
        },
        complete(res) {
        }
      })
    })
  },
  getAllowance() {//获取津贴
    return new Promise((resolve, reject) => {
      let clientId = config.baseUrl_allowance.startsWith('https://beta') ? 'YS_BETA' : 'YS_RELEASE ' //分测试环境和正式环境

      wx.request({
        url: url_getAllowance,
        data: {
          clientId: clientId,
          authenticationValue: !!app.globalData.ccUserInfo ? app.globalData.ccUserInfo.openid : '',//openid
          authenticationType: 'openid',
          currentTimestamp: new Date().getTime()
        },
        success(data) {
          console.log(data)
          if (data.data.code == 0) {
            resolve(data.data.data.totalSubsidy)
          } else {
            reject(data.message)
          }
        },
        fail(err) {
          console.error(err)
          reject(err)
        },
        complete(res) {
        }
      })
    })
  },

  calAllBenefits(_productListAll, _couponsListAll, _allowancesNum) {//计算优惠券，津贴
    var coupouCode = [];
    var coupouName = [];
    var coupouPrice = [];
    var discountProductId = [];

    var pkgCode = [];
    var pkgName = [];
    var pkgPrice = [];
    var pkgDiscountProductId = [];

    var hasCoupon = false;
    var hasAllowance = false;

    // console.log("优惠券=========="+JSON.stringify(data));
    if(_couponsListAll.data.length != 0) {
      hasCoupon = true;
      resetCou();
      checkCou();
      checkAllowance();
    } else {
      resetCou();
      checkAllowance();
    }
    return _productListAll

    function resetCou() {
      var child = _productListAll;
      for (let m = 0; m < child.length; m++) {
        child[m].couponname = "";
        child[m].couponcode = "";
        child[m].couponprice = "";
        child[m].coupondiscountproductid = "";
        child[m].allowance_act_id = "";
        child[m].allowanceprice = "";
        child[m].allowancediscountproductid = "";
      }
    }

  function checkCou() {
    var child = _productListAll;

    for (let m = 0; m < child.length; m++) { //对当前产品包中选中的产品项：
      var price = child[m].price;
      var product_id = child[m].product_id;
      var source = child[m].source;
      var category = child[m].product_type;
      var support_other_discount = child[m].support_other_discount;
      var is_support_direct_discount = child[m].is_support_direct_discount;
      var product_stock = child[m].product_stock;
      var discount_products = child[m].discount_products;

      for (let j = 0; j < _couponsListAll.data.length; j++) { //遍历优惠券列表
        var attributes = _couponsListAll.data[j].attributes;
        var business = _couponsListAll.data[j].businessLine
        if (attributes != null && attributes.length != 0) {
          for (let k = 0; k < attributes.length; k++) { //遍历优惠券的attributes
            if (attributes[k].resourceId != "") {//指定产品包可用
              var attrResId = attributes[k].resourceId.split(',');
              if (attrResId.indexOf(product_id) != -1) {
                // console.log("mrjr优惠券使用产品包可用");
                var nowTime = new Date().getTime();
                var endTime = Date.parse(new Date(_couponsListAll.data[j].effective_end_time.replace(' ', 'T').concat('.000Z')));
                var beginTime = Date.parse(new Date(_couponsListAll.data[j].effective_begin_time.replace(' ', 'T').concat('.000Z')));
                if (_couponsListAll.data[j].is_over_due == 0 && nowTime <= endTime && nowTime >= beginTime && price >= _couponsListAll.data[j].preferential_quota && support_other_discount == "true") {
                  //还需要考虑活动重复使用的问题--------------------------------------------------
                  var pay = "";
                  if (_couponsListAll.data[j].preferential_type == "discount") {
                    pay = price / 100 * _couponsListAll.data[j].preferential_discount;
                  } else {
                    pay = price - _couponsListAll.data[j].preferential_price;
                  }
                  if (is_support_direct_discount == "true") {
                    if (product_stock != 0) {
                      coupouCode.push(_couponsListAll.data[j].coupon_code);
                      coupouName.push(_couponsListAll.data[j].coupon_name);
                      coupouPrice.push(pay);
                      discountProductId.push(product_id);
                    } else { }
                  } else {
                    // console.log("mrjr优惠券使用产品包可用");
                    if ((discount_products).length != 0) {
                      var discount_products_id_arr = [];
                      var discount_products_fee_arr = [];
                      var discount_products_stock_arr = [];
                      for (let p = 0; p < (discount_products).length; p++) {
                        discount_products_id_arr.push((discount_products)[p].discount_product_id);
                        discount_products_fee_arr.push((discount_products)[p].discount_product_fee);
                        discount_products_stock_arr.push((discount_products)[p].discount_product_stock);
                      }
                      if (discount_products_fee_arr.indexOf(pay) != -1 && discount_products_stock_arr[discount_products_fee_arr.indexOf(pay)] != 0) {
                        coupouCode.push(_couponsListAll.data[j].coupon_code);
                        coupouName.push(_couponsListAll.data[j].coupon_name);
                        coupouPrice.push(pay);
                        discountProductId.push(discount_products_id_arr[discount_products_fee_arr.indexOf(pay)]);
                      }
                    } else { }
                  }
                } else {
                }
              } else {
              }
            } else {
              //复杂逻辑
              if (attributes[k].source != "") {//======================产品源可用
                var attrSource = attributes[k].source.split(',');
                if (attrSource.indexOf(source) != -1) {
                  // console.log("mrjr优惠券符合当前源")
                  if (attributes[k].category != "") {//======================产品类型可用
                    var attrCategory = attributes[k].category.split(',');
                    if (attrCategory.indexOf(category) != -1) {
                      var nowTime = new Date().getTime();
                      var endTime = Date.parse(new Date(_couponsListAll.data[j].effective_end_time.replace(' ', 'T').concat('.000Z')));
                      var beginTime = Date.parse(new Date(_couponsListAll.data[j].effective_begin_time.replace(' ', 'T').concat('.000Z')));
                      if (_couponsListAll.data[j].is_over_due == 0 && nowTime <= endTime && nowTime >= beginTime && price >= _couponsListAll.data[j].preferential_quota && support_other_discount == "true") {
                        //还需要考虑活动重复使用的问题--------------------------------------------------
                        var pay = "";
                        if (_couponsListAll.data[j].preferential_type == "discount") {
                          pay = price / 100 * _couponsListAll.data[j].preferential_discount;
                        } else {
                          pay = price - _couponsListAll.data[j].preferential_price;
                        }
                        if (is_support_direct_discount == "true") {
                          if (product_stock != 0) {
                            coupouCode.push(_couponsListAll.data[j].coupon_code);
                            coupouName.push(_couponsListAll.data[j].coupon_name);
                            coupouPrice.push(pay);
                            discountProductId.push(product_id);
                          } else { }
                        } else {
                          if ((discount_products).length != 0) {
                            var discount_products_id_arr = [];
                            var discount_products_fee_arr = [];
                            var discount_products_stock_arr = [];
                            for (let p = 0; p < (discount_products).length; p++) {
                              discount_products_id_arr.push((discount_products)[p].discount_product_id);
                              discount_products_fee_arr.push((discount_products)[p].discount_products_fee);
                              discount_products_stock_arr.push((discount_products)[p].discount_products_stock);
                            }
                            if (discount_products_fee_arr.indexOf(pay) != -1 && discount_products_stock_arr[discount_products_fee_arr.indexOf(pay)] != 0) {
                              coupouCode.push(_couponsListAll.data[j].coupon_code);
                              coupouName.push(_couponsListAll.data[j].coupon_name);
                              coupouPrice.push(pay);
                              discountProductId.push(discount_products_id_arr[discount_products_fee_arr.indexOf(pay)]);
                            }
                          } else { }
                        }
                      } else {
                      }
                    } else {
                    }
                  } else {
                    var nowTime = new Date().getTime();
                    var endTime = Date.parse(new Date(_couponsListAll.data[j].effective_end_time.replace(' ', 'T').concat('.000Z')));
                    var beginTime = Date.parse(new Date(_couponsListAll.data[j].effective_begin_time.replace(' ', 'T').concat('.000Z')));
                    // console.log("优惠券------" + i + ":::" + support_other_discount);
                    if (_couponsListAll.data[j].is_over_due == 0 && nowTime <= endTime && nowTime >= beginTime && price >= _couponsListAll.data[j].preferential_quota && support_other_discount == "true") {
                      //还需要考虑活动重复使用的问题--------------------------------------------------
                      var pay = "";
                      if (_couponsListAll.data[j].preferential_type == "discount") {
                        pay = price / 100 * _couponsListAll.data[j].preferential_discount;
                      } else {
                        pay = price - _couponsListAll.data[j].preferential_price;
                      }
                      if (is_support_direct_discount == "true") {
                        if (product_stock != 0) {
                          coupouCode.push(_couponsListAll.data[j].coupon_code);
                          coupouName.push(_couponsListAll.data[j].coupon_name);
                          coupouPrice.push(pay);
                          discountProductId.push(product_id);
                        } else { }
                      } else {
                        if ((discount_products).length != 0) {
                          var discount_products_id_arr = [];
                          var discount_products_fee_arr = [];
                          var discount_products_stock_arr = [];
                          for (let p = 0; p < (discount_products).length; p++) {
                            discount_products_id_arr.push((discount_products)[p].discount_product_id);
                            discount_products_fee_arr.push((discount_products)[p].discount_products_fee);
                            discount_products_stock_arr.push((discount_products)[p].discount_products_stock);
                          }
                          if (discount_products_fee_arr.indexOf(pay) != -1 && discount_products_stock_arr[discount_products_fee_arr.indexOf(pay)] != 0) {
                            coupouCode.push(_couponsListAll.data[j].coupon_code);
                            coupouName.push(_couponsListAll.data[j].coupon_name);
                            coupouPrice.push(pay);
                            discountProductId.push(discount_products_id_arr[discount_products_fee_arr.indexOf(pay)]);
                          }
                        } else { }
                      }
                    } else {
                    }
                  }
                } else {
                }
              } else {
                if (attributes[k].category != "") {//======================产品类型可用
                  var attCaate = attributes[k].category.split(',');
                  // console.log("mrjr优惠券使用类型："+attributes[k].category+"当前产品类型："+category);
                  if (attCaate.indexOf(category) != -1) {
                    // console.log("mrjr优惠券类型可使用");
                    var nowTime = new Date().getTime();
                    var endTime = Date.parse(new Date(_couponsListAll.data[j].effective_end_time.replace(' ', 'T').concat('.000Z')));
                    var beginTime = Date.parse(new Date(_couponsListAll.data[j].effective_begin_time.replace(' ', 'T').concat('.000Z')));
                    if (_couponsListAll.data[j].is_over_due == 0 && nowTime <= endTime && nowTime >= beginTime && price >= _couponsListAll.data[j].preferential_quota && support_other_discount == "true") {
                      //还需要考虑活动重复使用的问题--------------------------------------------------
                      var pay = "";
                      if (_couponsListAll.data[j].preferential_type == "discount") {
                        pay = price / 100 * _couponsListAll.data[j].preferential_discount;
                      } else {
                        pay = price - _couponsListAll.data[j].preferential_price;
                      }
                      if (is_support_direct_discount == "true") {
                        if (product_stock != 0) {
                          coupouCode.push(_couponsListAll.data[j].coupon_code);
                          coupouName.push(_couponsListAll.data[j].coupon_name);
                          coupouPrice.push(pay);
                          discountProductId.push(product_id);
                        } else { }
                      } else {
                        if ((discount_products).length != 0) {
                          var discount_products_id_arr = [];
                          var discount_products_fee_arr = [];
                          var discount_products_stock_arr = [];
                          for (let p = 0; p < (discount_products).length; p++) {
                            discount_products_id_arr.push((discount_products)[p].discount_product_id);
                            discount_products_fee_arr.push((discount_products)[p].discount_products_fee);
                            discount_products_stock_arr.push((discount_products)[p].discount_products_stock);
                          }
                          if (discount_products_fee_arr.indexOf(pay) != -1 && discount_products_stock_arr[discount_products_fee_arr.indexOf(pay)] != 0) {
                            coupouCode.push(_couponsListAll.data[j].coupon_code);
                            coupouName.push(_couponsListAll.data[j].coupon_name);
                            coupouPrice.push(pay);
                            discountProductId.push(discount_products_id_arr[discount_products_fee_arr.indexOf(pay)]);
                          }
                        } else { }
                      }
                    } else {
                    }
                  } else {
                  }
                } else {
                  //是否还需要判断category为空的状态？
                  var nowTime = new Date().getTime();
                  var endTime = Date.parse(new Date(_couponsListAll.data[j].effective_end_time.replace(' ', 'T').concat('.000Z')));
                  var beginTime = Date.parse(new Date(_couponsListAll.data[j].effective_begin_time.replace(' ', 'T').concat('.000Z')));
                  if (_couponsListAll.data[j].is_over_due == 0 && nowTime <= endTime && nowTime >= beginTime && price >= _couponsListAll.data[j].preferential_quota && support_other_discount == "true") {
                    //还需要考虑活动重复使用的问题--------------------------------------------------
                    var pay = "";
                    if (_couponsListAll.data[j].preferential_type == "discount") {
                      pay = price / 100 * _couponsListAll.data[j].preferential_discount;
                    } else {
                      pay = price - _couponsListAll.data[j].preferential_price;
                    }
                    if (is_support_direct_discount == "true") {
                      if (product_stock != 0) {
                        coupouCode.push(_couponsListAll.data[j].coupon_code);
                        coupouName.push(_couponsListAll.data[j].coupon_name);
                        coupouPrice.push(pay);
                        discountProductId.push(product_id);
                      } else { }
                    } else {
                      if ((discount_products).length != 0) {
                        var discount_products_id_arr = [];
                        var discount_products_fee_arr = [];
                        var discount_products_stock_arr = [];
                        for (let p = 0; p < (discount_products).length; p++) {
                          discount_products_id_arr.push((discount_products)[p].discount_product_id);
                          discount_products_fee_arr.push((discount_products)[p].discount_products_fee);
                          discount_products_stock_arr.push((discount_products)[p].discount_products_stock);
                        }
                        if (discount_products_fee_arr.indexOf(pay) != -1 && discount_products_stock_arr[discount_products_fee_arr.indexOf(pay)] != 0) {
                          coupouCode.push(_couponsListAll.data[j].coupon_code);
                          coupouName.push(_couponsListAll.data[j].coupon_name);
                          coupouPrice.push(pay);
                          discountProductId.push(discount_products_id_arr[discount_products_fee_arr.indexOf(pay)]);
                        }
                      } else { }
                    }
                  } else {
                  }
                }
              }
            }
          }
        } else {
          var nowTime = new Date().getTime();
          var endTime = Date.parse(new Date(_couponsListAll.data[j].effective_end_time.replace(' ', 'T').concat('.000Z')));
          var beginTime = Date.parse(new Date(_couponsListAll.data[j].effective_begin_time.replace(' ', 'T').concat('.000Z')));
          if (_couponsListAll.data[j].is_over_due == 0 && nowTime <= endTime && nowTime >= beginTime && price >= _couponsListAll.data[j].preferential_quota && support_other_discount == "true") {
            //还需要考虑活动重复使用的问题--------------------------------------------------
            var pay = "";
            if (_couponsListAll.data[j].preferential_type == "discount") {
              pay = price / 100 * _couponsListAll.data[j].preferential_discount;
            } else {
              pay = price - _couponsListAll.data[j].preferential_price;
            }
            if (is_support_direct_discount == "true") {
              if (product_stock != 0) {
                coupouCode.push(_couponsListAll.data[j].coupon_code);
                coupouName.push(_couponsListAll.data[j].coupon_name);
                coupouPrice.push(pay);
                discountProductId.push(product_id);
              } else { }
            } else {
              if ((discount_products).length != 0) {
                var discount_products_id_arr = [];
                var discount_products_fee_arr = [];
                var discount_products_stock_arr = [];
                for (let p = 0; p < (discount_products).length; p++) {
                  discount_products_id_arr.push((discount_products)[p].discount_product_id);
                  discount_products_fee_arr.push((discount_products)[p].discount_products_fee);
                  discount_products_stock_arr.push((discount_products)[p].discount_products_stock);
                }
                if (discount_products_fee_arr.indexOf(pay) != -1 && discount_products_stock_arr[discount_products_fee_arr.indexOf(pay)] != 0) {
                  coupouCode.push(_couponsListAll.data[j].coupon_code);
                  coupouName.push(_couponsListAll.data[j].coupon_name);
                  coupouPrice.push(pay);
                  discountProductId.push(discount_products_id_arr[discount_products_fee_arr.indexOf(pay)]);
                }
              } else { }
            }
          } else {
          }
        }
      }

      pkgCode.push(coupouCode);
      coupouCode = [];
      pkgName.push(coupouName);
      coupouName = [];
      pkgPrice.push(coupouPrice);
      coupouPrice = [];
      pkgDiscountProductId.push(discountProductId);
      discountProductId = [];
    }

    selectCon(pkgCode, pkgName, pkgPrice, pkgDiscountProductId);
  }

  function selectCon(pkgCode, pkgName, pkgPrice, pkgDiscountProductId) {
    var child = _productListAll;
    for (let m = 0; m < child.length; m++) {
      var useBeforePrice = child[m].price / 100;
      var tmp2 = pkgPrice[m][0];
      for (let j = 0; j < pkgPrice[m].length; j++) {
        if (pkgPrice[m][j] < tmp2) tmp2 = pkgPrice[m][j];
      }
      var bestnum = pkgPrice[m].indexOf(tmp2);
      // console.log("====has coupoun"+bestnum);
      if (bestnum != -1) {
        _productListAll[m].couponcode = pkgCode[m][bestnum];
        _productListAll[m].couponname = pkgName[m][bestnum];
        _productListAll[m].couponprice = pkgPrice[m][bestnum];
        _productListAll[m].coupondiscountproductid = pkgDiscountProductId[m][bestnum];
      }
    }
  }


  function checkAllowance() {
    if (_allowancesNum > 0) {//用户拥有津贴大于0
      var jintie = _allowancesNum;
      var child = _productListAll;

      for (let m = 0; m < child.length; m++) {
        var price = child[m].price;
        var product_id = child[m].product_id;
        var support_other_discount = child[m].support_other_discount;
        var is_support_direct_discount = child[m].is_support_direct_discount;
        var product_stock = child[m].product_stock;
        var discount_products = child[m].discount_products;
        var allowance_info = child[m].allowance_info || {};

        if (support_other_discount == "true" && new Date().getTime() > allowance_info.start_use_time && new Date().getTime() < allowance_info.end_use_time) {
          var allowance_schemes = allowance_info.allowance_schemes;
          for (let k = 0; k < allowance_schemes.length; k++) {
            if (jintie >= allowance_schemes[k].subsidy_blance && price >= allowance_schemes[k].allowance_check_money) {
              if (is_support_direct_discount == "true") {
                if (product_stock != 0) {
                  _productListAll[m].allowance_act_id = allowance_info.allowance_act_id;
                  _productListAll[m].allowanceprice = (price - allowance_schemes[k].allowance_discount_fee);
                  _productListAll[m].allowancediscountproductid = product_id;
                  hasAllowance = true;
                  break;
                } else { }
              } else {
                if ((discount_products).length != 0) {
                  var discount_products_id_arr = [];
                  var discount_products_fee_arr = [];
                  var discount_products_stock_arr = [];
                  var pay = price - allowance_schemes[k].allowance_discount_fee;
                  for (let p = 0; p < (discount_products).length; p++) {
                    discount_products_id_arr.push((discount_products)[p].discount_product_id);
                    discount_products_fee_arr.push((discount_products)[p].discount_product_fee);
                    discount_products_stock_arr.push((discount_products)[p].discount_product_stock);
                  }
                  if (discount_products_fee_arr.indexOf(pay) != -1 && discount_products_stock_arr[discount_products_fee_arr.indexOf(pay)] != 0) {
                    _productListAll[m].allowance_act_id = allowance_info.allowance_act_id;
                    _productListAll[m].allowanceprice = pay;
                    _productListAll[m].allowancediscountproductid = discount_products_id_arr[discount_products_fee_arr.indexOf(pay)];
                    hasAllowance = true;
                    break;
                  }
                } else { }
              }
            } else { }
          }
        } else { }
      }

        if (hasAllowance) {
          freshAfterCheck();
        } else if (hasCoupon) {
          freshAfterCheck();
        } else {
          freshAfterCheck();
        }
      }

      function freshAfterCheck() {
        hasCoupon = false;
        hasAllowance = false;
      }
    }
  },

},
})
//methods zone

// module.exports = {
//   getProductSourceList,
//   getProductPackageList,
//   getCoupones,
//   getAllowance,
//   calAllBenefits,
// }