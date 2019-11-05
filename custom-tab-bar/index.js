Component({
  data: {
    selected: 0,
    list: [{
      pagePath: "../../pages/index/index",
      text: "主页"
    }, {
      pagePath: "../../pages/my/my",
      text: "我的"
    }]
  },
  attached() {
    // console.log('custom-tab-bar attached')
  },
  ready() {
    // console.log('custom-tab-bar ready')
    let _pxNavBarHeight
    if(getApp().globalSystemInfo) {
      const {
        navBarHeight,
        navBarExtendHeight,
      } = getApp().globalSystemInfo;
      _pxNavBarHeight = navBarHeight + navBarExtendHeight
    } else {
      let _model = getApp().globalData.model.toLowerCase()
      let _platform = getApp().globalData.platform.toLowerCase()
      if(_platform === 'android') {
        _pxNavBarHeight = 68
      } else {
        _pxNavBarHeight = _model.indexOf('iphone x') != -1 ? 88 : 64
      }
      console.log(_model, _platform, _pxNavBarHeight)
    }
    // let _winWidth = wx.getSystemInfoSync().windowWidth
    // let _rpxNavBarHeight = _pxNavBarHeight * 750 / _winWidth 
    let tabBarStyle = `top: ${_pxNavBarHeight}px`
    // console.log(_rpxNavBarHeight, _pxNavBarHeight, tabBarStyle)
    this.setData({
      tabBarStyle
    });
  },
  created() {
    // console.log('custom-tab-bar created')
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      console.log("导航栏状态",data)
      const url = data.path
      wx.switchTab({ url })
      // this.setData({
      //   selected: data.index
      // })
    }
  }
})