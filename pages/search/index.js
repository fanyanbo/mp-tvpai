const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
const app = getApp()

Page({
  data: {
    isShowTips: false,
    bIphoneFullScreenModel: false,
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
    articlesResultList: [],
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
  handleGobackClick() {
    utils.navigateBack()
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
    if(!this.data.inputValue) return;
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
    const val = e.currentTarget.dataset.index;
    console.log('搜索结果页 handleTabClick val =' + val);
    this.setData({
      activeIndex: val
    })
  },
  handleArticleClick: function (e) {
    console.log('handleArticleClick')
    wx.navigateTo({
      url: `../cinecism/cinecism?id=${e.currentTarget.dataset.id}`
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
    utils.showLoadingToast('推送中...') 
    let {segment_index, video_third_id, third_album_id, video_url, video_title, coocaa_m_id} = e.currentTarget.dataset.keyword;
    let video_id = utils.isJson(video_url) ? JSON.parse(video_url).vid : ""; //添加推送历史使用，不明白为什么有这些命名？
    this.setData({
      curIndex: segment_index,
      curThirdId: video_third_id
    })  
    segment_index = e.currentTarget.dataset.index; // 更换了一种方式，直接用索引值，忘记更改原因了
    console.log(app.globalData.deviceId, third_album_id, segment_index, video_id, video_title, coocaa_m_id);
    this.pushEpisode(app.globalData.deviceId, third_album_id, segment_index, video_id, video_title, coocaa_m_id);
  },
  // 推送电影
  handleMovieTap: function (e) {
    console.log('推送电影', e);
    if (app.globalData.deviceId == null) {
      return wx.navigateTo({
        url: "../home/home"
      });
    }
    utils.showLoadingToast('推送中...')
    let {video_title, video_detail} = e.currentTarget.dataset.keyword;
    let third_album_id = video_detail.third_album_id;
    let coocaa_m_id = (video_detail.play_source && video_detail.play_source.coocaa_m_id) ? video_detail.play_source.coocaa_m_id : "";
    let video_url = video_detail.play_source.video_url;
    let video_id = utils.isJson(video_url) ? JSON.parse(video_url).vid : "";
    console.log(app.globalData.deviceId, third_album_id, video_title, coocaa_m_id, video_id);
    this.pushMovie(app.globalData.deviceId, third_album_id, video_title, video_id, coocaa_m_id);
  },
  handleMoreTap: function (e) {
    console.log('handleMoreTap pageIndex', this.data.curPageIndex);
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
    const {
      pxNavBarHeight,
      rpxNavBarHeight
    } = utils.getNavBarHeight();
    console.log(pxNavBarHeight, rpxNavBarHeight)
    let rpxSearchBoxHeigth = 104
    let resultTitleStyle = `top:${rpxNavBarHeight + rpxSearchBoxHeigth}rpx`
    let searchInputStyle = resultTitleStyle
    let searchBoxStyle = `top: ${rpxNavBarHeight}rpx`
    console.log(resultTitleStyle, searchInputStyle, searchBoxStyle)
    this.setData({
      resultTitleStyle,
      searchInputStyle,
      searchBoxStyle
    });
  },
  onShow() {
    console.log('search onShow监听页面显示');
    let that = this;
    this.setData({
      bIphoneFullScreenModel: app.globalData.bIphoneFullScreenModel
    });
    wx.getSystemInfo({
      success: (res) => {
        console.log(res);
        let screenHeight = that.getContentHeight({ platform: res.platform, model: res.model })
        if(screenHeight === 0)
          screenHeight = res.screenHeight;
        console.log(screenHeight);
        // 状态栏高度和屏幕宽度，单位都是px
        // let scale = res.windowWidth / 375;
        this.setData({
          paddingTop: res.statusBarHeight,
          scrollHeight: screenHeight - 92,
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
      console.log('搜索视频成功', res.data)
      utils.showLoadingToast('',false)
      if (res && res.data && res.data.data && res.data.code === 0) {
        // 加载'更多'数据进行组装
        let tmpData = this.data.searchResultList.concat(res.data.data);
        console.log(tmpData)
        this.setData({
          searchResultList: tmpData,
          hasMore: res.data.has_more
        })
        if(res.data.has_more === 1) {
          this.data.curPageIndex += 1;
        }
      } else {
        console.log('搜索视频失败')
        let errMsg = res.data.msg + "[" + res.data.code + "]"
        utils.showFailedToast(errMsg, this.data.errIconUrl)
        this.setData({
          isShowNoResult: true
        })
      }
    }).catch(res => {
      console.log('搜索视频发生错误', res)
      utils.showLoadingToast('',false)
      this.setData({
        isShowNoResult: true
      })
    })

    keyword = '好'
    utils.requestP(api.searchArticlesUrl, utils.paramsAssemble_wx({"keyword": keyword})).then(res => {
      console.log('搜索文章成功', res.data)
      if (res && res.data && res.data.code === 200) {
        this.setData({articlesResultList: res.data.data})
      } else {
        console.log('搜索文章失败')
        this.setData({
          isShowNoResult: true
        })
      }
    }).catch(res => {
      console.log('搜索文章发生错误', res)
      this.setData({
        isShowNoResult: true
      })
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
      ccsession: wx.getStorageSync('new_cksession')
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
  pushEpisode: function (deviceId, movieId, movieChildId, vId, title, coocaa_m_id) {
    let params = {
      ccsession: wx.getStorageSync('new_cksession'),
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
        this.addPushHistory(movieId, title, vId);
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
  pushMovie: function (deviceId, movieId, title, vId, coocaa_m_id) {
    let params = {
      ccsession: wx.getStorageSync('new_cksession'),
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
        this.addPushHistory(movieId, title, vId)
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
  addPushHistory: function (album_id, title, vid) {
    let urlParams = { "vuid": wx.getStorageSync("wxopenid") };
    let url = utils.urlAssemble_tvpai(api.addPushHistoryUrl, utils.paramsAssemble_tvpai(urlParams));
    console.log("addPushHistory", url);
    let data = {
      album_id: album_id,
      title: title,
      video_id: vid,
      video_type: "1"
    }
    utils.requestP(url, data, 'POST', 'application/json; charset=utf-8').then( res => {
      console.log('addPushHistory success', res);
    }).catch( res => {
      console.log('addPushHistory error', res);
    })
  },

  // 处理搜索历史关键词长度过长，排列顺序等逻辑
  getCacheHistoryKeywords: function (keyword) {
    keyword = this.getCutStr(keyword, 40)
    console.log(keyword)
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
  },

  // 处理字符串长度（兼容中文字符）
  getCutStr: function(str, cutLen) {
    let realLength = 0, len = str.length, charCode = -1;  
    let str_cut = '';
    for (let i = 0; i < len; i++) {  
        // charCode = str.charCodeAt(i);  
        charCode = str.charAt(i);  
        if (escape(charCode).length > 4) {
          realLength += 2;  
        } else {
          realLength += 1;  
        }
        str_cut = str_cut.concat(charCode);
        if (realLength > cutLen) {
          str_cut = str_cut.concat('...')
          return str_cut;
        }
    }  
    if (realLength <= cutLen)
      return str;
  },

  //根据不同设备和型号获取不同内容高度
  getContentHeight: function ({ platform, model }) {
    if(platform.match(/ios/i)) {
      if(model.match(/iPhone8/i)){
        return 600;
      }else if(model.match(/iPhone10/i)) {
        return 630
      }else if(model.match(/iPhone11/i)) {
        return 700;
      }else{
        return 650;
      }
    } else {
      return 0;
    }
  }
  // 结束
});