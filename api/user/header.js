const app = getApp()

module.exports = Behavior({
  behaviors: [],
  properties: {
    myBehaviorProperty: {
      type: String
    }
  },
  data: {
    package_header : { //获取产品包/产品源接口 header data
      "cAppVersion": app.globalData.boundDeviceInfo.vAppVersion,
      "vAppID": "0", //郭导：写死
      "cSID": app.globalData.boundDeviceInfo.sid,
      "sourceGroup": "coocaaEdu,tencent,yinhe,4KGarden,iwangding,wasu,chn_live,youku", //怎么获取？
      "cPkg": "com.tianci.movieplatform", // 目前字段里没有  //todo 
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
      "cOpenId": !!app.globalData.ccUserInfo ? app.globalData.ccUserInfo.openid : '',
      "supportSource": "",//目前字段里没有 
      "Resolution": app.globalData.boundDeviceInfo.resolution,
      "cHomepageVersion": "",//目前字段里没有 
      "vAppVersion": app.globalData.boundDeviceInfo.vAppVersion,
    },
    behavior_data: 'test behavior data'
  },
  attached() {
    console.log('behavior header attached.')
  },
  detached() {
    console.log('behavior header detached.')
  },
  methods: {
    myBehaviorMethod: function () { 
      console.log('behavior header myBehaviorMethod...')
    },
    getPackageHeader() {
      this.data.package_header.cAppVersion = app.globalData.boundDeviceInfo.vAppVersion
      this.data.package_header.cSID = app.globalData.boundDeviceInfo.sid
      this.data.package_header.cResolution = app.globalData.boundDeviceInfo.resolution
      this.data.package_header.cUDID = app.globalData.boundDeviceInfo.serviceId
      this.data.package_header.cTcVersion = app.globalData.boundDeviceInfo.tcVersion
      this.data.package_header.cChip = app.globalData.boundDeviceInfo.chip
      this.data.package_header.cSize = app.globalData.boundDeviceInfo.screenSize
      this.data.package_header.cModel = app.globalData.boundDeviceInfo.model
      this.data.package_header.MAC = app.globalData.boundDeviceInfo.devMac
      this.data.package_header.cOpenId = !!app.globalData.ccUserInfo ? app.globalData.ccUserInfo.openid : ''
      this.data.package_header.Resolution = app.globalData.boundDeviceInfo.resolution
      this.data.package_header.vAppVersion = app.globalData.boundDeviceInfo.vAppVersion
      console.log('behavior header :' + JSON.stringify(this.data.package_header))
      return this.data.package_header
    },
  }
})