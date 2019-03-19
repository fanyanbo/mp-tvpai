import utils from '../../utils/util';
const api = require('../../api/api.js');
export {
  utils,
}
const app = getApp()

Page({
  data: {
    isShowTips: false,
    showoverList:false,
    isShowDoc:false,
    historyList:[],
    management_good: false,
    select_all: false,
    batchdel:"",

  },


  // 管理纪录
  management: function () {
    let that = this;
    that.setData({
      management_good: true,
    })
  },
  finish_management: function () {
    let that = this;
    that.setData({
      management_good: false,
    })
  },
  // 选择
  select: function (e) {
    var that = this;
    let arr2 = [];
    if (that.data.management_good == false) {
      return;
    } else {
      var arr = that.data.historyList;
      var index = e.currentTarget.dataset.id; 
      var str="";     
      arr[index].checked = !arr[index].checked; 
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].checked) {
          arr2.push(arr[i].video_id)
        }
      };
      str = arr2.join(",")
      console.log(str);
      that.setData({
        historyList: arr,
        batchdel: str
      })

    }
  },
  // 删除
  deleteitem: function () {
    var that = this;
    let arr = that.data.historyList;
    let arr2 = [];   
    let str = "";  
    str = that.data.batchdel;
    str = "{"+str+"}"
    console.log(str)
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].checked == false) {
        arr2.push(arr[i]);
      }
    }

    const secret = app.globalData.secret
    var paramsStr = { "appkey": app.globalData.appkey, "del_ids": str, "time": app.globalData.time, "version_code": app.globalData.version_code, "vuid": wx.getStorageSync("wxopenid") }
    var sign = utils.encryptionIndex(paramsStr, secret)
    console.log(paramsStr)
    const url = api.batchdelUrl
    let data = {
      appkey: app.globalData.appkey,
      del_ids: str,
      time: app.globalData.time,
      version_code: app.globalData.version_code,
      vuid: wx.getStorageSync("wxopenid"),
      sign: sign,
    }
    utils.postLoading(url, 'GET', data, function (res) {
      console.log(res.data);
      if (res.data.code == 0) {
        that.setData({
          historyList: arr2,
          batchdel: ""
        })
        wx.showToast({
          title: '删除成功',
        })
        if (arr2.length == 0){
          that.setData({
            isShowDoc: false,
          })    
        }
      }
    }, function (res) {
      console.log('streams fail:')
      console.log(res)
      utils.showToastBox("加载数据失败", "loading")
    }, function (res) {
      console.log('streams complete:')
      console.log(res)
    }, "")



  },
  // 全选
  select_all: function () {
    let that = this;
    that.setData({
      select_all: !that.data.select_all
    })
    if (that.data.select_all) {
      let arr = that.data.historyList;
      let arr2 = [];
      let arr3 = [];
      let str = "";
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].checked == true) {
          arr2.push(arr[i]);
          arr3.push(arr[i].video_id);
        } else {
          arr[i].checked = true;
          arr2.push(arr[i]);
          arr3.push(arr[i].video_id);
        }
      }
      str = arr3.join(",")
      console.log(str);
      that.setData({
        historyList: arr2,
        batchdel: arr3
      })
    }
  },
  // 取消全选
  select_none: function () {
    let that = this;
    that.setData({
      select_all: !that.data.select_all
    })
    let arr = that.data.historyList;
    let arr2 = [];
    for (let i = 0; i < arr.length; i++) {
      arr[i].checked = false;
      arr2.push(arr[i]);
    }
    that.setData({
      historyList: arr2,
    })
  },





  historyList: function (e) {
    let that = this
    const secret = app.globalData.secret
    const vuid = wx.getStorageSync('wxopenid')
    console.log(vuid);
    const params = { "appkey": app.globalData.appkey, "time": app.globalData.time, "tv_source": app.globalData.tvSource, "version_code": app.globalData.version_code, "vuid": vuid }
    console.log(params);
    const sign = utils.encryptionIndex(params, secret)
    const url = api.pushhistorylistUrl
    let data = {
      appkey: app.globalData.appkey,
      vuid: vuid,
      time: app.globalData.time,
      tv_source: app.globalData.tvSource,
      version_code: app.globalData.version_code,
      sign: sign
    }
    utils.postLoading(url, 'GET', data, function (res) {
      console.log(res.data)
      if (res.data.data) {
        let withinList = res.data.data.movies_within_serven_days
        let overList = res.data.data.movies_over_serven_days

        for (let i = 0; i < res.data.data.movies_within_serven_days.length; i++){
          withinList[i].checked = false;
        }
        for (let i = 0; i < res.data.data.movies_over_serven_days.length; i++) {
          overList[i].checked = false;
        }
        var historyList = withinList.concat(overList);
        console.log(historyList);
        if (historyList.length == 0){
          that.setData({
            isShowDoc: false,
          }) 
        }else{
          that.setData({
            historyList: historyList,
            isShowDoc: true
          })
        }
      }
    }, function (res) {
      console.log('streams fail:')
      console.log(res)
      wx.showToast({
        title: '加载数据失败',
      })
      that.setData({
        isShowDoc: false,
      });
    }, function (res) {
      console.log('streams complete:')
    }, '')
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.historyList();
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})