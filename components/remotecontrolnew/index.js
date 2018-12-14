// components/remotecontrol/index.js
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    // 属性值可以在组件使用时指定
    fromPage: String
  },
  data: {
    // 这里是一些组件内部数据
    btnContent: '遥控器', 
    tipsContent: '提示：长按遥控器按钮，就能语音啦',
    isShowTips: true,
    isShowMask: false, // 是否显示遮罩层
    // 遥控按键落焦标识
    isOKFocus: false,
    isShutdownFocus: false,
    isVolupFocus: false,
    isVoldownFocus: false,
    isHomeFocus: false,
    isBackFocus: false,
    isMenuFocus: false,
    // 方向icon路径
    curDirectorImg: '../../images/director-normal.png',
    // 遥控器按钮icon路径
    curBtnImg: '../../images/remoter@3x.png',
    indexStatus: '',  // 当前显示版面
    longtapStatus: false, // 是否是长按状态
    voiceInputStatus: false, // 是否是语音输入状态
    waitVoiceResult: false,  // 等待语音结果状态
    oneTip: '您可以说：“今天天气怎么样”',
    // 动画数据
    count: 0, // 设置 计数器 初始为0
    countTimer: null, // 设置 定时器 初始为null
    animationData: {} 
  },
  methods: {
    // 这里是一个自定义方法,供父组件调用
    hideRemoteControl() {
      console.log('hideRemoteControl()方法');
    },

    handleBtnTipsClosed() {
      console.log('handleBtnTipsClosed()方法');
      this.setData({isShowTips: false});
    },

    handlePushController(e) {
      const curId = e.currentTarget.id;
      console.log('遥控按键按住', curId)
      switch (curId) {
        case 'ok':
          this.setData({ isOKFocus: true })
          break
        case 'home':
          this.setData({ isHomeFocus: true })
          break
        case 'back':
          this.setData({ isBackFocus: true })
          break
        case 'menu':
          this.setData({ isMenuFocus: true })
          break
        case 'shutdown':
          this.setData({ isShutdownFocus: true })
          break
        case 'voldown':
          this.setData({ isVoldownFocus: true })
          break
        case 'volup':
          this.setData({ isVolupFocus: true })
          break
        case 'up':
          this.setData({ curDirectorImg: '../../images/director-up.png' })
          break;
        case 'down':
          this.setData({ curDirectorImg: '../../images/director-down.png' })
          break;
        case 'left':
          this.setData({ curDirectorImg: '../../images/director-left.png' })
          break;
        case 'right':
          this.setData({ curDirectorImg: '../../images/director-right.png' })
          break;
      }
      // 调用后台推送接口
    },

    handlePushControllerEnd(e) {
      const curId = e.currentTarget.id;
      console.log('遥控按键松开', curId);
      switch (curId) {
        case 'ok':
          this.setData({ isOKFocus: false })
          break
        case 'home':
          this.setData({ isHomeFocus: false })
          break
        case 'back':
          this.setData({ isBackFocus: false })
          break
        case 'menu':
          this.setData({ isMenuFocus: false })
          break
        case 'shutdown':
          this.setData({ isShutdownFocus: false })
          break
        case 'voldown':
          this.setData({ isVoldownFocus: false })
          break
        case 'volup':
          this.setData({ isVolupFocus: false })
          break
        case 'up':
        case 'down':
        case 'left':
        case 'right':
          this.setData({ curDirectorImg: '../../images/director-normal.png' })
          break
      }
    },

    // 处理遮罩层点击事件
    handleTapMask(e) {
      console.log('触发mask点击事件', e);
      if (this.data.isShowMask) {
        this.setData({
          isShowMask: false,
          curBtnImg: '../../images/remoter@3x.png',
          btnContent: '遥控器'
        })
        this.showExitAnimation()
      }
    },

    ///////////////////////////////////处理遥控器相关事件/////////////////////////////////

    handleRecorderManagerStart() {
      console.log('手指按住');
    },

    handleRecorderManagerStop(event) {
      const that = this;
      console.log('手指松开, 是否等待语音结果:' + this.data.waitVoiceResult + ",是否为长按状态:" + this.data.longtapStatus);
      if (!this.data.waitVoiceResult) { //当处理语音过程中，不处理任何事件
        if (this.data.longtapStatus) { //当长按时手指松开，设置按钮样式，显示语音结果版面
          console.log('处理长按手指松开');
          this.setData({
            indexStatus: 'VoiceResult',
            voiceInputStatus: false,
            waitVoiceResult: true, //等待语音结果
            btnContent: '遥控器'          
          })
          // 清除录音动画timer
          this.countInterval('over');
          //等待5S，模拟语音处理，然后重置参数
          setTimeout(() => {
            that.setData({
              indexStatus: '',
              longtapStatus: false,
              waitVoiceResult: false,
              isShowMask: false
            })
          }, 5000)
        } else { //当短按手指松开，显示遥控版面
          console.log('处理短按手指松开');
          if (this.data.isShowMask) {
            // wx.showTabBar({});
            this.setData({
              // indexStatus: '',
              isShowMask: false,
              curBtnImg: '../../images/remoter@3x.png',
              btnContent: '遥控器'
            })
            this.setData({
              
             })
            this.showExitAnimation()
          } else {
            // wx.hideTabBar({});
            this.setData({
              indexStatus: 'RemoteControl',
              isShowMask: true,
              curBtnImg: '../../images/voice@3x.png',
              btnContent: '按住说话'
            })
            this.showEnterAnimaiton()
          }
        }
      }
    },

    // 遥控器按钮长按事件
    handleButtonLongTap(event) {
      console.log('触发遥控器按钮长按事件');
      //设置状态,并开始版面进入动画
      this.setData({
        indexStatus: 'VoiceInput',
        voiceInputStatus: true,
        isShowMask: true,
        curBtnImg: '../../images/voice@3x.png',
        btnContent: '松开结束',
        longtapStatus: true
      })
      this.showEnterAnimaiton()

      // 点击录音按钮开始动画效果
      console.log('开始执行录音动画');
      this.drawProgressbg();
      this.countInterval('start')
    },

    // handleButtonTap(event) {
    //   console.log('触发遥控器你按钮短按事件');
    // },

    // 绘制圆圈圈
    // drawProgressbg() {
    //   // 使用 wx.createContext 获取绘图上下文 context
    //   var ctx = wx.createCanvasContext('canvasProgressbg')
    //   var gradient = ctx.createLinearGradient(200, 100, 100, 200);
    //   gradient.addColorStop("0", "#BFD0DC");
    //   gradient.addColorStop("1.0", "#DEE8ED");
    //   ctx.setLineWidth(6);// 设置圆环的宽度
    //   // ctx.setStrokeStyle(gradient);
    //   ctx.setStrokeStyle('red');
    //   ctx.setLineCap('round') // 设置圆环端点的形状
    //   ctx.beginPath();//开始一个新的路径
    //   ctx.arc(90, 90, 80, 0, 2 * Math.PI, false);
    //   //设置一个原点(90,90)，半径为80的圆的路径到当前路径
    //   ctx.stroke();//对当前路径进行描边
    //   ctx.draw();
    // },


    drawProgressbg() {
      // 使用 wx.createContext 获取绘图上下文 context
      var context = wx.createContext('canvasProgressbg')

      context.rect(50,50,200,200)
      context.fill()
      context.clearRect(100,100,50,50)
      context.draw();
    },

    drawCircle(step) {
      var context = wx.createCanvasContext('canvasProgress');
      context.setLineWidth(10);
      context.setStrokeStyle('#FF0000');
      context.setLineCap('round');
      context.beginPath();
      // 参数step 为绘制的圆环周长，从0到2为一周 。 -Math.PI / 0.5 将起始角设在3点钟位置 ，结束角 通过改变 step 的值确定
      context.arc(90, 90, 80, -Math.PI / 0.5, step * Math.PI - Math.PI / 0.5, false);
      context.stroke();
      context.draw();
    },
    countInterval(control) {
      if (control === 'start') {
        this.setData({
          count: 0, // 设置 计数器 初始为0
          countTimer: null, // 设置 定时器 初始为null
        })
        // 设置倒计时 定时器 每100毫秒执行一次，计数器count+1 ,耗时15秒绘一圈
        this.countTimer = setInterval(() => {
          console.log('fyb,count=' + this.data.count)
          if (this.data.count <= 150) {
            /* 绘制圆环进度条  
            注意此处 传参 step 取值范围是0到2，
            所以 计数器 最大值 150 对应 2 做处理，计数器count=150的时候step=2
            */
            this.drawCircle(this.data.count / (150 / 2))
            this.data.count++;
          } else {
            clearInterval(this.countTimer);
          }
        }, 100)
      }
      if (control === 'over') {
        clearInterval(this.countTimer);
      }
    },

    // 动画相关的方法
    showEnterAnimaiton() {
      let animation = wx.createAnimation({
        duration: 200
      })
      this.animation = animation
      this.fadeIn();
    },

    showExitAnimation() {
      let animation = wx.createAnimation({
        duration: 200
      })
      this.animation = animation
      this.fadeDown();
    },

    fadeIn() {
      this.animation.translateY(0).step()
      this.setData({
        animationData: this.animation.export()
      })
    },

    fadeDown() {
      this.animation.translateY(500).step()
      this.setData({
        animationData: this.animation.export(),
      })
    },

  }
})