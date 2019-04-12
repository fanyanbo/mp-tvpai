import utils from '../../utils/util';
const api = require('../../api/api.js');
const utils_fyb = require('../../utils/util_fyb');
export {
  utils,
}
const app = getApp()

Page({
  data: {
    isShowTips: false,
    bIphoneFullScreenModel: false,
    showoverList: false,
    isShowDoc: false,
    historyList: [],
    management_good: false,
    select_all: false,
    batchdel: "",
    length: 0,

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
      var album_id = e.currentTarget.dataset.albumid;
      wx.navigateTo({
        url: '../../pages/movieDetail/movieDetail?id=' + album_id,
      });
    } else {
      var arr = that.data.historyList;
      var index = e.currentTarget.dataset.id;
      var str = "";
      console.log(arr)
      console.log("==============" + index)
      for (var k = 0; k < arr.length; k++) {
        var list = that.data.historyList[k].list;
        for (let i = 0; i < list.length; i++) {
          if (list[i].id == index) {
            console.log("------------")
            list[i].checked = !list[i].checked;
          }
          if (list[i].checked) {
            arr2.push(list[i].video_id)
          }
        };

      }
      str = arr2.join(",")
      console.log(str);
      that.setData({
        historyList: arr,
        batchdel: str,
        length: arr2.length
      })

    }
  },
  // 删除
  deleteitem: function () {
    var that = this;
    let str = "";
    str = that.data.batchdel;
    str = "{" + str + "}"
    console.log(str.length)
    if (str.length == 2) { //没有选择
      return
    }

    const secret = app.globalData.secret
    var paramsStr = {
      "appkey": app.globalData.appkey,
      "del_ids": str,
      "time": app.globalData.time(),
      "version_code": app.globalData.version_code,
      "vuid": wx.getStorageSync("wxopenid")
    }
    var sign = utils.encryptionIndex(paramsStr, secret)
    console.log(paramsStr)
    const url = api.batchdelUrl
    let data = {
      appkey: app.globalData.appkey,
      del_ids: str,
      time: app.globalData.time(),
      version_code: app.globalData.version_code,
      vuid: wx.getStorageSync("wxopenid"),
      sign: sign,
    }
    utils.postLoading(url, 'GET', data, function (res) {
      console.log(res.data);
      if (res.data.code == 0) {
        wx.showToast({
          title: '删除成功',
        })
        that.historyList();
      }
    }, function (res) {
      console.log('streams fail:')
      console.log(res)
      utils.showToastBox("加载数据失败", "loading")
    }, function (res) {
      console.log('streams complete:')
      console.log(res)
    }, "")

    // let params = { "del_ids": str, "vuid": wx.getStorageSync("wxopenid")}
    // let desParams = utils_fyb.paramsAssemble_wx(params);
    // utils_fyb.request(api.batchdelUrl, 'GET', desParams,
    //   function (res) {
    //     console.log('batchdelUrl success', res.data);
    //     if (res.data.result) {
    //       if (res.data.code == 0) {
    //         wx.showToast({
    //           title: '删除成功',
    //         })
    //         that.historyList();
    //       }
    //     } else {
    //       wx.showToast({
    //         title: res.data.message,
    //       })
    //     }
    //   },
    //   function (res) {
    //     console.log('batchdelUrl error', res);
    //     utils_fyb.showFailedToast('加载数据失败', that.data.errIconUrl)
    //   }
    // )

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
        var list = arr[i].list;
        for (let i = 0; i < list.length; i++) {
          if (list[i].checked == true) {
            arr3.push(list[i].video_id);
          } else {
            list[i].checked = true;
            arr3.push(list[i].video_id);
          }
        };
      }
      str = arr3.join(",")
      console.log(str);
      that.setData({
        historyList: arr,
        batchdel: arr3,
        length: arr3.length
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
    for (let i = 0; i < arr.length; i++) {
      var list = arr[i].list;
      for (let i = 0; i < list.length; i++) {
        list[i].checked = false;
      };
    }
    that.setData({
      historyList: arr,
      batchdel: '',
      length: 0
    })
  },

  historyList: function (e) {
    let that = this
    const secret = app.globalData.secret
    const vuid = wx.getStorageSync('wxopenid')
    console.log(vuid);
    const params = {
      "appkey": app.globalData.appkey,
      "time": app.globalData.time(),
      "tv_source": utils_fyb.getTvsource(),
      "version_code": app.globalData.version_code,
      "vuid": vuid
    }

    console.log(params);
    const sign = utils.encryptionIndex(params, secret)
    const url = api.pushhistorylistUrl
    let data = {
      appkey: app.globalData.appkey,
      vuid: vuid,
      time: app.globalData.time(),
      tv_source: utils_fyb.getTvsource(),
      version_code: app.globalData.version_code,
      sign: sign
    }
    utils.postLoading(url, 'GET', data, function (res) {
      console.log(res.data)
      if (res.data.data) {
        let _withinObj = {}
        let _overObj = {}
        let withinList = res.data.data.movies_within_serven_days
        let overList = res.data.data.movies_over_serven_days
        for (let i = 0; i < res.data.data.movies_within_serven_days.length; i++) {
          withinList[i].checked = false;
          withinList[i].id = i;
        }
        for (let i = 0; i < res.data.data.movies_over_serven_days.length; i++) {
          overList[i].checked = false;
          overList[i].id = res.data.data.movies_within_serven_days.length + i;
        }

        var key = "time";
        var _key = "list";
        _withinObj[key] = "一周内";
        _withinObj[_key] = withinList;
        _overObj[key] = "更早";
        _overObj[_key] = overList;

        var historyList = []
        if (withinList.length != 0) {
          historyList.push(_withinObj)
        }
        if (overList.length != 0){
          historyList.push(_overObj)
        }

        console.log(historyList);
        if (withinList.length == 0 && overList == 0) {
          that.setData({
            isShowDoc: false,
          })
        } else {
          that.setData({
            historyList: historyList,
            isShowDoc: true,
            length: 0,
            management_good: false,
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

  onLoad: function () {
    this.historyList();
  },
  onShow: function() {
    this.setData({
      isShowTips: app.globalData.isShowTips,
      bIphoneFullScreenModel: app.globalData.bIphoneFullScreenModel
    });
  }
})