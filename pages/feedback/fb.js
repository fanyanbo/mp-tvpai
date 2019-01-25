var utils = require('../../utils/util.js');
var api = require('../../api/api.js');
Page({
  data: {
    disabled: false
  },
  bindFormSubmit: function (e) {
    if (utils.ccsessionIs()== null) return
    var that = this
    var content = e.detail.value.textarea
    console.log(content == "" || content == null)
    if (content == "" || content == null) {
      utils.showToastBox("输入为空", "loading")
      return
    } else{
      that.setData({
        disabled: true,
      })
    }
    content = encodeURI(content, 'utf-8')
    console.log(content)
    var url = api.saveUserFeedbackUrl
    var key = '9acd4f7d5d9b87468575b240d824eb4f'
    var ccsession = wx.getStorageSync("cksession")
    var paramsStr = {"ccsession": ccsession, 'content': content }
    var sign = utils.encryption(paramsStr, key)
    
      var dataStr = utils.json2Form({ client_id: 'applet', sign: sign, param: '{"ccsession":"' + ccsession + '","content":"' + content + '"}' })
      wx.request({
        url: url,
        data: dataStr,
        method: 'post',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: res => {
          if (res.data.result) {
            console.log("获取反馈接口成功")
           wx.navigateTo({
             url: '../fbBack/fbBack',
           })
            that.setData({
              disabled: true,
              inputContent: '   '
            })
          } else {
            utils.showToastBox("反馈失败，请重试", "loading")
          }
        }
      })
  
  },
  onLoad: function () {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
        });
      }
    });
  },
  onshow: function () {

  }
})