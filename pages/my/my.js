// author: fanyanbo
// email: fanyanbo@coocaa.com
// date: 2019-09-20
// todo: 1.命名优化，2.代码优化 3.适配自定义导航栏

const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
// const user_package = require('../../api/user/package')
const user_push = require('../../api/user/push')
const user_login = require('../../api/user/login')
const app = getApp()

var packageBehavior = require('../../api/user/package')

Component({
  behaviors: [packageBehavior],

  data: {
    isShowTips: true,
    bIphoneFullScreenModel: false,
    bLoginCoocaa: !!app.globalData.ccUserInfo,//是否登录酷开系统账号
    bToastAuthTencentQQorWechat: false, //腾讯源进入产品包时，提示用户选择授权qq或微信的弹窗
    tencentAcctInfos: [ //腾讯源用户qq和微信信息
      {
        type: 'wechat',
        avatar: '../../images/my/wechat.png',
        name: '微信登录',
        valid: '无VIP',
      },
      {
        type: 'qq',
        avatar: '../../images/my/qq.png',
        name: 'QQ登录',
        valid: '无VIP',
      }
    ],
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
    productSourceList: [ //默认显示的产品源列表
      { index: 0, source_id: 0, source_name: '极光VIP', valid: '立即开通', image: '../../images/my/vip/mov.png' },
      { index: 1, source_id: 0, source_name: '教育VIP', valid: '立即开通', image: '../../images/my/vip/edu.png' },
      { index: 2, source_id: 0, source_name: '少儿VIP', valid: '立即开通', image: '../../images/my/vip/kid.png' },
      { index: 3, source_id: 0, source_name: '电竞VIP', valid: '立即开通', image: '../../images/my/vip/game.png' }
    ],
    historyList: [],//投屏历史
  },

  methods: {
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
        openId: !!app.globalData.ccUserInfo ? app.globalData.ccUserInfo.openid : '',
        deviceId: app.globalData.boundDeviceInfo.serviceId,
      }).then(res => {
        wx.showModal({
          title: '提示',
          content: '推送成功，请根据电视端提示操作',
          showCancel: false,
        })
      })
    },
    closeToastAuthTencentQQorWechat() { //关闭腾讯源授权弹窗
      this.setData({ bToastAuthTencentQQorWechat: false })
    },
    goVipPage(e) { //去产品包购买页
      console.log(e)
      if (!user_login.isUserLogin()){ //腾讯源需要qq或微信登录
        if (app.globalData.boundDeviceInfo.source == "tencent") {
          wx.showModal({
            title: '温馨提示',
            content: '购买腾讯产品需要绑定微信或QQ',
            success(res) {
              if (res.confirm) {
                wx.navigateTo({ url: '../login/login?action=tencentlogin' })
              }
            },
          })
        }else {
          wx.navigateTo({ url: '../login/login' })
        }
        return 
      }
      if (!app.globalData.deviceId) { //没绑定设备
        wx.showToast({
          title:  '请先连接设备',
          icon: 'none'
        })
        return
      }
      let source_id = e.currentTarget.dataset.id
      if(!source_id) {
        wx.showToast({
          title: '获取产品源失败，请先连接设备',
          icon: 'none'
        })
      }else {
        let index = e.currentTarget.dataset.index
        //是腾讯源，并且是影视，先确认微信或QQ授权
        if (index == 0 && this.isTencentSourceNQQWechatLogin()) {
          this.setData({ bToastAuthTencentQQorWechat: true })
        }else {
          let type = this.getThirdUserId().type
          wx.navigateTo({ url: `../vipbuy/vipbuy?source_id=${source_id}&tencent_type=${type}` })
        }
      }
    },
    goVipPageTencentSource(e) { //去腾讯源的产品包购买页
      let source_id = this.data.productSourceList[0].source_id
      let type = e.currentTarget.dataset.type
      wx.navigateTo({ url: `../vipbuy/vipbuy?source_id=${source_id}&tencent_type=${type}` })
    },
    _cleaProductSourceList() { //清空产品源信息
      this.data.productSourceList.forEach((item, index, arr) => {
        this.setData({
          [`productSourceList[${index}].source_id`]: 0,
          [`productSourceList[${index}].source_name`]: index == 0 ? '极光VIP' : (index == 1 ? '教育VIP' : (index == 2 ? '少儿VIP' : (index == 3 ? '电竞VIP' : 'VIP')) ),
          [`productSourceList[${index}].valid`]: '立即开通',
        })
      })
    },
    _getProductSourceList() {
      if (!!Object.keys(app.globalData.boundDeviceInfo).length) {
        new Promise((resolve, reject) => {
          if (this.isTencentSourceNQQWechatLogin()) {
            return this.getProductSourceList('wechat')
                      .then(res => this._tackleProductSourceList(res))
                      .then(() => {
                        return this.getProductSourceList('qq')
                      }).then(res => this._tackleProductSourceList(res))
          }else {
            return this.getProductSourceList().then(res => this._tackleProductSourceList(res))
          }
        }).catch(err => {
          wx.showToast({
            title: '获取产品源失败',
            icon: 'none'
          })
          this._cleaProductSourceList()
        })
      }else { //如果没绑定的设备，需要清除信息,
        this._cleaProductSourceList()
      }
    },
    _tackleProductSourceList(src) {
      let list = src.sources
      list.forEach((item, index) => {
        switch (item.source_sign) {
          case 'yinhe':  //影视,默认奇异果VIP
            this._updateProductSourceList(0, item, src.txType)
            break;
          case '6':
            this._updateProductSourceList(0, item, src.txType)
            break;
          case 'supervip':
            this._updateProductSourceList(1, item) //超级教育vip
            break;
          case 'shaoervip':
            this._updateProductSourceList(2, item)  //少儿vip
            break;
          case 'wasu':
            this._updateProductSourceList(3, item)  //电竞vip
            break;
        }
      })
    },
    _updateProductSourceList(index, item, txType) {//更新页面的产品源列表arr
      let valid = '开通权限'
      if(item.valid_type == 1) {//有效期
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
      if (txType == 'wechat') {
        this.setData({
          'tencentAcctInfos[0].valid': valid
        })
      } else if (txType == 'qq') {
        this.setData({
          'tencentAcctInfos[1].valid': valid
        })
        let valid0 = this.data.tencentAcctInfos[0].valid.match(/\d+\.\d+\.\d+\b/)
        valid0 = !!valid0 ? valid0 : ''
        let valid1 = this.data.tencentAcctInfos[1].valid.match(/\d+\.\d+\.\d+\b/)
        valid1 = !!valid1 ? valid1 : ''
        valid = valid0 > valid1 ? this.data.tencentAcctInfos[0].valid : this.data.tencentAcctInfos[1].valid 
      }
    this.setData({
      [`productSourceList[${index}].source_id`]: item.source_id,
      [`productSourceList[${index}].source_name`]: item.source_name,
      [`productSourceList[${index}].valid`]: valid,
    })
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
    //刷新登录状态
    if (!!app.globalData.ccUserInfo) {
      this.setData({ 
        bLoginCoocaa: true,
        'ccUserInfo.name': app.globalData.ccUserInfo.username,
        'ccUserInfo.avatar': app.globalData.ccUserInfo.avatar,
      })
    }else {//清除登录状态
      this.setData({
        bLoginCoocaa: false,
        'ccUserInfo.name': '',
        'ccUserInfo.avatar': '',
      })
    }
    //获取产品源列表
    this._getProductSourceList()
    this._getBoundTVInfo()
    // 获取历史和收藏列表
    this.getHistoryList();
    this.getFavoriteList();
  },
  onHide() {
    console.log('my onHide')
    this.setData({
      bToastAuthTencentQQorWechat: false
    })
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
          _path = '/pages/buyRecord/buyRecord'
          break;
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
        this.setData({
          historyList: []
        })
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
  } 
})






