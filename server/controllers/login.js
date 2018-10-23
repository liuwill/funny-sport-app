const qcloud = require('../qcloud')
const { mysql } = qcloud
const _ = require('lodash')

// 登录授权接口
module.exports = async (ctx, next) => {
    // 通过 Koa 中间件进行登录之后
    // 登录信息会被存储到 ctx.state.$wxInfo
    // 具体查看：
    if (ctx.state.$wxInfo.loginState) {
        const userInfo = ctx.state.$wxInfo.userinfo
        const existUser = await mysql('cUserInfo').select('*').where({ open_id: userInfo.userinfo.openId })
        if (!existUser || !existUser.length) {
            let newUser = _.pick(userInfo.userinfo, ['nickname', 'city', 'province', 'country'])
            const createdUser = await mysql.insert(Object.assign({
                open_id: userInfo.userinfo.openId,
                nickname: userInfo.userinfo.nickName,
                avatar: userInfo.userinfo.avatarUrl,
                create_time: new Date()
            }, newUser)).into('cUserInfo')
            console.log(createdUser)
        }
        // console.log(data)
        ctx.state.data = userInfo
        ctx.state.data['time'] = Math.floor(Date.now() / 1000)
    }
}
