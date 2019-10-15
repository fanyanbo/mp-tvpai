//mock fake data

const package_getsourcelist_data = { //获取产品源列表mock data
  "user_flag": 1, //_userFlag,
  "user_id": "2.4020ff964d0d4708a5eaa40fe59fd33c", //_userId,
  "client_type": 4,
  "business_type": 1,  //-1:all 0:movie 1:education
  "third_user_id": "o-G_Ut1fckL5fBMyygPT1eE5-grM"   //cOpenId //腾讯的openid
}
const package_getproductlist_data = { //获取产品包列表mock data
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

const package_header = { //获取产品包/产品源接口 header mock data
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

module.exports = {
    package_getsourcelist_data
  , package_header  
  , package_getproductlist_data
}