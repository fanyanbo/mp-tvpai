Page({
  data: {
    titleContent: '热搜',
    paddingTop: 0,
    isFocus: true,
    inputValue: '',
    currentContent: 'search-result-content',
    // currentContent: 'search-input-content',
    hotWordsList: [
      '西虹市首富',
      '我不是药神',
      '韩城',
      '小猪佩奇',
      '唐砖',
      '延禧攻略',
      '汪汪队立大功',
      '奇葩说第五季',
      '航海王',
      '小猪佩奇全集'
    ],
    historyWordsList: [
      '小猪',
      '延禧攻略',
      '吐槽大会'
    ],
    resultTitleList: [
      '全部视频',
      '全部文章'
    ],
    activeIndex: 0,
    videoContentList: [
      {
        videoItemImg: '../../images/banner2.jpg',
        videoItemTitle: '金钱世界世界世界世界世界',
        videoItemScore: 8.5,
        VideoItemDetail: {
          year : 2017,
          director: '文牧野',
          actor: '徐峥',
          type: '现实题材'
        }
      },
      {
        videoItemImg: '../../images/banner2.jpg',
        videoItemTitle: '金钱世界世界世界世界世界',
        videoItemScore: 8.5,
        VideoItemDetail: {
          year : 2017,
          director: '文牧野',
          actor: '徐峥',
          type: '现实题材'
        }
      }
    ],
    pushText: '推送'
  },

  handleMainTap() {
    console.log('搜索输入页 handleMainTap');
    this.selectComponent('#remotecontrol-id').hideRemoteControl()
  },

  handleReturnTap() {
    console.log('搜索输入页 handleReturnTap');
    wx.navigateBack();
  },

  handleDeteteTap () {
    console.log('搜索输入页 handleDeteteTap');
    this.setData({
      inputValue: '',
      isFocus: true
    })
  },

  inputBind(e) {
    console.log('搜索输入页 inputBind = ' + e.detail.value);
    this.setData({
      inputValue: e.detail.value
    })
  },

  handleClearTap() {
    console.log('搜索输入页 handleClearTap');
    this.setData({
      historyWordsList:[]
    })
  },

  handleCancelTap() {
    console.log('搜索输入页 handleCancelTap');
    wx.navigateBack();
  },

  handleTabClick: function(e) {
    const val = e.currentTarget.dataset['index'];
    console.log('搜索结果页 handleTabClick val =' + val);
    this.setData({
      activeIndex: val
    })
  },

  onLoad(options) {
    console.log('second onLoad监听页面加载');
  },

  onReady() {
    console.log('second onReady监听页面初次渲染完成');
  },

  onShow() {
    console.log('second onShow监听页面显示');
    wx.getSystemInfo({
      success: (res) => {
        // 状态栏高度和屏幕宽度，单位都是px
        console.log(res.statusBarHeight, res.windowWidth);
        let scale = res.windowWidth / 375;
        this.setData({
          paddingTop: res.statusBarHeight
        })
      }
    }) 
  },

  onHide() {
    console.log('second onHide监听页面隐藏');
  },

  onUnload() {
    console.log('second onUnload监听页面卸载');
  }
});
