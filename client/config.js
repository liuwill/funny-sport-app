/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'http://localhost:5757';

var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,

        // 检查计步情况
        checkStepUrl: `${host}/weapp/award/check/step`,

        // 获取计步奖励
        acceptStepAwardUrl: `${host}/weapp/award/accept/step`,

        // 获取商品列表
        listGoodsUrl: `${host}/weapp/goods/list`,

        // 获取商品详情
        goodsInfoUrl: `${host}/weapp/goods/info`,

        // 兑换商品
        exchangeUrl: `${host}/weapp/goods/info`,

        // 登录地址，用于建立会话
        loginUrl: `${host}/weapp/login`,

        // 测试的请求地址，用于测试会话
        requestUrl: `${host}/weapp/user`,

        // 测试的信道服务地址
        tunnelUrl: `${host}/weapp/tunnel`,

        // 上传图片接口
        uploadUrl: `${host}/weapp/upload`
    }
};

module.exports = config;
