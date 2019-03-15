const config = require('../config/index');
const baseUrl_wx = config.baseUrl_wx;
const baseUrl_tvpai = config.baseUrl_tvpai;

// 电视派业务后台接口
const searchByKeywordUrl = baseUrl_tvpai + "video/client/search/list";// 根据关键字搜索
const getHotKeywordUrl =  baseUrl_tvpai + "video/client/search/hot";// 获取热门关键词
const getHistoryKeywordUrl =  baseUrl_tvpai + "video/client/search/history";// 获取搜索历史关键词
const collectUrl = baseUrl_tvpai + "video/client/collect/add" //收藏或取消影片
const getCollectedListUrl = baseUrl_tvpai + "video/client/collect/list" //获取已收藏影片列表

// 微信业务后台接口
const getBindDeviceListUrl = baseUrl_wx + "wxUserDeviceAPI/bindDeviceList.coocaa";//获取已绑定设备列表
const pushMediaUrl = baseUrl_wx + "articleMoviesAPI/devicesPush.coocaa";//推送影视内容

module.exports = {
  searchByKeywordUrl: searchByKeywordUrl,
  getHotKeywordUrl: getHotKeywordUrl,
  getHistoryKeywordUrl: getHistoryKeywordUrl,
  collectUrl: collectUrl,
  getCollectedListUrl: getCollectedListUrl,
  getBindDeviceListUrl: getBindDeviceListUrl,
  pushMediaUrl: pushMediaUrl
}