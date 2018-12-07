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
    ]
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
  },

  onReady() {
    console.log('first onReady监听页面初次渲染完成');
  },

  onShow() {
    console.log('first onShow监听页面显示');
  },

  onHide() {
    console.log('first onHide监听页面隐藏');
  },

  onUnload() {
    console.log('first onUnload监听页面卸载');
  }

});
