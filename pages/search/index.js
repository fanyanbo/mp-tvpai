const utils = require('../../utils/util_fyb');
const api = require('../../api/api_fyb');
const app = getApp();

Page({
  data: {
    isShowTips: false,
    // inputPlaceholder: '搜索视频、影评或话题',
    inputPlaceholder: {},
    curIndex: 0, //当前剧集
    curThirdId: '',
    curThirdAlbumId: '', 
    curPageIndex: 0, //当前页索引，查看更多
    paddingTop: 0,
    scrollHeight: 0,
    isFocus: false, //搜索内容输入框焦点
    inputValue: '', //输入框内容
    isShowResult: false,
    isShowNoResult: false, //是否显示无搜索结果图片
    currentContent: 'search-result-content',
    // currentContent: 'search-input-content',
    hotKeywordsList: [],
    historyWordsList: ['小猪佩奇', '奇葩说'], // 后台接口关联账户信息，所以先做本地缓存处理
    resultTitleList: ['影片','文章'],
    activeIndex: 0,
    searchResultList: [],
    hasMore: 0, //1表示有下一页，2表示无下一页
    isLike: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  upper: function (event) {
    console.log('trigger upper');
  },
  lower: function (event) {
    console.log('trigger lower');
  },
  handleMainTap() {
    console.log('搜索输入页 handleMainTap');
    // this.selectComponent('#remotecontrol-id').hideRemoteControl()
  },
  handleDeteteTap() {
    console.log('搜索输入页 handleDeteteTap');
    this.setData({
      inputValue: '',
      isFocus: true,
      isShowResult: false
    })
  },
  // 点击收藏
  handleLikeTap(e) {
    console.log('handleLikeTap', e);
    this.setData({
      isLike: !this.data.isLike,
      curThirdAlbumId: e.currentTarget.dataset.keyword.third_album_id
    });
  },
  // 点击跳转详情页
  handleJumpTap(e) {
    console.log('handleJumpTap', e);
    let third_album_id = e.currentTarget.dataset.item.video_detail.third_album_id;
    console.log("../movieDetail/movieDetail?id=" + third_album_id);
    wx.navigateTo({
      url: "../movieDetail/movieDetail?id=" + third_album_id
    });
  },
  // 输入框内容有变化时触发
  inputBind(e) {
    console.log('搜索输入页 inputBind = ' + e.detail.value);
    this.setData({
      inputValue: e.detail.value
    })
  },
  // 点击关键词进行搜索
  onKeywordTap: function (event) {
    console.log('选择关键字：', event.target.dataset.keyword);
    let cacheKeywords = this.getCacheHistoryKeywords(event.target.dataset.keyword);
    this.setData({
      inputValue: event.target.dataset.keyword,
      isShowResult: true,
      isShowNoResult: false,
      searchResultList: [],
      historyWordsList: cacheKeywords
    })
    this.searchByKeyword(1, event.target.dataset.keyword)
  },
  // 输入法回车搜索
  query: function () {
    console.log('query')
    // 将搜索关键字缓存,去重
    let cacheKeywords = this.getCacheHistoryKeywords(this.data.inputValue);
    this.setData({
      searchResultList: [],
      isShowResult: true,
      isShowNoResult: false,
      historyWordsList: cacheKeywords
    })
    this.searchByKeyword(1, this.data.inputValue)
  },
  handleClearTap() {
    console.log('搜索输入页 handleClearTap');
    this.setData({historyWordsList: []});
    wx.setStorageSync('history_keywords', []);
  },
  handleTabClick: function (e) {
    const val = e.currentTarget.dataset['index'];
    console.log('搜索结果页 handleTabClick val =' + val);
    this.setData({
      activeIndex: val
    })
  },
  // 处理推送电视剧
  handleEpisodeTap: function (e) {
    console.log('推送剧集', e);
    this.setData({
      curIndex: e.currentTarget.dataset.keyword.segment_index,
      curThirdId: e.currentTarget.dataset.keyword.video_third_id
    });
    let third_album_id = e.currentTarget.dataset.keyword.third_album_id; 
    let segment_index = e.currentTarget.dataset.keyword.segment_index - 1;
    let tvId = JSON.parse(e.currentTarget.dataset.keyword.video_url).tvId;//添加推送历史使用，不明白为什么有这些命名？
    let video_title = e.currentTarget.dataset.keyword.video_title;
    console.log(app.globalData.deviceId, third_album_id, tvId, video_title);
    if (app.globalData.deviceId != null) {
      this.pushEpisode(app.globalData.deviceId, third_album_id, segment_index, tvId, video_title);
    } else {
      wx.navigateTo({url: "../home/home"});
    }
  },
  // 处理推送电影
  handleMovieTap: function (e) {
    console.log('推送电影', e);
    let third_album_id = e.currentTarget.dataset.keyword.video_detail.third_album_id;
    console.log(app.globalData.deviceId, third_album_id);
    if (app.globalData.deviceId != null) {
      this.pushMovie(app.globalData.deviceId, third_album_id);
    } else {
      wx.navigateTo({url: "../home/home"});
    }
  },
  handleMoreTap: function (e) {
    console.log('handleMoreTap', e);
    this.setData({ curPageIndex: this.data.curPageIndex + 1 })
    this.searchByKeyword(1, this.data.inputValue, this.data.curPageIndex);
  },
  // 页面onLoad生命周期事件
  onLoad() {
    console.log('search onLoad监听页面加载');
    let cacheKeywords = wx.getStorageSync('history_keywords');
    console.log(cacheKeywords);
    this.setData({ historyWordsList: cacheKeywords ? cacheKeywords : [] });
    this.getHotKeyword();
    console.log('搜索页当前已绑定设备', app.globalData.deviceId);

    //为了解决奇葩bug，解决搜索框文字重影的问题
    let that = this;
    setTimeout(function() {
      that.setData({
        inputPlaceholder: {"keyword": "搜索视频、影评或话题"},
      });
    }, 600);
  },
  onReady() {
    console.log('search onReady监听页面初次渲染完成');
  },
  onShow() {
    console.log('search onShow监听页面显示');
    wx.getSystemInfo({
      success: (res) => {
        // 屏幕宽度和高度
        console.log(res.screenWidth, res.screenHeight);
        // 状态栏高度和屏幕宽度，单位都是px
        console.log(res.statusBarHeight, res.windowWidth);
        let scale = res.windowWidth / 375;
        this.setData({
          paddingTop: res.statusBarHeight,
          scrollHeight: res.screenHeight - 92,
        })
      }
    })
  },
  onHide() {
    console.log('search onHide监听页面隐藏');
  },
  onUnload() {
    wx.setStorageSync('history_keywords', this.data.historyWordsList);
    console.log('search onUnload监听页面卸载');
  },

  // 根据关键词搜索内容
  searchByKeyword: function (videoType, keyword, pageIndex = 0) {
    let that = this;
    console.log('searchByKeyword videoType:' + videoType + ',keyword:' + keyword + ',pageIndex:' + pageIndex)
    wx.showLoading({ title: '加载中...' })
    let params = {
      "video_type": videoType,
      "keyword": keyword,
      "page_index": pageIndex
    };
    let desParams = utils.paramsAssemble_tvpai(params);
    console.log(desParams);
    utils.request(api.searchByKeywordUrl, 'GET', desParams,
      function (res) {
        console.log('success', res.data)
        wx.hideLoading()
        if (res && res.data && res.data.data && res.data.data.length != 0) {
          // 加载'更多'数据进行组装
          let tmpData = that.data.searchResultList.concat(res.data.data);
          console.log(tmpData)
          that.setData({
            searchResultList: tmpData,
            hasMore: res.data.has_more
          })
        } else {
          console.log('服务器开小差')
          let errMsg = res.data.msg + "[" + res.data.code + "]";
          wx.showToast({
            title: errMsg,
            icon: 'none',
            duration: 2000
          })
        }
      },
      function (res) {
        console.log('error', res)
      },
      function (res) {
        console.log('complete', res)
        that.setData({isShowNoResult: true})
      })
  },

  // 获取热门搜索关键词
  getHotKeyword: function () {
    let that = this;
    utils.request(api.getHotKeywordUrl, 'GET', utils.paramsAssemble_tvpai(),
      function (res) {
        console.log('getHotKeyword success', res.data)
        if (res.data && res.data.data) {
          that.setData({
            hotKeywordsList: res.data.data
          })
        } else {
          console.log('服务器开小差')
          let errMsg = res.data.msg + "[" + res.data.code + "]";
          wx.showToast({
            title: errMsg,
            icon: 'none',
            duration: 2000
          })
        }
      },
      function (res) {
        console.log('getHotKeyword error', res)
      },
      function (res) {
        console.log('getHotKeyword complete')
      })
  },

  // 获取搜索历史关键词
  getHistoryKeyword: function () {
    utils.request(api.getHistoryKeywordUrl, 'GET', utils.paramsAssemble_tvpai(),
      function (res) {
        console.log('getHistoryKeyword success', res.data)
      },
      function (res) {
        console.log('getHistoryKeyword error', res)
      },
      function (res) {
        console.log('getHistoryKeyword complete')
      })
  },

  // 获取已绑定的设备信息
  getBindedDevice: function () {
    let that = this;
    let params = { ccsession: wx.getStorageSync('cksession') };
    let desParams = utils.paramsAssemble_wx(params);
    console.log('getBindDeviceList params', desParams);
    utils.request(api.getBindDeviceListUrl, 'GET', desParams,
      function (res) {
        console.log('getBindDeviceList success', res.data);
        if (res.data.data) {
          for (let i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].bindStatus === 1) {
              console.log('当前绑定的设备id', res.data.data[i].deviceId);
              break;
            }
          }
        }
      },
      function (res) {
        console.log('getBindDeviceList error', res)
      },
      function (res) {
        console.log('getBindDeviceList complete')
      })
  },

  // 当设备id为空无法推送时处理获取设备id的流程，判断授权后跳转至设备绑定页面
  handleDeviceBindFlow: function () {
    let ccsession = wx.getStorageSync('cksession');
    if (ccsession == null || ccsession === '') {

    }
  },

  // 推送时判断获取用户信息是否授权的流程，暂未使用
  bindGetUserInfo(e) {
    console.log('canIUse', this.data.canIUse, e)
    let ccsession = wx.getStorageSync("cksession");
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
              wx.navigateTo({url: '../home/home'});
            }
          }, function (res) {
            console.log('error', res)
          });
        }
      });
    } else {
      if (e.currentTarget.dataset.type === 'episode' || e.currentTarget.dataset.type === 'other') {
        this.setData({
          curIndex: e.currentTarget.dataset.keyword.segment_index,
          curThirdId: e.currentTarget.dataset.keyword.video_third_id
        });
        let third_album_id = e.currentTarget.dataset.keyword.third_album_id;
        let segment_index = e.currentTarget.dataset.keyword.segment_index - 1;
        console.log(app.globalData.deviceId, third_album_id);
        if (app.globalData.deviceId != null) {
          this.pushEpisode(app.globalData.deviceId, third_album_id, segment_index); // 参数不全
        } else {
          wx.navigateTo({url: "../home/home"});
        }
      } else if (e.currentTarget.dataset.type === 'movie') {
        let third_album_id = e.currentTarget.dataset.keyword.video_detail.third_album_id;
        console.log(app.globalData.deviceId, third_album_id);
        if (app.globalData.deviceId != null) {
          this.pushMovie(app.globalData.deviceId, third_album_id);
        } else {
          wx.navigateTo({url: "../home/home"});
        }
      } else {
        wx.navigateTo({url: "../home/home"});
      }
    }
  },

  // 推送电视剧
  pushEpisode: function (deviceId, movieId, movieChildId, tvId, title) {
    let that = this;
    let params = {
      ccsession: wx.getStorageSync('cksession'),
      deviceId: deviceId,
      movieId: movieId,
      moviechildId: movieChildId + ''
    };
    let desParams = utils.paramsAssemble_wx(params);
    console.log('pushEpisode params', desParams);
    utils.request(api.pushMediaUrl, 'GET', desParams,
      function (res) {
        console.log('pushEpisode success', res.data);
        if (res.data.code === 200) {
          that.addPushHistory(movieId, tvId, title);
          wx.showToast({
            title: '推送成功',
            icon: 'success',
            duration: 2000
          });
        } else {
          console.log('推送剧集失败');
          let errMsg = res.data.message + "[" + res.data.code + "]";
          wx.showToast({
            title: errMsg,
            icon: 'none',
            duration: 2000
          });
        }
      },
      function (res) {
        console.log('pushEpisode error', res)
      },
      function (res) {
        console.log('pushEpisode complete')
      })
  },

  // 推送电影
  pushMovie: function (deviceId, movieId) {
    let params = {
      ccsession: wx.getStorageSync('cksession'),
      deviceId: deviceId,
      movieId: movieId
    };
    let desParams = utils.paramsAssemble_wx(params);
    console.log('pushMovie params', desParams);
    utils.request(api.pushMediaUrl, 'GET', desParams,
      function (res) {
        console.log('pushMovie success', res.data);
        if (res.data && res.data.code === 200) {
          wx.showToast({
            title: '推送成功',
            icon: 'success',
            duration: 2000
          });
        } else {
          console.log('推送电影失败');
          let errMsg = res.data.message + "[" + res.data.code + "]";
          wx.showToast({
            title: errMsg,
            icon: 'none',
            duration: 2000
          });
        }
      },
      function (res) {
        console.log('pushMovie error', res)
      },
      function (res) {
        console.log('pushMovie complete')
      })
  },

  // 收藏或取消影片
  collect: function () {

  },

  // 获取收藏影片列表
  getCollectedList: function() {
    let params = {
      page_index: 0,
      page_size: 10,
      video_type: 1
    }
    let desParams = utils.paramsAssemble_tvpai(params);
    console.log(desParams);
    utils.request(api.getCollectedListUrl, 'GET', desParams,
      function (res) {
        console.log('getCollectedList success', res.data)
      },
      function (res) {
        console.log('getCollectedList error', res)
      }
    )
  },

  // 添加推送历史
  addPushHistory: function(album_id, title, tvid) {
    let vuid = wx.getStorageSync("wxopenid");
    console.log('addPushHistory vuid', vuid);
    let srcParams = { "vuid": vuid };
    let desParams = utils.paramsAssemble_tvpai(srcParams);
    console.log(desParams);
    let url = utils.urlAssemble_tvpai(api.addPushHistoryUrl, desParams);
    console.log(url);
    wx.request({
      url: url,
      method: "POST",
      data: {
        album_id: album_id,
        title: title,
        video_id: tvid,
        video_type: "1",
      },
      header: {
        "Content-Type": "application/json; charset=utf-8"
      },
      success: function (res) {
        console.log('addPushHistory success', res);
      },
      error: function (res) {
        console.log('addPushHistory error', res);
      }
    });
  },

  // 获取微信用户信息，需要用户授权
  getUserInfo: function () {
    wx.getUserInfo({
      success(res) {
        console.log('getUserInfo success', res);
      },
      fail(err) {
        console.log('getUserInfo err', err);
      }
    })
  },

  // 获取系统信息
  getSystemInfo: function () {
    wx.getSystemInfo({
      success(res) {
        console.log('getDevInfo success', res);
      },
      fail(err) {
        console.log('getDevInfo err', err);
      }
    })
  },

  // 处理搜索历史排列顺序逻辑
  getCacheHistoryKeywords: function(keyword) {
    let cacheKeywords = this.data.historyWordsList;
    let index = cacheKeywords.indexOf(keyword)
    if(index > -1) {
      cacheKeywords.splice(index, 1);
      cacheKeywords.unshift(keyword);
    } else {
      cacheKeywords.unshift(keyword);
    }
    if(cacheKeywords.length > 10) {
      cacheKeywords = cacheKeywords.slice(0,10);
    }
    return cacheKeywords; 
  }
  // 结束
});
