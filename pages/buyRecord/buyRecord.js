// pages/buyRecord/buyRecord.js
const util_fyb = require('../../utils/util_fyb')

var payBehavior=require('../../api/user/pay')

Component({
  behaviors: [payBehavior],

  /**
   * 页面的初始数据
   */
  data: {
    recordList: [], //数组结构 [{day: '2019-10-24', orders: [{name:'包年', price: 1}, {name:'包月', price: 1},]}]
    _pagenum: 1,
    _pagecount: 10,
    recordTip: '正在努力加载中,请稍候~',
  },

  methods: {
    handleGobackClick: function () {
      console.log('handleGobackClick')
      util_fyb.navigateBack()
    },
    _getBuyRecord() { //获取消费记录
      this.queryOrderByToken(this.data._pagenum, this.data._pagecount).then( data => {
        if(data.count == 0) {
          //todo 没有数据了，我是有底线的
          //todo 加节流处理
          //todo 加防呆：没有数据后不再请求接口
          if(!this.data.recordList.length) {
            this.setData({
              recordTip: '暂无消费记录~'
            })
          }else {
            wx.showToast({
              title: '没有数据了',
              icon: 'none'
            })
          }
        }else {
          let that = this
          data.list.forEach((item,index) => {
            let { 
              prodName,
              actualAmount,
              orderTime,
              orderNo,
            } = item
            let info = {
              prodName,
              actualAmount,
              orderTime,
              orderNo,
            }
            let day = orderTime.substr(0, orderTime.indexOf(' ')).replace(/(\d{4})-(\d{1,2})-(\d{1,2})/, (match, p1, p2, p3) => {            
              p2 = p2.length < 2 ? ('0' + p2) : p2 //提取年月日并对单位月日前补0
              p3 = p3.length < 2 ? ('0' + p3) : p3
              return `${p1}年${p2}月${p3}日`
            })
            let dayIndex = that.data.recordList.findIndex((item, index) => {
              return item.day == day
            })
            if (dayIndex == -1) { //没有当天，则追加
              let orders = []
              orders.push(info)
              that.data.recordList.push({day, orders})
            }else {
              that.data.recordList[dayIndex].orders.push(info)
            }
          })
          this.data.recordList.sort((a,b) => a.day > b.day ? -1 : 1).forEach(item => {
            item.orders.sort((a, b) => a['orderTime'] > b['orderTime'] ? -1 : 1)
          })
          this.setData({
            recordList: this.data.recordList
          })
          // console.log(this.data.recordList)

          this.data._pagenum += 1;
        }
      }).catch( err => console.err(err))
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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
      this._getBuyRecord()
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
      this._getBuyRecord()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
  },
})