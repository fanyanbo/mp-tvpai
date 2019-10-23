// pages/vipbuy/vipbuy.js
const user_mock = require('../../api/user/mock')

var payBehavior = require('../../api/user/pay')
var packageBehavior = require('../../api/user/package')

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
      userName: getApp().globalData.ccUserInfo.username,
      name: '',
      price: 0,
      orderId: 0,
      payTime: 0,
      validTime: 0,
    }, //当前订单信息
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
          return  this.genOrder(params).then(res => {
                    this.data._orderId = res.orderId
                    this.prePay(res)
                  }).catch( err => {
                    console.error(err)
                    wx.showToast({
                      title: '支付失败，请重试',
                      icon: 'none'
                    })
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
        let stage = this.data.PageStage.PAY_FAIL_PAGE //失败页处理,继续支付
        wx.redirectTo({
          url: `../vipbuy/vipbuy?stage=${stage}&orderId=${this.data._orderId}&pay=${JSON.stringify(this.data._payParams)}`,
        })
      }).finally(() => {
        this.data._orderId = null;
        this.data._payParams = null;
      })
    },
    _getOrderDetailes() { //获取订单详情
      this.queryOrderDetail(this.data._orderId).then( res => {
        if (this.data.stage == this.data.PageStage.PAY_SUCCESS_PAGE) {
          if (res.syn_status == 1) {
            this.setData({
              'orderInfos.name': res.order_title,
              'orderInfos.validTime': res.syn_time, //need fix
            })
          }
        } else if (this.data.stage == this.data.PageStage.PAY_FAIL_PAGE) {
          this.data._payParams = JSON.parse(options.pay)
          this.setData({
            'orderInfos.name': res.order_title,
            'orderInfos.price': res.pay_info.total_pay_fee,
            'orderInfos.orderId': res.pay_info.oss_order_no,
            'orderInfos.payTime': res.pay_time, //need fix
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
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      console.log(options)
      let stage = +options.stage
      // stage = this.data.PageStage.PAY_SUCCESS_PAGE //test
      if (!!stage) {
        this.setData({
          stage: stage
        })
        this.data._orderId = options.orderId
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