const config = require('../config/index');

class Api {

  constructor() {
    this.host = config.baseUrl_nj + '/aimp/';
  }

  request(url, data, method, success, fail, complete) {
    wx.request({
      url: url,
      data: data,
      method: method,
       // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/json;utf-8',
      }, 
      success: function (res) {
        var data = res.data;
        console.log(data);
        success && typeof success === 'function' && success(data);
      },
      fail: function (error) {
        console.log(url, error);
        fail && typeof fail === 'function' && fail(error);
      },
      complete: function (msg) {
        complete && typeof complete === 'function' && complete(msg);
      }
    })
  }

  _get(url, data, success, fail, complete) {
    this.request(url, data, 'GET', success, fail, complete);
  }

  _post(url, data, success, fail, complete) {
    this.request(url, data, 'POST', success, fail, complete);
  }

  /**
   * 获取openid
   */
  handleGetOpenId(options) {
    this._post(this.host + 'mp/updateSession', options.data, options.success)
  }
  /**
   * 验证用户
   */
  handleVerifyUser(options) {
    this._post(this.host + 'mp/verifyUser', options.data, options.success, options.fail)
  }
  /**
   * detail:{
   *  code: close_icon, // wx.login的数据
   *  wxUserInfo: close_icon, // 解密的数据
   * }
   */
  parseWxUser({data,success,fail}){
    this._post(this.host + 'mp/parseWxUser', data, success, fail);
  }

  /**
   * 是否绑定电视
   */
  getBindTv(options) {
    this._post(this.host + 'mp/getBindTv', options.data, options.success, options.fail)
  }
  /**
   * 绑定电视
   */
  handleBindTv(options) {
    this._post(this.host + 'mp/bindTv', options.data, options.success, options.fail);
  }
  /**
   * 解除绑定电视
   */
  handleUnBindTv(options) {
    this._post(this.host + 'mp/unbindTv', options.data, options.success, options.fail);
  }
  /**
  * 获取是否在线
  */
  handleIsOnline(options) {
    this._post(this.host + 'mp/isOnline', options.data, options.success, options.fail);
  }
  /**
  * 获取百度腾讯识别接口
  */
  handleRecognitionType(options) {
    this._post(this.host + 'mp/getRecognitionType', options.data, options.success, options.fail);
  }
  /**
   * 遥控器指令
   */
  pushController(options) {
    this._post(this.host + 'wxVip/pushController', options.data, options.success, options.fail)
  }
  /**
   * 推送文本
   */
  pushText(options) {
    this._post(this.host + 'wxVip/pushText', options.data, options.success, options.fail)
  }
  /**
   * 从后台动态获取提示信息
   */
  getMpTips(options){
    this._post('https://user.coocaa.com/tv/ai/mp/tips', options.data, options.success, options.fail)
  }
  /**
   * 上传语音文件
   */
  uploadFile(options) {
    console.log(options)
    wx.uploadFile({
      url: 'https://user.coocaa.com/aimp/mp/pushVoice',
      filePath: options.data.tempFilePath,
      name: 'file',
      formData: {openid:options.data.openid},
      success:options.success,
      fail:options.fail,
      complete:options.complete
    })
  }
  /**
   * 检测TV是否在线，及TV端小维AI版本是否支持小程序
   */
  isTVOnline(options) {
    let url = 'https://user.coocaa.com/tvpaiNew/push/checkOnline?activeId='
    this._post(url + options.data.activeid, options.data, options.success, options.fail, options.complete)
  }

  //刷新被绑定设备状态（小维AI版本是否支持小程序）
  isTVSupportMP(activeid) {
    let that = this;
    return new Promise(function (resolve, reject) {
      console.log('isTVSupportMP, activeid:' + activeid)
      let bBindedTVSupportMP = false;
      if (!activeid) { //如果没绑定设备，不获取直接resolve交给后续流程
        resolve(bBindedTVSupportMP)
        return;
      }
      let dataOnline = {
        activeid: activeid
      }
      that.isTVOnline({
        data: dataOnline,
        success(res) {
          console.log("isTVOnline success res:" + JSON.stringify(res))
          if (res.supportApplet == "yes") {//TV小维AI版本支持遥控
            bBindedTVSupportMP = true
          } else {
            bBindedTVSupportMP = false
          }
          resolve(bBindedTVSupportMP)
        },
        fail(res) {
          console.log("isTVOnline fail:" + res)
          // wx.showToast({
          //   title: '获取失败请重试',
          //   icon: 'none',
          //   image: '../../images/components/remotecontrol/close@3x.png'
          // })
          resolve(bBindedTVSupportMP)//fail时，如何toast提示用户？
        }
      });
    })
  } 
}

module.exports = new Api();