//mock fake data
const app = getApp();

const is_fake_data = false;//用mock data测试



const mock_package_getsourcelist_data = { //获取产品源列表mock data
  "user_flag": 1, //_userFlag,
  "user_id": "2.4020ff964d0d4708a5eaa40fe59fd33c", //_userId,
  "client_type": 4,
  "business_type": 1,  //-1:all 0:movie 1:education
  "third_user_id": "o-G_Ut1fckL5fBMyygPT1eE5-grM"   //cOpenId //腾讯的openid
}

const mock_package_getproductlist_data = { //获取产品包列表mock data
    "user_flag": 2,  //_userFlag,
    "user_id": "8151266f4ede11e6987500505687790a", //_userId,
    "client_type": 4,//就下单传3,其它都传4
    "business_type": 1,  //-1:all 0:movie 1:education
    "third_user_id": "",   //cOpenId //腾讯的openid
    "is_support_movie": "true",
    "movie_id": "",
    "node_type": "",
    "source_id": 1,//0:tencent, 1:qiyi
    "auth_type": 0 //鉴权类型，0第三方，1自有,该字段影视详情接口取
}

const mock_package_header = { //获取产品包/产品源接口 header mock data
  "cAppVersion": "7070002",
  "vAppID": "0", //郭导：写死
  "cSID": "756390a8-511f-4e04-b5fd-82a2fe70ec5f",
  "sourceGroup": "coocaaEdu,tencent,yinhe,4KGarden,iwangding,wasu,chn_live,youku", //怎么获取？
  "cPkg": "com.tianci.movieplatform",
  "cPattern": "normal",
  "language": "zh",
  "cResolution": "720p,1080p,4K,H265",
  "cSkySecurity": "false",
  "headerVersion": "8",
  "cUDID": "49499300",
  "cTcVersion": "700190408",
  "cChip": "9S61",
  "cSize": "50",
  // "Accept-Charset": "utf-8",
  "cBrand": "Skyworth",
  // "Accept": "application/json,text/*", //todo
  "cModel": "G50",
  "cFMode": "Default",
  "cEmmcCID": "11010030303847373000393a20e1c400",
  "MAC": "28354519712d",
  "vAcceptSources": "sky,voole,tencent,iqiyi", //郭导：写死
  // "license": "GiTv",
  "aSdk": "26",
  "cUserInfo":"",
  "cOpenId": "a263e5010c8511e8ac64525400f3186f",
  "supportSource": "4k",
  "Resolution": "1920x1080",
    "cHomepageVersion": "7070002",
  "vAppVersion": "7070002"
}
var package_header = { //获取产品包/产品源接口 header data
  "cAppVersion": app.globalData.boundDeviceInfo.vAppVersion,
  "vAppID": "0", //郭导：写死
  "cSID": app.globalData.boundDeviceInfo.sid,
  "sourceGroup": "coocaaEdu,tencent,yinhe,4KGarden,iwangding,wasu,chn_live,youku", //怎么获取？
  "cPkg": '',//"com.tianci.movieplatform",  目前字段里没有 
  "cPattern": "normal", //目前字段里没有 
  "language": "zh",     //目前字段里没有 
  "cResolution": app.globalData.boundDeviceInfo.resolution,//"720p,1080p,4K,H265",
  "cSkySecurity": "false",//目前字段里没有 
  "headerVersion": "8",
  "cUDID": app.globalData.boundDeviceInfo.serviceId,
  "cTcVersion": app.globalData.boundDeviceInfo.tcVersion,
  "cChip": app.globalData.boundDeviceInfo.chip,
  "cSize": app.globalData.boundDeviceInfo.screenSize,
  // "Accept-Charset": "utf-8",
  "cBrand": "Skyworth", //目前字段里没有 
  // "Accept": "application/json,text/*", //todo  
  "cModel": app.globalData.boundDeviceInfo.model,
  "cFMode": "Default",  //目前字段里没有 
  "cEmmcCID": "",       //目前字段里没有 
  "MAC": app.globalData.boundDeviceInfo.devMac,
  "vAcceptSources": "sky,voole,tencent,iqiyi", //郭导：写死
  // "license": "GiTv",
  "aSdk": "", //目前字段里没有 
  "cUserInfo": "",//目前字段里没有 
  "cOpenId": '',//目前字段里没有 
  "supportSource": "",//目前字段里没有 
  "Resolution": app.globalData.boundDeviceInfo.resolution,
  "cHomepageVersion": "",//目前字段里没有 
  "vAppVersion": app.globalData.boundDeviceInfo.vAppVersion,
}
const mock_package_list_data = { //产品包返回数据
  "code": 0,
  "data": {
    "activity_content": "{\"activityFlag\":\"1\",\"activityBgImage\":\"http://img.sky.fs.skysrt.com/movie_homepage_images/20190925/20190925112057546888_600x100.png\",\"activityFocusBgImage\":\"http://img.sky.fs.skysrt.com/movie_homepage_images/20190925/20190925112105357521_600x100.png\",\"packagename\":\"com.coocaa.app_browser\",\"dowhat\":\"startActivity\",\"bywhat\":\"action\",\"byvalue\":\"coocaa.intent.action.browser.no_trans\",\"params\":{\"url\":\"http://img.sky.fs.skysrt.com/tvos6_imgs_master/20190920/20190920160155242835_1920*1080.jpeg\"}}",
    "b_id": "5",
    "background_image": "http://img.sky.fs.skysrt.com/movie_homepage_images/20190925/20190925111718119417_1920x1080.jpg",
    "dmp_code": "",
    "focus_index": 1,
    "policy_id": "1645",
    "products": [
      {
        "allowance_info": null,
        "app_code": "",
        "base_desc": "30元/月",
        "buy_count": 1,
        "desc": "续费30元/月，每月享腾讯视频三端VIP",
        "discount_fee": 3000,
        "discount_products": [],
        "erp_code": "",
        "extend_attribute": "",
        "flag": 0,
        "icon_json": "{\"pIcon\":\"\",\"iconFlag\":0}",
        "images": [
          {
            "size": "s",
            "style": "v",
            "type": "web",
            "url": "http://img.sky.fs.skysrt.com/movie_homepage_images/20180927/20180927091659487180_938x138.png"
          }
        ],
        "is_alert": false,
        "is_focus": true,
        "is_keep_pay_product": 1,
        "is_recommend": true,
        "is_support_direct_discount": false,
        "is_three_terminal": 1,
        "is_unpaid": 0,
        "leave_count": 0,
        "movie_image": "",
        "product_id": 1642,
        "product_level": 7,
        "product_name": "连续包月",
        "product_stock": 0,
        "product_type": "P-Month",
        "show_style": 0,
        "source_id": 0,
        "source_sign": "",
        "support_other_discount": false,
        "unique_code": "",
        "unit_fee": 3000,
        "valid_times": {
          "count": 1,
          "unit": "m"
        },
        "vip_fee": 3000
      },
      {
        "allowance_info": null,
        "app_code": "",
        "base_desc": "45元/月",
        "buy_count": 1,
        "desc": "45元/月，享1个月腾讯视频VIP权益",
        "discount_fee": 4500,
        "discount_products": [],
        "erp_code": "",
        "extend_attribute": "",
        "flag": 0,
        "icon_json": "{\"pIcon\":\"\",\"iconFlag\":0}",
        "images": [
          {
            "size": "s",
            "style": "v",
            "type": "web",
            "url": "http://img.sky.fs.skysrt.com/movie_homepage_images/20180927/20180927091659487180_938x138.png"
          }
        ],
        "is_alert": false,
        "is_focus": false,
        "is_keep_pay_product": 0,
        "is_recommend": false,
        "is_support_direct_discount": false,
        "is_three_terminal": 1,
        "is_unpaid": 0,
        "leave_count": 0,
        "movie_image": "",
        "product_id": 2165,
        "product_level": 1,
        "product_name": "1个月",
        "product_stock": 0,
        "product_type": "P-Month",
        "show_style": 0,
        "source_id": 0,
        "source_sign": "",
        "support_other_discount": false,
        "unique_code": "",
        "unit_fee": 5000,
        "valid_times": {
          "count": 1,
          "unit": "m"
        },
        "vip_fee": 4500
      },
      {
        "allowance_info": null,
        "app_code": "",
        "base_desc": "39元/月",
        "buy_count": 1,
        "desc": "39元/月，享3个月腾讯视频VIP权益",
        "discount_fee": 11800,
        "discount_products": [],
        "erp_code": "",
        "extend_attribute": "",
        "flag": 0,
        "icon_json": "{\"pIcon\":\"\",\"iconFlag\":0}",
        "images": [
          {
            "size": "s",
            "style": "v",
            "type": "web",
            "url": "http://img.sky.fs.skysrt.com/movie_homepage_images/20180927/20180927091659487180_938x138.png"
          }
        ],
        "is_alert": false,
        "is_focus": false,
        "is_keep_pay_product": 0,
        "is_recommend": false,
        "is_support_direct_discount": false,
        "is_three_terminal": 1,
        "is_unpaid": 0,
        "leave_count": 0,
        "movie_image": "",
        "product_id": 2167,
        "product_level": 1,
        "product_name": "3个月",
        "product_stock": 0,
        "product_type": "P-Season",
        "show_style": 0,
        "source_id": 0,
        "source_sign": "",
        "support_other_discount": false,
        "unique_code": "",
        "unit_fee": 14800,
        "valid_times": {
          "count": 1,
          "unit": "se"
        },
        "vip_fee": 11800
      },
      {
        "allowance_info": null,
        "app_code": "",
        "base_desc": "29元/月",
        "buy_count": 1,
        "desc": "29元/月，享1年腾讯视频VIP权益",
        "discount_fee": 34800,
        "discount_products": [],
        "erp_code": "",
        "extend_attribute": "",
        "flag": 0,
        "icon_json": "{\"pIcon\":\"\",\"iconFlag\":0}",
        "images": [
          {
            "size": "s",
            "style": "v",
            "type": "web",
            "url": "http://img.sky.fs.skysrt.com/movie_homepage_images/20180927/20180927091659487180_938x138.png"
          }
        ],
        "is_alert": false,
        "is_focus": false,
        "is_keep_pay_product": 0,
        "is_recommend": false,
        "is_support_direct_discount": false,
        "is_three_terminal": 1,
        "is_unpaid": 0,
        "leave_count": 0,
        "movie_image": "",
        "product_id": 2168,
        "product_level": 1,
        "product_name": "12个月",
        "product_stock": 0,
        "product_type": "P-Year",
        "show_style": 0,
        "source_id": 0,
        "source_sign": "",
        "support_other_discount": false,
        "unique_code": "",
        "unit_fee": 48800,
        "valid_times": {
          "count": 1,
          "unit": "y"
        },
        "vip_fee": 34800
      },
      {
        "allowance_info": null,
        "app_code": "",
        "base_desc": "49.3元/月",
        "buy_count": 1,
        "desc": "49.3元/月，享6个月腾讯视频VIP",
        "discount_fee": 29600,
        "discount_products": [],
        "erp_code": "",
        "extend_attribute": "",
        "flag": 0,
        "icon_json": "{\"pIcon\":\"\",\"iconFlag\":0}",
        "images": [
          {
            "size": "s",
            "style": "v",
            "type": "web",
            "url": "http://img.sky.fs.skysrt.com/movie_homepage_images/20180927/20180927091659487180_938x138.png"
          }
        ],
        "is_alert": false,
        "is_focus": false,
        "is_keep_pay_product": 0,
        "is_recommend": false,
        "is_support_direct_discount": false,
        "is_three_terminal": 1,
        "is_unpaid": 0,
        "leave_count": 0,
        "movie_image": "",
        "product_id": 2268,
        "product_level": 1,
        "product_name": "6个月",
        "product_stock": 0,
        "product_type": "P-HalfYear",
        "show_style": 0,
        "source_id": 0,
        "source_sign": "",
        "support_other_discount": false,
        "unique_code": "",
        "unit_fee": 29600,
        "valid_times": {
          "count": 6,
          "unit": "m"
        },
        "vip_fee": 29600
      }
    ],
    "scheme_id": 1419,
    "scheme_name": "腾讯默认方案+连续包（半年卡刊例价）",
    "show_template": "{\"hintBgImage\":\"http://img.sky.fs.skysrt.com/movie_homepage_images/20180925/20180925173256279910_734x500.jpg\",\"hintConfirmImage\":\"http://img.sky.fs.skysrt.com/movie_homepage_images/20180925/20180925173527369731_292x90.png\",\"hintFocusConfirmImage\":\"http://img.sky.fs.skysrt.com/movie_homepage_images/20180925/20180925173558227259_292x90.png\",\"bgImage\":\"http://img.sky.fs.skysrt.com/movie_homepage_images/20190925/20190925111718119417_1920x1080.jpg\",\"focusProductImage\":\"http://img.sky.fs.skysrt.com/movie_homepage_images/20180926/20180926103435828881_938x138.png\",\"hintColor\":\"#DCB875\",\"hintFlag\":\"0\",\"productImage\":\"http://img.sky.fs.skysrt.com/movie_homepage_images/20180927/20180927091659487180_938x138.png\",\"qrcodeBgFlag\":\"1\",\"maxQrcodeBgImage\":{\"topMargin\":\"215\",\"url\":\"http://img.sky.fs.skysrt.com/movie_homepage_images/20190925/20190925112029404932_400x748.jpg\"},\"hintCancelImage\":\"http://img.sky.fs.skysrt.com/movie_homepage_images/20180925/20180925173416365792_292x90.png\",\"hintFocusCancelImage\":\"http://img.sky.fs.skysrt.com/movie_homepage_images/20180925/20180925173339098642_292x90.png\",\"minQrcodeBgImage\":{\"topMargin\":\"160\",\"url\":\"http://img.sky.fs.skysrt.com/movie_homepage_images/20190925/20190925112020726635_300x550.jpg\"}}"
  },
  "msg": "success"
}

module.exports = {
  package_header: is_fake_data ? mock_package_header : package_header, //目前只有header有真数据，其它都在各自module里
  package_getsourcelist_data: mock_package_getsourcelist_data,
  package_getproductlist_data: mock_package_getproductlist_data,
  package_list_data: mock_package_list_data,
}

