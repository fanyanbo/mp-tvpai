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
    btnContent: '按住说话',
    indexStatus: '',
    longtapStatus: false,
    voiceInputStatus: false,
    waitVoiceResult: false,
    oneTip: '您可以说：“今天天气怎么样”'
  },
  methods: {
    // 这里是一个自定义方法
    hideRemoteControl() {
      console.log('hideRemoteControl()方法');
      this.setData({
        indexStatus: ''
      })
    },

    handleRecorderManagerStart() {
      console.log('手指按住');
    },

    handleRecorderManagerStop(event) {
      const that = this;
      console.log('手指松开, waitVoiceResult=' + this.data.waitVoiceResult + ",longtapStatus=" + this.data.longtapStatus);
      if (!this.data.waitVoiceResult) { //当处理语音过程中，不处理任何事件
        if (this.data.longtapStatus) { //当长按时手指松开，设置按钮样式，显示语音结果版面
          console.log('处理长按手指松开');
          this.setData({
            indexStatus: 'VoiceResult',
            voiceInputStatus: false,
            waitVoiceResult: true, //等待语音结果
            btnContent: '按住说话'
          })
          //等待3S，模拟语音处理，然后重置参数
          setTimeout(() => {
            that.setData({
              indexStatus: '',
              longtapStatus: false,
              waitVoiceResult: false
            })
          }, 5000)
        } else { //当短按手指松开，显示遥控版面
          console.log('处理短按手指松开');
          if (this.data.indexStatus === 'RemoteControl') {
            this.setData({
              indexStatus: ''
            })
          } else {
            this.setData({
              indexStatus: 'RemoteControl'
            })
          } 
        }
      }
    },

    handleLongTap(event) {
      console.log('触发长按事件');
      //设置按钮样式，设置遥控版面为语音版面
      this.setData({
        indexStatus: 'VoiceInput',
        voiceInputStatus: true,
        btnContent: '松开结束',
        longtapStatus: true
      })
    },

    handleTap(event) {
      console.log('触发短按事件');
    }
  }
})