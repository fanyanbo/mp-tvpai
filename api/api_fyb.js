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
const getRecommendListUrl = "https://beta-tvpi.coocaa.com/" + "video/client/longvideo/recommendlist";// 获取首页推荐
const getRecommendMoreListUrl = baseUrl_tvpai + "video/client/longvideo/recommendmorelist";// 获取首页推荐更多内容
const getHistoryListUrl = baseUrl_tvpai + "video/client/pushhistory/list";//获取历史列表
const addPushHistoryUrl = baseUrl_tvpai + "video/client/pushhistory/add";//添加推送历史项
const delPushHistoryUrl = baseUrl_tvpai + "video/client/pushhistory/batchdel";//删除推送历史项
const getVideoDetailUrl = "https://beta-tvpi.coocaa.com/" + "video/client/longvideo/videodetail";//获取影片详情
const getRelatedVideoUrl = "https://beta-tvpi.coocaa.com/" + "video/client/longvideo/relatelong";//获取关联影片
const getSegmentListUrl = baseUrl_tvpai + "video/client/longvideo/episodeslist";//获取剧集列表
const getRelatedActorsUrl = "https://beta-tvpi.coocaa.com/" + "video/client/longvideo/videorelateactors"; //获取相关影人信息
const getRelatedVideoByActorUrl = "https://beta-tvpi.coocaa.com/" + "video/client/longvideo/actorrelatevideos"; //获取影人相关影片
const getTopicUrl = "https://beta-tvpi.coocaa.com/" + "video/client/topic/get"; //获取片单信息
const getFavoriteTopicUrl = "https://beta-tvpi.coocaa.com/" + "video/client/topic/getcollect"; //获取收藏的片单
const setFavoriteTopicUrl = "https://beta-tvpi.coocaa.com/" + "video/client/topic/collect"; //收藏/取消收藏片单


// 微信业务后台接口
const getBindDeviceListUrl = baseUrl_wx + "wxUserDeviceAPI/bindDeviceList.coocaa";//获取已绑定设备列表
const pushMediaUrl = baseUrl_wx + "articleMoviesAPI/devicesPush.coocaa";//推送影视内容
const getBannerDataUrl = "https://beta-wx.coocaa.com/" + "spread/homePageBanners.coocaa";//获取Banner数据
const getSessionUrl = baseUrl_wx + "appletAPI/getSession.coocaa";//使用登录凭证code等参数获取session_key和openid
const getUserInfoUrl = baseUrl_wx + "appletAPI/getuserinfo.coocaa";//微信小程序API接口
const bindDeviceUrl = baseUrl_wx + "wxUserDeviceAPI/bindDevice.coocaa";//绑定设备
const changeDeviceStatusUrl = baseUrl_wx + "wxUserDeviceAPI/changeDeviceStatus.coocaa";//修改设备名称或修改设备绑定状态接口
const getRelatedArticlesUrl = "https://beta-wx.coocaa.com/" + "articleMoviesAPI/linkArticles.coocaa";//获取影片关联文章
const searchArticlesUrl = "https://beta-wx.coocaa.com/" + "articleMoviesAPI/searchArticles.coocaa";//搜索文章
const submitFavoriteArticleUrl = "https://beta-wx.coocaa.com/" + "articleMoviesAPI/appletEmpCollectArticle.coocaa"; //文章的收藏/取消收藏
const getFavoriteArticlesUrl = "https://beta-wx.coocaa.com/" + "appletUsers/getCollectArticle.coocaa";//获取收藏文章
const getFavoriteVideosUrl = "https://beta-wx.coocaa.com/" + "appletUsers/getCollectMovies.coocaa";//获取收藏影片
const getCommentsUrl = "https://beta-wx.coocaa.com/" + "articleMoviesAPI/getCommentList.coocaa";//获取影片/文章评论
const submitCommentUrl = "https://beta-wx.coocaa.com/" + "articleMoviesAPI/saveCommentByUser.coocaa";//提交影片/文章评论
const submitClickLikeUrl = "https://beta-wx.coocaa.com/" + "articleMoviesAPI/clickLike.coocaa";//提交某条评论的点赞/取消点赞
const addMovieFavoriteUrl = "https://beta-wx.coocaa.com/" + "articleMoviesAPI/appletCollectVideo.coocaa";//添加影片收藏
const getFavoriteStatusUrl = "https://beta-wx.coocaa.com/" + "moviesAPI/getCollectStatus.coocaa";//根据movieid获取收藏状态
const delMovieFavoriteUrl = "https://beta-wx.coocaa.com/" + "articleMoviesAPI/appletCancelCollectVideo.coocaa";//删除影片收藏
const formIdEventCollectUrl = baseUrl_wx + 'userEventLog/saveEventLog.coocaa';//为发送模板消息收集form-id

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
  getHistoryListUrl: getHistoryListUrl,
  addPushHistoryUrl: addPushHistoryUrl,
  delPushHistoryUrl: delPushHistoryUrl,
  changeDeviceStatusUrl: changeDeviceStatusUrl,
  getVideoDetailUrl: getVideoDetailUrl,
  getRelatedVideoUrl: getRelatedVideoUrl,
  getSegmentListUrl: getSegmentListUrl,
  getRelatedActorsUrl: getRelatedActorsUrl,
  getRelatedVideoByActorUrl: getRelatedVideoByActorUrl,
  getRecommendMoreListUrl: getRecommendMoreListUrl,
  getTopicUrl: getTopicUrl,
  getRelatedArticlesUrl: getRelatedArticlesUrl,
  searchArticlesUrl: searchArticlesUrl,
  getFavoriteArticlesUrl: getFavoriteArticlesUrl,
  getFavoriteVideosUrl: getFavoriteVideosUrl,
  getCommentsUrl: getCommentsUrl,
  submitCommentUrl: submitCommentUrl,
  submitClickLikeUrl: submitClickLikeUrl,
  getFavoriteTopicUrl: getFavoriteTopicUrl,
  setFavoriteTopicUrl: setFavoriteTopicUrl,
  addMovieFavoriteUrl: addMovieFavoriteUrl,
  getFavoriteStatusUrl: getFavoriteStatusUrl,
  submitFavoriteArticleUrl: submitFavoriteArticleUrl,
  delMovieFavoriteUrl: delMovieFavoriteUrl,
  formIdEventCollectUrl,
}