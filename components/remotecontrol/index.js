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
    activeid: null, //设备激活id
    activeidOld: null, //旧的激活id,每次发命令前判断一次激活id是否有变（以检测设备变更的情况）
    btnContent: '遥控器', 
    tipsContent: '提示：长按遥控器按钮，就能语音啦',
    query: '',
    // isShowTips: true,
    isShowMask: false, // 是否显示遮罩层
    hasRecordAuth: null, //是否有录音权限
    // 遥控按键落焦标识
    isOKFocus: false,
    isShutdownFocus: false,
    isVolupFocus: false,
    isVoldownFocus: false,
    isHomeFocus: false,
    isBackFocus: false,
    isMenuFocus: false,
    // 方向icon路径
    curDirectorImg: '../../images/components/remotecontrol/director-normal.png',
    // 遥控器按钮icon路径
    curBtnImg: '../../images/components/remotecontrol/remoter@3x.png',
    indexStatus: '',  // 当前显示版面
    longtapStatus: false, // 是否是长按状态
    bStartRecord: false,//是否开始录制音频
    voiceInputStatus: false, // 是否是语音输入状态
    waitVoiceResult: false,  // 等待语音结果状态
    oneTip: '您可以说：“今天天气怎么样”',
    // 动画数据
    count: 0, // 设置 计数器 初始为0
    countTimer: null, // 设置 定时器 初始为null
    animationData: {} ,
    bBindedTVOnline: null, //绑定TV是否在线
    bBindedTVSupportMP: null,//绑定TV是否支持小程序
  },
  methods: {
    // 这里是一个自定义方法,供父组件调用
    //绑定设备状态有更新时，刷新下被绑设备状态
    refreshBindedTVStatus() {
      this.data.activeidOld = this.data.activeid = app.globalData.activeId;
      console.log('refreshBindedTVStatus new id:' + this.data.activeid)
      let that = this;
      let dataOnline = {
        activeid: that.data.activeid
      }
      njApi.isTVOnline({
        data: dataOnline,
        success(res) {
          console.log("isTVOnline success res:" + JSON.stringify(res))
          if (res.status == "online") {
            console.log("isTVOnline tv online.")
            that.data.bBindedTVOnline = true
          } else {//TV不在线
            console.log("isTVOnline tv offline.")
            that.data.bBindedTVOnline = false
          }
          if (res.supportApplet == "yes") {//TV小维AI版本不支持遥控
            console.log("isTVOnline supportApplet yes.")
            that.data.bBindedTVSupportMP = true
          } else {
            console.log("isTVOnline supportApplet no.")
            that.data.bBindedTVSupportMP = false
          }
        },
        fail(res) {
          console.log("isTVOnline fail:" + res)
        }
      });
    },    
    //判断当前绑定设备状态，是否满足遥控器操作需要的条件
    //1. 是否绑定设备
    //2. 是否在线 & 支持小程序
    //3. 是否有录音权限
    //默认只判断状态，不现实提示弹窗； 如需显示，请传参{type:'longpress'}
   isBindedTVStatusReady({type = 'tap'} = {}) {
    //正常流程
    this.data.activeid = app.globalData.activeId;//实时获取最新激活id
    if(this.data.activeidOld != this.data.activeid) { //激活id有变
      this.refreshBindedTVStatus()
      this.data.activeidOld = this.data.activeid
    }
    if (!!this.data.activeid && !!this.data.bBindedTVOnline && !!this.data.bBindedTVSupportMP) {
      if (type == 'tap') {
        console.log('tap tv ready.')
        return true
      }
      if (!!this.data.hasRecordAuth) { //长按才需要判断录音权限，短按不需要
        console.log('longpress tv ready.')
        return true
      }
    }

      //step 1: 是否绑定设备
      // this.data.activeid = 31140974; //yuanbotest only
      if (this.data.activeid == null) {
        //显示 设备未绑定 modal 
        wx.showModal({
          title: "设备未绑定",
          content: "您还未绑定设备，暂无法操作",
          cancelText: "取消",
          confirmText: "去绑定",
          confirmColor: '#FDBE1A',
          success(res) {
            console.log('设备未绑定 ShowModal success: ' + JSON.stringify(res))
            if (res.confirm) {
              console.log('用户选择确定,跳转到设备绑定页面')
              wx.navigateTo({
                url: '../../pages/home/home',
              })
            } else if (res.cancel) {
              console.log('用户选择取消')
            }
          },
          fail(res) {
            console.log('设备未绑定 ShowModal fail: ' + res)
          }
        })
        return false
      }

      //step 2:是否在线 & 支持小程序
      if (!this.data.bBindedTVOnline) {
        console.log("bBindedTVOnline false.")
        wx.showToast({
          title: '抱歉，当前绑定的设备不在线，\r\n请确认是否开机联网',
          icon: 'none'
        })
        return false
      }
      if (!this.data.bBindedTVSupportMP) {
        console.log("bBindedTVSupportMP false.")
        wx.showToast({
          title: '抱歉，当前绑定的设备暂不支持遥控，\r\n请先安装升级小维AI',
          icon: 'none'
        })
        return false
      }
      if( type == 'tap') {
        console.log('type:tap tv ready')
        return true
      }
      //Step 3: 录音权限判断（长按才需要判断录音权限，短按不需要）
      if (!this.data.hasRecordAuth) {
        console.log('没有录音权限，引导用户进行授权')
        let that = this;
        authApi.checkRecordPriority({
          success: (hasPriority) => {
            console.log('checkPriorityCallback ', hasPriority);
            if (!hasPriority) {
              wx.authorize({
                scope: 'scope.record',
                success: () => {
                  console.log('录音授权成功')
                  that.setData({
                    hasRecordAuth: true
                  });
                },
                fail: (res) => {
                  console.log('录音授权失败', res);
                  that.setData({
                    hasRecordAuth: false
                  });
                  //如果用户已经拒绝过授权录音，之后再调wx.authorize会直接fail,所以需要再用modal引导用户授权
                  if (true) { //(res.errCode == '-12006') {
                    console.log('显示模态授权框')
                    wx.showModal({
                      title: '授权提示',
                      content: '语音遥控需要小程序录音权限',
                      cancelText: '取消',
                      confirmText: '确定',
                      comfirmColor: '#21c0ae',
                      success: function (res) {
                        console.log('showModal success ', res)
                        if (res.confirm) {
                          wx.openSetting({
                            success: (res) => {
                              console.log('openSetting success', res);
                              if (!!res.authSetting['scope.record']) {
                                console.log('录音授权成功')
                                that.setData({
                                  hasRecordAuth: true
                                });
                              }
                            },
                            fail: (res) => {
                              console.log('openSetting fail', res);
                            }
                          })
                        } else {
                          console.log('showModal cancel')
                        }
                      },
                      fail: function (res) {
                        console.log('showModal fail', res)
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
              return false
            } else {
              that.setData({
                hasRecordAuth: true
              });
              console.log('type:longpress tv ready')
              return true
            }
          }
        })
      }
    },
    hideRemoteControl() {
      console.log('hideRemoteControl()')
      this.setData({
        curBtnImg: '../../images/components/remotecontrol/remoter@3x.png',
        btnContent: '遥控器',
        voiceInputStatus: false,
        indexStatus: '',
        longtapStatus: false,
        bStartRecord: false,
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
      console.time('timeTap')
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
          this.setData({ curDirectorImg: '../../images/components/remotecontrol/director-up.png' })
          break;
        case 'down':
          this.setData({ curDirectorImg: '../../images/components/remotecontrol/director-down.png' })
          break;
        case 'left':
          this.setData({ curDirectorImg: '../../images/components/remotecontrol/director-left.png' })
          break;
        case 'right':
          this.setData({ curDirectorImg: '../../images/components/remotecontrol/director-right.png' })
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
          this.setData({ curDirectorImg: '../../images/components/remotecontrol/director-normal.png' })
          break
      }
      
      var bTVReady = false;
      bTVReady = this.isBindedTVStatusReady()
      if(!bTVReady) {
        console.log('TV not ready')
        return 
      }

      console.log('TV ready: activeid:' + this.data.activeid + ',action:' + curId)
      const data = {
        activeid: this.data.activeid,
        action: curId
      }
      njApi.pushController({
        data: data,
        success: function (res) {
          console.log('pushController done!', res)
          console.timeEnd('timeTap')
        }
      })
    },

    // 处理遮罩层点击事件,等待语音解析过程不处理该事件
    handleTapMask(e) {
      console.log('触发mask点击事件', e);
      if (!this.data.waitVoiceResult && this.data.isShowMask) {
        this.setData({
          isShowMask: false,
          curBtnImg: '../../images/components/remotecontrol/remoter@3x.png',
          btnContent: '遥控器'
        })
        this.showExitAnimation()
      }
    },

    //处理遥控器相关事件
    handleRecorderManagerStart() {
      console.time('timeVoice')
      if (!this.data.isShowMask) {
        console.log('refresh tv status.')
        this.refreshBindedTVStatus()
      }
      console.log('语音键 touch start 目标设备：' + this.data.activeid);
      //每次进入遥控器面板前，刷新一次设备状态
    },

    handleRecorderManagerStop(event) {
      console.log('语音键 touch end, 是否等待语音结果: ' + this.data.waitVoiceResult + ",是否为长按状态: " + this.data.longtapStatus 
              + '是否开始录制:' +this.data.bStartRecord);
      var bTVReady = false;
      bTVReady = this.isBindedTVStatusReady()
      if (!bTVReady) {
        console.log('TV not ready')
        return
      }
      console.timeEnd('timeVoice')
      try {
        //当处理语音过程中，不处理任何事件, 注意不能直接返回，需处理第一次情况
        if (!this.data.waitVoiceResult) {
          if (this.data.bStartRecord){ //当长按时手指松开，设置按钮样式，显示语音结果版面
            console.log('处理长按手指松开，停止录音，停止超时倒计时，停止录音动画，等待解析结果');
            this.stopRecordTimer()
            this.stopRecordAnimation()
            this.stopRecord()
            this.setData({
              indexStatus: 'VoiceResult',
              longtapStatus:false,
              bStartRecord: false,
              voiceInputStatus: false,
              waitVoiceResult: true, //等待语音结果
              curBtnImg: '../../images/components/remotecontrol/remoter@3x.png',
              btnContent: '遥控器'
            })
            //等待5S，模拟语音处理，然后重置参数
            // setTimeout(() => {
            //   this.setData({
            //     indexStatus: '',
            //     longtapStatus: false,
            //     waitVoiceResult: false,
            //     isShowMask: false,
            //     query: ''
            //   })
            // }, 5000)
          } else if (!!this.data.longtapStatus) {
            this.setData({
              longtapStatus: false,
            })
          }else { //当短按手指松开，显示遥控版面
            console.log('处理短按手指松开');
            if (this.data.isShowMask) {
              this.setData({
                // indexStatus: '',
                isShowMask: false,
                curBtnImg: '../../images/components/remotecontrol/remoter@3x.png',
                btnContent: '遥控器'
              })
              this.showExitAnimation()
            } else {
              // wx.hideTabBar({});
              this.setData({
                indexStatus: 'RemoteControl',
                isShowMask: true,
                curBtnImg: '../../images/components/remotecontrol/voice@3x.png',
                btnContent: '按住说话'
              })
              this.showEnterAnimaiton()
            }
          }
        } else if (!!this.data.longtapStatus) {
          this.setData({
            longtapStatus: false,
          })
        }
      }
      catch (err) {
        console.log('handleRecorderManagerStop catch err ', err);
      }
    },

    // 遥控器按钮长按事件
    handleButtonLongTap(event) {
      console.log('语音键 longpress ...') 
      this.setData({
        longtapStatus: true
      })
      var bTVReady = false;
      bTVReady = this.isBindedTVStatusReady({type: 'longpress'})
      if (!bTVReady) {
        console.log('TV not ready')
        return
      }
      
      console.log('已经有录音权限');
      this.startRecord();     
    },

    //处理录音流程，目前仅使用腾讯方案，百度方案后续补充
    startRecord() {
      // 显示语音输入版面，设置相关状态
      this.setData({
        indexStatus: 'VoiceInput',
        voiceInputStatus: true,
        isShowMask: true,
        curBtnImg: '../../images/components/remotecontrol/voice@3x.png',
        btnContent: '松开结束',
        bStartRecord: true
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
        that.setData({
          query: res.result,
        })
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
            curBtnImg: '../../images/components/remotecontrol/remoter@3x.png',
            btnContent: '遥控器',
            voiceInputStatus: false,
            indexStatus: '',
            longtapStatus: false,
            bStartRecord:false,
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
              curBtnImg: '../../images/components/remotecontrol/remoter@3x.png',
              btnContent: '遥控器',
              voiceInputStatus: false,
              indexStatus: '',
              longtapStatus: false,
              bStartRecord: false,
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
            bStartRecord: false,
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

    //是否有录音权限
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

    //进到每个页面时获取一次最新设备id，刷新一次设备状态
    this.data.activeidOld = this.data.activeid = app.globalData.activeId
    if (this.data.activeid == null) {
      console.log('activeid null')
      return
    }
    this.refreshBindedTVStatus()

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