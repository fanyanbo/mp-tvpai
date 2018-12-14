Page({
  data: {
    imgUrls: [
      '../../images/banner1.jpg',
      '../../images/banner2.jpg',
      '../../images/banner3.jpg'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 10000,
    duration: 1000,
    column:[
      {
        "text":"test",
        "url":"",
        "columnId":"1"
      },
      {
        "text": "电视剧",
        "url": "",
        "columnId": "2"
      },
      {
        "text": "综艺",
        "url": "",
        "columnId": "1"
      },
      {
        "text": "动漫",
        "url": "",
        "columnId": "1"
      },
      {
        "text": "娱乐",
        "url": "",
        "columnId": "1"
      },
      {
        "text": "电视剧",
        "url": "",
        "columnId": "1"
      }, {
        "text": "电影",
        "url": "",
        "columnId": "1"
      }
    ],
    animationImgList: [
      "../../images/000.png",
      "../../images/001.png",
      "../../images/002.png",
      "../../images/003.png",
      "../../images/004.png",
      "../../images/005.png",
      "../../images/006.png",
      "../../images/007.png",
      "../../images/008.png",
      "../../images/009.png",
      "../../images/010.png",
      "../../images/011.png"
    ],
    animationImgUrl: '',
    // value: false, //模态框的状态 true-隐藏 false-显示
    animationData: {}
  },

  onLoad(options) {
    console.log('first onLoad监听页面加载');
    wx.getSystemInfo({
      success: (res) => {
        // 状态栏高度和屏幕宽度，单位都是px
        console.log(res);
      }
    }) 
  },

  handletap() {
    console.log('first 触发handletap事件');
    this.selectComponent('#remotecontrol-id').hideRemoteControl()
    // 测试语音动效
    // const that = this;
    // let i = 0;
    // setInterval(() => {  
    //   let url = that.data.animationImgList[i]
    //   console.log('url = ' + url + ',i = ' + i)
    //   that.setData({animationImgUrl:url});
    //   i++;
    //   if(i === 12)
    //    i = 0;
    // }, 100)

    var that = this;
    var animation = wx.createAnimation({
      duration: 800,//动画的持续时间 默认400ms 数值越大，动画越慢 数值越小，动画越快
      timingFunction: 'ease',//动画的效果 默认值是linear
    })

    this.animation = animation
    that.fadeDown();//调用隐藏动画
  },

  onReady() {
    console.log('first onReady监听页面初次渲染完成');
    var context = wx.createContext()

    context.rect(50,50,200,200)
    context.fill()
    context.clearRect(100,100,50,50)
    wx.drawCanvas({
      canvasId: 'firstCanvas',
      actions: context.getActions()
    })
  },

  onShow() {
    console.log('first onShow监听页面显示');

  },

  onHide() {
    console.log('first onHide监听页面隐藏');
  },

  onUnload() {
    console.log('first onUnload监听页面卸载');
  },

  // 显示遮罩层
  showModal: function () {
    var that = this;
    // that.setData({
    //   value: true
    // })
    var animation = wx.createAnimation({
      duration: 600,//动画的持续时间 默认400ms 数值越大，动画越慢 数值越小，动画越快
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation
    setTimeout(function () {
      that.fadeIn();//调用显示动画
    }, 200)
  },

  // 隐藏遮罩层
  hideModal: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 800,//动画的持续时间 默认400ms 数值越大，动画越慢 数值越小，动画越快
      timingFunction: 'ease',//动画的效果 默认值是linear
    })

    this.animation = animation
    that.fadeDown();//调用隐藏动画
    // setTimeout(function () {
    //   that.setData({
    //     value: false
    //   })
    // },720)//先执行下滑动画，再隐藏模块
  },

  //动画集
  fadeIn: function () {
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export()//动画实例的export方法导出动画数据传递给组件的animation属性
    })
  },

  fadeDown: function () {
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(),
    })
  }
});
