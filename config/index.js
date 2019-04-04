/**
 * author : fanyanbo@coocaa.com
 */

const env = 'prod';
// const env = 'dev';

const config = (env === 'prod') ? {
    baseUrl_nj: "https://user.coocaa.com/",
    baseUrl_tvpai: "https://tvpi.coocaa.com/",
    baseUrl_wx: "https://wx.coocaa.com/"
} : {
    baseUrl_nj: "https://user.coocaa.com/",
    baseUrl_tvpai: "https://beta-tvpi.coocaa.com/",
    baseUrl_wx: "https://beta-wx.coocaa.com/"
}

console.log("config", config)

module.exports = config;

