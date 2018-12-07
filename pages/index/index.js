//index.js
var utils = require('../../utils/util.js');
//获取应用实例
var app = getApp()

Page({
  data: {
    page: '1',
    pageSize: '10',
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    indicatorColor: '#ececec',
    indicatorActiveColor: '#acacac',
    column:[
      {
        "text":"电影",
        "columnId":"1"
      },
      {
        "text": "电视剧",
        "columnId": "2"
      },
      {
        "text": "综艺",
        "columnId": "1"
      },
      {
        "text": "动漫",
        "columnId": "1"
      },
      {
        "text": "娱乐",
        "columnId": "1"
      },
      {
        "text": "电视剧",
        "columnId": "1"
      }, {
        "text": "电影",
        "columnId": "1"
      },
      {
        "text": "娱乐",
        "columnId": "1"
      },
      {
        "text": "电视剧",
        "columnId": "1"
      }, {
        "text": "电影",
        "columnId": "1"
      }
    ],
    list:[
      {
        "title": "VIP专区",
        "typeId": "1",
        caseItems:{
          "listView":[
            {
              "img": "../../images/banner1.jpg",
              "name": "创业时代",
              "id": "1"
            }, {
              "img": "../../images/banner1.jpg",
              "name": "创业时代",
              "id": "2"
            }, {
              "img": "../../images/banner1.jpg",
              "name": "创业时代",
              "id": "2"
            }, {
              "img": "../../images/banner1.jpg",
              "name": "创业时代",
              "id": "2"
            }, {
              "img": "../../images/banner1.jpg",
              "name": "创业时代",
              "id": "2"
            }
          ]
        }
      }, {
        "title": "热门电视剧",
        "typeId": "2",
        caseItems: {
          "listView": [
            {
              "img": "../../images/banner2.jpg",
              "name": "创业时代",
              "id": "1"
            }, {
              "img": "../../images/banner2.jpg",
              "name": "创业时代",
              "id": "2"
            }, {
              "img": "../../images/banner2.jpg",
              "name": "创业时代",
              "id": "2"
            }, {
              "img": "../../images/banner2.jpg",
              "name": "创业时代",
              "id": "2"
            }, {
              "img": "../../images/banner2.jpg",
              "name": "创业时代",
              "id": "2"
            }
          ]
        }
      }
    ]

  },
  // 获取一级分类
  oneclassify: function (message) {
    let that = this
    const appkey = app.globalData.appkey
    const secret = app.globalData.secret
    const time = app.globalData.time
    const page_index = that.data.page
    const page_size = that.data.pageSize
    const params = { "appkey": appkey, "page_index": page_index, "page_size": page_size, "time": time}
    const sign = utils.encryption(params, secret)
    const url = app.globalData.ROOTUrl + '/video/client/longvideo/oneclassify'
    console.log("-------------"+url)
    let data = {
      appkey : appkey,
      page_index: page_index,
      page_size: page_size,
      time: time,
      sign : sign
    }
    utils.postLoading(url, 'GET', data, function (res) {
      console.log('streams ok:')
      console.log(res)
      let streamsTm = that.data.streams
      if (res.data.result) {
        if (that.data.page == '1') {
          streamsTm = []
        }
        if (parseInt(that.data.page) > res.data.data.pager.totalPage) {
          that.setData({
            hasMoreData: false
          })
          return false
        }
        let streams = res.data.data.list
        if (streams.length < parseInt(that.data.pageSize)) {
          that.setData({
            streams: getPeriods(streamsTm.concat(streams)),
            hasMoreData: false
          })
        } else {
          that.setData({
            streams: getPeriods(streamsTm.concat(streams)),
            hasMoreData: true,
            page: parseInt(that.data.page) + 1 + ''
          })
        }
      } else {
        wx.showToast({
          title: res.data.message,
        })
      }
    }, function (res) {
      console.log('streams fail:')
      console.log(res)

      wx.showToast({
        title: '加载数据失败',
      })
    }, function (res) {
      console.log('streams complete:' + time + "；sing:" + sign)
      console.log(res)
    }, message)
  },

  onLoad(options) {
    console.log('first onLoad监听页面加载');
    let that = this
    that.oneclassify('')
  },

  onReady() {
    console.log('first onReady监听页面初次渲染完成');
  },

  onShow() {
    console.log('first onShow监听页面显示');
  },

  onHide() {
    console.log('first onHide监听页面隐藏');
  },

  onUnload() {
    console.log('first onUnload监听页面卸载');
  }
});
