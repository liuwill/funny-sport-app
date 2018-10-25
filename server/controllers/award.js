const qcloud = require('../qcloud')
const { mysql } = qcloud
const generalUtils = require('../utils/general')
const MAX_DAILY_STEP = 100000

module.exports = {
    checkStep: async (ctx) => {
        if (!ctx.state.$wxInfo.loginState) {
            ctx.state.code = -1
            return
        }

        const wxUser = ctx.state.$wxInfo.userinfo
        const httpRequest = ctx.request.body
        if (!httpRequest.step || isNaN(httpRequest.step)) {
            ctx.state.code = -1
            return
        }

        const existUsers = await mysql('cUserInfo').select('*').where({ open_id: wxUser.openId })
        if (!existUsers || !existUsers.length) {
            ctx.state.code = -1
            return
        }
        const existUser = existUsers[0]
        const todayStep = await mysql('cUserStep').sum('step as step').where(mysql.raw('user_id = :user_id AND DATE(create_time) = CURDATE()', {
            user_id: existUser.id
        }))
        const currentStep = todayStep[0]['step'] || 0
        if (currentStep >= httpRequest.step || httpRequest.step > MAX_DAILY_STEP) {
            ctx.state.code = -1
            return
        }
        let suggest = Math.round((httpRequest.step - currentStep) / 1000)

        ctx.state.data = {
            list: [{
                suggest,
                timestamp: Date.now()
            }]
        }
    },
    acceptStepAward: async (ctx, next) => {
        if (!ctx.state.$wxInfo.loginState) {
            ctx.state.code = -1
            return
        }

        const wxUser = ctx.state.$wxInfo.userinfo
        const httpRequest = ctx.request.body
        if (!httpRequest.step || isNaN(httpRequest.step)) {
            ctx.state.code = -1
            return
        }

        const existUsers = await mysql('cUserInfo').select('*').where({ open_id: wxUser.openId })
        if (!existUsers || !existUsers.length) {
            ctx.state.code = -1
            return
        }
        const existUser = existUsers[0]
        const todayStep = await mysql('cUserStep').sum('step as step').where(mysql.raw('user_id = :user_id AND DATE(create_time) = CURDATE()', {
            user_id: existUser.id
        }))
        const currentStep = todayStep[0]['step'] || 0
        if (currentStep >= httpRequest.step || httpRequest.step > MAX_DAILY_STEP) {
            ctx.state.code = -1
            return
        }
        // 以上代码，检查是否可以获得积分

        const addStep = httpRequest.step - currentStep
        let suggest = Math.round(addStep / 1000)
        let ipAddr = generalUtils.getIp(ctx.header)
        const stepData = {
            user_id: existUser.id,
            score: suggest,
            step: addStep,
            location: ipAddr,
            device: 'wechat',
            create_time: new Date()
        }
        const scoreRecord = {
            user_id: existUser.id,
            source: 'step',
            score: suggest,
            create_time: new Date()
        }
        // Using trx as a transaction object:

        mysql.transaction(async function (trx) {
            // trx = await mysql.transaction()
            await mysql('cUserInfo')
                .where({ open_id: wxUser.openId })
                .increment('score', suggest)
                .transacting(trx)
            await mysql.insert(stepData).into('cUserStep').transacting(trx)
            await mysql.insert(scoreRecord).into('cUserScoreRecord').transacting(trx)

            await trx.commit()
        }).then(async () => {
            ctx.state.data = {
                origin: currentStep,
                step: addStep,
                score: suggest
            }
            await next()
        }).catch(async (err) => {
            // await trx.rollback()
            ctx.state.code = -1
            console.log(err.message)
            await next()
        })
    }
}
