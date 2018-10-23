const config = require('../config')
const qcloud = require('../qcloud')
const { mysql } = qcloud
const generalUtils = require('../utils/general')

module.exports = {
    hello: async ctx => {
        ctx.state.data = {
            msg: 'Hello World'
        }
    },
    user: async ctx => {
        ctx.state.data = {
            msg: ctx.state.$wxInfo.userinfo
        }
    },
    decrypt: async (ctx) => {
        const appId = config.appId
        const httpRequest = ctx.request.body

        // const userData = ctx.state.$wxInfo.userinfo
        const sessionData = await mysql('cSessionInfo').select('*').where({
            skey: httpRequest.skey
        })

        if (!sessionData || !sessionData.length) {
            ctx.state.code = -1
            return
        }
        ctx.state.date = {
            run: generalUtils.decryptData(appId, sessionData[0].session_key, httpRequest.encrypted, httpRequest.iv)
        }
    }
}