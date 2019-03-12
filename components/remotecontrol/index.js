// 腾讯语音解析插件
let plugin = requirePlugin("WechatSI")
let manager = plugin.getRecordRecognitionManager()
const njApi = require('../../api/api_nj')
const authApi = require('../../api/api_auth')
const app = getApp();

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    fromPage: String, // 属性值可以在组件使用时指定
    isShowTips: {
      type: Boolean,
      value: true
    }
  },
  data: {
    activeid: null,
    btnContent: '遥控器', 
    tipsContent: '提示：长按遥控器按钮，就能语音啦',
    query: '',
    // isShowTips: true,
    isShowMask: false, // 是否显示遮罩层
    hasRecordAuth: null, //是否有录音权限
    hasDevice: false, //是否有目标设备
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
    animationData: {} ,
    isShowToastDlg: false,// 是否显示"设备未绑定"对话弹窗
    toastDlgGoBindProperties: {},//“设备未绑定”对话弹窗-提示内容
    isShowToastPrompt: false,//是否显示"电视不支持遥控"提示弹窗
    toastPromptNotSupportContents: {},//“电视不支持遥控”提示弹窗-提示内容
  },
  methods: {
    // 这里是一个自定义方法,供父组件调用
    handleToastGoBindCancel() { //取消去绑定弹窗
      console.log("toast gobindTV hide...")
      this.setData({
        isShowToastDlg: false
      })
    },
    handleToastGoBindConfirm() {
      console.log("toast gobindTV confirm...")
      this.setData({
        isShowToastDlg: false
      })
      wx.navigateTo({
        url:"../../pages/home/home"
      })
    },
    handleToastNotSupport() {
      console.log("toast notsupport hide...")
      this.setData({
        isShowToastPrompt: false
      })
    },
    hideRemoteControl() {
      console.log('hideRemoteControl()')
      this.setData({
        curBtnImg: '../../images/remoter@3x.png',
        btnContent: '遥控器',
        voiceInputStatus: false,
        indexStatus: '',
        longtapStatus: false,
        waitVoiceResult: false,
        isShowMask: false,
        query: ''
      })
    },

    handleBtnTipsClosed() {
      console.log('handleBtnTipsClosed()')
      app.globalData.isShowTips = false
      this.setData({isShowTips: false})
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
        case 'volume_minus':
          this.setData({ isVoldownFocus: true })
          break
        case 'volume_plus':
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
        case 'volume_minus':
          this.setData({ isVoldownFocus: false })
          break
        case 'volume_plus':
          this.setData({ isVolupFocus: false })
          break
        case 'up':
        case 'down':
        case 'left':
        case 'right':
          this.setData({ curDirectorImg: '../../images/director-normal.png' })
          break
      }
      console.log('activeid:' + this.data.activeid + ',action:' + curId)
      const data = {
        activeid: this.data.activeid,
        action: curId
      }
      njApi.pushController({
        data: data,
        success: function (res) {
          console.log('pushController done!',res)
        }
      })
    },

    // 处理遮罩层点击事件,等待语音解析过程不处理该事件
    handleTapMask(e) {
      console.log('触发mask点击事件', e);
      if (!this.data.waitVoiceResult && this.data.isShowMask) {
        this.setData({
          isShowMask: false,
          curBtnImg: '../../images/remoter@3x.png',
          btnContent: '遥控器'
        })
        this.showExitAnimation()
      }
    },

    //处理遥控器相关事件
    handleRecorderManagerStart() {
      console.log('手指按住, 监测是否有目标设备：' + app.globalData.activeid);
      if (this.data.activeid == null) {
        let activeid = app.globalData.activeid
        if (activeid != null) {
          this.setData({
            activeid: activeid,
            hasDevice: true
          })
        } else {
          this.setData({
            hasDevice: false
          })
          //显示 设备未绑定 对话弹窗
          this.setData({
            isShowToastDlg: true,
            toastDlgGoBindProperties: {
              title: "设备未绑定",
              tips: "您还未绑定设备，暂无法操作",
              btnCancel: "取消",
              btnConfirm: "去绑定"
            }
          })
        }
      }
    },

    handleRecorderManagerStop(event) {

      console.log('手指松开, 是否等待语音结果: ' + this.data.waitVoiceResult + ",是否为长按状态: " + this.data.longtapStatus + "，是否有目标设备： " + this.data.hasDevice);
      try {
        if (this.data.activeid == null) return;  //无目标设备时不处理任何事件
        //当处理语音过程中，不处理任何事件, 注意不能直接返回，需处理第一次情况
        if (!this.data.waitVoiceResult) {
          if (this.data.longtapStatus) { //当长按时手指松开，设置按钮样式，显示语音结果版面
            console.log('处理长按手指松开，停止录音，停止超时倒计时，停止录音动画，等待解析结果');
            this.stopRecordTimer()
            this.stopRecordAnimation()
            this.stopRecord()
            this.setData({
              indexStatus: 'VoiceResult',
              voiceInputStatus: false,
              waitVoiceResult: true, //等待语音结果
              curBtnImg: '../../images/remoter@3x.png',
              btnContent: '遥控器'          
            })
            //等待5S，模拟语音处理，然后重置参数
            // setTimeout(() => {
            //   that.setData({
            //     indexStatus: '',
            //     longtapStatus: false,
            //     waitVoiceResult: false,
            //     isShowMask: false,
            //     query: ''
            //   })
            // }, 5000)
          } else { //当短按手指松开，显示遥控版面
            console.log('处理短按手指松开');
            if (this.data.isShowMask) {
              this.setData({
                // indexStatus: '',
                isShowMask: false,
                curBtnImg: '../../images/remoter@3x.png',
                btnContent: '遥控器'
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
      }
      catch (err) {
        console.log('handleRecorderManagerStop catch err ', err);
      }
    },

    // 遥控器按钮长按事件
    handleButtonLongTap(event) {
      console.log('触发遥控器按钮长按事件') 
      if (this.data.activeid == null) 
        return;
      if (this.data.hasRecordAuth){
        console.log('已经有录音权限');
        this.startRecord();
        return;
      }
      console.log('没有录音权限，引导用户进行授权')
      let that = this;
      authApi.checkRecordPriority({
        success: (hasPriority) => {
          console.log('checkPriorityCallback ', hasPriority);
          if (!hasPriority) {
            wx.authorize({
              scope: 'scope.record',
              success:() => {
                console.log('录音授权成功')
                that.setData({
                  hasRecordAuth: true
                });
                return
              },
              fail: (res)=> {
                console.log('录音授权失败', res);
                that.setData({
                  hasRecordAuth: false
                });
                if(res.errCode=='-12006') {
                  console.log('显示模态授权框')
                  wx.showModal({
                    title: '授权提示',
                    content: '语音遥控需要小程序录音权限',
                    cancelText: '取消',
                    confirmText: '确定',
                    comfirmColor: '#21c0ae',
                    success: function(res) {
                      console.log('showModal success，执行wx.openSetting', res)
                      if (res.confirm) {
                        wx.openSetting({
                          success: (res)=>{
                            console.log('openSetting success',res);
                          },
                          fail: (res) => {
                            console.log('openSetting fail', res);
                          },
                          complete: (res) => {
                            console.log('openSetting complete', res);
                          }
                        })
                      } else{
                        console.log('showModal cancel')
                      }
                    },
                    fail: function(res) {
                      console.log('showModal fail',res)
                    }
                  })
                } else {
                  // 申请录音权限失败
                  wx.showToast({
                    title: '语音遥控需要小程序录音权限',
                    icon: 'none',
                    duration: 2000,
                  })
                }
              }
            })
          } else {
            that.setData({
              hasRecordAuth: true
            });
            that.startRecord();
          }
        }
      })
    },

    //处理录音流程，目前仅使用腾讯方案，百度方案后续补充
    startRecord() {
      // 显示语音输入版面，设置相关状态
      this.setData({
        indexStatus: 'VoiceInput',
        voiceInputStatus: true,
        isShowMask: true,
        curBtnImg: '../../images/voice@3x.png',
        btnContent: '松开结束',
        longtapStatus: true, 
        hasDevice: true
      })
      console.log('开始执行语音输入动画和版面进场动画');
      this.startRecordAnimation();   
      this.showEnterAnimaiton()
      console.log('开始录音，并倒计时');
      // this.startRecordTimer()
      this.handleTencentRecorder()
    },
    stopRecord() {
      manager.stop();
    },

    handleTencentRecorder() {
      const that = this
      manager.onRecognize = function (res) {
        console.log("onRecognize result", res.result)
      }
      manager.onStop = function (res) {
        console.log("onStop result", res.result)
        if (!res.result) {
          wx.showToast({
            title: '抱歉，请再说一遍',
            icon: 'none',
            duration: 1000,
          })
          that.setData({
            curBtnImg: '../../images/remoter@3x.png',
            btnContent: '遥控器',
            voiceInputStatus: false,
            indexStatus: '',
            longtapStatus: false,
            waitVoiceResult: false,
            isShowMask: false,
            query: ''
          })
        } else {
          // 语音结果面板显示解析结果
          that.setData({
            query: res.result,
          })
          // 推送文本
          const data = {
            activeid: that.data.activeid,
            text: res.result
          }
          njApi.pushText({
            data: data,
            success(res) {
              // 文本推送成功；
              console.log('pushText done!',res)
            }
          })
          // 2s后回到主页面
          setTimeout(() => {
            that.setData({
              curBtnImg: '../../images/remoter@3x.png',
              btnContent: '遥控器',
              voiceInputStatus: false,
              indexStatus: '',
              longtapStatus: false,
              waitVoiceResult: false,
              isShowMask: false,
              query: ''
            })
          }, 2000)
        }
      }
      manager.onStart = function (res) {
        console.log("onStart", res)
      }
      manager.onError = function (res) {
        console.log("onError", res)
        wx.showToast({
          title: '报错，请再说一遍' + res.retcode,
          icon: 'none',
          duration: 1000,
        })
        // 2s后回到主页面
        setTimeout(() => {
          that.setData({
            indexStatus: '',
            longtapStatus: false,
            waitVoiceResult: false,
            isShowMask: false,
            query: ''
          })
        }, 2000)
      }
      manager.start({ duration: 10000, lang: "zh_CN" }) // 这里超时会回调onstop
    },

    startRecordTimer() {
      this.limitTimer = setTimeout(() => {
        console.log('输入语音时间过长，超时')
      }, 10000)
    },
    stopRecordTimer() {
      if(this.limitTimer) {
        clearInterval(this.limitTimer)
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
    stopRecordAnimation() {
      if (this.interval) {
        clearInterval(this.interval);
      }
    },
    startRecordAnimation() {
      var me = this;
      var cxt = wx.createCanvasContext('canvasCircle',this);
      cxt.setLineWidth(6);
      cxt.setStrokeStyle('#eeeeee'); //圆的颜色
      cxt.setLineCap('round');
      cxt.beginPath();
      cxt.arc(100, 100, 96, 0, 2 * Math.PI, false);
      cxt.stroke();
      cxt.draw();
      //加载动画
      var steps = 1,startAngle = 1.5 * Math.PI,endAngle = 0,speed = 100,sec = 100;
      function drawing (s, e) {
          var cxt2 = wx.createCanvasContext('canvasRing',me);
          cxt2.setLineWidth(6);
          cxt2.setStrokeStyle('#FFD71C');// 动态圆的颜色
          cxt2.setLineCap('round');
          cxt2.beginPath();
          cxt2.arc(100, 100, 96, s, e, false);
          cxt2.stroke();
          cxt2.draw();
      }
      function drawLoading () {
          if(steps < 101){
              //这里用me,同步数据,渲染页面
              endAngle = steps * 2 * Math.PI / speed + startAngle;
              drawing(startAngle, endAngle);
              steps++;
              console.log(steps);
          }else{
              clearInterval(this.interval);
          }
      }
      this.interval = setInterval(drawLoading,sec);
    }
  },
  // 组件在内存中创建完毕执行
  created() {
    console.log('remotecontrol component created()')
  },
  // 组件挂载之前执行
  attached() {
    console.log('remotecontrol component attached()')
  },
  // 组件挂载后执行
  ready() {
    console.log('remotecontrol component ready()')
    if (this.data.hasRecordAuth == null) {
      authApi.checkRecordPriority({
        success: (hasPriority) => {
          console.log('ready(),checkRecordPriority hasPriority=' + hasPriority)
          this.setData({
            hasRecordAuth: hasPriority
          })
        }
      })
    }
  },
  // 组件移动的时候执行
  moved() {
    console.log('remotecontrol component moved()')
  },
  // 组件移除执行
  detached() {
    console.log('remotecontrol component detached()')
  }
})