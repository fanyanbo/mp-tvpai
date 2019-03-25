const utils_fyb = require('../../utils/util_fyb');
const api_fyb = require('../../api/api_fyb');

Page({
  data: {
    userInfo: {
      nickName: '你好',
      avatarUrl: '../../images/man.png'
    },
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad: function () {
    console.log('onLoad');
    this.getMovieHistoryList();
  },

  onShow: function () {
    console.log('onShow');
    this.getMovieHistoryList();
  },

  // 设备绑定入口暂未使用，但推送历史需要使用
  bindGetUserInfo(e) {
    console.log('canIUse', this.data.canIUse, e)
    if (!e.detail.userInfo) {
      // 用户拒绝直接返回授权框
      return;
    }
    let that = this;
    let ccsession = wx.getStorageSync("cksession");
    console.log('bindGetUserInfo ccsession', ccsession);
    if (ccsession == null || ccsession === '') {
      wx.login({
        success: function (res) {
          console.log('code', res);
          utils_fyb.getSessionByCode(res.code, function (res) {
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
  jumpHomePage: function () {
    wx.navigateTo({
      url: '../home/home',
    })
  },


  getMovieHistoryList: function () {
    let that = this;
    let vuid = wx.getStorageSync('wxopenid');
    console.log('vuid:',vuid);
    if (vuid == null || vuid === '') return;
    let srcParams = {"vuid": vuid };
    let desParams = utils_fyb.paramsAssemble_tvpai(srcParams);
    console.log(desParams);
    utils_fyb.request(api_fyb.getHistoryListUrl, 'GET', desParams, 
      function (res) {
        console.log("getMovieHistoryList success", res);
        if (res.data.data) {
          let withinList = res.data.data.movies_within_serven_days
          let overList = res.data.data.movies_over_serven_days
          if (withinList.length == 0) {
            that.setData({
              historyList: overList
            })
          } else {
            that.setData({
              historyList: withinList
            })
          }
        }
      },
      function (res) {
        console.log("getMovieHistoryList error", res);
      }
    )
  },
})






