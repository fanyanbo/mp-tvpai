
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
    keyboardHeight: 0,
    currentWordNumber: 0,
    score: 0,
    inputValue: '',
    placeholder: '写几句评论吧...',
    stars: [
      {
        flag: 1,
        score: 1,
        grayStar: "/images/star_gray.png",
        lightStar: "/images/star_light.png"
      },
      {
        flag: 1,
        score: 2,
        grayStar: "/images/videodetail/star.png",
        lightStar: "/images/videodetail/star-focus.png"
      },
      {
        flag: 1,
        score: 3,
        grayStar: "/images/videodetail/star.png",
        lightStar: "/images/videodetail/star-focus.png"
      },
      {
        flag: 1,
        score: 4,
        grayStar: "/images/videodetail/star.png",
        lightStar: "/images/videodetail/star-focus.png"
      },
      {
        flag: 1,
        score: 5,
        grayStar: "/images/videodetail/star.png",
        lightStar: "/images/videodetail/star-focus.png"
      }
    ],
  },
  methods: {
    // 自定义方法

    handleInputEvent: function (e) {
      // 获取输入框的内容
      let inputValue = e.detail.value;
      // 获取输入框内容的长度
      let len = parseInt(inputValue.length);
      // console.log("已输入字数：", len);
      this.setData({
        currentWordNumber: len,
        inputValue: inputValue
      })
    },
    handleFocusEvent: function (e) {
      let bottomHeight = e.detail.height;
      console.log("键盘高度", e)
      this.setData({
        keyboardHeight: bottomHeight
      })
    },
    handleBlurEvent: function (e) {
      console.log('handleBlurEvent')
      this.setData({
        keyboardHeight: 0
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
      console.log("triggerEvent")
      //todo:校验内容和分数是否为空
      if(this.data.inputValue && this.data.inputValue.length === 0 || this.data.score === 0) {
        this.setData({
          placeholder: '输入内容或评分不能为空！！'
        })
        return
      }
      this.triggerEvent('home', 
      {"content": this.data.inputValue,"score": this.data.score})
      this.setData({
        isShow: false
      })
    },
    closeGrayBox: function () {
      this.setData({
        isShow: false
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