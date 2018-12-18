var utils = require('../../utils/util.js')
var api = require('../../config/config.js')
var app = getApp()
Page({
  data: {
    focus: false,
    flag: true,
    inputValue: '',
    searchKey:true
  },
  bindButtonTap: function () {
    this.setData({
      focus: true,
      flag: false
    })
  },
  blurTap:function(){
    // 搜索框失去焦点
    this.setData({
      focus: false,
      flag: true
    })
  },
  searchSure:function(e){
  // 关键字搜索
    var keyword = e.detail.value
    console.log(keyword)
    console.log("formid：")
    console.log(e.detail.formId)
    wx.setStorageSync("formid", e.detail.formId)
    searchMovie(this,keyword)
    var type = "keySearch"
    keyword = keyword.replace(/[\s|\~|`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\|\[|\]|\{|\}|\;|\：|\"|\'|\,|\<|\.|\>|\/|\?]/g, "")
    keyword = encodeURI(keyword, 'utf-8')
    utils.eventCollect(type, keyword)
  },
  tagClick:function(e){
    // 标签点击搜索 跳到search
    var categoryId = e.currentTarget.dataset.category
    wx.navigateTo({
      url: '../sresult/sresult?category_id=' + categoryId
    })

  },
  hotClick:function(e){
    searchMovie(this, e.currentTarget.dataset.content)
  },
  closeSearch:function(){
    this.setData({
      searchKey:true
    })
  },
  onLoad:function(){
    hotSearch(this)
  }
})

// 搜索
function searchMovie(that,keyword){
  var url = api.searchUrl
  var ccsession = wx.getStorageSync("cksession")
  that.setData({
    tvTilte: keyword
  })
  keyword = keyword.replace(/[\s|\~|`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\|\[|\]|\{|\}|\;|\：|\"|\'|\,|\<|\.|\>|\/|\?]/g, "")
  console.log("keyword:" + keyword)
  keyword = encodeURI(keyword, 'utf-8')
  var paramsStr = { "ccsession": ccsession, "keyword": keyword } 
  var sign = utils.encryption(paramsStr, app.globalData.key)

  var dataStr = utils.json2Form({ client_id: 'applet', sign: sign, param: '{"ccsession":"' + ccsession + '","keyword":"' + keyword + '"}' })
  console.log("dataStr--------------------------")
  console.log(dataStr)
 
  wx.request({
    url: url,
    data: dataStr,
    method: 'post',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: res => {
       utils.showToastBox("加载中...", "loading")
      if (res.data.result && res.data.data!=null){
        console.log("mmmm====================xxx")
        console.log(res.data)
          //搜索成功 设置searchKey 为false
          // 展示搜索关键字内容
          that.setData({
            videoList: res.data.data.videos,
            searchKey: false
          })
     
      }else{
        utils.showToastBox(res.data.message, "loading")
      }
      // console.log(res.data)
    },
    error:function(){
      utils.showToastBox('搜索失败', "loading")
    }
  })
}


function hotSearch(that) {
  var paramsStr = { "ccsession": wx.getStorageSync("cksession") }
  var sign = utils.encryption(paramsStr, app.globalData.key)
  wx.request({
    url: api.getHotSearchListUrl,
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
      if (res.data.data != null) {
        that.setData({
          hotSearch: res.data.data.hot_word_list
        })
      }
    },
    fail: function (res) {
      utils.showToastBox(res.data.msg, "loading")
    }
  })
}

