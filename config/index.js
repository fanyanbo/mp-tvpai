/**
 * author : fanyanbo@coocaa.com
 */

// const env = 'prod';
const env = 'dev';

const config = (env === 'prod') ? {
    baseUrl_nj: "http://weixin.rangnihaokan.com",
    baseUrl_nj2: "https://user.coocaa.com",
    baseUrl_tvpai: "https://tvpi.coocaa.com/",
    baseUrl_wx: "http://wx.coocaa.com"
} : {
    baseUrl_nj: "http://weixin.rangnihaokan.com",
    baseUrl_nj2: "https://user.coocaa.com",
    baseUrl_tvpai: "https://beta-tvpi.coocaa.com/",
    baseUrl_wx: "http://beta-wx.coocaa.com"
}

console.log("config", config)

module.exports = config;

