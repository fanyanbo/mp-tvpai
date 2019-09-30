
Component({
  properties: {
    // 属性值可以在组件使用时指定
    isShow: {
      type: Boolean,
      value: false
    },
  },
  data: {
    // 组件内部数据
    isShowIn: false,
    keyboardHeight: '',
    currentWordNumber: 0,
    score: 0,
    inputComment: '',
    stars: [
      {
        flag: 1,
        score: 1,
        bgImg: "/images/score2_icon.png",
        bgfImg: "/images/score_icon.png"
      },
      {
        flag: 1,
        score: 2,
        bgImg: "/images/score2_icon.png",
        bgfImg: "/images/score_icon.png"
      },
      {
        flag: 1,
        score: 3,
        bgImg: "/images/score2_icon.png",
        bgfImg: "/images/score_icon.png"
      },
      {
        flag: 1,
        score: 4,
        bgImg: "/images/score2_icon.png",
        bgfImg: "/images/score_icon.png"
      },
      {
        flag: 1,
        score: 5,
        bgImg: "/images/score2_icon.png",
        bgfImg: "/images/score_icon.png"
      }
    ],
  },
  methods: {
    // 自定义方法

    bindInput: function (e) {
      // 获取输入框的内容
      let inputValue = e.detail.value;
      // 获取输入框内容的长度
      let len = parseInt(inputValue.length);
      console.log("已输入字数：", len);
      this.setData({
        currentWordNumber: len,
        inputValue: inputValue
      })
    },
    setBottom: function (event) {
      let bottomHeight = event.detail.height;
      console.log("键盘高度", bottomHeight)
      this.setData({
        keyboardHeight: bottomHeight
      })
    },
    chooseScore: function (e) {
      console.log("点击星星：", this.data);
      for (let i = 0; i < this.data.stars.length; i++) {
        let allItem = 'stars[' + i + '].flag';
        this.setData({
          [allItem]: 1
        })
      }
      let index = e.currentTarget.dataset.index;
      for (let i = 0; i <= index; i++) {
        let item = 'stars[' + i + '].flag';
        this.setData({
          [item]: 2
        })
      }
    },
    //阻止向上冒泡，触发最上层的关闭评论弹窗
    getFocus: function () {
      return
    },
    getScore: function (e) {
      let score = e.currentTarget.dataset.score;
      console.log("分数：", score);
      this.setData({
        score: score
      })
    },
    reply: function (e) {
      this.setData({
        isShowIn: false
      })
      console.log("inputComment", this.data.inputValue,"score",this.data.score)
    },
    closeGrayBox: function () {
      this.setData({
        isShowIn: false
      })
    },
  },
  lifetimes: {
    attached: function () {
      console.log('在组件实例进入页面节点树时执行');
    },
    detached: function () {
      console.log('在组件实例被从页面节点树移除时执行');
    },
    created: function () {
      console.log('在组件实例刚刚被创建时执行');

    }
  },
})