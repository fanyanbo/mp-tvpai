// author: fanyanbo
// email: fanyanbo@coocaa.com
// date: 2019-09-20
// todo: 1.命名优化，2.代码优化 3.适配自定义导航栏

const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
const user_package = require('../../api/user/package')
const user_push = require('../../api/user/push')

const app = getApp()

Page({
  data: {
    isShowTips: true,
    bIphoneFullScreenModel: false,
    bLoginCoocaa: !!app.globalData.ccUserInfo,//是否登录酷开系统账号
    ccUserInfo: {//当前登录的酷开账户用户信息
      name: '',
      avatar: ''
    }, 
    curTV: { //当前绑定电视
      name: '设备未连接',
      source: '',
      btn: '连接',
      bAcctMatch: true,//小程序登录账户与当前绑定电视账户是否一致
      unmatch: {
        acct: [
          { location: '手机端', name: '', avatar: ''},
          { location: '电视端', name: '未登录', avatar: '../../images/my/vip/kid.png'} //todo 修改为未登录的默认头像
        ],
        tip: '当前电视端尚未登陆账号，是否将当前手机账号同步至电视端',
      },
    },
    //mock data
    productSourceList: [ //默认显示的产品源列表
      { source_id: 1, source_name: '极光VIP', valid: '立即开通', image: '../../images/my/vip/mov.png' },
      { source_id: 44, source_name: '教育VIP', valid: '立即开通', image: '../../images/my/vip/edu.png' },
      { source_id: 57, source_name: '少儿VIP', valid: '立即开通', image: '../../images/my/vip/kid.png' },
      { source_id: 56, source_name: '电竞VIP', valid: '立即开通', image: '../../images/my/vip/game.png' }
    ],
    historyList: [],//投屏历史

  },
  tapUserInfo() {//点击用户头像
    wx.navigateTo({ url: '../login/login'})
  },
  _getBoundTVAcct() { //获取当前电视的账号信息
    let ccUserInfo = wx.getStorageSync('ccUserInfo')
    if (!ccUserInfo) {//小程序没登录
      this.setData({
        'curTV.bAcctMatch': true,
      })
      return
    } 
    user_push.getTVAcctInfo({ //获取电视端登录账户
      mac: app.globalData.boundDeviceInfo.devMac,
      deviceId: app.globalData.boundDeviceInfo.serviceId
    }).then(res => {
      let tip = ''
      if (res.open_id == ccUserInfo.openid) { //小程序和电视登录账号一致
        this.setData({
          'curTV.bAcctMatch': true,
        })
        return
      } 
      console.log(this.data.curTV)
      this.setData({ //更新手机端头像
        'curTV.bAcctMatch': false,
        'curTV.unmatch.acct[0].name': ccUserInfo.username,
        'curTV.unmatch.acct[0].avatar': ccUserInfo.avatar,
      })
      if (!!res.open_id) { //电视有登录
        this.setData({
          'curTV.unmatch.acct[1].name' : res.nick_name,
          'curTV.unmatch.acct[1].avatar': res.avatar,
          'curTV.unmatch.tip': '当前手机端与电视端会员账号不一致，推送付费内容后电视端可能无法完整播放。',
        })
      }else {
        this.setData({
          'curTV.unmatch.tip': '当前电视端尚未登陆账号，是否将当前手机账号同步至电视端'
        })
      }
      console.log(this.data.curTV)
    }).catch(err => {
      console.error('获取电视端账号 失败')
      this.setData({
        'curTV.bAcctMatch': true,
      })
      wx.showToast({
        title: '获取电视端账号失败，请查看电视端是否登录',
        icon: 'none'
      })
    })
  },
  _getBoundTVInfo() { //获取当前绑定的设备信息
    if (!!Object.keys(app.globalData.boundDeviceInfo).length) {
      this.setData({
          'curTV.name': app.globalData.boundDeviceInfo.deviceName,
          'curTV.source': app.globalData.boundDeviceInfo.source == "tencent" ? '腾讯源' : '爱奇艺源',
          'curTV.btn': '切换设备'
      })
      this._getBoundTVAcct()
    }else {
      this.setData({
        'curTV.name': '设备未连接',
        'curTV.source': '',
        'curTV.btn': '连接',
        'curTV.bAcctMatch': true,
      })
    }
  },
  syncTVAcct() { //同步当前账号到tv端
    user_push.pushTvLogin({
      openId: app.globalData.ccUserInfo.openid,
      deviceId: app.globalData.boundDeviceInfo.serviceId,
    }).then(res => {
      //todo 
      wx.showModal({
        title: '提示',
        content: '推送成功，请根据电视端提示操作',
        showCancel: fals,
      })
    })
  },
  goVipPage(e) { //去产品包购买页
    console.log(e)
    if (!app.globalData.ccUserInfo) { //没登录
      wx.navigateTo({ url: '../login/login' })
      return
    }
    if (!app.globalData.deviceId) { //没绑定设备
      wx.showToast({
        title: '请先绑定设备',
        icon: 'none'
      })
      return
    }
    let source_id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `../vipbuy/vipbuy?source_id=${source_id}` })
  },
  _getProductSourceList() {
    if (!!Object.keys(app.globalData.boundDeviceInfo).length) {
      user_package.getProductSourceList().then((res) => {
        console.log(res)
        //todo 获取的产品源列表需要先过滤
        let list = data.data.data.sources
        list.forEach((item, index) => {
          switch(item.source_id) {
            case '1':  //影视,默认奇异果VIP
              _updateProductSourceList(0, item)
              break;
            case '5':
              if(app.globalData.boundDeviceInfo.source == 'tencent') //tencent 超级影视
              {
                _updateProductSourceList(0, item)
              }
              break;
            case '44':
              _updateProductSourceList(1, item) //超级教育vip
              break;
            case '57':
              _updateProductSourceList(2, item)  //少儿vip
              break;
            case '56':
              _updateProductSourceList(3, item)  //电竞vip
              break;
          }
        })
      }).catch(err => {
        wx.showToast({
          title: '获取产品源失败',
          icon: 'none'
        })
      })
      function _updateProductSourceList(index, item) {//更新页面的产品源列表arr
        let valid = '开通权限'
        if (item.valid_type == 1) {//有效期
          if (item.valid_scope.end_readable) {
            valid = item.valid_scope.end_readable.substr(0, 10).replace(/-/g, '.').concat('到期')
          } else if (item.valid_scope.end) {
            let time = new Date(item.valid_scope.end * 1000)
            let year = time.getFullYear();
            let month = time.getMonth() + 1;
            let day = time.getDate();
            let d = year + "." + (month < 10 ? ("0" + month) : month) + "." + ((day < 10 ? ("0" + day) : day) + "到期");
            valid = d
          }
        }
        this.setData({
          [`productSourceList[${index}].source_id`]: item.source_id,
          [`productSourceList[${index}].source_name`]: item.source_name,
          [`productSourceList[${index}].valid`]: valid,
        })
      }
    }
  },

  onLoad: function () {
    console.log('onLoad');
    // if (app.globalData.deviceId != null) {
    //   this.setData({
    //     isDevConnected: true
    //   })
    // }


  },

  onShow: function () {
    console.log('onShow');
    if (!!app.globalData.ccUserInfo) {//refresh login status
      this.setData({ 
        bLoginCoocaa: true,
        'ccUserInfo.name': app.globalData.ccUserInfo.username,
        'ccUserInfo.avatar': app.globalData.ccUserInfo.avatar,
      })
    }else { //清除登录状态
      this.setData({
        bLoginCoocaa: false,
        'ccUserInfo.name': '',
        'ccUserInfo.avatar': '',
      })
    }
    //获取产品源列表
    this._getProductSourceList()
    this._getBoundTVInfo()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      // 切换到“我的”tab，设置选中状态
      this.getTabBar().setData({
        selected: 1 // 这个数是tabBar从左到右的下标，从0开始
      })
    }
    this.setData({
      isShowTips: app.globalData.isShowTips,
      bIphoneFullScreenModel: app.globalData.bIphoneFullScreenModel,
    });
    // 获取历史和收藏列表
    this.getHistoryList();
    this.getFavoriteList();
  },
  clearStorage: function () {
    wx.setStorageSync('new_cksession', "");
  },
  // 跳转至搜索页面
  handleSearchTap: function () {
    utils.navigateTo('../search/index');
  },
  // 设备绑定和推送历史入口暂未使用
  bindGetUserInfo(e) {
    console.log('bindGetUserInfo', e)
    if (!e.detail.userInfo) {
      // 用户拒绝直接返回授权框
      return;
    }
    let ccsession = wx.getStorageSync("new_cksession");
    console.log('bindGetUserInfo ccsession', ccsession);
    if (ccsession == null || ccsession === '') {
      wx.login({
        success: function (res) {
          console.log('code', res);
          utils.getSessionByCode(res.code, function (res) {
            console.log('success', res);
            if (res.data.result && res.data.data) {
              let ccsession = res.data.data.ccsession;
              let wxopenid = res.data.data.wxopenid;
              wx.setStorageSync('cksession', ccsession);
              wx.setStorageSync('wxopenid', wxopenid);
              console.log('setStorage, session = ' + ccsession + ',openid = ' + wxopenid);
              wx.navigateTo({
                url: '../history/history',
              })
            }
          }, function (res) {
            console.log('getSessionByCode error', res)
          });
        }
      });
    } else {
      wx.navigateTo({
        url: '../history/history',
      })
    }
  },
  // 跳转设备绑定页面
  handleJumpPage: function (e) {
    console.log(e.currentTarget.dataset.type)
    let _type = e.currentTarget.dataset.type
    let _path
    switch(_type) {
      case "home":
        _path = '/pages/home/home'
        break;  
      case "history":
        let _session = wx.getStorageSync("new_cksession")
        _path = (!!_session) ? '../history/history' : '../home/home'
        break;
      case "favorite": 
        _path = '/pages/favorite/favorite'
        break;
      case "record":
      case "card":
        wx.showToast({
          title: '页面建设中，请稍候',
          icon: 'none'
        })
      break;
    }
    console.log(_type, _path);
    wx.navigateTo({
      url: _path,
    })
  },

  // 获取历史列表
  getHistoryList: function () {
    let vuid = wx.getStorageSync('wxopenid');
    console.log('获取openid：', vuid);
    if (vuid == null || vuid === '') return;
    let srcParams = { "vuid": vuid };
    let desParams = utils.paramsAssemble_tvpai(srcParams);
    utils.requestP(api.getHistoryListUrl, desParams).then(res => {
      console.log("获取历史列表成功：", res);
      if (res.data.data) {
        let withinList = res.data.data.movies_within_serven_days
        let overList = res.data.data.movies_over_serven_days
        let historyList = withinList.concat(overList);
        this.setData({
          historyList: historyList
        })
      }
    }).catch(res => {
      console.log("获取历史列表发生错误：", res);
    })
  },

  // 获取收藏列表
  getFavoriteList: function () {
    let vuid = wx.getStorageSync('wxopenid');
    console.log('获取openid：', vuid);
    if (vuid == null || vuid === '') return;
    let srcParams = { "vuid": vuid, "video_type": 1 };
    let desParams = utils.paramsAssemble_tvpai(srcParams);
    console.log(desParams);
    utils.requestP(api.getCollectedListUrl, desParams).then(res => {
      console.log("获取收藏列表成功：", res);
      if (res.data.data) {
        this.setData({
          likeList: res.data.data
        })
      }
    }).catch(res => {
      console.log("获取收藏列表发生错误：", res);
    })
  },
})






