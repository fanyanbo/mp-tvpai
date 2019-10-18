// author:fanyanbo
// email: fanyanbo@coocaa.com
// date: 2019-09-30
// desc: 我的收藏页 

const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
const app = getApp()

Page({
  data: {
    tabbarList: ['影片', '片单', '文章'],
    activeIndex: 0, //tabbar索引
    videoList: [],
    topicList: [],
    articleList: [],
    isVideoEdit: false, //视频列表是否是编辑状态
    isVideoNoResult: false, //视频列表是否是无结果状态
    isTopicEdit: false, //片单列表是否是编辑状态
    isTopicNoResult: true, //片单列表是否是无结果状态
    isArticleEdit: false, //文章列表是否是编辑状态
    isArticleNoResult: false, //文章列表是否是无结果状态
    isVideoSelectAll: false, //视频列表是否是全选状态
    isTopicSelectAll: false, //片单列表是否是全选状态
    isArticleSelectAll: false, //文章列表是否是全选状态
  },

  // 页面生命周期事件
  onLoad: function (options) {
    console.log(options)
    this.getArticlesFavorite()
    this.getVideosFavorite()
    this.getTopicFavorite()
  },

  // 处理导航栏返回点击事件
  handleGobackClick: function () {
    console.log('handleGobackClick')
    utils.navigateBack()
  },

  // 处理tabbar点击事件
  handleTabbarClick: function (e) {
    const _activeIndex = e.currentTarget.dataset['index'];
    console.log('切换tabbar activeIndex = ' + _activeIndex);
    this.setData({
      activeIndex: _activeIndex
    })
  },

  // 处理编辑按钮点击事件
  handleEditClick: function (e) {
    let type = e.currentTarget.dataset.type
    console.log('handleEditClick', type)
    switch (type) {
      case "video": {
        this.setData({ isVideoEdit: true })
        break
      }
      case "topic": {
        this.setData({ isTopicEdit: true })
        break
      }
      case "article": {
        this.setData({ isArticleEdit: true })
        break
      }
    }
  },

  // 处理取消编辑点击事件
  handleCancelClick: function (e) {
    let type = e.currentTarget.dataset.type
    console.log('handleCancelClick', type)
    switch (type) {
      case "video": {
        this.setData({ isVideoEdit: false })
        break
      }
      case "topic": {
        this.setData({ isTopicEdit: false })
        break
      }
      case "article": {
        this.setData({ isArticleEdit: false })
        break
      }
    }
  },

  // 处理全选点击事件
  handleSelectAllClick: function (e) {
    console.log('handleSelectAllClick')
    let _selectArr = []
    switch (e.currentTarget.dataset.type) {
      case "video": {
        let arr = this.data.videoList
        for (let i = 0; i < arr.length; i++) {
          let _list = arr[i].list
          for (let j = 0; j < _list.length; j++) {
            _list[j].selected = true
            _selectArr.push(_list[j].id)
          }
        }
        this.setData({ videoList: arr, isVideoSelectAll: true, selectedList: _selectArr })
        break
      }
      case "topic": {
        let arr = this.data.topicList
        for (let i = 0; i < arr.length; i++) {
          let _list = arr[i].list
          for (let j = 0; j < _list.length; j++) {
            _list[j].selected = true
            _selectArr.push(_list[j].id)
          }
        }
        this.setData({ topicList: arr, isTopicSelectAll: true, selectedList: _selectArr })
        break
      }
      case "article": {
        let arr = this.data.articleList
        for (let i = 0; i < arr.length; i++) {
          let _list = arr[i].list
          for (let j = 0; j < _list.length; j++) {
            _list[j].selected = true
            _selectArr.push(_list[j].id)
          }
        }
        this.setData({ articleList: arr, isArticleSelectAll: true, selectedList: _selectArr })
        break
      }
    }
  },

  // 处理取消全选点击事件
  handleCancelSelectAllClick: function (e) {
    console.log('handleCancelSelectAllClick')
    switch (e.currentTarget.dataset.type) {
      case "video": {
        let arr = this.data.videoList
        for (let i = 0; i < arr.length; i++) {
          let _list = arr[i].list
          for (let j = 0; j < _list.length; j++) {
            _list[j].selected = false
          }
        }
        this.setData({ videoList: arr, isVideoSelectAll: false, selectedList: [] })
        break
      }
      case "topic": {
        let arr = this.data.topicList
        for (let i = 0; i < arr.length; i++) {
          let _list = arr[i].list
          for (let j = 0; j < _list.length; j++) {
            _list[j].selected = false
          }
        }
        this.setData({ topicList: arr, isTopicSelectAll: false, selectedList: [] })
        break
      }
      case "article": {
        let arr = this.data.articleList
        for (let i = 0; i < arr.length; i++) {
          let _list = arr[i].list
          for (let j = 0; j < _list.length; j++) {
            _list[j].selected = false
          }
        }
        this.setData({ articleList: arr, isArticleSelectAll: false, selectedList: [] })
        break
      }
    }
  },

  // 处理移除点击事件
  handleRemoveClick: function (e) {
    console.log('handleRemoveClick')
    let { type } = e.currentTarget.dataset
    console.log(this.data.selectedList)
    switch (type) {
      case "video": {     
        this.delVideosFavorite(this.data.selectedList)
        break
      }
      case "topic": {
        break
      }
      case "article": {
        break
      }
    }
  },

  // 处理选择待删除项点击事件
  handleSelectClick: function (e) {
    console.log('handleSelectClick')
    let { id, type } = e.currentTarget.dataset
    let _selectArr = []
    switch (type) {
      case "video": {
        let arr = this.data.videoList
        for (let i = 0; i < arr.length; i++) {
          let _list = arr[i].list
          for (let j = 0; j < _list.length; j++) {
            if (_list[j].movieId === id) {
              _list[j].selected = !_list[j].selected
            }
            if (_list[j].selected) {
              // 注意这里是collectid，不是movieid
              _selectArr.push(_list[j].collectId)
            }
          }
        }
        this.setData({ videoList: arr, selectedList: _selectArr })
        break
      }
      case "topic": {
        let arr = this.data.topicList
        for (let i = 0; i < arr.length; i++) {
          let _list = arr[i].list
          for (let j = 0; j < _list.length; j++) {
            if (_list[j].id === id) {
              _list[j].selected = !_list[j].selected
            }
            if (_list[j].selected) {
              _selectArr.push(_list[j].id)
            }
          }
        }
        this.setData({ topicList: arr, selectedList: _selectArr })
        break
      }
      case "article": {
        let arr = this.data.articleList
        for (let i = 0; i < arr.length; i++) {
          let _list = arr[i].list
          for (let j = 0; j < _list.length; j++) {
            if (_list[j].id === id) {
              _list[j].selected = !_list[j].selected
            }
            if (_list[j].selected) {
              _selectArr.push(_list[j].id)
            }
          }
        }
        this.setData({ articleList: arr, selectedList: _selectArr })
        break
      }
    }
  },

  // 进入影片详情页
  handleVideoClick: function (e) {
    console.log('handleVideoClick')
    let { movieid } = e.currentTarget.dataset
    wx.navigateTo({
      url: `../movieDetail/movieDetail?id=${movieid}`,
    })
  },

  // 进入片单详情页
  handleTopicClick: function (e) {
    console.log('handleTopicClick')
    let { topicid } = e.currentTarget.dataset
    wx.navigateTo({
      url: `../topicDetail/topicDetail?id=${topicid}`,
    })
  },

  // 进入文章页面
  handleArticleClick: function (e) {
    console.log('handleArticleClick')
    let { articleid } = e.currentTarget.dataset
    wx.navigateTo({
      url: '../cinecism/cinecism?id=' + articleid
    })
  },

  // 获取收藏的文章列表
  getArticlesFavorite: function () {
    let ccsession = wx.getStorageSync('new_cksession')
    if (ccsession == "") return
    let params = { "ccsession": ccsession }
    utils.requestP(api.getFavoriteArticlesUrl, utils.paramsAssemble_wx(params)).then(res => {   
      if (res.data && res.data.data && res.data.data.list && res.data.code === 200) {
        console.log('获取收藏文章列表成功:', res)
        let _list = res.data.data.list
        for (let i = 0; i < _list.length; i++) {
          _list[i].selected = false
        }
        let _articleList = [],
          _articleToday = {
            time: '今天',
            list: _list
          }
        _articleList.push(_articleToday)
        this.setData({ articleList: _articleList, isArticleNoResult: false, isArticleEdit: false })
      } else {
        console.log('获取收藏文章列表失败:', res)
        this.setData({ isArticleNoResult: true })
      }
    }).catch(res => {
      console.log('获取收藏文章列表发生错误:', res)
      this.setData({ isArticleNoResult: true })
    })
  },

  // 获取收藏的视频列表
  getVideosFavorite: function () {
    let ccsession = wx.getStorageSync('new_cksession')
    if (ccsession == "") return
    let params = { "ccsession": ccsession }
    utils.requestP(api.getFavoriteVideosUrl, utils.paramsAssemble_wx(params)).then(res => {   
      if (res.data && res.data.data && res.data.data.list && res.data.code === 200) {
        console.log('获取收藏视频列表成功:', res)
        let _list = res.data.data.list
        for (let i = 0; i < _list.length; i++) {
          _list[i].selected = false
        }
        let _videoList = [],
          _videoToday = {
            time: '今天',
            list: _list
          }
        _videoList.push(_videoToday)
        this.setData({ videoList: _videoList, isVideoNoResult: false, isVideoEdit: false  })
      } else {
        console.log('获取收藏视频列表失败:',res)
        this.setData({ isVideoNoResult: true })
      }
    }).catch(res => {
      console.log('获取收藏视频列表发生错误:', res)
      this.setData({ isVideoNoResult: true })
    })
  },

    // 删除收藏的视频
    delVideosFavorite: function (delList) {
      let ccsession = wx.getStorageSync('new_cksession')
      if (ccsession == "") return
      let _collectIds = `[${delList}]`
      console.log(_collectIds)
      let params = { "ccsession": ccsession, "collectIds": _collectIds }
      utils.requestP(api.delMovieFavoriteUrl, utils.paramsAssemble_wx(params)).then(res => {
        if (res.data && res.data.code === 200) {
          console.log('删除影片收藏成功', res)
          this.getVideosFavorite()
        } else {
          console.log('删除影片收藏失败', res)
        }
      }).catch(res => {
        console.log('删除影片收藏发生错误', res)
      })
    },

  // 获取收藏的片单列表
  getTopicFavorite: function () {
    let params = { "vuid": wx.getStorageSync("wxopenid") }
    utils.requestP(api.getFavoriteTopicUrl, utils.paramsAssemble_tvpai(params)).then(res => {   
      if (res.data.data && res.data.data.length !== 0) {
        console.log('获取收藏片单列表成功:', res)
        let _list = res.data.data
        for (let i = 0; i < _list.length; i++) {
          _list[i].selected = false
        }
        let _topicList = [],
            _topicToday = {
              time: '今天',
              list: _list
            }
        _topicList.push(_topicToday)
        this.setData({ topicList: _topicList, isTopicNoResult: false, isTopicEdit: false  })
      } else {
        console.log('获取收藏片单列表失败:', res)
        this.setData({ isTopicNoResult: true })
      }
    }).catch(res => {
      console.log('获取收藏片单列表发生错误:', res)
      this.setData({ isTopicNoResult: true })
    })
  }

})  