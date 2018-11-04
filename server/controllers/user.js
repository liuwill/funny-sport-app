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
            ctx.state.code = 500
            ctx.state.data = { msg: '请求处理失败' }
        }
    },
    data: async (ctx, next) => {
        if (!ctx.state.$wxInfo.loginState) {
            ctx.state.code = 500
            ctx.state.data = { msg: '请求处理失败' }
            return
        }

        const wxUser = ctx.state.$wxInfo.userinfo
        const existUsers = await mysql('cUserInfo').select('*').where({ open_id: wxUser.openId })
        if (!existUsers || !existUsers.length) {
            ctx.state.code = 500
            ctx.state.data = { msg: '请求处理失败' }
            return
        }
        const existUser = existUsers[0]

        ctx.state.data = {
            user: existUser
        }
    },
    invite: async (ctx, next) => {
        if (!ctx.state.$wxInfo.loginState) {
            ctx.state.code = 500
            ctx.state.data = { msg: '请求处理失败' }
            return
        }

        const wxUser = ctx.state.$wxInfo.userinfo
        const existUsers = await mysql('cUserInfo').select('*').where({ open_id: wxUser.openId })
        if (!existUsers || !existUsers.length) {
            ctx.state.code = 500
            ctx.state.data = { msg: '请求处理失败' }
            return
        }
        const existUser = existUsers[0]
        if (existUser.create_time.valueOf() + 600000 < Date.now()) {
            ctx.state.code = 500
            ctx.state.data = { msg: '邀请失败' }
            return
        }
        const inviteRelations = await mysql('cUserInvite').select('*').where({inviter_id: existUser.id})
        if (inviteRelations && inviteRelations.length) {
            ctx.state.code = 500
            ctx.state.data = { msg: '已经完成邀请' }
            return
        }

        const requestBody = ctx.request.body
        if (!requestBody.uid) {
            ctx.state.code = 500
            ctx.state.data = { msg: '没有人推荐' }
            return
        }
        const theUser = await mysql('cUserInfo').select('*').where({ id: requestBody.uid })
        if (!theUser || !theUser.length) {
            ctx.state.code = 500
            ctx.state.data = { msg: '没有人推荐' }
            return
        }
        const createdInvite = await mysql.insert(Object.assign({
            user_id: requestBody.uid,
            inviter_id: existUser.id,
            score: 5,
            create_time: new Date()
        }, {})).into('cUserInvite')

        ctx.body = {
            status: 0,
            code: 0,
            data: {
                invite: createdInvite
            }
        }
    }
}
