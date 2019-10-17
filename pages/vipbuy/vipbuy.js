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
    //todo 
    let data = this.data.productListAll[this.data.curSelectedProject.id]
    user_pay.genOrder(data).then( res => {
      //todo 
      console.log(res)
    })
    
    let stage = this.data.PageStage.PAY_SUCCESS_PAGE
    if(Math.random()*10 < 5) { //test
      stage = this.data.PageStage.PAY_FAIL_PAGE
    }
    wx.navigateTo({
      url: `../vipbuy/vipbuy?stage=${stage}`,
    })
  },
  _getProductPackageList() {
    return  user_package.getProductPackageList().then((data) => {
              console.log(data)
              this.data.productListAll = data.data.data.products;
              let arr = this.data.productListAll.map((item, index) => {
                let product = {
                  product_name: item.product_name,
                  desc: item.desc,
                  unit_fee: item.unit_fee,
                  discount_fee: item.discount_fee,
                  id: index,
                }
                return product
              })
              this.setData({
                productListShow: arr
              })
            })
  },
  selectProduct(e) { //用户选择产品包
    console.log(e.currentTarget.dataset)
    let id = e.currentTarget.dataset.id;
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (!!+options.stage) {
      this.setData({
        stage: +options.stage
      })
    }

    this._getProductPackageList()
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