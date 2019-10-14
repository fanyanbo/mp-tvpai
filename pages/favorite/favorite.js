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
    article: [],
    isEdit: false, //是否是编辑状态
    isVideoSelectAll: false,
    isTopicSelectAll: false,
    isArticleSelectAll: false,
  },

  onLoad: function (options) {
    console.log(options)
  },

  onShow: function () {

  },

  onReady: function () {
    console.log('search onReady监听页面初次渲染完成');
    const {
      pxNavBarHeight,
      rpxNavBarHeight,
      ratio
    } = utils.getNavBarHeight();
    console.log(pxNavBarHeight, rpxNavBarHeight, ratio)

    let _videoToday = {
      time: '今天',
      list: [
        {
          "id": 1,
          "selected": false
        },
        {
          "id": 2,
          "selected": false
        }
      ]
    }, _videoWeekend = {
      time: '一周内',
      list: [
        {
          "id": 3,
          "selected": false
        },
        {
          "id": 4,
          "selected": false
        },
        {
          "id": 5,
          "selected": false
        }
      ]
    }, _videoAgo = {
      time: '更早',
      list: [
        {
          "id": 6,
          "selected": false
        },
        {
          "id": 7,
          "selected": false
        },
        {
          "id": 8,
          "selected": false
        },
        {
          "id": 9,
          "selected": false
        }
      ]
    }

    let _videoList = []
    _videoList.push(_videoToday)
    _videoList.push(_videoWeekend)
    _videoList.push(_videoAgo)
    this.setData({ videoList: _videoList })
  },

  handleGobackClick: function () {
    console.log('handleGobackClick')
    utils.navigateBack()
  },

  handleTabbarClick: function (e) {
    const _activeIndex = e.currentTarget.dataset['index'];
    console.log('切换tabbar activeIndex = ' + _activeIndex);
    this.setData({
      activeIndex: _activeIndex
    })

    if(_activeIndex === 1) {
      let _topicToday = {
        time: '今天',
        list: [
          {
            "id": 1,
            "selected": false
          },
          {
            "id": 2,
            "selected": false
          }
        ]
      }, _topicWeekend = {
        time: '一周内',
        list: [
          {
            "id": 3,
            "selected": false
          },
          {
            "id": 4,
            "selected": false
          },
          {
            "id": 5,
            "selected": false
          }
        ]
      }, _topicAgo = {
        time: '更早',
        list: [
          {
            "id": 6,
            "selected": false
          }
        ]
      }
  
      let _topicList = []
      _topicList.push(_topicToday)
      _topicList.push(_topicWeekend)
      _topicList.push(_topicAgo)
      this.setData({ topicList: _topicList })
    } else if(_activeIndex === 2) {
      let _articleToday = {
        time: '今天',
        list: [
          {
            "id": 1,
            "selected": false
          },
          {
            "id": 2,
            "selected": false
          }
        ]
      }, _articleWeekend = {
        time: '一周内',
        list: [
          {
            "id": 3,
            "selected": false
          },
          {
            "id": 4,
            "selected": false
          },
          {
            "id": 5,
            "selected": false
          }
        ]
      }, _articleAgo = {
        time: '更早',
        list: [
          {
            "id": 6,
            "selected": false
          },
          {
            "id": 7,
            "selected": false
          }
        ]
      }
  
      let _articleList = []
      _articleList.push(_articleToday)
      _articleList.push(_articleWeekend)
      _articleList.push(_articleAgo)
      this.setData({ articleList: _articleList })
    }
  },

  handleEditClick: function (e) {
    console.log('handleEditClick')
    this.setData({
      isEdit: true
    })
  },

  handleCancelClick: function (e) {
    console.log('handleCancelClick')
    this.setData({
      isEdit: false
    })
  },

  handleSelectAllClick: function (e) {
    console.log('handleSelectAllClick')
    let _selectArr = []
    switch(e.currentTarget.dataset.type) {
      case "video": {
        let arr = this.data.videoList
        for(let i=0; i<arr.length; i++) {
          let _list = arr[i].list
          for(let j=0; j<_list.length; j++) {
            _list[j].selected = true
            _selectArr.push(_list[j].id)
          }
        }
        this.setData({videoList: arr, isVideoSelectAll: true, selectedList: _selectArr})
      }
      case "topic": {
        let arr = this.data.topicList
        for(let i=0; i<arr.length; i++) {
          let _list = arr[i].list
          for(let j=0; j<_list.length; j++) {
            _list[j].selected = true
            _selectArr.push(_list[j].id)
          }
        }
        this.setData({topicList: arr, isTopicSelectAll: true, selectedList: _selectArr})
      }
      case "article": {
        let arr = this.data.articleList
        for(let i=0; i<arr.length; i++) {
          let _list = arr[i].list
          for(let j=0; j<_list.length; j++) {
            _list[j].selected = true
            _selectArr.push(_list[j].id)
          }
        }
        this.setData({articleList: arr, isArticleSelectAll: true, selectedList: _selectArr})
      }
    }
  },

  handleCancelSelectAllClick: function (e) {
    console.log('handleCancelSelectAllClick')
    switch(e.currentTarget.dataset.type) {
      case "video": {
        let arr = this.data.videoList
        for(let i=0; i<arr.length; i++) {
          let _list = arr[i].list
          for(let j=0; j<_list.length; j++) {
            _list[j].selected = false
          }
        }
        this.setData({videoList: arr, isVideoSelectAll: false, selectedList: []})
      }
      case "topic": {
        let arr = this.data.topicList
        for(let i=0; i<arr.length; i++) {
          let _list = arr[i].list
          for(let j=0; j<_list.length; j++) {
            _list[j].selected = false
          }
        }
        this.setData({topicList: arr, isTopicSelectAll: false, selectedList: []})
      }
      case "article": {
        let arr = this.data.articleList
        for(let i=0; i<arr.length; i++) {
          let _list = arr[i].list
          for(let j=0; j<_list.length; j++) {
            _list[j].selected = false
          }
        }
        this.setData({articleList: arr, isArticleSelectAll: false, selectedList: []})
      }
    }
  },

  handleRemoveClick: function () {
    console.log('handleRemoveClick')
  },

  handleSelectClick: function (e) {
    console.log('handleSelectClick')
    let {id, type} = e.currentTarget.dataset
    let _selectArr = []
    switch(type) {
      case "video": {
        let arr = this.data.videoList
        for(let i=0; i<arr.length; i++) {
          let _list = arr[i].list
          for(let j=0; j<_list.length; j++) {
            if(_list[j].id === id) {
              _list[j].selected = !_list[j].selected
            }
            if(_list[j].selected) {
              _selectArr.push(_list[j].id)
            }
          }
        }
        this.setData({videoList: arr, selectedList: _selectArr})
      }
      case "topic": {
        let arr = this.data.topicList
        for(let i=0; i<arr.length; i++) {
          let _list = arr[i].list
          for(let j=0; j<_list.length; j++) {
            if(_list[j].id === id) {
              _list[j].selected = !_list[j].selected
            }
            if(_list[j].selected) {
              _selectArr.push(_list[j].id)
            }
          }
        }
        this.setData({topicList: arr, selectedList: _selectArr})
      }
      case "article": {
        let arr = this.data.articleList
        for(let i=0; i<arr.length; i++) {
          let _list = arr[i].list
          for(let j=0; j<_list.length; j++) {
            if(_list[j].id === id) {
              _list[j].selected = !_list[j].selected
            }
            if(_list[j].selected) {
              _selectArr.push(_list[j].id)
            }
          }
        }
        this.setData({articleList: arr, selectedList: _selectArr})
      }
    }
  }
})  