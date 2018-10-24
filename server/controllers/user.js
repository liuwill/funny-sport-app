const qcloud = require('../qcloud')
const { mysql } = qcloud

module.exports = {
    wechat: async (ctx, next) => {
        // 通过 Koa 中间件进行登录态校验之后
        // 登录信息会被存储到 ctx.state.$wxInfo
        // 具体查看：
        if (ctx.state.$wxInfo.loginState === 1) {
            // loginState 为 1，登录态校验成功
            ctx.state.data = ctx.state.$wxInfo.userinfo
        } else {
            ctx.state.code = -1
        }
    },
    data: async (ctx, next) => {
        if (!ctx.state.$wxInfo.loginState) {
            ctx.state.code = -1
            return
        }

        const wxUser = ctx.state.$wxInfo.userinfo
        const existUsers = await mysql('cUserInfo').select('*').where({ open_id: wxUser.openId })
        if (!existUsers || !existUsers.length) {
            ctx.state.code = -1
            return
        }
        const existUser = existUsers[0]

        ctx.state.data = {
            user: existUser
        }
    }
}
