// pages/login/login.js
const utils = require('../../utils/util_fyb')
const user_login = require('../../api/user/login')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    rpxNavBarHeight: 0, //绝度定位需要减去导航栏高度
    SubPages: { //枚举当前显示的子页面
      LOGIN_HOME: 1, //登录首页
      LOGIN_BY_WECHAT: 2,
      LOGIN_BY_MOBILE: 3, //手机号登录页
      LOGIN_BY_ACCOUNT: 4, //账号密码登录页

      HASLOGIN_HOME: 101, //已登录首页
      HASLOGIN_REVISE_MOBILE: 102, //修改手机号页
      HASLOGIN_REVISE_NAME: 103,  //修改名称页
    },
    curSubPage: 0,//当前所处子页面,取值见this.data.SubPages
    login_wechat_url: 'https://beta-wx.coocaa.com/users/miniprogram/usercenter/login.html?ccSession=',
    //-- 登录变量 start --
    arrLoginType: [ //登录类型 
      { id: 1, type: '微信登录', image: '../../images/my/login/wechat.png'},
      { id: 2, type: '手机登录', image: '../../images/my/login/mob.png' },
      { id: 3, type: '账号登录', image: '../../images/my/login/acct.png' },
    ],
    userinput_mob: 0,
    userinput_pw: 0,
    userinput_vcode: 0,
    //-- 登录变量 end --
    
    //-- 修改用户信息 start --
    inputValue: '',
    //-- 修改用户信息 end --

    //todo mock data
    curUser: { //当前用户账户信息  
      name: '冈拉梅朵',
      mob: '13555555555',
      wechat: '微信昵称很长长'
    },
    loginRevise: { //已登录后修改账号昵称或手机号的提示
      name: {title: '修改账号昵称', type: 'text', btn: '完成'},
      mob: { title: '修改手机号', type: 'number', btn: '确认更换手机号' }
    },
  },
  // -- 登录方法 start --
  inputAccountBlur(e) { //账号密码登录-获取账号
    console.log('account blur:' + JSON.stringify(e.detail))
    this.data.userinput_mob = e.detail.value;
    //todo 校验并处理异常
    //todo 校验页面验证码，并处理异常
  },
  inputPasswordBlue(e) { //账号密码登录-获取账号
    console.log('pw blur:' + JSON.stringify(e.detail))
    this.data.userinput_pw = e.detail.value;
    //todo 校验并处理异常
    //todo 校验页面验证码，并处理异常
  },
  startLoginByAcct(e) { //账号密码登录
    if (!e.detail.userInfo) {
      // 如果用户拒绝直接退出，下次依然会弹出授权框
      return;
    }
    if (!this.data.userinput_mob || !this.data.userinput_pw) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的账号密码',
        showCancel: false
      })
      return
    }
    Promise.resolve().then(() => {
      if (wx.getStorageSync('new_cksession')) {
        return user_login.acctLogin(this.data.userinput_mob, this.data.userinput_pw)
      } else {
        return user_login.getWXAuth(e.detail)
          .then(() => {
            user_login.mobLogin(this.data.userinput_mob, this.data.userinput_pw)
          })
      }
    }).then((res) => {
      // 登录成功，返回首页
      wx.showToast({
        title: '登录成功',
      })
      wx.navigateBack({ delta: 2 }) //跳到我的页面
      }).catch((res) => {
        // 登录失败
        wx.showToast({
          title: '登录失败请重试',
          icon: 'none'
        })
      })
  },
  inputMobileBlur(e) { //手机号登录-手机号码输入完毕
    console.log('input blur:' + JSON.stringify(e.detail))
    this.data.userinput_mob = e.detail.value;
    //todo 校验手机号码，并处理异常
    //todo 校验页面验证码，并处理异常
  },
  getVCode() { //获取验证码
    console.log('getVCode...')
    user_login.vcode(this.data.userinput_mob)
    //todo 处理验证码逻辑，1min内置灰并显示倒计时
  },
  inputVCodeBlur(e) { //手机号登录-验证码输入完毕
    this.data.userinput_pw = e.detail.value;
    //todo 输入为空时的异常提示
  },

  startLoginByMob(e) { //手机号登录 //todo 需要优化，不需要再用getusrinfo type button即可
    if (!e.detail.userInfo) {
      // 如果用户拒绝直接退出，下次依然会弹出授权框
      return;
    }
    if (!this.data.userinput_mob || !this.data.userinput_pw) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的手机号或验证码',
        showCancel: false
      })
      return
    }
    Promise.resolve().then(() => { //todo 流程是否可优化 代码冗余
      if (wx.getStorageSync('new_cksession')) {
        return user_login.mobLogin(this.data.userinput_mob, this.data.userinput_pw)
      } else {
        return user_login.getWXAuth(e.detail)
                .then(() => {
                  user_login.mobLogin(this.data.userinput_mob, this.data.userinput_pw)
                })
      }
    }).then((res) => {
      // 登录成功，返回首页
      wx.showToast({
        title: '登录成功',
      })
      wx.navigateBack({delta: 2}) //调回到登录前页面
    })
  },
  _startLoginByWechat(e) { //微信登录
    if(!e.detail.userInfo) {
      //如果用户拒绝直接退出，下次依然会弹出授权框
      return;
    }
    Promise.resolve().then(() => {
      return new Promise((resolve, reject) => {
        let ccsession = wx.getStorageSync('new_cksession')
        if (ccsession) {
          resolve(ccsession)
        } else {
          user_login.getWXAuth(e.detail).then( () => {
              let ccsession = wx.getStorageSync('new_cksession')
              resolve(ccsession)
            }).catch(err => {
              reject(err)
            })
        }
      })
    }).then((ccsession) => {
      return wx.navigateTo({
        url: '../login/login?stage=' + this.data.SubPages.LOGIN_BY_WECHAT,
      })
    })
  },
  chooseLoginType(e) { //选择登录方式
    let cur = +e.currentTarget.dataset.id
    console.log('login type: ' + cur)
    switch (cur) {
      case 1: cur = this.data.SubPages.LOGIN_BY_WECHAT; break; 
      case 3: cur = this.data.SubPages.LOGIN_BY_ACCOUNT; break;
      case 2: 
      default: cur = this.data.SubPages.LOGIN_BY_MOBILE; break;
    }
    if (cur == this.data.SubPages.LOGIN_BY_WECHAT) {
      this._startLoginByWechat(e)
    }else {
      wx.navigateTo({
        url: `../login/login?stage=${cur}`,
      })
    }
  },
  startLogout() { //退出登录
    wx.showModal({
      title: '提示',
      content: '确认退出酷开账号吗?',
      success(res) {
        if (res.confirm) {
          user_login.userLogout().then(() => {
            wx.navigateBack({})
          })
        }
      }
    })
  },
  wechatH5GetMsg(e) { //H5页面消息
    console.log(e)
    let userInfo = e.detail.data
    if(!userInfo) {
      return 
    }
    userInfo = userInfo[0]
    user_login.ccloginByWechatH5(userInfo)
  },
  wechatH5Load(e) { //H5页面加载成功
    // console.log(e)
  },
  wechatH5Error(e) { //H5页面加载成功
    // console.log(e)
  },
  // -- 登录方法 end --
  handleGobackClick(e){ //返回
    wx.navigateBack()
  },

  // -- 修改昵称 start --
  goChangeNickname(e) {//修改账号昵称
    let stage = this.data.SubPages.HASLOGIN_REVISE_NAME
    wx.navigateTo({
      url: `../login/login?stage=${stage}`,
    })
  },
  getInputValue(e) {
    console.log('input blur:' + JSON.stringify(e.detail))
    this.data.inputValue = e.detail.value;
  },
  clearInputValue(e) {
    this.setData({ inputValue: '' })
  },
  confirmInputValue(e) {
    console.log(this.data.inputValue)
    user_login.login_changeNickname(this.data.inputValue).then( res => {
      wx.showToast({
        title: '修改成功',
      })
    }).catch( err => {
      wx.showToast({
        title: '修改失败请重试',
        icon: 'none'
      })
    })
  },
  // -- 修改昵称 end --

  refreshVCode(e) {//刷新验证码

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      rpxNavBarHeight: utils.getNavBarHeight().rpxNavBarHeight + 'rpx'
    })
    if(options.stage) { //登录页内跳转
      if (+options.stage == this.data.SubPages.LOGIN_BY_WECHAT) {
        let ccsession = wx.getStorageSync('new_cksession')
        this.setData({
          login_wechat_url: this.data.login_wechat_url + ccsession
        })
        // //test
        // let url = 'https://beta.webapp.skysrt.com/yuanbo/wx/wechat1.html?ccsession=' + ccsession
        // this.setData({
        //   login_wechat_url: url
        // })
      }
      this.setData({
        curSubPage: +options.stage
      })
    } else { //从其它页到登录页
      if (!!getApp().globalData.ccUserInfo) {
        this.setData({
          curSubPage: this.data.SubPages.HASLOGIN_HOME
        })
      }else {
        this.setData({
          curSubPage: this.data.SubPages.LOGIN_HOME
        })
      }
    }
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