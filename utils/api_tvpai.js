// const baseUrl ='https://beta-tvpi.coocaa.com/';
const baseUrl ='https://tvpi.coocaa.com/';

const searchByKeywordUrl = baseUrl + "video/client/search/list";// 根据关键字搜索
const getHotKeywordUrl =  baseUrl + "video/client/search/hot";// 获取热门关键词
const getHistoryKeywordUrl =  baseUrl + "video/client/search/history";// 获取搜索历史关键词

module.exports = {
  searchByKeywordUrl: searchByKeywordUrl,
  getHotKeywordUrl: getHotKeywordUrl,
  getHistoryKeywordUrl: getHistoryKeywordUrl
}