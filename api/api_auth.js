'use strict';

const app = getApp();

class AuthApi {
 
  /**
   * 检验用户权限
   */
  checkUserInfoPriority({success}){
    wx.getSetting({
      success: (res) => {
        success && success(!!res.authSetting['scope.userInfo']);
      },
    })
  }
  /**
   * 检验用户录音权限
   */
  checkRecordPriority({ success }) {
    wx.getSetting({
      success: (res) => {
        success && success(!!res.authSetting['scope.record']);
      },
    })
  }
}

module.exports = new AuthApi();







