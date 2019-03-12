const utils = require('../../utils/util_fyb');
const api = require('../../utils/api_tvpai')

Page({
  data: {
    isShowTips: false,
    inputPlaceholder: '搜索视频、影评或话题',
    curIndex: 0, //当前剧集
    curThirdId: '',
    curThirdAlbumId: '',
    curPageIndex: 0, //当前页索引，查看更多
    paddingTop: 0,
    scrollHeight: 0,
    isFocus: true,
    inputValue: '', //输入框内容
    isShowResult: false, 
    currentContent: 'search-result-content',
    // currentContent: 'search-input-content',
    hotKeywordsList: [], 
    historyWordsList: ['小猪佩奇','奇葩说'], // 后台接口关联账户信息，所以先做本地缓存处理
    resultTitleList: [
      '影片',
      '文章'
    ],
    activeIndex: 0,
    searchResultList: [],
    hasMore: 0, //1表示有下一页，2表示无下一页
    isLike: false
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
  handleLikeTap(e) {
    console.log('handleLikeTap', e);
    this.setData({
      isLike: !this.data.isLike,
      curThirdAlbumId: e.currentTarget.dataset.keyword.third_album_id
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
    let cacheKeywords = this.data.historyWordsList;
    cacheKeywords.push(event.target.dataset.keyword);
    this.setData({
      inputValue: event.target.dataset.keyword,
      isShowResult: true,
      searchResultList: [],
      historyWordsList: cacheKeywords
    })
    this.searchByKeyword(1, event.target.dataset.keyword)
  },
  // 输入法回车搜索
  query: function () {
    console.log('query')
    // 将搜索关键字缓存
    let cacheKeywords = this.data.historyWordsList;
    cacheKeywords.push(this.data.inputValue);
    this.setData({
      searchResultList: [],
      isShowResult: true,
      historyWordsList: cacheKeywords
    })
    this.searchByKeyword(1, this.data.inputValue)
  },
  handleClearTap() {
    console.log('搜索输入页 handleClearTap');
    this.setData({
      historyWordsList: []
    })
  },
  handleTabClick: function (e) {
    const val = e.currentTarget.dataset['index'];
    console.log('搜索结果页 handleTabClick val =' + val);
    this.setData({
      activeIndex: val
    })
  },
  handleEpisodeTap: function (e) {
    console.log('handleEpisodeTap', e);
    console.log(e.currentTarget.dataset.keyword.segment_index)
    this.setData({
      curIndex: e.currentTarget.dataset.keyword.segment_index,
      curThirdId: e.currentTarget.dataset.keyword.video_third_id
    });
  },
  handleMoreTap: function (e) {
    console.log('handleMoreTap', e);
    this.setData({ curPageIndex: this.data.curPageIndex + 1 })
    this.searchByKeyword(1, this.data.inputValue, this.data.curPageIndex);
  },
  onLoad(options) {
    console.log('search onLoad监听页面加载');
    let cacheKeywords = wx.getStorageSync('history_keywords');
    console.log(cacheKeywords);
    this.setData({historyWordsList: cacheKeywords ? cacheKeywords : []});
    this.getHotKeyword();
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

  searchByKeyword: function (videoType, keyword, pageIndex = 0) {
    let that = this;
    console.log('searchByKeyword videoType:' + videoType + ',keyword:' + keyword + ',pageIndex:' + pageIndex)
    wx.showLoading({title: '加载中...'})
    let params = {
      "video_type": videoType,
      "keyword": keyword,
      "page_index": pageIndex
    };
    let desParams = utils.paramsHandler(params);
    console.log(desParams);
    utils.request(api.searchByKeywordUrl, 'GET', desParams,
      function (res) {
        console.log('success', res.data)
        console.log('success', res.data.data)
        wx.hideLoading()
        if (res && res.data && res.data.data && res.data.data.length != 0) {
          // 组装数据
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
        console.log('complete')
      })
  },

  getHotKeyword: function () {
    let that = this;
    utils.request(api.getHotKeywordUrl, 'GET', utils.paramsHandler(),
      function (res) {
        console.log('getHotKeyword success', res.data)
        if (res.data && res.data.data) {
          that.setData({ 
            hotKeywordsList: res.data.data
          })
        }else {
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

  getHistoryKeyword: function() {
    let that = this;
    utils.request(api.getHistoryKeywordUrl, 'GET', utils.paramsHandler(),
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

  getUserInfo: function () {
    wx.getUserInfo({
      success(res) {
        console.log('getUserInfo success',res);
      },
      fail(err) {
        console.log('getUserInfo err', err);
      }
    })
  },
  getSystemInfo: function() {
    wx.getSystemInfo({
      success(res) {
        console.log('getDevInfo success', res);
      },
      fail(err) {
        console.log('getDevInfo err', err);
      }
    })
  }
  // 结束
});
