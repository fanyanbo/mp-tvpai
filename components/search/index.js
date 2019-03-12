// components/remotecontrol/index.js
Component({
  properties: {
    // 属性值可以在组件使用时指定
  },
  data: {
    // 这里是一些组件内部数据
    searchContent: '搜索视频、影评或话题',
    paddingTop: 0,
    scale: 1
  },
  methods: {
    // 这里是一个自定义方法
    handletap() {
      console.log('handletap');
      wx.navigateTo({
        url: '../../pages/home/home',
      })
    }
  },
  lifetimes: {
    attached: function () {
      console.log('在组件实例进入页面节点树时执行');
      wx.getSystemInfo({
        success: (res) => {
          // 状态栏高度和屏幕宽度，单位都是px
          console.log(res);
          console.log(res.statusBarHeight, res.windowWidth);
          let scale = res.windowWidth / 375;
          this.setData({
            paddingTop: res.statusBarHeight + 12
          })
        }
      })     
    },
    detached: function () {
      console.log('在组件实例被从页面节点树移除时执行');
    },
    created: function () {
      console.log('在组件实例刚刚被创建时执行');

    }
  },
})