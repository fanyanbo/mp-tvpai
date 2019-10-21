// pages/vipbuy/vipbuy.js
const user_mock = require('../../api/user/mock')
const user_package = require('../../api/user/package')
const user_pay = require('../../api/user/pay')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    productListShow:[],//保存页面需要显示的信息
    productListAll: [],//保存后台返回的所有数据
    PageStage: {
      HOME_PAGE: 0,
      PAY_SUCCESS_PAGE: 1,
      PAY_FAIL_PAGE: 2,
    },
    stage: 0,
    curSelectedProject: {},//当前选择的产品包
  },

  handleGobackClick(e) {//返回
    wx.navigateBack({})
  },
  payNow(e) { //立即支付
    let data = this.data.productListAll[this.data.curSelectedProject.id]
    user_pay.genOrder(data).then( res => {
      return user_pay.prePay(res)
    }).then(res => {
      return user_pay.startPay(res)
    }).then(res => {
      console.log(res)
      //todo 支付成功，页面重定向到支付成功页
      let stage = this.data.PageStage.PAY_SUCCESS_PAGE
      wx.redirectTo({
        url: `../vipbuy/vipbuy?stage=${stage}`,
      })
    }).catch(err => {
      console.error('prePay error')
      //todo 失败页处理
      let stage = this.data.PageStage.PAY_FAIL_PAGE
      wx.redirectTo({
        url: `../vipbuy/vipbuy?stage=${stage}`,
      })
    }) 
  },
  _getProductPackageList(params) { //获取产品包列表
    return user_package.getProductPackageList(params).then((data) => {
              console.log(data)
              let focus = 0;
              this.data.productListAll = data.data.data.products;
              let arr = this.data.productListAll.map((item, index) => {
                let product = {
                  product_name: item.product_name,
                  desc: item.desc,
                  unit_fee: item.unit_fee / 100,
                  discount_fee: item.discount_fee / 100,
                  id: index,
                  focus: item.is_focus
                }
                if (item.is_focus) {
                  focus = index
                }
                return product
              })
              this.setData({
                productListShow: arr
              })
              this._updatePayPrice(focus)
            })
  },
  _updatePayPrice(id) { //更新立即支付价格
    this.data.productListShow.map((item, index) => {
      this.setData({
        [`productListShow[${index}].focus`]: index == id
      })
    })
    let totalPrice = this.data.productListAll[id].discount_fee / 100;  // todo 需要计算津贴+优惠券等 
    let save = (this.data.productListAll[id].unit_fee - this.data.productListAll[id].discount_fee) / 100; //todo fix!
    this.setData({
      curSelectedProject: {
        id,
        totalPrice,
        save
      }
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
    if (!!+options.stage) {
      this.setData({
        stage: +options.stage
      })
    }else {
      let source_id = options.source_id
      this._getProductPackageList({
        source_id
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
})