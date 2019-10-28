// pages/vipbuy/vipbuy.js
const user_mock = require('../../api/user/mock')
const util_fyb = require('../../utils/util_fyb.js')

var payBehavior = require('../../api/user/pay')
var packageBehavior = require('../../api/user/package')
const app = getApp()

Component({
  behaviors: [payBehavior, packageBehavior],

  data: {
    productListShow: [],//保存页面显示需要的信息
    PageStage: {
      HOME_PAGE: 0,
      PAY_SUCCESS_PAGE: 1,
      PAY_FAIL_PAGE: 2,
    },
    stage: 0,
    curSelectedProject: {},//当前选择的产品包
    _curSourceId: 0, //当前产品包的source_id值，支付成功或失败时需要
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
      name: app.globalData.ccUserInfo.username,
      avatar: app.globalData.ccUserInfo.avatar,
    },
  },
  
  methods: {
    handleGobackClick(e) {//返回
      wx.navigateBack({})
    },
    _getProductPackageList(params) { //获取产品包列表
      const productPkgPromise = this.getProductPackageList(params)
      const couponsPromise = this.getCoupones()
      const allowancePromise = this.getAllowance()
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
      }).catch(err => {
        console.error(err)
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
      let save = this.data.productListShow[id].oldprice - totalPrice;
      this.setData({
        curSelectedProject: {
          id,
          totalPrice,
          save
        }
      })
    },
    payNow(e) { //立即支付
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
        return this.startPay(this.data._payParams)
      }).then(res => {
        console.log(res)
        let stage = this.data.PageStage.PAY_SUCCESS_PAGE //todo 支付成功，页面重定向到支付成功页
        wx.redirectTo({
          url: `../vipbuy/vipbuy?stage=${stage}&orderId=${this.data._orderId}`,
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
        wx.redirectTo({
          url: `../vipbuy/vipbuy?stage=${stage}&orderId=${this.data._orderId}&pay=${JSON.stringify(this.data._payParams)}`,
        })
      }).finally(() => {
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
    },
    goRollPrize() { //支付成功去抽奖
      let openid = app.globalData.ccUserInfo.openid
      let nickName = app.globalData.ccUserInfo.username
      let loginType = !!this.data._tencentType ? (this.data._tencentType == 'qq' ? 1 : 2) : 0
      let wxid = app.globalData.ccUserInfo.wxVuId
      let url = `http://beta.webapp.skysrt.com/lqq/chou/chou.html?openId=${openid}&nickName=${nickName}&loginType=${loginType}&wxid=${wxid}`
      wx.navigateTo({
        url: `../webview/webview?path=${url}`
      });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      console.log(options)
      let stage = +options.stage
      // stage = this.data.PageStage.PAY_SUCCESS_PAGE//test
      this.data._tencentType = options.tencent_type
      if (!!stage) {
        this.setData({
          stage: stage
        })
        this.data._orderId = options.orderId
        if (this.data.stage == this.data.PageStage.PAY_FAIL_PAGE) {
          this.data._payParams = JSON.parse(options.pay)
        }
        this._getOrderDetailes(this.data._orderId)
      }else {
        this.data._curSourceId = options.source_id
        this._getProductPackageList({
          source_id: options.source_id
        })
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
  }, 
})