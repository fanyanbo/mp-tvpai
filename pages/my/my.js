// author: fanyanbo
// email: fanyanbo@coocaa.com
// date: 2019-09-20
// todo: 1.命名优化，2.代码优化 3.适配自定义导航栏

const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
const app = getApp()

Page({
  data: {
    userInfo: {
      nickName: '你好',
      avatarUrl: '../../images/man.png',
      isDevConnected: false,
    },
    bLoginCoocaa: true,//是否登录酷开系统账号
    productSourceList: [ //产品源列表
      { id: 1, title: '极光VIP', valid: '2020.10.25到期', image: '../../images/my/vip/mov.png'},
      { id: 2, title: '教育VIP', valid: '立即开通', image: '../../images/my/vip/edu.png' },
      { id: 3, title: '少儿VIP', valid: '立即开通', image: '../../images/my/vip/kid.png' },
      { id: 4, title: '电竞VIP', valid: '立即开通', image: '../../images/my/vip/game.png' }
    ],
    curTV: { //当前绑定电视
      name: '客厅电视',
      source: '爱奇艺源'
    },
    bAcctMatch: false,//当前绑定电视账户与微信登录账户一致
    unmatch: {
      tips: [
        '当前电视端尚未登陆账号，是否将当前手机账号同步至电视端',
        '当前手机端与电视端会员账号不一致，推送付费内容后电视端可能无法完整播放。',
      ],
      acct: [
        { name: '小茗同学', location: '手机端', image: '../../images/my/vip/mov.png'},
        { name: '用户昵称长长', location: '电视端', image: '../../images/my/vip/kid.png' }
      ],
    },
    historyList:[],//投屏历史
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isShowTips: true,
    bIphoneFullScreenModel: false
  },
  userLogin(e) { //用户登录
    console.log(e)
    wx.navigateTo({ url: '../login/login'})
  },
  goVipPage(e) { //去产品包购买页
    console.log(e)
    wx.navigateTo({ url: '../vipbuy/vipbuy' })
  },
  onLoad: function () {
    console.log('onLoad');
    if (app.globalData.deviceId != null) {
      this.setData({
        isDevConnected: true
      })
    }
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
      isDevConnected: !!app.globalData.deviceId
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
    console.log('canIUse', this.data.canIUse, e)
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
    let _session = wx.getStorageSync("new_cksession")
    let _path = (_type === 'history' && _session != null) ? '../history/history' : '../home/home'
    console.log(_type, _session, _path);
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






