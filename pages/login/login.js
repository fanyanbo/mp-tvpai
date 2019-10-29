// pages/login/login.js
const utils = require('../../utils/util_fyb')
const user_login = require('../../api/user/login')
const user_bind = require('../../api/user/bind')
const app = getApp()

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
    login_wechat_url: `https://beta-wx.coocaa.com/users/miniprogram/usercenter/login.html?theme=coocaa-pay-login&loginMethod=weixin&redirect_uri=${encodeURIComponent('navigateBack,2')}&ccSession=`,
    //-- 登录变量 start --
    arrLoginType: [ //登录类型 
      { id: 1, type: '微信登录', image: '../../images/my/login/wechat.png'},
      { id: 2, type: '手机登录', image: '../../images/my/login/mob.png' },
      { id: 3, type: '账号登录', image: '../../images/my/login/acct.png' },
    ],
    userinput_mob: 0,
    userinput_pw: 0,
    userinputVcodeOK: false,
    //-- 登录变量 end --
    //-- 修改用户信息 start --
    inputValue: '',
    //-- 修改用户信息 end --

    curUser: { //当前用户账户信息  
      name: '',
      mob: '未绑定',
      wechat: '',//todo 需要获取微信昵称
    },
    loginRevise: { //已登录后修改账号昵称或手机号的提示
      name: {title: '修改账号昵称', type: 'text', btn: '完成'},
      mob: { title: '修改手机号', type: 'number', btn: '确认更换手机号' }
    },
    _pageVCodeObj: null,//登录页面图形二维码对象实例
    _mobMsgVCodeObj: null,//手机短信验证码实例对象
    mobMsgVCode: '获取验证码', //手机短信验证码
    mobMsgVCodeGetFunc: 'getVCode',//手机短信验证码函数-绑定字段
  },
  //---获取页面验证码 --start--
  _showPageVerificationCode() { //在画布上显示页面验证码
    let ranNum = (min, max) => Math.floor(Math.random() * (max - min)) + min 
    let sysWidth = wx.getSystemInfoSync().windowWidth
    let width = 176 * sysWidth / 750
    let height = 60 * sysWidth / 750
    let canvasid = ''
    if (this.data.curSubPage == this.data.SubPages.LOGIN_BY_MOBILE) {
      canvasid = 'vcodecanvasMob'
    }else {
      canvasid = 'vcodecanvasAcct'
    }
    let context = wx.createCanvasContext(canvasid)
    //绘制验证码
    context.setTextBaseline('middle')
    let code = this.data._pageVCodeObj.refresh()
    let i = 0
    for(let txt of code) {
      let fontsize = ranNum(height/2, height)
      context.font = `bolder ${fontsize}px sans-serif`
      context.setShadow(3, 3, 3, 'rgba(0, 0, 0, 0.3)')
      let x = width / 5 * ++i;
      let y = height / 2;
      context.translate(x, y)
      let deg = ranNum(-30, 30)
      context.rotate(deg * Math.PI / 180)
      context.fillText(txt, 0, 0)
      context.rotate(-deg * Math.PI / 180)
      context.translate(-x, -y)
    }
    context.save()
    //绘制干扰线
    for (let i = 0; i < 2; i++) {
      context.beginPath()
      context.moveTo(ranNum(0, width), ranNum(0, height))
      context.lineTo(ranNum(0, width), ranNum(0, height))
      context.stroke()
    }
    context.draw()
  },
  _getPageVerificationCode() {
    this.data._pageVCodeObj = new utils.VerificationCode()
    this._showPageVerificationCode()
  },
  pageVCodeRefresh() { //刷新页面二维码
    console.log('refresh')
    this._showPageVerificationCode()
  },
  pageVCodeVerify(e) {
    let res = this.data._pageVCodeObj.validate(e.detail.value) 
    if(typeof res == 'string') {
      this._showPageVerificationCode()
      this.data.userinputVcodeOK = false
      wx.showToast({
        title: '图形验证码输入错误,请重试',
        icon: 'none'
      })
    }else {
      this.data.userinputVcodeOK = true
    }
  },
  //---获取页面验证码 --end--
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
    if (!this.data.userinputVcodeOK) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的验证码',
        showCancel: false
      })
      return
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
      user_bind.getDeviceList().then(() => { //登录成功后刷新设备列表
        wx.showToast({
          title: '登录成功',
        })
        wx.navigateBack({ delta: 2 }) //返回登录前页面
      })
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
  getVCode() { //获取手机短信验证码
    console.log('getVCode...')
    if(!this.data.userinput_mob) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的手机号',
        showCancel: false
      })
      return
    }
    this.setData({ //disable
      mobMsgVCodeGetFunc: null
    })
    this.data._mobMsgVCodeObj =  new utils.CountDown({onProgress : (count) => { //开始倒计时
        this.setData({
          mobMsgVCode: count + '秒后再试'
        })
      }, onFinish : () => {
        this.setData({
          mobMsgVCode: '重新获取验证码',
          mobMsgVCodeGetFunc: 'getVCode', //enable
          _mobMsgVCodeObj: null,
        })
      }})
    this.data._mobMsgVCodeObj.start()
    user_login.vcode(this.data.userinput_mob)
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
    if (!this.data.userinputVcodeOK) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的图片验证码',
        showCancel: false
      })
      return
    }
    if (!this.data.userinput_mob || !this.data.userinput_pw) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的手机号或短信验证码',
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
      user_bind.getDeviceList().then(() => { //登录成功后刷新设备列表
        wx.showToast({
          title: '登录成功',
        })
        wx.navigateBack({ delta: 2 }) //返回登录前页面
      })
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
    if (!e.detail.userInfo) { // 如果用户拒绝直接退出，下次依然会弹出授权框
      return;
    }
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
    if(userInfo.code == 200) { //登录成功
      user_login.ccloginByWechatH5(userInfo.data)
      user_bind.getDeviceList().then(() => { //登录成功后刷新设备列表
        wx.showToast({
          title: '登录成功',
        })
      })
    }else {
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      })
    }
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
      this.setData({
        curSubPage: +options.stage
      })
      if (+options.stage == this.data.SubPages.LOGIN_BY_WECHAT) {
        let ccsession = wx.getStorageSync('new_cksession')
        this.setData({
          login_wechat_url: this.data.login_wechat_url + ccsession
        })
      }else {
        this._getPageVerificationCode()
      }
    }else {//从其它页到登录页
        if (options.action != 'tencentlogin' && !!getApp().globalData.ccUserInfo) { //
          this.setData({
            curSubPage: this.data.SubPages.HASLOGIN_HOME,
            'curUser.name': !!app.globalData.ccUserInfo ? app.globalData.ccUserInfo.username : '',
            'curUser.mob': !!app.globalData.ccUserInfo && !!app.globalData.ccUserInfo.mobile ? app.globalData.ccUserInfo.mobile : '未绑定',
            'curUser.wechat': !!app.globalData.ccUserInfo ? app.globalData.ccUserInfo.username : '', //todo 待从账户信息获取
          })
        } else {
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
    console.log('show')
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
    console.log('login.js unload')
    !!this.data._mobMsgVCodeObj && this.data._mobMsgVCodeObj.end()
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