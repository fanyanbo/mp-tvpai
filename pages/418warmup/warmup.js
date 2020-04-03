const utils = require('../../utils/util_fyb')
const activity = require('../../api/activity/index')

Page({
    data: {
        videoUrl: 'http://webapp.skysrt.com/common-activity/webx/okr/m/418warmup/v/a731dca7f008ed7692732d1d7a2418e8.mp4',
        posterUrl: 'http://webapp.skysrt.com/common-activity/webx/miniapp/tvpai/418/poster.png',
        contactImgUrl: 'http://webapp.skysrt.com/common-activity/webx/miniapp/tvpai/418/contact.png',
        contactCardTitle: '酷开418会员日福利提前领',
        tabbarList: ['守护家园 助力抗疫', '418会员日三重礼'],
        tabbarActiveIndex: 0,
        desc: `1.所有用户领取限量福利，需授权酷开爱看电视公众号获取身份信息。
        2.酷开418超级会员日福利领取活动期间，每天限量领取1万分礼物，礼物包括但不限于：实物奖品、现金红包、优惠券以及酷开418守护小家园活动通用货币：幸福值。
        3.每个用户在领取页面每日均有2次领取机会。次日将会重置2次领取机会。该机会不可叠加，不可转让。
        4.领取礼品机会为先到先得，若已领取完成则请关注次日活动并进行领取。
        5.用户可开通提醒功能，可在次日活动有效时间内收到提醒，以便领取限量奖品。
        6.领取到优惠券、幸福值等奖品的用户需绑定酷开系统电视后即可使用。
        7.教育优惠券、少儿优惠券自领取30日内有效；电竞优惠券自领取3日内有效。同一类型优惠券不可累加使用，一次订单仅可使用一张进行抵扣，不可转赠，不可提现。
        8.领取到现金红包的用户需及时进行提现。
        9.酷开418超级会员日福利领取活动时间为：4月5日0点-4月9日24点。
        10.该活动解释权归酷开所有。`,
        isLoadComplete: false,
        isManualImageLoad1: false,
        isManualImageLoad2: false,
        isPlaying: true
    },
    onReady: function () {
        console.log('warmup onReady')
        this.videoContext = wx.createVideoContext('myVideo')
    },
    onLoad: function () {
        console.log('warmup onLoad')
        // 调用活动后台接口
        // activity.get418ActivityInitData().then(res => {
        //     console.log('get418ActivityInitData', res)
        // })
    },
    onShow: function () {
        console.log('warmup onShow')
        wx.reportAnalytics('okr_page_show', {
            page_name: '418预热页',
            params: ''
        })
    },
    handleGobackClick: function () {
        utils.navigateBack()
    },
    handleContact(e) {
        console.log('handleContact', e.detail)
        wx.reportAnalytics('okr_button_clicked', {
            page_name: '418预热页',
            button_name: '点击联系客服',
            params: ''
        })
    },
    handleTabbarClick: function (e) {
        const _activeIndex = e.currentTarget.dataset['index'];
        console.log('切换tabbar activeIndex =' + _activeIndex);
        this.setData({
            tabbarActiveIndex: _activeIndex
        })
    },
    handlePlayClick: function () {
        console.log('handlePlayClick isPlaying = ' + this.data.isPlaying)
        this.data.isPlaying ? this.videoContext.pause() : this.videoContext.play()
        this.setData({
            isPlaying: !this.data.isPlaying
        })
        // 测试订阅消息授权框
        // wx.requestSubscribeMessage({
        //     tmplIds: ['L25aAIe-sduzEU0vHrOF5zS2zxVznQ-mBKR4Dml1So4'],
        //     success(res) {
        //         console.log(res)
        //     }
        // })
    },
    handleGuideClick: function () {
        console.log('handleGuideClick')
        this.setData({
            isShowPopup: true,
            isFixedWindow: true
        })
    },
    hidePopup: function () {
        this.setData({
            isShowPopup: false,
            isFixedWindow: false
        })
    },
    imageLoad() {
        console.log('imageLoad')
        this.setData({ isLoadComplete: true })
    },
    munualImageLoad(res) {
        console.log('munualImageLoad')
        let _pageIndex = res.target.dataset.index
        switch (_pageIndex) {
            case 0:
                this.setData({
                    isManualImageLoad1: true,
                    isManualImageLoad2: false,
                    manualImageheight: res.detail.height
                })
                break;
            case 1:
                this.setData({
                    isManualImageLoad1: false,
                    isManualImageLoad2: true,
                    manualImageheight: res.detail.height
                })
                break;
        }

    }
})  