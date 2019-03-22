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
    activeid: null, //设备激活id
    btnContent: '遥控器', 
    tipsContent: '提示：长按遥控器按钮，就能语音啦',
    query: '你可以说: \r\n \r\n 声音调到10 \r\n 刘德华 \r\n 我想看世界杯 \r\n 返回主页 \r\n 创维的客服电话是多少',
    isShowMainPanel: false, // 是否显示遥控器主面板
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
    oneTip: '您可以说：“今天天气怎么样”',//todo
    // 动画数据
    count: 0, // 设置 计数器 初始为0
    countTimer: null, // 设置 定时器 初始为null
    animationData: {} ,
    //被绑定设备状态
    bBindedTVOnline: null, //绑定TV是否在线
    bBindedTVSupportMP: null,//绑定TV是否支持小程序
    bBindedTVReady: false //绑定TV是否准备就绪
  },
  methods: {  
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
      console.log('没有录音权限，引导用户进行授权')
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
                } else {
                  wx.showToast({  // 申请录音权限失败
                    title: '语音遥控需要小程序录音权限',
                    icon: 'none',
                    duration: 2000,
                  })
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
        njApi.isTVOnline({
          data: dataOnline,
          success(res) {
            console.log("isTVOnline success res:" + JSON.stringify(res))
            if (res.status == "online") {//TV在线
              that.data.bBindedTVOnline = true
            } else {
              that.data.bBindedTVOnline = false
            }
            if (res.supportApplet == "yes") {//TV小维AI版本支持遥控
              that.data.bBindedTVSupportMP = true
            } else {
              that.data.bBindedTVSupportMP = false
            }
            resolve()
          },
          fail(res) {
            console.log("isTVOnline fail:" + res)
            wx.showToast({
              title: '加载失败请重试',
              icon: 'none',
              image: '../../images/components/remotecontrol/close@3x.png'
            })
            reject()//fail时，如何toast提示用户？
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
      //step 3:是否在线
      if (!this.data.bBindedTVOnline) {
        console.log(" bBindedTVOnline false.")
        wx.showToast({
          title: '抱歉，当前绑定的设备不在线，\r\n请确认是否开机联网',
          icon: 'none'
        })
        return false
      }
      if( type == 'tap') {
        console.log(' type:tap tv ready')
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
    _toggleMainPanel() { //打开或关闭遥控器主面板
      console.log('mainpanel: ' + this.data.isShowMainPanel)
      if (this.data.isShowMainPanel) {
        this.setData({
          indexStatus: '',
          isShowMainPanel: false,
          curBtnImg: '../../images/components/remotecontrol/remoter@3x.png',
          btnContent: '遥控器',
          query:''
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
    //处理遥控器相关事件
    handleRecorderManagerStart() { //touch start
      console.log('语音键 touch start activeid：' + this.data.activeid);
      this.data.longtapStatus = false;//reset each time
    },
    handleRecorderManagerStop(event) { //touch end
      console.log('语音键 touch end, 是否等待语音结果: ' + this.data.waitVoiceResult 
                  + ", 是否长按状态: " + this.data.longtapStatus
                  + ', 是否开始录制:' + this.data.bStartRecord);
      let that = this
      if (!that.data.longtapStatus && !that.data.isShowMainPanel) {//每次 Tap 进入遥控器前，刷新一次被绑定TV状态:
        console.log('tap enter rc, refresh tv status...')
        that.setData({ bBindedTVReady: false }); //reset status
        that._refreshBindedTVStatusAsync()
          .then( () => that._checkBindedTVStatusAsync() )
          .then( () => processTouchEnd() )
          .catch( () => console.warn('tap promise error...bBindedTVReady:' + that.data.bBindedTVReady) )
      } else {  //longpress or 进入遥控器后的tap
        processTouchEnd()
      }
      function processTouchEnd() {
        if (!that.data.bBindedTVReady) {
          console.log('TV not ready, return.')
          return
        }else {
          console.log('TV ready, go on...')
        }
        try {
          if (!that.data.waitVoiceResult) { //当处理语音过程中，不处理任何事件, 注意不能直接返回，需处理第一次情况
            if (that.data.bStartRecord) { //当长按时手指松开，设置按钮样式，显示语音结果版面
              console.log('longpress 手指松开，停止录音，停止超时倒计时，停止录音动画，等待解析结果...');
              that._stopRecordingSite()
            } else { //当短按手指松开，显示遥控版面
              console.log('tap 手指松开');
              that._toggleMainPanel()
            }
          }
        }
        catch (err) {
          console.log('processTouchEnd catch err ', err);
        }
      }
    },
    handleButtonLongTap(event) { //longpress 遥控器按钮长按事件
      console.log('longpress 语音键...')
      this.setData({
        longtapStatus: true
      })
      if (!this._checkBindedTVStatus({ type: 'longpress' }))
      {
        console.log('longpress TV not ready')
        return
      } 
      console.log('longpress TV ready 有录音权限')
      if (this.data.isShowTips) {//如果用户已经录过一次音了，关闭提示语
        this.handleBtnTipsClosed()
      }
      this.startRecord();
    },
    handleBtnTipsClosed() { //关闭提示语
      console.log('handleBtnTipsClosed()')
      app.globalData.isShowTips = false
      this.setData({ isShowTips: false })
    },
    _toggleGeneralKeyStatus({id, status}) {  //处理遥控器一般按键UI显示状态
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
          this.setData({ isShutdownFocus: status })
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
          this.setData( {curDirectorImg: img} )
          break
      }
    },
    handlePushController(e) { //遥控器一般按键 按下
      const curId = e.currentTarget.id;
      this._toggleGeneralKeyStatus({id:curId,status:true})
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
    handleTapMask(e) {  //处理遮罩层点击事件,等待语音解析过程不处理该事件
      console.log('触发mask点击事件', e);
      if (!this.data.waitVoiceResult && this.data.isShowMainPanel) {
        this._toggleMainPanel()
      }
    },
    _resetRecordPanelStatus() {
      console.log('hideRemoteControl()')
      this.setData({
        query: '你可以说: \r\n \r\n 声音调到10 \r\n 刘德华 \r\n 我想看世界杯 \r\n 返回主页 \r\n 创维的客服电话是多少',
        waitVoiceResult: false
      })
    },
    //处理录音流程，目前仅使用腾讯方案，百度方案后续补充
    startRecord() {
      // 显示语音输入版面，设置相关状态
      this.setData({
        indexStatus: 'VoiceInput',
        voiceInputStatus: true,
        isShowMainPanel: true,
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
    _stopRecordingSite(){ //停止录制现场所有动作（包括配套计时器 UI 后台处理 以及 状态复位等）
      this.stopRecordTimer()
      this.stopRecordAnimation()
      this.stopRecord()
      console.log('_stopRecordingSite 1 waitVoiceResult: ' + this.data.waitVoiceResult)
      this.setData({
        indexStatus: 'VoiceResult',
        longtapStatus: false,
        bStartRecord: false,
        voiceInputStatus: false,
        waitVoiceResult: true, //等待语音结果
        curBtnImg: '../../images/components/remotecontrol/remoter@3x.png',
        btnContent: '按住说话'
      })
      console.log('_stopRecordingSite 2 waitVoiceResult: ' + this.data.waitVoiceResult)
      //等待5S，模拟语音处理，然后重置参数
      // setTimeout(() => {
      //   that.setData({
      //     indexStatus: '',
      //     longtapStatus: false,
      //     waitVoiceResult: false,
      //     isShowMainPanel: false,
      //     query: ''
      //   }) 
      // }, 5000)
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
          that._resetRecordPanelStatus()
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
          // 2s后回到主页面
          setTimeout(() => that._resetRecordPanelStatus(), 2000)
        }
      }
      manager.onStart = function (res) {
        console.log("onStart", res)
      }
      manager.onError = function (res) {
        console.log("onError", res)
        wx.showToast({
          title: '报错，请再说一遍\r\n' + res.retcode,
          icon: 'none',
          duration: 1000,
        })
        setTimeout(() => that._resetRecordPanelStatus(), 2000)
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

 const f = () => console.log('now');
 (
   () => new Promise(
     resolve => resolve(f())
   )
 )();

 console.log('next')
 