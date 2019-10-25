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
    isShowFavorite: false, //是否显示收藏icon
    isFavorite: false, //当前影片的收藏状态
    vidList: [],
    movieId: "",
    coocaa_m_id: "",
    videoId: "",
    updated_segment: 1,
    errIconUrl: '../../images/close_icon.png',
    thumbsIconUrl: '../../images/videodetail/thumbs.png',
    thumbsFocusIconUrl: '../../images/videodetail/thumbs-focus.png',
    tabbarList: ['视频', '短评'],
    activeIndex: 0, //tabbar索引
    commentTotalNum: 164, //评论总数
    hotCommentList: [], //热评总数
    allCommentList: [], //评论总数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    utils.showLoadingToast()
    console.log('当前影片id和from:', options)
    this.data.curMovieId = options.id
    this.data.from = options.from
    // 初始化评论点赞列表的缓存
    this.data._commentLike = wx.getStorageSync('comment_like')
    if (!this.data._commentLike) wx.setStorageSync('comment_like', [])
    this.getDetailData(this.data.curMovieId)
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
          // isShowFavorite: res.data.data.is_collect === 1 ? true : false, // 1表示收藏, 2表示无收藏
          videoDetailData: res.data.data,
          tags: _tags, // 这个属性有用到么？
          videoType: res.data.data.video_type,
          coocaa_m_id: _coocaa_m_id,
          videoId: _videoId,
          updated_segment: res.data.data.updated_segment
        })
        this.getRelatedFilms(movieId)
        this.getSeries(movieId)
        this.getRelatedActors(movieId)
        this.getComment(movieId)
        this.getRelatedArticles(movieId)
        this.getFavoriteStatus(movieId)
        utils.showLoadingToast('', false)
      }
      //日志提交
      wx.reportAnalytics('page_videodetail_show', {
        from: this.data.from,
        video_name: res.data.data.album_title || this.data.curMovieId
      });
    }).catch(res => {
      console.log('影片详情获取失败', res)
      //日志提交
      wx.reportAnalytics('page_videodetail_show', {
        from: this.data.from,
        video_name: res.data.data.album_title || this.data.curMovieId
      });
      utils.showFailedToast('加载数据失败', this.data.errIconUrl)
    })
  },

  // 获取关联演员
  getRelatedActors: function (movieId) {
    let params = { "third_album_id": movieId };
    let url = utils.urlAssemble_tvpai(api.getRelatedActorsUrl, utils.paramsAssemble_tvpai(params));
    utils.requestP(url, null).then(res => {
      console.log("获取关联演员数据:", res.data.data)
      this.setData({
        relatedActorsList: res.data.data.actors
      })
    }).catch(res => {
      console.log('获取关联演员数据发生错误:', res)
      // utils.showFailedToast('加载数据失败', this.data.errIconUrl)
    })
  },

  // 获取关联影片（猜你喜欢）
  getRelatedFilms: function (movieId) {
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

  // 获取关联文章
  getRelatedArticles: function (movieId) {
    let params = { "movieId": movieId }
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

  // 获取剧集列表（注意区分电影，电视剧，纪录片类型，它们展示有差异）
  getSeries: function (movieId) {
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

  // 获取当前影片收藏状态
  getFavoriteStatus: function (movieId) {
    let ccsession = wx.getStorageSync('new_cksession')
    if (ccsession == "") return
    let params = { "ccsession": ccsession, "movieId": movieId }
    utils.requestP(api.getFavoriteStatusUrl, utils.paramsAssemble_wx(params)).then(res => {
      if (res.data.data && res.data.code === 200) {
        console.log("获取影片收藏状态成功:", res)
        // 保存当前影片对应的收藏id
        this.data.collectId = res.data.data.collectId
        this.setData({ isFavorite: res.data.data.isCollected, isShowFavorite: true })
      } else {
        console.log("获取影片收藏状态失败:", res)
        this.setData({ isFavorite: false, isShowFavorite: true })
      }
    }).catch(res => {
      console.log('获取影片收藏状态发生错误:', res)
    })
  },

  // 获取全部评论
  getComment: function (movieId) {
    let ccsession = wx.getStorageSync('new_cksession')
    if (ccsession == "") return
    let params = { "ccsession": ccsession, "movieId": movieId }
    let desParams = utils.paramsAssemble_wx(params)
    console.log('获取评论参数:', desParams)
    utils.requestP(api.getCommentsUrl, desParams).then(res => {
      console.log("获取评论数据:", res)
      if (res.data.data && res.data.code === 200) {
        this.data._allComments = res.data.data.list
        this.data_commentLike = wx.getStorageSync('comment_like') //评论点赞缓存列表   
        for (let i = 0; i < this.data._allComments.length; i++) {
          let _index = this.data._commentLike.indexOf(this.data._allComments[i].id) //判断缓存中是否有点赞记录
          if (_index > -1) {
            this.data._allComments[i].isThumbsUp = true
          }
        }
        this.data._hotComments = this.data._allComments.length <= 3 ? this.data._allComments : this.data._allComments.slice(0, 3)
        this.setData({
          hotCommentList: this.data._hotComments,
          allCommentList: this.data._allComments
        })
      } else {
        console.log("获取评论数据失败:", res)
      }
    }).catch(res => {
      console.log('获取评论数据发生错误:', res)
    })
  },

  // 提交评论
  submitComment: function (content, score) {
    let ccsession = wx.getStorageSync('new_cksession')
    // let ccsession = 'b45004fab0934395dc20ede9dc13801d'
    if (ccsession == "") return
    let params = {
      "ccsession": ccsession,
      "movieId": this.data.curMovieId,
      "content": content,
      "grade": score
    }
    let desParams = utils.paramsAssemble_wx(params)
    console.log('提交评论参数:', desParams)
    utils.requestP(api.submitCommentUrl, desParams).then(res => {
      if (res.data.data && res.data.code === 200) {
        console.log("提交评论数据成功:", res)
        this.data._allComments = res.data.data.list
        this.data_commentLike = wx.getStorageSync('comment_like') //评论点赞缓存列表   
        for (let i = 0; i < this.data._allComments.length; i++) {
          let _index = this.data._commentLike.indexOf(this.data._allComments[i].id) //判断缓存中是否有点赞记录
          if (_index > -1) {
            this.data._allComments[i].isThumbsUp = true
          }
        }
        this.data._hotComments = this.data._allComments.length <= 3 ? this.data._allComments : this.data._allComments.slice(0, 3)
        this.setData({
          hotCommentList: this.data._hotComments,
          allCommentList: this.data._allComments
        })
      } else {
        console.log("提交评论数据失败:", res)
      }
    }).catch(res => {
      console.log('提交评论数据发生错误:', res)
    })
  },

  // 对某条评论点赞/取消点赞
  submitClickLike: function (commentId) {
    let ccsession = wx.getStorageSync('new_cksession')
    // let ccsession = 'b45004fab0934395dc20ede9dc13801d'
    if (ccsession == "") return
    let params = { "ccsession": ccsession, "commentId": commentId + '' }
    let desParams = utils.paramsAssemble_wx(params)
    utils.requestP(api.submitClickLikeUrl, desParams).then(res => {
      console.log("点赞成功:", res)
      if (res.data.data) {
        let _type = res.data.data.type
        let _commentLike = wx.getStorageSync('comment_like') //评论点赞缓存列表
        let _index = _commentLike.indexOf(commentId) //判断缓存中是否有点赞记录
        console.log(commentId, _commentLike)
        if (_type === 'sure') {
          if (_index < 0) {
            _commentLike.push(commentId)
            wx.setStorageSync('comment_like', _commentLike)
          }
        } else {
          if (_index > -1) {
            _commentLike.splice(_index, 1)
            wx.setStorageSync('comment_like', _commentLike)
          }
        }
        for (let i = 0; i < this.data._allComments.length; i++) {
          if (commentId === this.data._allComments[i].id) {
            if (_type === 'sure') {
              this.data._allComments[i].isThumbsUp = true
              this.data._allComments[i].praiseNum += 1
            } else {
              this.data._allComments[i].isThumbsUp = false
              this.data._allComments[i].praiseNum -= 1
            }
          }
        }
        this.data._hotComments = this.data._allComments.length <= 3 ? this.data._allComments : this.data._allComments.slice(0, 3)
        this.setData({
          hotCommentList: this.data._hotComments,
          allCommentList: this.data._allComments
        })
      }
    }).catch(res => {
      console.log('点赞失败:', res)
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
    let _deviceId = app.globalData.deviceId
    if (_deviceId == null) { // 跳转设备绑定页面
      return wx.redirectTo({
        url: "../home/home"
      })
    }
    let { coocaamid, videoid, moviechildid, movieid, title } = e.currentTarget.dataset
    this.setData({
      moviechildid: moviechildid,
      coocaamid: coocaamid,
      movieId: movieid
    })
    let _session = wx.getStorageSync("new_cksession")
    console.log("校验参数 session:" + _session + ", deviceId:" + _deviceId)
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
      console.log('推送结果:', res.data)
      if (res.data && res.data.code === 200) {
        this.setData({
          selected: coocaamid,
          isPushDone: true
        })
        this.addPushHistory(movieid, title, videoid)
        utils.showSuccessToast('推送成功')
      } else {
        console.log('推送失败', res)
        let errMsg = res.data.message + (res.data.code == null ? "" : "[" + res.data.code + "]");
        utils.showFailedToast(errMsg, this.data.errIconUrl)
      }
    }).catch(res => {
      console.log('推送发生错误', res)
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

  // 获取演员信息
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

  // 处理导航栏主页点击事件
  handleGohomeClick: function () {
    console.log('handleGohomeClick')
    // 注意:tabbar页面无法使用redirectTo和navigateTo进行跳转
    wx.switchTab({
      url: '../index/index'
    })
  },

  // 处理导航栏返回点击事件
  handleGobackClick: function () {
    console.log('handleGobackClick')
    utils.navigateBack()
  },

  // 处理tabbar切换事件
  handleTabbarClick: function (e) {
    const _activeIndex = e.currentTarget.dataset['index'];
    console.log('切换tabbar activeIndex =' + _activeIndex);
    this.setData({
      activeIndex: _activeIndex
    })
  },

  // 进入演员详情页
  handleActorClick: function (e) {
    console.log('handleActorClick', e)
    let { actorinfo } = e.currentTarget.dataset
    // this.getActorInfo(actorinfo.id)
    wx.navigateTo({
      url: `../actorDetail/actorDetail?info=${JSON.stringify(actorinfo)}`,
    })
  },

  // 进入关联影片详情页
  handleFavoriteClick: function (e) {
    console.log('handleFavoriteClick', e)
    let { id } = e.currentTarget.dataset
    wx.redirectTo({
      url: `../movieDetail/movieDetail?id=${id}`,
    })
  },

  // 进入关联文章详情页
  handleRecommendClick: function (e) {
    console.log('handleRecommendClick', e)
    wx.navigateTo({
      url: `../cinecism/cinecism?id=${e.currentTarget.dataset.id}`
    })
  },

  // 点击显示更多评论
  handleHotClick: function (e) {
    console.log('handleHotClick', e)
    this.setData({
      activeIndex: 1
    })
  },

  // 处理点赞点击事件
  handleThumbsClick: function (e) {
    console.log('handleThumbsClick')
    let { id } = e.currentTarget.dataset
    this.submitClickLike(id)
  },

  // 处理遥控器输入评论点击事件
  handleCommentClick: function () {
    console.log('handleCommentClick')
    this.setData({ isCommentShow: true })
  },

  // 处理提交评论点击事件
  handleSubmitClick: function (e) {
    console.log('handleSubmitClick', e)
    let { content, score } = e.detail
    // 后台按照10分制定义
    this.submitComment(content, score * 2)
  },

  // 收藏影片
  handleCollectionClick: function () {
    console.log('handleCollectionClick')
    // 检查是否登录酷开账号
    utils.checkCoocaaUserLogin()
    let ccsession = wx.getStorageSync('new_cksession')
    if (ccsession == "") return
    let _movieid = `['${this.data.curMovieId}']`
    let params = { "ccsession": ccsession, "moviesId": _movieid }
    utils.requestP(api.addMovieFavoriteUrl, utils.paramsAssemble_wx(params)).then(res => {
      if (res.data && res.data.code === 200) {
        console.log('添加影片收藏成功', res)
        this.setData({ isFavorite: true })
        this.data.collectId = res.data.data[0].collectId
      } else {
        console.log('添加影片收藏失败', res)
      }
    }).catch(res => {
      console.log('添加影片收藏发生错误', res)
    })
  },

  // 取消影片收藏
  handleUnCollectionClick: function () {
    console.log('handleUnCollectionClick')
    // 检查是否登录酷开账号
    utils.checkCoocaaUserLogin()
    let ccsession = wx.getStorageSync('new_cksession')
    if (ccsession == "") return
    let _collectIds = `[${this.data.collectId}]`
    console.log(_collectIds)
    let params = { "ccsession": ccsession, "collectIds": _collectIds }
    utils.requestP(api.delMovieFavoriteUrl, utils.paramsAssemble_wx(params)).then(res => {
      if (res.data && res.data.code === 200) {
        console.log('删除影片收藏成功', res)
        this.setData({ isFavorite: false, isShowFavorite: true })
      } else {
        console.log('删除影片收藏失败', res)
      }
    }).catch(res => {
      console.log('删除影片收藏发生错误', res)
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

})