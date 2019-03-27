const utils = require('../../utils/util_fyb');
const api = require('../../api/api_fyb');
const api_nj = require('../../api/api_nj');
const app = getApp();

Page({
  data: {
    isShowTips: false,
    errIconUrl: '../../images/close_icon.png',
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
    hotKeywordsList: [],
    historyWordsList: ['小猪佩奇', '奇葩说'], // 后台接口关联账户信息，所以先做本地缓存处理
    resultTitleList: ['影片', '文章'],
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
    this.setData({
      historyWordsList: []
    });
    wx.setStorageSync('history_keywords', []);
  },
  handleTabClick: function (e) {
    const val = e.currentTarget.dataset['index'];
    console.log('搜索结果页 handleTabClick val =' + val);
    this.setData({
      activeIndex: val
    })
  },
  // 推送电视剧，先判断是否绑定设备，再判断电视是否在线，注意先后顺序
  handleEpisodeTap: function (e) {
    console.log('推送剧集', e);
    if (app.globalData.deviceId == null) {
      return wx.navigateTo({
        url: "../home/home"
      });
    }
    new Promise(function (resolve, reject) {
        let dataOnline = {
          activeid: app.globalData.activeId //获取最新绑定设备激活ID
        }
        api_nj.isTVOnline({
          data: dataOnline,
          success(res) {
            console.log("isTVOnline success res:" + JSON.stringify(res))
            if (res.status === "online") { //TV在线
              resolve();
            } else {
              reject(res);
            }
          },
          fail(res) {
            console.log("isTVOnline fail:" + res)
            reject(res)
          }
        });
      })
      .then( () => {
        wx.showLoading({
          title: '推送中...'
        })
        this.setData({
          curIndex: e.currentTarget.dataset.keyword.segment_index,
          curThirdId: e.currentTarget.dataset.keyword.video_third_id
        })
        let third_album_id = e.currentTarget.dataset.keyword.third_album_id;
        let segment_index = e.currentTarget.dataset.keyword.segment_index; //需不需要减1？
        let tvId = JSON.parse(e.currentTarget.dataset.keyword.video_url).tvId; //添加推送历史使用，不明白为什么有这些命名？
        let video_title = e.currentTarget.dataset.keyword.video_title;
        let coocaa_m_id = e.currentTarget.dataset.keyword.coocaa_m_id;
        console.log(app.globalData.deviceId, third_album_id, tvId, video_title, coocaa_m_id);
        this.pushEpisode(app.globalData.deviceId, third_album_id, segment_index, tvId, video_title, coocaa_m_id);
      })
      .catch( res => {
        console.log('catch...', res)
        utils.showFailedToast('电视不在线', this.data.errIconUrl);
      })
  },
  // 推送电影
  handleMovieTap: function (e) {
    console.log('推送电影', e);
    if (app.globalData.deviceId == null) {
      return wx.navigateTo({
        url: "../home/home"
      });
    }
    new Promise(function (resolve, reject) {
        let dataOnline = {
          activeid: app.globalData.activeId //获取最新绑定设备激活ID
        }
        api_nj.isTVOnline({
          data: dataOnline,
          success(res) {
            console.log("isTVOnline success res:" + JSON.stringify(res))
            if (res.status === "online") { //TV在线
              resolve();
            } else {
              reject(res);
            }
          },
          fail(res) {
            console.log("isTVOnline fail:" + res)
            reject(res)
          }
        });
      })
      .then( () => {
        wx.showLoading({
          title: '推送中...'
        })
        let third_album_id = e.currentTarget.dataset.keyword.video_detail.third_album_id;
        let video_title = e.currentTarget.dataset.keyword.video_title;
        let coocaa_m_id = e.currentTarget.dataset.keyword.video_detail.play_source.coocaa_m_id;
        let tvId = JSON.parse(e.currentTarget.dataset.keyword.video_detail.play_source.video_url).tvId;
        console.log(app.globalData.deviceId, third_album_id, video_title, coocaa_m_id, tvId);
        this.pushMovie(app.globalData.deviceId, third_album_id, video_title, tvId, coocaa_m_id);
      })
      .catch( res => {
        console.log('catch...', res)
        utils.showFailedToast('电视不在线', this.data.errIconUrl);
      })
  },
  handleMoreTap: function (e) {
    console.log('handleMoreTap', e);
    this.setData({
      curPageIndex: this.data.curPageIndex + 1
    })
    this.searchByKeyword(1, this.data.inputValue, this.data.curPageIndex);
  },
  // 页面onLoad生命周期事件
  onLoad() {
    console.log('search onLoad监听页面加载');
    let cacheKeywords = wx.getStorageSync('history_keywords');
    console.log(cacheKeywords);
    this.setData({
      historyWordsList: cacheKeywords ? cacheKeywords : []
    });
    this.getHotKeyword();
    console.log('搜索页当前已绑定设备', app.globalData.deviceId);

    //为了解决奇葩bug，设置一个延时效果会好一点，处理搜索框文字重影的问题
    let that = this;
    setTimeout(function () {
      that.setData({
        inputPlaceholder: {
          "keyword": "搜索视频、影评或话题"
        },
      });
    }, 500);
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
    console.log('searchByKeyword videoType:' + videoType + ',keyword:' + keyword + ',pageIndex:' + pageIndex)
    let params = {
      "video_type": videoType,
      "keyword": keyword,
      "page_index": pageIndex
    };
    let desParams = utils.paramsAssemble_tvpai(params);
    console.log(desParams);
    utils.showLoadingToast('搜索中...')
    utils.requestP(api.searchByKeywordUrl, desParams).then(res => {
      console.log('searchByKeyword success', res.data)
      utils.showLoadingToast('',false)
      if (res && res.data && res.data.data && res.data.code === 0) {
        // 加载'更多'数据进行组装
        let tmpData = this.data.searchResultList.concat(res.data.data);
        console.log(tmpData)
        this.setData({
          searchResultList: tmpData,
          hasMore: res.data.has_more
        })
      } else {
        console.log('searchByKeyword failed')
        let errMsg = res.data.msg + "[" + res.data.code + "]";
        utils.showFailedToast(errMsg, this.data.errIconUrl)
      }
      this.setData({
        isShowNoResult: true
      })
    }).catch(res => {
      console.log('searchByKeyword error', res)
      utils.showFailedToast('获取失败', this.data.errIconUrl)
    })
  },

  // 获取热门搜索关键词
  getHotKeyword: function () {
    utils.requestP(api.getHotKeywordUrl, utils.paramsAssemble_tvpai()).then(res => {
      console.log('getHotKeyword success', res.data)
      if (res.data && res.data.data) {
        this.setData({
          hotKeywordsList: res.data.data
        })
      } else {
        console.log('getHotKeyword failed')
        let errMsg = res.data.msg + "[" + res.data.code + "]";
        utils.showFailedToast(errMsg, this.data.errIconUrl)
      }
    }).catch(res => {
      console.log('getHotKeyword error', res)
    })
  },

  // 获取搜索历史关键词
  getHistoryKeyword: function () {
    utils.requestP(api.getHistoryKeywordUrl, utils.paramsAssemble_tvpai()).then(res => {
      console.log('getHistoryKeyword success', res.data)
    }).catch(res => {
      console.log('getHistoryKeyword error', res)
    })
  },

  // 获取已绑定的设备信息
  getBindedDevice: function () {
    let params = {
      ccsession: wx.getStorageSync('cksession')
    };
    let desParams = utils.paramsAssemble_wx(params);
    console.log('getBindDeviceList params', desParams);
    utils.requestP(api.getBindDeviceListUrl, desParams).then(res => {
      console.log('getBindDeviceList success', res.data);
      if (res.data.data) {
        for (let i = 0; i < res.data.data.length; i++) {
          if (res.data.data[i].bindStatus === 1) {
            console.log('当前绑定的设备id', res.data.data[i].deviceId);
            break;
          }
        }
      }
    }).catch(res => {
      console.log('getBindDeviceList error', res)
    })
  },

  // 推送电视剧
  pushEpisode: function (deviceId, movieId, movieChildId, tvId, title, coocaa_m_id) {
    let params = {
      ccsession: wx.getStorageSync('cksession'),
      deviceId: deviceId,
      movieId: movieId,
      moviechildId: movieChildId + '',
      coocaamid: coocaa_m_id
    };
    let desParams = utils.paramsAssemble_wx(params);
    console.log('pushEpisode params', desParams);
    utils.requestP(api.pushMediaUrl, desParams).then(res => {
      console.log('pushEpisode success', res.data);
      if (res.data.code === 200) {
        this.addPushHistory(movieId, title, tvId);
        utils.showSuccessToast('推送成功')
      } else {
        console.log('pushEpisode failed');
        let errMsg = res.data.message + "[" + res.data.code + "]";
        utils.showFailedToast(errMsg, this.data.errIconUrl);
      }
    }).catch(res => {
      console.log('pushEpisode catch:', res);
      utils.showFailedToast('推送失败', this.data.errIconUrl);
    })
  },

  // 推送电影
  pushMovie: function (deviceId, movieId, title, tvId, coocaa_m_id) {
    let params = {
      ccsession: wx.getStorageSync('cksession'),
      deviceId: deviceId,
      movieId: movieId, 
      coocaamid: coocaa_m_id
    };
    let desParams = utils.paramsAssemble_wx(params);
    console.log('pushMovie params', desParams);
    utils.requestP(api.pushMediaUrl, desParams).then(res => {
      console.log('pushMovie success', res.data);
      if (res.data && res.data.code === 200) {
        utils.showSuccessToast('推送成功')
        this.addPushHistory(movieId, title, tvId)
      } else {
        console.log('pushMovie failed');
        let errMsg = res.data.message + (res.data.code == null ? "" : "[" + res.data.code + "]");
        utils.showFailedToast(errMsg, this.data.errIconUrl)
      }
    }).catch(res => {
      console.log('pushMovie catch', res);
      utils.showFailedToast('推送失败', this.data.errIconUrl)
    })
  },

  // 添加推送历史
  addPushHistory: function (album_id, title, tvid) {
    let urlParams = { "vuid": wx.getStorageSync("wxopenid") };
    let url = utils.urlAssemble_tvpai(api.addPushHistoryUrl, utils.paramsAssemble_tvpai(urlParams));
    console.log("addPushHistory", url);
    let data = {
      album_id: album_id,
      title: title,
      video_id: tvid,
      video_type: "1"
    }
    utils.requestP(url, data, 'POST', 'application/json; charset=utf-8').then( res => {
      console.log('addPushHistory success', res);
    }).catch( res => {
      console.log('addPushHistory error', res);
    })
  },

  // 处理搜索历史排列顺序逻辑
  getCacheHistoryKeywords: function (keyword) {
    let cacheKeywords = this.data.historyWordsList;
    let index = cacheKeywords.indexOf(keyword)
    if (index > -1) {
      cacheKeywords.splice(index, 1);
      cacheKeywords.unshift(keyword);
    } else {
      cacheKeywords.unshift(keyword);
    }
    if (cacheKeywords.length > 10) {
      cacheKeywords = cacheKeywords.slice(0, 10);
    }
    return cacheKeywords;
  }
  // 结束
});