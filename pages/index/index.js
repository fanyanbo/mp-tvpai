Page({
  data: {
    imgUrls: [
      '../../images/banner1.jpg',
      '../../images/banner2.jpg',
      '../../images/banner3.jpg'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 10000,
    duration: 1000,
    column:[
      {
        "text":"电影",
        "columnId":"1"
      },
      {
        "text": "电视剧",
        "columnId": "2"
      },
      {
        "text": "综艺",
        "columnId": "1"
      },
      {
        "text": "动漫",
        "columnId": "1"
      },
      {
        "text": "娱乐",
        "columnId": "1"
      },
      {
        "text": "电视剧",
        "columnId": "1"
      }, {
        "text": "电影",
        "columnId": "1"
      }
    ],
    list:[
      {
        "title": "VIP专区",
        "typeId": "1",
        caseItems:{
          "listView":[
            {
              "img": "../../images/banner1.jpg",
              "name": "创业时代",
              "id": "1"
            }, {
              "img": "../../images/banner1.jpg",
              "name": "创业时代",
              "id": "2"
            }, {
              "img": "../../images/banner1.jpg",
              "name": "创业时代",
              "id": "2"
            }, {
              "img": "../../images/banner1.jpg",
              "name": "创业时代",
              "id": "2"
            }, {
              "img": "../../images/banner1.jpg",
              "name": "创业时代",
              "id": "2"
            }
          ]
        }
      }, {
        "title": "热门电视剧",
        "typeId": "2",
        caseItems: {
          "listView": [
            {
              "img": "../../images/banner2.jpg",
              "name": "创业时代",
              "id": "1"
            }, {
              "img": "../../images/banner2.jpg",
              "name": "创业时代",
              "id": "2"
            }, {
              "img": "../../images/banner2.jpg",
              "name": "创业时代",
              "id": "2"
            }, {
              "img": "../../images/banner2.jpg",
              "name": "创业时代",
              "id": "2"
            }, {
              "img": "../../images/banner2.jpg",
              "name": "创业时代",
              "id": "2"
            }
          ]
        }
      }
    ]

  },

  onLoad(options) {
    console.log('first onLoad监听页面加载');
  },

  onReady() {
    console.log('first onReady监听页面初次渲染完成');
  },

  onShow() {
    console.log('first onShow监听页面显示');
  },

  onHide() {
    console.log('first onHide监听页面隐藏');
  },

  onUnload() {
    console.log('first onUnload监听页面卸载');
  }
});
