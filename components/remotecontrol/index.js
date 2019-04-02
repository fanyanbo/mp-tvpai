// 腾讯语音解析插件
let plugin = requirePlugin("WechatSI")
let manager = plugin.getRecordRecognitionManager()
const njApi = require('../../api/api_nj')
const authApi = require('../../api/api_auth')
const app = getApp();

Component({
  properties: {
    isShowTips: {
      type: Boolean,
      value: true
    }
  },
  data: {
    //遥控按键落焦标识
    isOKFocus: false,
    isShutdownFocus: false,
    isVolupFocus: false,
    isVoldownFocus: false,
    isHomeFocus: false,
    isBackFocus: false,
    isMenuFocus: false,
    curDirectorImg: '../../images/components/remotecontrol/director-normal.png',    // 方向icon路径
    curBtnImg: '../../images/components/remotecontrol/remoter@3x.png',    // 遥控器按钮icon路径
    
    //被绑定设备状态 
    activeid: null, //设备激活id
    hasRecordAuth: null, //是否有录音权限
    bBindedTVSupportMP: null,//绑定TV是否支持小程序
    bBindedTVReady: null, //绑定TV是否准备就绪

    //遥控器面板显示内容
    tipsContent: '提示：长按遥控器按钮，就能语音啦',
    aInputTips: [], //随机语音提示语数组
    btnContent: '遥控器',
    query: '', //用户语音输入内容

    //遥控器UI显示flag
    isShowMainPanel: false, // 是否显示遥控器主面板
    isShowMainPanelBakup: false,//是否显示遥控器主面板-上次状态备份，语音输入后需要恢复之前状态
    indexStatus: '',  // 当前显示版面
    indexStatusBakup: '',//当前显示版面-上次状态备份，语音输入后需要恢复之前状态
    
    //语音输入流程控制flag
    bTapStatus: false, //是否tap状态
    bLongPressStatus: false, // 是否是长按状态
    bStartRecord: false,//是否开始录制音频
    bWaitVoiceResult: false,  // 等待语音结果状态

    //语音输入动画数据
    count: 0, // 设置 计数器 初始为0
    countTimer: null, // 设置 定时器 初始为null
    animationData: {} ,
  },
  methods: {
    //处理一般按键和提示语的接口 -start-
    _toggleMainPanel() { //打开或关闭遥控器主面板
      console.log('mainpanel: ' + this.data.isShowMainPanel)
      if (this.data.isShowMainPanel) {
        this.setData({
          indexStatus: '',
          isShowMainPanel: false,
          curBtnImg: '../../images/components/remotecontrol/remoter@3x.png',
          btnContent: '遥控器',
          query: ''
        })
        this.showExitAnimation()
      } else {
        // wx.hideTabBar({});
        this.setData({
          indexStatus: 'RemoteControl',
          isShowMainPanel: true,
          curBtnImg: '../../images/components/remotecontrol/voice@3x.png',
          btnContent: '按住说话'
        })
        this.showEnterAnimaiton()
      }
    },    
    handleTapMask(e) {  //处理遮罩层点击事件,等待语音解析过程不处理该事件
      console.log('触发mask点击事件:e:%o, bWaitVoiceResult: %s, isShowMainPanel:%s.', e, this.data.bWaitVoiceResult, this.data.isShowMainPanel);
      if (!this.data.bWaitVoiceResult && this.data.isShowMainPanel) {
        this._toggleMainPanel()
      }
    },  
    handleBtnTipsClosed() { //关闭录音提示语
      console.log('handleBtnTipsClosed()')
      app.globalData.isShowTips = false
      this.setData({ isShowTips: false })
    },
    _toggleGeneralKeyStatus({ id, status }) {  //切换遥控器一般按键显示状态
      switch (id) {
        case 'ok':
          this.setData({ isOKFocus: status })
          break
        case 'home':
          this.setData({ isHomeFocus: status })
          break
        case 'back':
          this.setData({ isBackFocus: status })
          break
        case 'menu':
          this.setData({ isMenuFocus: status })
          break
        case 'shutdown':
          // this.setData({ isShutdownFocus: status })
          wx.showToast({
            title: '当前版本暂不支持开关机功能',
            icon: 'none'
          })
          break
        case 'volume_minus':
          this.setData({ isVoldownFocus: status })
          break
        case 'volume_plus':
          this.setData({ isVolupFocus: status })
          break
        case 'up':
        case 'down':
        case 'left':
        case 'right':
          let img = status ? ('../../images/components/remotecontrol/director-' + id + '.png') : ('../../images/components/remotecontrol/director-normal.png');
          this.setData({ curDirectorImg: img })
          break
      }
    },
    handlePushController(e) { //遥控器一般按键 按下
      const curId = e.currentTarget.id;
      this._toggleGeneralKeyStatus({ id: curId, status: true })
      console.log('遥控按键按住: ', curId)
    },
    handlePushControllerEnd(e) { //遥控器一般按键 松开
      const curId = e.currentTarget.id;
      this._toggleGeneralKeyStatus({ id: curId, status: false })
      console.log('遥控按键松开', curId);
      const data = {
        activeid: this.data.activeid,
        action: curId
      }
      njApi.pushController({
        data: data,
        success: function (res) {
          console.log('pushController done!', res)
        }
      })
    },
    //处理一般按键和提示语的接口 -end-
    //处理被绑定设备状态的接口 -start-
    _showModalUnbindTV() {//显示设备未绑定 modal 
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
    },
    _showModalUserAuthRecord(){//显示用户授权录音权限 modal
      console.log('没有录音权限，引导用户进行授权')
      let that = this
      wx.showModal({
        title: '授权提示',
        content: '语音遥控需要小程序录音权限',
        cancelText: '取消',
        confirmText: '确定',
        comfirmColor: '#21c0ae',
        success: function (res) {
          console.log('showModal success ', res)
          if (res.confirm) {
            wx.openSetting({//打开权限设置页
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
    },
    _checkUserRecordAuthStatus(){//检查用户录音权限授权状态
      console.log('check record auth..')
      let that = this;
      authApi.checkRecordPriority({
        success: (hasPriority) => {
          console.log('checkRecordPriority ', hasPriority);
          if (!hasPriority) {
            wx.authorize({
              scope: 'scope.record',
              success: () => {
                console.log('录音授权成功')
                that.setData({
                  hasRecordAuth: true
                });
                return true;
              },
              fail: (res) => {
                console.log('录音授权失败', res);
                that.setData({
                  hasRecordAuth: false
                });
                if (true) { //(res.errCode == '-12006') { //如果用户已经拒绝过授权录音，之后再调wx.authorize会直接fail,所以需要再用modal引导用户授权
                  this._showModalUserAuthRecord()
                }
                return false
              }
            })
          } else {
            that.setData({
              hasRecordAuth: true
            });
            console.log('hasRecordAuth: true')
            return true
          }
        }
      })
    },
    _refreshBindedTVStatusAsync() {//刷新设备状态
      let that = this;
      return new Promise(function (resolve, reject) {
        that.data.activeid = app.globalData.activeId;//获取最新绑定设备激活ID
        console.log('refresh tv status, activeid:' + that.data.activeid)
        let dataOnline = {
          activeid: that.data.activeid
        }
        if (!that.data.activeid) {
          resolve()
          return;
        }
        njApi.isTVOnline({
          data: dataOnline,
          success(res) {
            console.log("isTVOnline success res:" + JSON.stringify(res))
            if (res.supportApplet == "yes") {//TV小维AI版本支持遥控
              that.data.bBindedTVSupportMP = true
            } else {
              that.data.bBindedTVSupportMP = false
            }
            resolve()
          },
          fail(res) {
            console.log("isTVOnline fail:" + res)
            // wx.showToast({
            //   title: '获取失败请重试',
            //   icon: 'none',
            //   image: '../../images/components/remotecontrol/close@3x.png'
            // })
            resolve()//fail时，如何toast提示用户？
          }
        });
      })
    },    
    //检查当前绑定设备状态，是否满足遥控器操作需要的条件: 1. 是否已绑定设备 2. 是否支持小程序 3.是否在线  4. (长按录音时）是否有录音权限
   _checkBindedTVStatus({type = 'tap'} = {}) {
      console.log('_checkBindedTVStatus in, type: '+type)
      //step 1: 是否绑定设备
      if (this.data.activeid == null) {
        this._showModalUnbindTV()
        return false
      }
      //step 2:是否支持小程序
     if (!this.data.bBindedTVSupportMP) {
       console.log("  bBindedTVSupportMP false.")
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
      //Step 4: 录音权限判断（长按才需要判断录音权限，短按不需要）
      if (!this.data.hasRecordAuth) {
        return this._checkUserRecordAuthStatus();
      }
      return true
    },
    _checkBindedTVStatusAsync({ type = 'tap' } = {}) {//检查当前绑定设备状态(异步)
      console.log('_checkBindedTVStatusAsync')
      let that = this
      return new Promise(function (resolve, reject) {
        if (that._checkBindedTVStatus({type})) {
          that.setData({ bBindedTVReady: true })
          resolve()
        } else {
          that.setData({ bBindedTVReady: false })
          reject()
        }
      })
    },
    //处理被绑定设备状态的接口 -end-
    //处理遥控器remoter-btn相关事件 -start-
    handleRecorderManagerMove(event) { //滑动手指取消录入，待做
      console.log('touchmove e: %o.', event)
    },
    handleRecorderManagerStart() { //touch start
      console.log('[RC] touch start, activeid：' + this.data.activeid + ', bBindedTVReady:' + this.data.bBindedTVReady);
      //set status each touch start
      this.data.bTapStatus = true;
      this.data.bLongPressStatus = false;
    },
    handleRecorderManagerStop(event) { //touch end
      let that = this
      console.log('[RC] touch end, tap: %s, longpress: %s, start record: %s, waiting voice result: %s. ', 
        that.data.bTapStatus, that.data.bLongPressStatus, that.data.bStartRecord, that.data.bWaitVoiceResult);

      if (!that.data.bWaitVoiceResult) {//当处理语音过程中，不处理任何事件,
        //fix 1: 不管是否支持，每次tap都去获取，以解决：如果从支持的TV，去绑定一台不支持的，是否状态不更新;（是否有更好方案？）
        //fix 2: 如果一直是支持的，但没有去初始化状态，导致第一次tap时会去后台获取状态，但ui没反应。
        if (that.data.bTapStatus) { //tap 
          if(!that.data.isShowMainPanel){
            that._refreshBindedTVStatusAsync()
              .then(() => that._checkBindedTVStatusAsync())
              .then(() => that._toggleMainPanel())
              .catch(() => console.warn('tap promise. bBindedTVReady:' + that.data.bBindedTVReady))
          }else {
            that._toggleMainPanel()
          }
        } else { //longpress
            that._stopRecordingSite()
        }
      }
      //reset status each touch end.
      that.data.bTapStatus = false;
      that.data.bLongPressStatus = false;
    },
    handleButtonLongPress(event) { //longpress 遥控器按钮长按事件
      console.log('[RC] longpress ...')
      this.data.bTapStatus = false;
      this.data.bLongPressStatus = true;
      if (!this._checkBindedTVStatus({ type: 'longpress' })) {
        console.log('[RC]longpress TV not ready')
        return
      }
      if (this.data.isShowTips) {//如果用户已经录过一次音了，关闭提示语
        this.handleBtnTipsClosed()
      }
      this.startRecord();
    },
    //处理遥控器remoter-btn相关事件 -end-

    //语音输入相关接口 -start-
    _saveStatusBeforeRecord() { //保存录音前的遥控器页面状态，录音完后要恢复
      console.log('_saveStatusBeforeRecord()...')
      this.data.indexStatusBakup = this.data.indexStatus;
      this.data.isShowMainPanelBakup = this.data.isShowMainPanel;
    },
    _restoreStatusAfterRecord() { //恢复录音前的遥控器页面状态
      console.log('_restoreStatusAfterRecord()...')
      this.setData({
        indexStatus: this.data.indexStatusBakup,
        isShowMainPanel: this.data.isShowMainPanelBakup
      })
      if(this.data.isShowMainPanel) {
        this.setData({
          btnContent: '按住说话',
          curBtnImg: '../../images/components/remotecontrol/voice@3x.png',
        })
      }else {
        this.setData({
          btnContent: '遥控器',
          curBtnImg: '../../images/components/remotecontrol/remoter@3x.png',
        })
      }
    },
    _showInputTips() { //随机显示语音输入提示语
      var aRecordTips = [['\"返回主页\"', '\"今天天气怎么样\"', '\"声音调到10\"', '\"打开网络设置\"']
        , ['\"猫用英语怎么说\"', '\"暂停/继续播放\"', '\"我想听周杰伦的晴天\"', '\"现在几点了\"']
        , ['\"鱼香肉丝\"', '\"这个人是谁\"', '\"我想看都挺好第五集\"', '\"深圳到北京的飞机票\"']];
      var index = Math.floor(Math.random()*3);
      this.setData({
        aInputTips: aRecordTips[index]
      })
    },
    //处理录音流程，目前仅使用腾讯方案，百度方案后续补充
    startRecord() {
      console.log('[startRecord] bStartRecord:%s, bWaitVoiceResult:%s.', this.data.bStartRecord, this.data.bWaitVoiceResult)
      if (this.data.bStartRecord || this.data.bWaitVoiceResult) {
        console.log('is recording, return.')
        return
      }
      this._saveStatusBeforeRecord()
      // 显示语音输入版面，设置相关状态
      this.setData({
        indexStatus: 'VoiceInput',
        isShowMainPanel: true,
        curBtnImg: '../../images/components/remotecontrol/voice@3x.png',
        btnContent: '松开结束',
        bStartRecord: true,
        query: ''
      })
      console.log('开始执行语音输入动画和版面进场动画');
      this._showInputTips();
      this.startRecordAnimation();   
      this.showEnterAnimaiton()
      console.log('开始录音，并倒计时');
      // this.startRecordTimer()
      this.handleTencentRecorder()
    },
    stopRecord() {
      manager.stop();
    },
    _stopRecordingSite({type = 'manual'}={}){ //type: 'auto':wx后台自动stop; 停止录制现场所有动作（包括配套计时器 UI 后台处理 以及 状态复位等）
      console.log('[_stopRecordingSite] type:%s, bStartRecord:%s, bWaitVoiceResult:%s.', type, this.data.bStartRecord, this.data.bWaitVoiceResult)
      if (type == 'wxauto') { //如果是wx后台自动stop
        this.setData({
          bWaitVoiceResult: false
        })
      }
      if(!this.data.bStartRecord) {
        console.log('_stopRecordingSite, not start, return...')
        return;
      }
      console.log('_stopRecordingSite begin...')
      this.setData({
        bStartRecord: false,
      })
      this.stopRecordTimer()
      this.stopRecordAnimation()
      if (type == 'manual'){ //如果是用户松手手动stop
        this.setData({
          bWaitVoiceResult: true, //等待语音结果
        })
        this.stopRecord()
      }
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
        that._stopRecordingSite({ type: 'wxauto' }) //case: 超时微信后台自动stop
        if (!res.result) {
          wx.showToast({
            title: '抱歉，请再说一遍',
            icon: 'none',
            duration: 1000,
            complete() {
              that._restoreStatusAfterRecord()
            }
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
            success(res) { // 文本推送成功
              console.log('pushText done!',res)
            }
          })
          setTimeout(() => {
            that.setData({
              indexStatus: 'VoiceResult'
            });
            setTimeout(()=>{
              that._restoreStatusAfterRecord()
            }, 1000)
          }, 1500)
        }
      }
      manager.onStart = function (res) {
        console.log("onStart", res)
      }
      manager.onError = function (res) {
        console.log("onError", res)
        that._stopRecordingSite({type:'wxauto'}) //case: error时自动stop
        wx.showToast({
          title: '报错，请再说一遍\r\n' + res.retcode,
          icon: 'none',
          duration: 1000,
          complete() {
            that._restoreStatusAfterRecord()
          }
        })
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

    // 动画相关的方法 -start-
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
      this._resetAnimationCircle();//复位动画效果
    },
    _drawingCanvasCircle(s, e) { //画语音输入的圆形进度条
      var me = this;
      var cxt2 = wx.createCanvasContext('canvasCircle', me);
      cxt2.setLineWidth(4);
      cxt2.setStrokeStyle('#FFD600');// 动态圆的颜色
      cxt2.setLineCap('round');
      cxt2.beginPath();
      cxt2.arc(30, 30, 29, s, e, false);
      cxt2.stroke();
      cxt2.draw();
    },
    _resetAnimationCircle() {
      console.log('reset circle ..')
      this._drawingCanvasCircle(0,0);
    },
    startRecordAnimation() {
      var me = this;
      //加载动画
      var startAngle = 1.5 * Math.PI, endAngle = 0;
      var steps = 1,speed = 100,sec = 100;
      function drawLoading () {
          if(steps < 101){
              //这里用me,同步数据,渲染页面
              endAngle = steps * 2 * Math.PI / speed + startAngle;
              me._drawingCanvasCircle(startAngle, endAngle);
              steps++;
              console.log(steps);
          }else{
              clearInterval(this.interval);
          }
      }
      this.interval = setInterval(drawLoading,sec);
    }
    // 动画相关的方法 -end-
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
    console.log('remotecontrol component ready() hasRecordAuth:' + this.data.hasRecordAuth + ',bBindedTVSupportMP:' + this.data.bBindedTVSupportMP)
    //是否有录音权限
    if (this.data.hasRecordAuth == null) { //fix:这里获取，可以避免如果有录音权限，第一次长按语音键时没任何提示也不开始录音（因为检测是异步的，同步代码直接返回了false）
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
