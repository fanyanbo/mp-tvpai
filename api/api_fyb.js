const config = require('../config/index');
const baseUrl_wx = config.baseUrl_wx;
const baseUrl_tvpai = config.baseUrl_tvpai;

// 电视派业务后台接口
const searchByKeywordUrl = baseUrl_tvpai + "video/client/search/list";// 根据关键字搜索
const getHotKeywordUrl =  baseUrl_tvpai + "video/client/search/hot";// 获取热门关键词
const getHistoryKeywordUrl =  baseUrl_tvpai + "video/client/search/history";// 获取搜索历史关键词
const collectUrl = baseUrl_tvpai + "video/client/collect/add"; //收藏或取消影片
const getCollectedListUrl = baseUrl_tvpai + "video/client/collect/list"; //获取已收藏影片列表
const getOneClassifyUrl = baseUrl_tvpai + "video/client/longvideo/oneclassify";// 获取一级标签分类
const getRecommendListUrl = baseUrl_tvpai + "video/client/longvideo/recommendlist";// 获取首页推荐
const getHistoryListUrl = baseUrl_tvpai + "video/client/pushhistory/list";//获取历史列表

// 微信业务后台接口
const getBindDeviceListUrl = baseUrl_wx + "wxUserDeviceAPI/bindDeviceList.coocaa";//获取已绑定设备列表
const pushMediaUrl = baseUrl_wx + "articleMoviesAPI/devicesPush.coocaa";//推送影视内容
const getBannerDataUrl = baseUrl_wx + "spread/getStreams.coocaa";//获取Banner数据
const getSessionUrl = baseUrl_wx + "appletAPI/getSession.coocaa";//使用登录凭证code等参数获取session_key和openid
const getUserInfoUrl = baseUrl_wx + "appletAPI/getuserinfo.coocaa";//微信小程序API接口
const bindDeviceUrl = baseUrl_wx + "wxUserDeviceAPI/bindDevice.coocaa";//绑定设备

module.exports = {
  searchByKeywordUrl: searchByKeywordUrl,
  getHotKeywordUrl: getHotKeywordUrl,
  getHistoryKeywordUrl: getHistoryKeywordUrl,
  collectUrl: collectUrl,
  getCollectedListUrl: getCollectedListUrl,
  getOneClassifyUrl: getOneClassifyUrl,
  getRecommendListUrl: getRecommendListUrl,
  getBindDeviceListUrl: getBindDeviceListUrl,
  pushMediaUrl: pushMediaUrl,
  getBannerDataUrl: getBannerDataUrl,
  getSessionUrl: getSessionUrl,
  getUserInfoUrl: getUserInfoUrl,
  bindDeviceUrl: bindDeviceUrl,
  getHistoryListUrl: getHistoryListUrl
}