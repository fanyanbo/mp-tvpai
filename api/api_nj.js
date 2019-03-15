/***
 * 网络请求
 */
class Api {

  constructor() {
    this.host = 'https://user.coocaa.com/aimp/';
    // this.host = 'http://192.168.1.107:40001/';
  }

  request(url, data, method, success, fail, complete) {
    wx.request({
      url: url,
      data: data,
      method: method,
       // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/json;utf-8',
      }, // 设置请求的 header
      success: function (res) {
        var data = res.data;
        console.log(data);
        success && typeof success === 'function' && success(data);
      },
      fail: function (error) {
        console.log(url, error);
        // fail
        fail && typeof fail === 'function' && fail(error);
      },
      complete: function () {
        // complete
        complete && typeof complete === 'function' && fail(complete);
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
   *  code: xxx, // wx.login的数据
   *  wxUserInfo: xxx, // 解密的数据
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
      // url: 'https://user.coocaa.com/aimptest/mp/pushVoice',
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
    let url = ' https://user.coocaa.com/tvpaiNew/push/checkOnline?activeId='
    this._post(url + options.data.activeid, options.data, options.success, options.fail)
  }
}

module.exports = new Api();