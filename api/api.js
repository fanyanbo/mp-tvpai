const baseUrl = 'https://wx.coocaa.com/'; 
// const baseUrl = 'https://beta-wx.coocaa.com/';
const _baseUrl = "https://tvpi.coocaa.com/";
// const _baseUrl ='https://beta-tvpi.coocaa.com/';


const getDevicesUrl = baseUrl + "articleMoviesAPI/getDevices.coocaa";//获取设备信息
const logoutUrl = baseUrl + "ccuserlogin/logout.coocaa";//登出酷开账号
const appletCollectVideoUrl = baseUrl + "articleMoviesAPI/appletCollectVideo.coocaa";//收藏影片
const clickLikeUrl = baseUrl + "articleMoviesAPI/clickLike.coocaa";//点赞接口
const appletEmpCollectArticleUrl = baseUrl + "articleMoviesAPI/appletEmpCollectArticle.coocaa";//收藏文章
const saveArticleCommentByUserUrl = baseUrl + "articleMoviesAPI/saveArticleCommentByUser.coocaa";//保存评论
const saveUserVoteUrl = baseUrl + "articleMoviesAPI/saveUserVote.coocaa";//保存投票
const devicesPushUrl = baseUrl + "articleMoviesAPI/devicesPush.coocaa";//推送影视
const getArticleDetailUrl = baseUrl + "articleMoviesAPI/getArticleDetail.coocaa";//文章详情
const getArticleCommentUrl = baseUrl + "articleMoviesAPI/getArticleComment.coocaa";//评论
const getArticleMoviesUrl = baseUrl + "articleMoviesAPI/getArticleMovies.coocaa";//获取相关影片
const getMoviesDetailUrl = baseUrl + "articleMoviesAPI/getMoviesDetail.coocaa";//影视详情和相关文章
const getBannersUrl = baseUrl + "spread/getBanners.coocaa";//获取轮播图数据
const saveUserFeedbackUrl = baseUrl + "articleMoviesAPI/saveUserFeedback.coocaa";//保存用户反馈
const getStreamsUrl = baseUrl + "spread/getStreams.coocaa";//获取信息流
const getCaptchaUrl = baseUrl + "ccuserlogin/getCaptcha.coocaa";//获取验证码
const captchaLoginUrl = baseUrl + "ccuserlogin/captchaLogin.coocaa";//登录酷开账号
//const getVideoDetailUrl = baseUrl + "moviesAPI/getVideoDetail.coocaa";//获取影片详情接口
//const getRelateVideoListUrl = baseUrl + "moviesAPI/getRelateVideoList.coocaa";//获取猜你喜欢（关联影片列表）
//const getTvSegmentListUrl = baseUrl + "moviesAPI/getTvSegmentList.coocaa";//获取剧集列表接口
const searchUrl = baseUrl + "moviesAPI/search.coocaa";//搜索
const getHotSearchListUrl = baseUrl + "moviesAPI/getHotSearchList.coocaa";//热门搜索
const getCollectArticleUrl = baseUrl + "appletUsers/getCollectArticle.coocaa";//个人中心页相关接口
const getEmpCommentUrl = baseUrl + "appletUsers/getEmpComment.coocaa";//个人中心获取参与的话题
const checkUserUrl = baseUrl + "ccuserlogin/checkUser.coocaa";//根据ccssesion获取当前的用户信息
const getCollectMoviesUrl = baseUrl + "appletUsers/getCollectMovies.coocaa";//个人中心收藏影片接口
const getSubChnListUrl = baseUrl + "moviesAPI/getSubChnList.coocaa";//获取影视频道二级分类列表接口内容
const getTagListUrl = baseUrl + "moviesAPI/getTagList.coocaa";//获取频道筛选标签列表接口
const getChnVideoListUrl = baseUrl + "moviesAPI/getChnVideoList.coocaa";//获取频道内容列表接口
const getSessionUrl = baseUrl + "appletAPI/getSession.coocaa";//使用登录凭证 code 获取 session_key 和 openid
const getuserinfoUrl = baseUrl + "appletAPI/getuserinfo.coocaa";//微信小程序API接口
const saveEventLogUrl = baseUrl + "userEventLog/saveEventLog.coocaa";//事件收集
const bindDeviceListUrl = baseUrl + "wxUserDeviceAPI/bindDeviceList.coocaa";//设备接口列表
const bindDeviceUrl = baseUrl + "wxUserDeviceAPI/bindDevice.coocaa";//用户绑定接口
const changeDeviceStatusUrl = baseUrl + "wxUserDeviceAPI/changeDeviceStatus.coocaa";//修改设备名称或修改设备绑定状态接口

