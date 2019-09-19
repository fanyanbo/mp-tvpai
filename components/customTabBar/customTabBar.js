Component({
  data: {
    selected: 0,
    color: "#333",
    selectedColor: "#FDBE1A",
    list: [{
      pagePath: "../../pages/index/index",
      text: "主页"
    }, {
      pagePath: "../../pages/my/my",
      text: "我的"
    }]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      console.log("导航栏状态",data)
      const url = data.path
      wx.switchTab({ url })
      this.setData({
        selected: data.index
      })
    }
  }
})