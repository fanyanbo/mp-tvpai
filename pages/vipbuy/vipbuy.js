// pages/vipbuy/vipbuy.js
const user_mock = require('../../api/user/mock')
const util_fyb = require('../../utils/util_fyb.js')
const user_login = require('../../api/user/login.js')
const config = require('../../config/index.js')

var payBehavior = require('../../api/user/pay')
var packageBehavior = require('../../api/user/package')
const app = getApp()

Component({
  behaviors: [payBehavior, packageBehavior],

  data: {
    _FailPageCustomEventSubmitPageName: '', //失败页数据采集
    _FailPageCustomEventSubmitVipName: '',//失败页数据采集
    _appLaunchFrom: util_fyb.getAppLaunchSource(), //数据采集
    productListShow: [],//保存页面显示需要的信息
    PageStage: {
      HOME_PAGE: 0,
      PAY_SUCCESS_PAGE: 1,
      PAY_FAIL_PAGE: 2,
    },
    stage: 0,
    curSelectedProject: {
      id : 0,
      totalPrice : 0,
      save: 0
    },//当前选择的产品包
    _curSourceId: 0, //当前产品包的source_id值，支付成功或失败时需要
    _curVipType: '',//当前选择的产品包类型
    _orderId: null, //当前支付订单号
    _payParams: null, //当前预支付订单参数
    orderInfos: {
      userName: app.globalData.ccUserInfo.username,
      name: '',
      price: '',
      orderId: '',
      payTime: '',
      validTime: '',
    }, //当前订单信息
    _tencentType:null,
    curUserInfo: { //当前登录用户信息
      name: '',
      avatar: '',
    },
    bToastAuthTencentQQorWechat: false, //腾讯源进入产品包时，提示用户选择授权qq或微信的弹窗
    navBarTitle: '',//当前产品包名称
    benifitImg: {
      image: '', 
      height: 'oneline',//不同vip权益图片高度不同
    },//vip权益图片
    tencentAcctInfos: [ //腾讯源用户qq和微信信息
      {
        type: 'wechat',
        avatar: '../../images/my/wechat.png',
        name: '微信登录',
        valid: '无VIP',
      },
      {
        type: 'qq',
        avatar: '../../images/my/qq.png',
        name: 'QQ登录',
        valid: '无VIP',
      }
    ],
  },
  
  methods: {
    handleGobackClick(e) {//返回
      wx.navigateBack({})
    },
    _getProductPackageList(params) { //获取产品包列表
      const productPkgPromise = this.getProductPackageList(params)
      const couponsPromise = this.getCoupones(params)
      const allowancePromise = this.getAllowance()
      util_fyb. showLoadingToast('产品包加载中~')
      Promise.all([productPkgPromise, couponsPromise, allowancePromise]).then(([products, coupons, allowances]) => {
        products = products.data.data.products.filter((item) => {
            return item.product_level == 8 ? false : true;
          }).map(item => {
            return Object.assign(item, {source : params.source_id })
          })
        products = this.calAllBenefits(products, coupons, allowances)
        console.log(products)
        let focus = 0;
        let arrShow = products.map((item, index) => {
            if (item.is_focus) {
              focus = index
            }
            return {
              id: index,
              is_focus: item.is_focus,
              product_id: item.product_id,
              product_name: item.product_name,
              desc: item.desc,
              pIcon: !!item.icon_json && !!JSON.parse(item.icon_json).pIcon ? JSON.parse(item.icon_json).pIcon : '',
              is_keep_pay_product: item.is_keep_pay_product,
              price: item.discount_fee,
              oldprice: item.unit_fee,
              allowance_act_id: item.allowance_act_id,
              discount_product_id: !!item.allowancediscountproductid ? item.allowancediscountproductid : item.coupondiscountproductid,
              couponcode: item.couponcode,
              discount_price: !!item.allowanceprice ? item.allowanceprice : item.couponprice,
            }
        })
        this.setData({  
          productListShow: arrShow
        })
        this._updatePayPrice(focus)
        util_fyb. showLoadingToast('产品包加载中~', false)
      }).catch(err => {
        console.error(err)
        util_fyb. showLoadingToast('产品包加载中~', false)
        wx.showToast({
          title: '获取产品包出错，请重新进入',
          icon: 'none'
        })
      })
    },  
    _updatePayPrice(id) { //更新选中项及立即支付价格
      this.data.productListShow.map((item, index) => {
        this.setData({
          [`productListShow[${index}].is_focus`]: index == id
        })
      })
      let totalPrice = !!this.data.productListShow[id].discount_price ? this.data.productListShow[id].discount_price : this.data.productListShow[id].price;
      let save = this.data.productListShow[id].price - totalPrice;
      this.setData({
        curSelectedProject: {
          id,
          totalPrice,
          save
        }
      })
    },
    payNow(e) { //立即支付
      let button_name = '', page_name = '' //数据采集
      if (this.data.stage == this.data.PageStage.PAY_FAIL_PAGE) {
        page_name = this.data._FailPageCustomEventSubmitPageName
        button_name = '继续支付'
      }else {
        page_name = this.data.navBarTitle
        button_name = '确认支付'
      }
      wx.reportAnalytics('vip_detail_page_clicked', {
        page_name: page_name,
        button_name: button_name,
        source_name: !!this.data._appLaunchFrom ? this.data._appLaunchFrom : '我的',
      });
      util_fyb. showLoadingToast('支付中~')
      new Promise((resolve, reject) => {
        if (this.data.stage == this.data.PageStage.HOME_PAGE) {
          let params = this.data.productListShow[this.data.curSelectedProject.id]
          this.genOrder(params, this.data._tencentType).then(res => {
            this.data._orderId = res.orderId
            return this.prePay(res)
          }).then( res => {
            console.log(res)
            resolve(res)
          }).catch( err => {
            console.error(err)
            reject()
          })
        } else if (this.data.stage == this.data.PageStage.PAY_FAIL_PAGE) { //支付失败后，继续支付
          resolve()
        }
      }).then(res => {
        if (this.data.stage == this.data.PageStage.HOME_PAGE) {
          this.data._payParams = res
        }
        util_fyb. showLoadingToast('支付中~', false)
        return this.startPay(this.data._payParams)
      }).then(res => {
        console.log(res)
        let vip_name = '', page_name = '' //支付成功-数据采集
        if (this.data.stage == this.data.PageStage.PAY_FAIL_PAGE) {
          page_name = this.data._FailPageCustomEventSubmitPageName
          vip_name = this.data._FailPageCustomEventSubmitVipName
        }else {
          page_name = this.data.navBarTitle
          vip_name = this.data.productListShow[this.data.curSelectedProject.id].product_name
        }
        wx.reportAnalytics('vip_pay_success_result', {
          page_name: page_name,
          vip_name: vip_name,
          source_name: !!this.data._appLaunchFrom ? this.data._appLaunchFrom : '我的',
        });
        let stage = this.data.PageStage.PAY_SUCCESS_PAGE //todo 支付成功，页面重定向到支付成功页
        wx.navigateTo({
          url: `../vipbuy/vipbuy?stage=${stage}&orderId=${this.data._orderId}&page_name=${this.data.navBarTitle}`,
        })
      }).catch(err => {
        console.error('prePay error')
        if (!this.data._payParams || !this.data._orderId) {
          wx.showToast({
            title: '支付失败，请重试',
            icon: 'none'
          })
          return
        }
        let stage = this.data.PageStage.PAY_FAIL_PAGE //失败页处理,继续支付
        wx.navigateTo({
          url: `../vipbuy/vipbuy?stage=${stage}&orderId=${this.data._orderId}&pay=${JSON.stringify(this.data._payParams)}&page_name=${this.data.navBarTitle}&vip_name=${this.data.productListShow[this.data.curSelectedProject.id].product_name}`,
        })
      }).then(() => {
        this.data._orderId = null;
        this.data._payParams = null;
        }, () => {
          this.data._orderId = null;
          this.data._payParams = null;
        })
    },
    _pollOrderBenefitStatus(ctx, start, time) {//支付成功后，轮询订单权益开通情况, 得到结果后delay3s再查一次，超时时间15s
      new Promise( (resolve) => {
        console.log('timeout 3000')
        setTimeout(resolve, 3000)
      }).then( res =>{
        console.log('after 3s, .then')
        return ctx.queryOrderDetail(ctx.data._orderId).then(res => {
          console.log('poll then...' + res.syn_status)
          if (res.syn_status == 1) {
            ctx.setData({
              'orderInfos.validTime': util_fyb.getFormatTime(res.due_time * 1000) + '到期', //need fix
            })
            return
          }
          if (+new Date() > start + time) {
            ctx.setData({
              'orderInfos.validTime': '权益开通超时,请关注酷开会员公众号联系客服处理', //need fix
            })
            return
          }
          ctx._pollOrderBenefitStatus(ctx, start, time) 
        }).catch(err => {
          console.error(err)
        })
      })
    },
    _getOrderDetailes() { //获取订单详情
      let that = this
      this.queryOrderDetail(this.data._orderId).then( res => {
        if (this.data.stage == this.data.PageStage.PAY_SUCCESS_PAGE) {
          if (res.syn_status == 1) {
            this.setData({
              'orderInfos.name': res.order_title,
              'orderInfos.validTime': util_fyb.getFormatTime(res.due_time * 1000) + '到期', //need fix
            })
          }else {
            this.setData({
              'orderInfos.name': res.order_title,
              'orderInfos.validTime': '权益开通中，请稍候~',
            })
            setTimeout(that._pollOrderBenefitStatus, 0, that, +new Date(), 15000) 
          }
        } else if (this.data.stage == this.data.PageStage.PAY_FAIL_PAGE) {
          this.setData({
            'orderInfos.name': res.order_title,
            'orderInfos.price': res.pay_info.total_pay_fee / 100,
            'orderInfos.orderId': res.pay_info.pay_order_no,//oss_order_no, // need confirm with chenyuan.
            'orderInfos.payTime': util_fyb.getFormatTime(res.create_time * 1000),
          })
        }
      }).catch( err => {
        console.error(err)
        
      })
    },
    selectProduct(e) { //用户选择产品包
      console.log(e.currentTarget.dataset)
      let id = e.currentTarget.dataset.id;
      this._updatePayPrice(id)
      wx.reportAnalytics('vip_detail_page_clicked', {
        page_name: this.data.navBarTitle,
        button_name: this.data.productListShow[this.data.curSelectedProject.id].product_name,
        source_name: !!this.data._appLaunchFrom ? this.data._appLaunchFrom : '我的',
      });
    },
    goRollPrize() { //支付成功去抽奖
      let openid = app.globalData.ccUserInfo.openid
      let nickName = app.globalData.ccUserInfo.username
      let loginType = 0
      let wxid = app.globalData.ccUserInfo.wxVuId
      
      let url = `https://webapp.skysrt.com/activity201911/mobile-main/turntable/chou.html`
      if(config.env == 'dev') {
        url = `http://beta.webapp.skysrt.com/lqq/chou/chou.html`
      }
      url += `?openId=${openid}&nickName=${nickName}&loginType=${loginType}&wxid=${wxid}`      
      wx.navigateTo({
        url: `../webview/webview?path=${url}`
      });
    },
    _getProductSourceList() { //获取产品源列表，为了显示微信或qq VIP有效期
      return this.getProductSourceList('wechat')
        .then(res => this._tackleProductSourceList(res))
        .then(() => {
          return this.getProductSourceList('qq')
        })
        .then(res => this._tackleProductSourceList(res))
        .catch(err => {
          wx.showToast({
            title: '获取产品源失败',
            icon: 'none'
          })
        })
    },
    _tackleProductSourceList(src) {
      let list = src.sources
      list.forEach((item, index) => {
        switch (item.source_sign) {
          case '6':
            this._updateProductSourceList(0, item, src.txType)
            break;
        }
      })
    },
    _updateProductSourceList(index, item, txType) {//更新页面的产品源列表arr
      let valid = '开通权限'
      if (item.valid_type == 1) {//有效期
        if (item.valid_scope.end_readable) {
          valid = item.valid_scope.end_readable.substr(0, 10).replace(/-/g, '.').concat('到期')
        } else if (item.valid_scope.end) {
          let time = new Date(item.valid_scope.end * 1000)
          let year = time.getFullYear();
          let month = time.getMonth() + 1;
          let day = time.getDate();
          let d = year + "." + (month < 10 ? ("0" + month) : month) + "." + ((day < 10 ? ("0" + day) : day) + "到期");
          valid = d
        }
      }
      if (txType == 'wechat') {
        this.setData({
          'tencentAcctInfos[0].valid': valid
        })
      } else if (txType == 'qq') {
        this.setData({
          'tencentAcctInfos[1].valid': valid
        })
      }
    },

    goVipPageTencentSource(e) { //显示腾讯源的产品包购买页
      this.setData({ bToastAuthTencentQQorWechat: false })
      this.data._tencentType = e.currentTarget.dataset.type
      this._getProductPackageList({ source_id: this.data._curSourceId, txType: this.data._tencentType })
    },
    closeToastAuthTencentQQorWechat() { //关闭腾讯源授权弹窗
      wx.navigateBack()
    },
    _checkHasBoundDevice() { //检查是否绑定设备
      if (!!Object.keys(app.globalData.boundDeviceInfo).length) {
        let that = this
        wx.showModal({
          title: '温馨提示',
          content: '绑定设备，然后查看对应的VIP产品包信息',
          cancelText: '返回',
          cancelColor: '#000000',
          confirmText: '去绑定',
          confirmColor: '#576B95',
          success(res) {
            if (res.confirm) {
              wx.navigateTo({ url: `/pages/home/home` })
            } else {
              wx.navigateBack()
            }
          },
        })
        return false
      }
    },
    _checkUserLoginStateForPay() { //检查登录状态是否满足调起各产品包的要求
      if (this.data._curVipType == 'movie' && (app.globalData.boundDeviceInfo.source == "tencent")) { //影视vip
        if (user_login.isUserLogin({ type: 2 })){
          this.setData({ bToastAuthTencentQQorWechat: true })
          this._getProductSourceList()
          return false
        } else if (user_login.isUserLogin({ type: 1 })) {
          this.data._tencentType = user_login.getTencentOpenId().type
          return true
        } else if (!user_login.isUserLogin({ type: 1 })) {
          let that = this
          wx.showModal({
            title: '温馨提示',
            content: '购买腾讯产品需要绑定微信或QQ',
            success(res) {
              if (res.confirm) {
                wx.navigateTo({ url: `../login/login?action=tencentlogin` })
              } else {
                wx.navigateBack()
              }
            },
          })
          return false
        }
      }
      if(!user_login.isUserLogin()) {
        let that = this
        wx.showModal({
          title: '温馨提示',
          content: '获取VIP产品包信息需要登录',
          cancelText: '返回',
          cancelColor: '#000000',
          confirmText: '去登录',
          confirmColor: '#576B95',
          success(res) {
            if (res.confirm) {
              wx.navigateTo({ url: `../login/login` })
            } else {
              wx.navigateBack()
            }
          },
        })
        return false
      }
      return true
    },
    _showNavBarTitle(index) { //显示页面viptitle
      let srcName = '', benefitImg = '../../images/my/vipbuy/benefit.png', height = 'oneline'
      switch (index) {
        case 'edu': 
          srcName = '超级教育VIP'; 
          benefitImg = '../../images/my/vipbuy/vipedu.png'
          break;
        case 'kid': 
          srcName = '少儿VIP'; 
          benefitImg = '../../images/my/vipbuy/vipkid.png'
          height = 'twoline'
          break;
        case 'game': 
          srcName = '电竞VIP';
          benefitImg = '../../images/my/vipbuy/vipgame.png'
          break;
        default:
          if (app.globalData.boundDeviceInfo.source == "tencent") {
            srcName = '超级影视VIP';
          } else {
            srcName = '奇异果VIP';
          }
          height = 'twoline'
          break;
      }
      this.setData({
        navBarTitle: srcName,
        'benifitImg.image': benefitImg,
        'benifitImg.height': height,
      })
      wx.reportAnalytics('vip_detail_page_show', { //数据采集
        page_name: srcName,
        source_name: !!this.data._appLaunchFrom ? this.data._appLaunchFrom : '我的',
      });
    },
    readServiceProtocol(e) { //查看协议
      let type = e.currentTarget.dataset.type
      if(type == 'service') {
        type = this.data._curVipType
      }
      wx.navigateTo({
        url: `../userProtocol/userProtocol?&type=${type}`,
      })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      console.log(options)
      let stage = +options.stage
      if (!!stage) { //页面内跳转
        this.setData({
          stage: stage
        })
        this.data._orderId = options.orderId
        if (this.data.stage == this.data.PageStage.PAY_FAIL_PAGE) {
          this.data._payParams = JSON.parse(options.pay)
          this.data._FailPageCustomEventSubmitPageName = options.page_name
          this.data._FailPageCustomEventSubmitVipName = options.vip_name
        } else if (this.data.stage == this.data.PageStage.PAY_SUCCESS_PAGE) { //只有爱奇艺影视VIP购买成功，才显示’送移动端黄金VIP‘图标
          if (options.page_name == '奇异果VIP') {
            this.setData({
              navBarTitle : '奇异果VIP'
            })
          }
        }
        this._getOrderDetailes(this.data._orderId)
      }else { //其它页跳转到本页面
        this.data._curSourceId = options.source_id
        this.data._curVipType = options.type
        this._showNavBarTitle(this.data._curVipType)
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
      if (this.data.stage == this.data.PageStage.HOME_PAGE) {
        if (this._checkHasBoundDevice && this._checkUserLoginStateForPay()) {
          this._getProductPackageList({ source_id: this.data._curSourceId, txType: this.data._tencentType  })
        }
      }
      this.setData({
        'curUserInfo.name': !!app.globalData.ccUserInfo ? app.globalData.ccUserInfo.username : '',
        'curUserInfo.avatar': !!app.globalData.ccUserInfo ? app.globalData.ccUserInfo.avatar : '',
        'orderInfos.userName': !!app.globalData.ccUserInfo ? app.globalData.ccUserInfo.username : '',
      })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
      console.log('vipbuy hide.')
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
      console.log('vipbuy unload.')
      this.setData({bToastAuthTencentQQorWechat: false})
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
  }, 
})