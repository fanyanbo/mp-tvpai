// author: fanyanbo
// email: fanyanbo@coocaa.com
// date: 2019-09-16
// des: 影片详情页
// todo: 1.命名优化，2.代码优化 3.注释优化 4.性能优化

const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
const app = getApp()

Page({
  data: {
    isShowTips: false, //是否显示遥控器提示
    bIphoneFullScreenModel: false,
    isFixedWindow: false, //是否固定窗口
    videoType: "", //影片类型
    selected: "", //选中的剧集
    isPushDone: false, //是否推送成功
    isShowFavorite: false, //是否显示收藏
    vidList: [], //里面全是空，待确认字段
    movieId: "",
    coocaa_m_id: "",
    videoId: "",
    updated_segment: 1,
    errIconUrl: '../../images/close_icon.png',
    thumbsIconUrl:  '../../images/videodetail/thumbs.png',
    thumbsFocusIconUrl:  '../../images/videodetail/thumbs-focus.png',
    tabbarList: ['视频', '短评'],
    activeIndex: 0, //tabbar索引
    commentTotalNum: 164, //评论总数
    hotCommentList: ['','',''], //热评总数
    allCommentList: ['','','','','',''], //评论总数
    isThumbsUp:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {  
    utils.showLoadingToast()  
    this.getDetailData(options.id)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      // isShowTips: app.globalData.isShowTips,
      bIphoneFullScreenModel: app.globalData.bIphoneFullScreenModel
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('onReachBottom')
    if (this.data.activeIndex === 1 && this.data.allCommentList.length < 12) {
      let _data = this.data.allCommentList.concat(['','','']);
      this.setData({
        allCommentList: _data
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 获取详情数据，初始化调用
  getDetailData: function (movieId) {
    let params = { "third_album_id": movieId };
    let desParams = utils.paramsAssemble_tvpai(params);
    utils.requestP(api.getVideoDetailUrl, desParams).then(res => {
      console.log("影片详情结果:", res)
      console.log("检测session值, ccsession:" + wx.getStorageSync("new_cksession"))
      if (res.data.data) {
        let _tagsTemp = res.data.data.video_tags.toString().split(',')
        let _tags = _tagsTemp && _tagsTemp.length >= 3 ? [_tagsTemp.slice(0, 3).join(' · ')] : []
        let _coocaa_m_id = (res.data.data.play_source && res.data.data.play_source.coocaa_m_id) ? res.data.data.play_source.coocaa_m_id : ""
        let _videoId = (res.data.data.play_source && res.data.data.play_source.video_third_id) ? res.data.data.play_source.video_third_id : ""
        this.setData({
          isShowFavorite: res.data.data.is_collect === 1 ? true : false, // 1表示收藏, 2表示无收藏
          videoDetailData: res.data.data,
          tags: _tags, // 这个属性有用到么？
          videoType: res.data.data.video_type,
          coocaa_m_id: _coocaa_m_id,
          videoId: _videoId,
          updated_segment: res.data.data.updated_segment
        })
        this.renderRelatedFilms(movieId)
        this.renderSeries(movieId)
        this.renderRelatedActors(movieId)
        this.renderRelatedArticles(movieId)
        utils.showLoadingToast('', false)
      }
    }).catch(res => {
      console.log('影片详情获取失败', res)
      utils.showFailedToast('加载数据失败', this.data.errIconUrl)
    })
  },

  // 渲染关联影人
  renderRelatedActors: function (movieId) {
    let params = { "third_album_id": movieId };
    let url = utils.urlAssemble_tvpai(api.getRelatedActorsUrl, utils.paramsAssemble_tvpai(params));
    console.log("获取相关影人url:" + url)
    utils.requestP(url, null).then(res => {
      console.log("获取关联影人:", res.data.data)
      this.setData({
        relatedActorsList: res.data.data.actors
      })
    }).catch(res => {
      console.log('获取关联影人失败:', res)
      utils.showFailedToast('加载数据失败', this.data.errIconUrl)
    })
  },

  // 渲染关联影片（猜你喜欢）
  renderRelatedFilms: function (movieId) {
    let params = { "third_album_id": movieId, "page_size": "10" };
    let desParams = utils.paramsAssemble_tvpai(params);
    utils.requestP(api.getRelatedVideoUrl, desParams).then(res => {
      console.log("获取关联影片:", res.data.data)
      if (res.data.data && res.data.data.length > 0) {
        let _relatedVideo = res.data.data.length > 9 ? res.data.data.slice(0, 9) : res.data.data
        this.setData({
          relatedVideoList: _relatedVideo
        })
      }
    }).catch(res => {
      console.log('获取关联影片数据失败:', res)
      utils.showFailedToast('加载数据失败', this.data.errIconUrl)
    })
  },

  // 渲染关联文章
  renderRelatedArticles: function (movieId) {
    movieId = "_oqy_1012320100" //仅用于测试
    let params = {"movieId": movieId}
    let desParams = utils.paramsAssemble_wx(params)
    utils.requestP(api.getRelatedArticlesUrl, desParams).then(res => {
      console.log('获取关联文章', res.data);
      if (res.data.data && res.data.code === 200) {
        this.setData({
          relatedArticlesList: res.data.data
        })
      } else {
        console.log('获取关联文章失败');
      }
    }).catch(res => {
      console.log('获取关联文章发生错误', res);
    })
  },

  // 渲染剧集列表（注意区分电影，电视剧，纪录片类型，它们展示有差异）
  renderSeries: function (movieId) {
    let updated_segment = this.data.updated_segment
    let params = { "third_album_id": movieId, "page_size": updated_segment };
    let desParams = utils.paramsAssemble_tvpai(params);
    utils.requestP(api.getSegmentListUrl, desParams).then(res => {
      console.log("获取剧集数据:", res)
      if (this.data.videoType === "纪录片") {
        console.log("纪录片剧集列表:", res.data.data.reverse())
      } else {
        console.log("非纪录片剧集列表:", res.data.data)
      }
      if (res.data.data) {
        for (let i = 0; i < res.data.data.length; i++) {
          this.data.vidList.push(JSON.parse(res.data.data[i].video_url).vid) 
        }
        this.setData({
          moviesItem: res.data.data,
          vidList: this.data.vidList
        })
      }
    }).catch(res => {
      console.log('获取剧集数据失败:', res)
      utils.showFailedToast('加载数据失败', this.data.errIconUrl)
    })
  },

  // 显示浮窗
  showPopup: function (e) {
    let _whichPopup = e.currentTarget.dataset.tap;
    console.log("显示弹窗:" + _whichPopup)
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear'
    })
    animation.translateY(500).step()

    if (_whichPopup === "desc") {
      this.setData({
        animationData: animation.export(),
        isShowDescPopup: true,
        isFixedWindow: true
      })
    } else {
      this.setData({
        animationData: animation.export(),
        isShowSeriesPopup: true,
        isFixedWindow: true
      })
    }

    setTimeout(() => {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }, 200)
  },

  // 隐藏浮窗
  hidePopup: function (e) {
    let _whichPopup = e.currentTarget.dataset.tap;
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear'
    })
    animation.translateY(500).step()
    this.setData({
      animationData: animation.export()
    })
    setTimeout(() => {
      animation.translateY(0).step()
      if (_whichPopup === "desc") {
        this.setData({
          animationData: animation.export(),
          isShowDescPopup: false,
          isFixedWindow: false
        })
      } else {
        this.setData({
          animationData: animation.export(),
          isShowSeriesPopup: false,
          isFixedWindow: false
        })
      }
    }, 200)
  },

  // 推送影片
  push: function (e) {
    if (app.globalData.deviceId == null) {
      return wx.redirectTo({
        url: "../home/home"
      });
    }
    let { coocaamid, videoid, moviechildid, movieid, title } = e.currentTarget.dataset
    this.setData({
      moviechildid: moviechildid,
      coocaamid: coocaamid,
      movieId: movieid
    })
    let _session = wx.getStorageSync("new_cksession")
    let _deviceId = app.globalData.deviceId
    console.log("校验参数 session:" + _session + ", deviceId:" + _deviceId);
    wx.showLoading({ title: '推送中...' })
    if (_deviceId == null) {
      utils.showFailedToast('无设备id', this.data.errIconUrl)
      return
    }

    let params = this.data.videoType === "电影" ?
      {
        "ccsession": _session,
        "deviceId": _deviceId + '',
        "movieId": movieid
      } :
      {
        "ccsession": _session,
        "coocaamid": coocaamid,
        "deviceId": _deviceId + '',
        "movieId": movieid,
        "moviechildId": moviechildid + ''
      }

    console.log("推送参数:", params)
    let desParams = utils.paramsAssemble_wx(params);
    console.log('推送参数(组装后):', desParams);
    utils.requestP(api.pushMediaUrl, desParams).then(res => {
      console.log('推送成功', res.data);
      if (res.data && res.data.code === 200) {
        this.setData({
          selected: coocaamid,
          isPushDone: true
        })
        this.addPushHistory(movieid, title, videoid)
        utils.showSuccessToast('推送成功')
      } else {
        console.log('推送失败');
        let errMsg = res.data.message + (res.data.code == null ? "" : "[" + res.data.code + "]");
        utils.showFailedToast(errMsg, this.data.errIconUrl)
      }
    }).catch(res => {
      console.log('推送发生错误', res);
      utils.showFailedToast('推送失败', this.data.errIconUrl)
    })
  },

  // 添加历史
  addPushHistory: function (movieId, title, videoId) {
    let urlParams = { "vuid": wx.getStorageSync("wxopenid") };
    let url = utils.urlAssemble_tvpai(api.addPushHistoryUrl, utils.paramsAssemble_tvpai(urlParams));
    let data = {
      album_id: movieId,
      title: title,
      video_id: videoId, //null会导致获取历史列表数据缺失
      video_type: "1"
    }
    utils.requestP(url, data, 'POST', 'application/json; charset=utf-8').then(res => {
      console.log('添加历史成功', res);
    }).catch(res => {
      console.log('添加历史失败', res);
    })
  },

  scroll: function (e) {
    console.log('触发scroll事件')
  },

  scrollToLower: function (e) {
    console.log('触发scrollToLower事件')
  },

  scrollToUpper: function (e) {
    console.log('触发scrollToUpper事件')
  },

  getActorInfo: function (actorid) {
    let params = { "actor_id": actorid };
    let url = utils.urlAssemble_tvpai(api.getRelatedVideoByActorUrl, utils.paramsAssemble_tvpai(params));
    console.log("获取影人信息url:" + url)
    utils.requestP(url, null).then(res => {
      console.log("获取影人信息:", res)
    }).catch(res => {
      console.log('获取影人信息失败:', res)
      utils.showFailedToast('加载数据失败', this.data.errIconUrl)
    })
  },

  handleGohomeClick: function () {
    console.log('handleGohomeClick')
    // 注意:tabbar页面无法使用redirectTo和navigateTo进行跳转
    wx.switchTab({
      url: '../index/index'
    })
  },

  handleGobackClick: function () {
    console.log('handleGobackClick')
    utils.navigateBack()
  },

  handleTabbarClick: function (e) {
    const _activeIndex = e.currentTarget.dataset['index'];
    console.log('切换tabbar activeIndex =' + _activeIndex);
    this.setData({
      activeIndex: _activeIndex
    })
  },

  handleActorClick: function (e) {
    console.log('handleActorClick', e)
    let {actorinfo} = e.currentTarget.dataset
    // this.getActorInfo(actorinfo.id)
    wx.navigateTo({
      url: `../actorDetail/actorDetail?info=${JSON.stringify(actorinfo)}`,
    })
  },

  handleFavoriteClick: function (e) {
    console.log('handleFavoriteClick', e)
    let {id} = e.currentTarget.dataset
    wx.redirectTo({
      url: `../movieDetail/movieDetail?id=${id}`,
    })
  },

  handleRecommendClick: function (e) {
    console.log('handleRecommendClick', e)
    wx.navigateTo({
      url: `../cinecism/cinecism?id=${e.currentTarget.dataset.id}`
    })
  },

  handleHotClick: function (e) {
    console.log('handleHotClick', e)
    this.setData({
      activeIndex: 1
    })
  },

  handleThumbsClick: function (e) {
    console.log('handleThumbsClick', e)
    let {index} = e.currentTarget.dataset
    this.setData({
      curIndex: index
    })
  },

  handleCommentClick: function () {
    console.log('handleCommentClick')
    this.setData({isCommentShow: true})
  }


  //收藏喜欢（未开发）
  // favorite(e) {
  //   if (app.globalData.deviceId == null) {
  //     return wx.redirectTo({
  //       url: "../home/home"
  //     });
  //   }
  //   let that = this
  //   var video_title = e.currentTarget.dataset.title
  //   var video_poster = e.currentTarget.dataset.poster
  //   var third_album_id = e.currentTarget.dataset.id

  //   const secret = app.globalData.secret
  //   var paramsStr = { "appkey": app.globalData.appkey, "collect_type": 1, "time": app.globalData.time(), "version_code": app.globalData.version_code, "vuid": wx.getStorageSync("wxopenid") }
  //   var sign = utils.encryptionIndex(paramsStr, secret)
  //   console.log(third_album_id)
  //   console.log(paramsStr)
  //   wx.request({
  //     url: api.addUrl + "?collect_type=1&sign=" + sign + "&vuid=" + wx.getStorageSync("wxopenid") + "&version_code=" + app.globalData.version_code + "&time=" + app.globalData.time() + "&appkey=" + app.globalData.appkey,
  //     method: "POST",
  //     data: {
  //       third_album_id: third_album_id,
  //       title: video_title,
  //       video_poster: video_poster,
  //       video_type: 1,
  //       vuid: wx.getStorageSync("wxopenid")
  //     },
  //     header: {
  //       "Content-Type": "application/json; charset=utf-8"
  //     },
  //     success: function (res) {
  //       console.log(res.data);
  //       that.setData({
  //         likeShow: true
  //       })
  //     },
  //   })
  // }
})