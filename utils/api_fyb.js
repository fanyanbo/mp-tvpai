// 电视派业务后台接口
// const baseUrl ='https://beta-tvpi.coocaa.com/';
const baseUrl ='https://tvpi.coocaa.com/';

const searchByKeywordUrl = baseUrl + "video/client/search/list";// 根据关键字搜索
const getHotKeywordUrl =  baseUrl + "video/client/search/hot";// 获取热门关键词
const getHistoryKeywordUrl =  baseUrl + "video/client/search/history";// 获取搜索历史关键词


// 微信业务后台接口
// const wxBaseUrl = 'https://wx.coocaa.com/'; 
const wxBaseUrl = 'http://beta-wx.coocaa.com/';

const getBindDeviceListUrl = wxBaseUrl + "wxUserDeviceAPI/bindDeviceList.coocaa";//获取已绑定设备列表
const pushMediaUrl = wxBaseUrl + "articleMoviesAPI/devicesPush.coocaa";//推送影视内容

module.exports = {
  searchByKeywordUrl: searchByKeywordUrl,
  getHotKeywordUrl: getHotKeywordUrl,
  getHistoryKeywordUrl: getHistoryKeywordUrl,
  getBindDeviceListUrl: getBindDeviceListUrl,
  pushMediaUrl: pushMediaUrl
}