const oneclassifyUrl = _baseUrl + "video/client/longvideo/oneclassify";// 获取一级标签分类
const recommendlistUrl = _baseUrl + "video/client/longvideo/recommendlist";// 获取首页推荐接口
const recommendmorelistUrl = _baseUrl + "video/client/longvideo/recommendmorelist";// 获取标签页详细内容
const getVideoDetailUrl = _baseUrl + "video/client/longvideo/videodetail";//获取影片详情接口
const relatelongUrl = _baseUrl + "video/client/longvideo/relatelong";//相关正片
const getTvSegmentListUrl = _baseUrl + "video/client/longvideo/episodeslist";//获取剧集列表接口
const addUrl = _baseUrl + "video/client/collect/add";//收藏接口

const addpushhistoryUrl = _baseUrl + "video/client/pushhistory/add";//添加推送历史
const pushhistorylistUrl = _baseUrl + "video/client/pushhistory/list";//查询推送历史
const batchdelUrl = _baseUrl + "video/client/pushhistory/batchdel";//删除推送历史

module.exports = {
  getDevicesUrl:getDevicesUrl,
  logoutUrl: logoutUrl,
  appletCollectVideoUrl: appletCollectVideoUrl,
  clickLikeUrl: clickLikeUrl,
  appletEmpCollectArticleUrl:appletEmpCollectArticleUrl,
  saveArticleCommentByUserUrl: saveArticleCommentByUserUrl,
  saveUserVoteUrl: saveUserVoteUrl,
  devicesPushUrl: devicesPushUrl,
  getArticleDetailUrl: getArticleDetailUrl,
  getArticleCommentUrl: getArticleCommentUrl,
  getArticleMoviesUrl: getArticleMoviesUrl,
  getMoviesDetailUrl: getMoviesDetailUrl,
  getBannersUrl: getBannersUrl,
  saveUserFeedbackUrl: saveUserFeedbackUrl,
  getStreamsUrl: getStreamsUrl,
  getCaptchaUrl: getCaptchaUrl,
  captchaLoginUrl: captchaLoginUrl,
  getVideoDetailUrl: getVideoDetailUrl,
  getTvSegmentListUrl: getTvSegmentListUrl,
  searchUrl: searchUrl,
  getHotSearchListUrl: getHotSearchListUrl,
  getCollectArticleUrl: getCollectArticleUrl,
  getEmpCommentUrl: getEmpCommentUrl,
  checkUserUrl: checkUserUrl,
  getCollectMoviesUrl: getCollectMoviesUrl,
  getSubChnListUrl: getSubChnListUrl,
  getTagListUrl: getTagListUrl,
  getChnVideoListUrl: getChnVideoListUrl,
  getSessionUrl: getSessionUrl,
  getuserinfoUrl: getuserinfoUrl,
  saveEventLogUrl: saveEventLogUrl,
  bindDeviceListUrl: bindDeviceListUrl,
  bindDeviceUrl: bindDeviceUrl,
  oneclassifyUrl: oneclassifyUrl,
  recommendlistUrl: recommendlistUrl,
  recommendmorelistUrl: recommendmorelistUrl,
  relatelongUrl: relatelongUrl,
  changeDeviceStatusUrl: changeDeviceStatusUrl,
  addUrl: addUrl,
  addpushhistoryUrl: addpushhistoryUrl,
  pushhistorylistUrl: pushhistorylistUrl,
  batchdelUrl: batchdelUrl,
}