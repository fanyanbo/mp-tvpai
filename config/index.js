/**
 * author : fanyanbo@coocaa.com
 */

// const env = 'prod';
const env = 'dev';

const config = (env === 'prod') ? {
    baseUrl_nj: "https://user.coocaa.com/",
    baseUrl_tvpai: "https://tvpi.coocaa.com/",
    baseUrl_wx: "https://wx.coocaa.com/",               //微信url(hengyanyan)
    baseUrl_sz: "https://dev-api-business.skysrt.com/", //产品包url (chenzonghui)
    baseUrl_pay: "https://pay.coocaa.com/",             //支付url(chenyuan)
    baseUrl_acct: "https://passport.coocaa.com/",       //账户url(chenxiguang)
    baseUrl_allowance: "https://jintie.coocaa.com/"     //津贴url(zhangyuhao)
} : {
    baseUrl_nj: "https://user.coocaa.com/",
    baseUrl_tvpai: "https://beta-tvpi.coocaa.com/",
    baseUrl_wx: "https://beta-wx.coocaa.com/",
    baseUrl_sz: "http://dev.business.video.tc.skysrt.com/",
    baseUrl_pay: "https://beta-pay.coocaa.com/",
    baseUrl_acct: "http://beta.passport.coocaa.com/",
    baseUrl_allowance: "https://beta-jintie.coocaa.com/"
}

console.log("config", config)

module.exports = config;

