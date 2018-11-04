const qcloud = require('../qcloud')
const { mysql } = qcloud
const generalUtils = require('../utils/general')
const config = require('../config')
const MAX_DAILY_STEP = 100000

module.exports = {
    checkRealStep: async (ctx) => {
        const appId = config.appId
        const httpRequest = ctx.request.body

        if (!ctx.state.$wxInfo.loginState) {
            ctx.state.code = -1
            return
        }

        const wxUser = ctx.state.$wxInfo.userinfo
        const sessionData = await mysql('cSessionInfo').select('*').where({
            skey: httpRequest.skey
        })

        if (!sessionData || !sessionData.length) {
            ctx.state.code = 500
            ctx.state.data = { msg: '请求处理失败' }
            return
        }
        let runData = generalUtils.decryptData(appId, sessionData[0].session_key, httpRequest.encrypted, httpRequest.iv)
        if (runData) {
            runData.current = generalUtils.pickCurrentStep(runData)
        }

        if (!runData.current) {
            ctx.body = {
                code: 500,
                status: 1,
                data: { msg: '参数错误' }
            }
            return
        }

        const existUsers = await mysql('cUserInfo').select('*').where({ open_id: wxUser.openId })
        if (!existUsers || !existUsers.length) {
            ctx.state.code = 500
            ctx.state.data = { msg: '用户不存在' }
            return
        }
        const existUser = existUsers[0]
        const todayStep = await mysql('cUserStep').sum('step as step').where(mysql.raw('user_id = :user_id AND DATE(create_time) = CURDATE()', {
            user_id: existUser.id
        }))
        const currentStep = todayStep[0]['step'] || 0
        if (currentStep >= runData.current || runData.current > MAX_DAILY_STEP) {
            ctx.state.code = 500
            ctx.state.data = { msg: '没有生成新的步' }
            return
        }
        let suggest = Math.round((runData.current - currentStep) / 1000)
        const awardList = [{
            type: 'step',
            current: runData.current,
            suggest,
            score: suggest,
            timestamp: Date.now()
        }]

        // 获取邀请积分
        const inviteAwards = await mysql('cUserInvite').select('*').where({ user_id: existUser.id })
        if (inviteAwards && inviteAwards.length) {
            inviteAwards.forEach(item => {
                awardList.push({
                    type: 'invite',
                    suggest: item.score,
                    score: item.score,
                    id: item.id,
                    timestamp: item.create_time.valueOf()
                })
            })
        }
        ctx.state.data = {
            list: awardList
        }
    },
    checkStep: async (ctx) => {
        if (!ctx.state.$wxInfo.loginState) {
            ctx.state.code = -1
            return
        }

        const wxUser = ctx.state.$wxInfo.userinfo
        const httpRequest = ctx.request.body
        if (!httpRequest.step || isNaN(httpRequest.step)) {
            ctx.state.code = 500
            ctx.state.data = { msg: '参数错误' }
            return
        }

        const existUsers = await mysql('cUserInfo').select('*').where({ open_id: wxUser.openId })
        if (!existUsers || !existUsers.length) {
            ctx.state.code = 500
            ctx.state.data = { msg: '用户不存在' }
            return
        }
        const existUser = existUsers[0]
        const todayStep = await mysql('cUserStep').sum('step as step').where(mysql.raw('user_id = :user_id AND DATE(create_time) = CURDATE()', {
            user_id: existUser.id
        }))
        const currentStep = todayStep[0]['step'] || 0
        if (currentStep >= httpRequest.step || httpRequest.step > MAX_DAILY_STEP) {
            ctx.state.code = 500
            ctx.state.data = { msg: '步数不正确' }
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
    pickStepAward: async (ctx, next) => {
        const appId = config.appId
        if (!ctx.state.$wxInfo.loginState) {
            ctx.state.code = -1
            return
        }

        const wxUser = ctx.state.$wxInfo.userinfo
        const httpRequest = ctx.request.body
        if (!httpRequest.step || isNaN(httpRequest.step)) {
            ctx.state.code = 500
            ctx.state.data = { msg: '参数错误' }
            return
        }
        const sessionData = await mysql('cSessionInfo').select('*').where({
            skey: httpRequest.skey
        })

        if (!sessionData || !sessionData.length) {
            ctx.state.code = 500
            ctx.state.data = { msg: '请求处理失败' }
            return
        }
        let runData = generalUtils.decryptData(appId, sessionData[0].session_key, httpRequest.encrypted, httpRequest.iv)
        if (runData) {
            runData.current = generalUtils.pickCurrentStep(runData)
        }

        if (!runData.current) {
            ctx.body = {
                code: 500,
                status: 1,
                data: { msg: '当前没有任何步数' }
            }
            return
        }

        const existUsers = await mysql('cUserInfo').select('*').where({ open_id: wxUser.openId })
        if (!existUsers || !existUsers.length) {
            ctx.state.code = 500
            ctx.state.data = { msg: '用户不存在，请先登录' }
            return
        }
        const existUser = existUsers[0]
        const todayStep = await mysql('cUserStep').sum('step as step').where(mysql.raw('user_id = :user_id AND DATE(create_time) = CURDATE()', {
            user_id: existUser.id
        }))
        const currentStep = todayStep[0]['step'] || 0
        if (currentStep >= httpRequest.step || httpRequest.step > runData.current || httpRequest.step > MAX_DAILY_STEP) {
            ctx.state.code = 500
            ctx.state.data = { msg: '步数不足' }
            return
        }
        // 以上代码，检查是否可以获得积分

        const addStep = httpRequest.step - currentStep
        let suggest = Math.round(addStep / 1000)
        if (suggest <= 0) {
            ctx.state.code = 500
            ctx.state.data = { msg: '步数不足' }
            return
        }
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
            ctx.state.code = 500
            ctx.state.data = { msg: '请求处理失败' }
            console.log(err.message)
            await next()
        })
    },
    acceptStepAward: async (ctx, next) => {
        if (!ctx.state.$wxInfo.loginState) {
            ctx.state.code = -1
            return
        }

        const wxUser = ctx.state.$wxInfo.userinfo
        const httpRequest = ctx.request.body
        if (!httpRequest.step || isNaN(httpRequest.step)) {
            ctx.state.code = 500
            ctx.state.data = { msg: '参数错误' }
            return
        }

        const existUsers = await mysql('cUserInfo').select('*').where({ open_id: wxUser.openId })
        if (!existUsers || !existUsers.length) {
            ctx.state.code = 500
            ctx.state.data = { msg: '用户不存在，请先登录' }
            return
        }
        const existUser = existUsers[0]
        const todayStep = await mysql('cUserStep').sum('step as step').where(mysql.raw('user_id = :user_id AND DATE(create_time) = CURDATE()', {
            user_id: existUser.id
        }))
        const currentStep = todayStep[0]['step'] || 0
        if (currentStep >= httpRequest.step || httpRequest.step > MAX_DAILY_STEP) {
            ctx.state.code = 500
            ctx.state.data = { msg: '步数不正确' }
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
            ctx.state.code = 500
            ctx.state.data = { msg: '请求处理失败' }
            console.log(err.message)
            await next()
        })
    },
    pickInviteScore: async (ctx, next) => {
        if (!ctx.state.$wxInfo.loginState) {
            ctx.state.code = -1
            return
        }

        const wxUser = ctx.state.$wxInfo.userinfo
        const httpRequest = ctx.request.body
        if (!httpRequest.score || isNaN(httpRequest.score) || !httpRequest.id || isNaN(httpRequest.id)) {
            ctx.state.code = 500
            ctx.state.data = { msg: '参数错误' }
            return
        }

        const existUsers = await mysql('cUserInfo').select('*').where({ open_id: wxUser.openId })
        if (!existUsers || !existUsers.length) {
            ctx.state.code = 500
            ctx.state.data = { msg: '用户不存在，请先登录' }
            return
        }
        const existUser = existUsers[0]
        const inviteRelation = await mysql('cUserInvite').select('*').where({ user_id: existUser.id, id: httpRequest.id })
        if (!inviteRelation || !inviteRelation.length) {
            ctx.state.code = 500
            ctx.state.data = { msg: '邀请记录不存在' }
            return
        } else if (inviteRelation[0].status !== 0) {
            ctx.body = {
                status: 100,
                code: 100,
                msg: '积分已经过期'
            }
            return
        } else if (inviteRelation[0].score !== httpRequest.score) {
            ctx.body = {
                status: 100,
                code: 100,
                msg: '积分不匹配'
            }
            return
        }

        mysql.transaction(async function (trx) {
            // trx = await mysql.transaction()
            await mysql('cUserInfo')
                .where({ open_id: wxUser.openId })
                .increment('score', inviteRelation[0].score)
                .transacting(trx)
            await mysql('cUserInvite').where({ id: httpRequest.id }).update({
                status: 1
            }).transacting(trx)
            await mysql.insert({
                user_id: existUser.id,
                source: 'invite',
                score: inviteRelation[0].score,
                create_time: new Date()
            }).into('cUserScoreRecord').transacting(trx)

            await trx.commit()
        }).then(async () => {
            ctx.state.data = {
                score: inviteRelation[0].score
            }
            await next()
        }).catch(async (err) => {
            // await trx.rollback()
            ctx.state.code = 500
            ctx.state.data = { msg: '请求处理失败' }
            console.log(err.message)
            await next()
        })
    }
}
