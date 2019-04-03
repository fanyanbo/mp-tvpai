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
    // this.getMovieHistoryList();
  },

  onShow: function () {
    console.log('onShow');
    this.getMovieHistoryList();
    this.getLikeList();
  },
  clearStorage:function(){
    wx.setStorageSync('new_cksession', "");
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
  handleJumpPage: function (e) {
    console.log(e.currentTarget.dataset.type);
    if (e.currentTarget.dataset.type === 'home') {
      wx.navigateTo({
        url: '../home/home',
      })
    } else if (e.currentTarget.dataset.type === 'history') {
      let ccsession = wx.getStorageSync("new_cksession")
      if (ccsession == null || ccsession === '') {
        wx.navigateTo({
          url: '../home/home',
        })
      } else {
        wx.navigateTo({
          url: '../history/history',
        })
      }
    }
  },

  // 获取推送历史列表
  getMovieHistoryList: function () {
    let vuid = wx.getStorageSync('wxopenid');
    console.log('vuid:',vuid);
    if (vuid == null || vuid === '') return;
    let srcParams = {"vuid": vuid };
    let desParams = utils_fyb.paramsAssemble_tvpai(srcParams);
  //  console.log(desParams);
    utils_fyb.requestP(api_fyb.getHistoryListUrl, desParams).then(res => {
      console.log("getMovieHistoryList success", res);
      if (res.data.data) {
        let withinList = res.data.data.movies_within_serven_days
        let overList = res.data.data.movies_over_serven_days
        let historyList = withinList.concat(overList);
          this.setData({
            historyList: historyList
          })

      }
    }).catch(res => {
      console.log("getMovieHistoryList error", res);
    })
  },

  // 获取推送历史列表
  getLikeList: function () {
    let vuid = wx.getStorageSync('wxopenid');
    console.log('vuid:',vuid);
    if (vuid == null || vuid === '') return;
    let srcParams = { "vuid": vuid,"video_type":1};
    let desParams = utils_fyb.paramsAssemble_tvpai(srcParams);
    console.log(desParams);
    utils_fyb.requestP(api_fyb.getCollectedListUrl, desParams).then(res => {
      console.log("我的喜欢 success", res);
      if (res.data.data) {
          this.setData({
            likeList: res.data.data
          })

      }
    }).catch(res => {
      console.log("getLikeList error", res);
    })
  },




})






