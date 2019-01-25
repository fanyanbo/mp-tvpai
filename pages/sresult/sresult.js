var utils = require('../../utils/util.js')
var api = require('../../api/api.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag: true,
    tabAll:'tabAll',
    tabShow:'show',
    tagListAbsolute:'',
    activeIndex:0,
    active:0,
    pageIndex:0
  },
  tabClick:function(e){
    console.log(e)
    // 点击全部展开或收起展示
    var tabAlls, tabShows, flags, tagListAbsolutes;
    if (e.currentTarget.dataset.tab == 'show'){
      tabShows = 'hidden'
      tabAlls = "tabOpen"
      flags = false
      tagListAbsolutes = 'tagListAbsolute'
      
    }else{
      tabShows = 'show'
      tabAlls = "tabAll"
      flags = true
      tagListAbsolutes = ''
    }
    this.setData({
      tabAll: tabAlls,
      tabShow: tabShows,
      flag: flags,
      tagListAbsolute: tagListAbsolutes
    });
  },
  movieclick:function(e){
    console.log(e);
    var type = "movieItem"
    utils.eventCollect(type, e.currentTarget.dataset.id)
  },
  tagClick:function(e){
    var that = this
    var channelId = that.data.channelId
    var sorts = e.currentTarget.dataset.sortvalue
    var filters = e.currentTarget.dataset.filtervalue
    var extraCondition = e.currentTarget.dataset.exvalue
    that.setData({
      pageIndex: 0,
      contentAll: [],
      sorts: sorts,
      filters: filters,
      extraCondition: extraCondition,
      activeIndex:'dd',
      activeIndex2: e.currentTarget.dataset.index
    })
    var type = "classifyClick"
    console.log(channelId)
    console.log("formid：")
    console.log(e.detail.formId)
    wx.setStorageSync("formid", e.detail.formId)
    utils.eventCollect(type, channelId)
    searchContent(that, channelId, sorts, filters, extraCondition)
    
  },
  radioChange: function (e) {
    console.log('======radio发生change事件，携带value值为：', e.detail.value)
    console.log(e)
    //  this.setData({
    //    active: e.detail.value
    // })
  },
  secondTag:function(e){
    console.log("事件——=-======")
    console.log(e)
    // this.setData({
    //   activeIndex: e.currentTarget.dataset.num
    // })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    utils.showToastBox('加载中...', "loading")
    console.log(options.category_id)
    var that = this
    var paramsStr = { "ccsession": wx.getStorageSync("cksession"), "channelId": options.category_id}
    var sign = utils.encryption(paramsStr, app.globalData.key)
    wx.request({
      url: api.getSubChnListUrl,
      data: {
        client_id: 'applet',
        sign: sign,
        param: paramsStr
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'GET',
      success: function (res) {
        
        if (res.data.data!=null){
          console.log(res.data.data.sub_chn_list)
          that.setData({
            firstChn: res.data.data.sub_chn_list,
            channelId: res.data.data.chn_id

          })
        }else{
          utils.showToastBox(res.data.errMsg, "loading")
        }
        
      }
    })
    secondChn(that, options.category_id)
    // var channelId = ''

    searchContent(that, options.category_id)
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
    console.log('onPullDownRefresh')
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('onReachBottom')
    var that = this
    searchContent(that, that.data.channelId, that.data.sorts, that.data.filters, that.data.extraCondition)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },
  chioceChn:function(e){
    var that = this
    var channelId = that.data.channelId
    var sorts = e.currentTarget.dataset.sortvalue
    var filters = e.currentTarget.dataset.filtervalue
    var extraCondition = e.currentTarget.dataset.exvalue
    that.setData({
      pageIndex:0,
      contentAll:[],
      sorts: sorts,
      filters: filters,
      extraCondition: extraCondition,
      activeIndex: e.currentTarget.dataset.isd,
      activeIndex2: 'aa',
    })
    searchContent(that, channelId, sorts, filters, extraCondition)
  }
})


function secondChn(that,channelId){
  var paramsStr = { "ccsession": wx.getStorageSync("cksession"), "channelId": channelId }
  var sign = utils.encryption(paramsStr, app.globalData.key)
  wx.request({
    url: api.getTagListUrl,
    data: {
      client_id: 'applet',
      sign: sign,
      param: paramsStr
    },
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'GET',
    success: function (res) {
      // console.log(res.data.data.tags)
      if (res.data.result && res.data.data!=null) {
        var arr =[];
        for (var k in res.data.data.tags){
          arr.push(res.data.data.tags[k])
        }

        that.setData({
          secondchn: arr
        })

        // console.log("=============================-------------------===========")
        // console.log(arr)
      } else {
        utils.showToastBox(res.data.message, "loading")
      }

    }
  })
}

function searchContent(that, channelId, sorts, filters, extraCondition){
  var ccsession = wx.getStorageSync("cksession")
  var paramsStr = { "ccsession": ccsession, "channelId": channelId, "pageIndex": that.data.pageIndex }
  var sign = utils.encryption(paramsStr, app.globalData.key)
  var dataStr = utils.json2Form({ client_id: 'applet', sign: sign, param: '{"ccsession":"' + ccsession + '","channelId":"' + channelId + '","pageIndex":"' + that.data.pageIndex + '"}' })
  if (filters!=undefined){
    sorts = encodeURI(sorts, 'utf-8')
    filters = encodeURI(filters, 'utf-8')
    extraCondition = encodeURI(extraCondition, 'utf-8')
    console.log("条件筛选!")
    paramsStr = { "ccsession": ccsession, "channelId": channelId, "extraCondition": extraCondition, "filters": filters, "pageIndex": that.data.pageIndex,"sorts": sorts }
    sign = utils.encryption(paramsStr, app.globalData.key)
    dataStr = utils.json2Form({ client_id: 'applet', sign: sign, param: '{"ccsession":"' + ccsession + '","channelId":"' + channelId + '","extraCondition":"' + extraCondition + '","filters":"' + filters + '","pageIndex":"' + that.data.pageIndex + '","sorts":"' + sorts + '"}' });
  }
  
  wx.request({
    url: api.getChnVideoListUrl,
    data: dataStr,
    method: 'post',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: res => {
      console.log("==============------------ggg")
      console.log(res)
      if (res.data.result && res.data.data.data!=null) {
        var nowtotal = that.data.pageIndex*res.data.data.pageSize
          if(that.data.pageIndex==0){
            that.setData({
              contentAll: res.data.data.data.videos,
              pageIndex: parseInt(res.data.data.pageIndex) + 1
            })
          } else if (nowtotal<=res.data.data.data.total){
            that.setData({
              contentAll: that.data.contentAll.concat(res.data.data.data.videos),
              pageIndex: parseInt(res.data.data.pageIndex) + 1
            })
          }else{
            utils.showToastBox("已全部加载完！", "loading")
            return 
          }
      
      }else {
        utils.showToastBox(res.data.message, "loading")
      }

    }
  })
}