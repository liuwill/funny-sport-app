const CONF = {
    port: '5757',
    rootPathname: '',

    // 微信小程序 App ID
    appId: '',

    // 微信小程序 App Secret
    appSecret: '',

    // 是否使用腾讯云代理登录小程序
    useQcloudLogin: true,

    qcloudAppId: '',
    qcloudSecretId: '',
    serverHost: '',
    tunnelServerUrl: '',
    tunnelSignatureKey: '',

    /**
     * MySQL 配置，用来存储 session 和用户信息
     * 若使用了腾讯云微信小程序解决方案
     * 开发环境下，MySQL 的初始密码为您的微信小程序 appid
     */
    mysql: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        db: 'cAuth',
        pass: 'test',
        char: 'utf8mb4'
    },

    cos: {
        /**
         * 地区简称
         * @查看 https://cloud.tencent.com/document/product/436/6224
         */
        region: 'ap-guangzhou',
        // Bucket 名称
        fileBucket: 'qcloudtest',
        // 文件夹
        uploadFolder: 'resource'
    },

    // 微信登录态有效期
    wxLoginExpires: 7200,
    wxMessageToken: 'abcdefgh'
}

const configFields = {
    MYSQL_HOST: 'host',
    MYSQL_POST: 'port',
    MYSQL_USER: 'user',
    MYSQL_DATABASE: 'db',
    MYSQL_PASSWORD: 'pass'
}
for (let item in configFields) {
    if (process.env[item]) {
        let key = configFields[item]
        CONF.mysql[key] = process.env[item]
    }
}

module.exports = CONF
