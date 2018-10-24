const qcloud = require('../qcloud')
const { mysql } = qcloud
const _ = require('lodash')
const goodsUtils = require('../utils/goods')

module.exports = {
    create: async (ctx) => {
        const httpRequest = ctx.request.body
        const serialId = goodsUtils.generateSerialId()
        let goodsAttributes = _.pick(httpRequest, ['image', 'score', 'price', 'stock', 'sales', 'title', 'content'])
        await mysql.insert(Object.assign({
            serial_id: serialId,
            create_time: new Date()
        }, goodsAttributes)).into('cAwardGoods')

        ctx.state.date = {
            goods: goodsAttributes
        }
    },
    list: async (ctx) => {
        const goodsList = await mysql('cAwardGoods').select('*').where({ status: goodsUtils.GOODS_ITEM_STATUS.PUBLISHED }).orderBy('id', 'desc')
        ctx.state.data = {
            list: goodsList,
            total: goodsList.length
        }
    },
    info: async (ctx) => {
        const httpRequest = ctx.request.query
        const goodsList = await mysql('cAwardGoods').select('*').where({
            serial_id: httpRequest['serial_id']
        })
        ctx.state.data = {
            goods: goodsList.length ? goodsList[0] : null
        }
    },
    exchange: async (ctx, next) => {
        const httpRequest = ctx.request.query
        const goodsList = await mysql('cAwardGoods').select('*').where({
            serial_id: httpRequest['serial_id'],
            status: goodsUtils.GOODS_ITEM_STATUS.PUBLISHED
        })

        if (!goodsList || !goodsList.length) {
            ctx.state.code = -1
            return
        }
        const goodsItem = goodsList[0]
        if (goodsItem.stock < 1) {
            ctx.state.code = -1
            ctx.state.message = '库存不足'
            return
        }

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
        if (existUser.score < goodsItem.score) {
            ctx.state.code = -1
            ctx.state.message = '积分不足'
            return
        }

        const orderId = goodsUtils.generateSerialId()
        const createdOrder = {
            order_id: orderId,
            serial_id: goodsItem.serial_id,
            user_id: existUser.id,
            score: goodsItem.score,
            status: goodsUtils.ORDER_STATUS.PAID,
            create_time: new Date()
        }
        mysql.transaction(async function (trx) {
            // trx = await mysql.transaction()
            await mysql('cUserInfo')
                .where({ open_id: wxUser.openId })
                .decrement('score', goodsItem.score)
                .transacting(trx)
            await mysql('cAwardGoods')
                .where({
                    serial_id: httpRequest['serial_id']
                })
                .decrement('stock', 1)
                .increment('sales', 1)
                .transacting(trx)

            await mysql.insert({
                user_id: existUser.id,
                order_id: orderId,
                score: goodsItem.score,
                create_time: new Date()
            }).into('cUserScoreUsage').transacting(trx)
            await mysql.insert(createdOrder).into('cAwardOrder').transacting(trx)
            await trx.commit()
        }).then(async () => {
            ctx.state.data = {
                order: createdOrder,
                goods: goodsItem
            }
            await next()
        }).catch(async (err) => {
            // await trx.rollback()
            ctx.state.code = -1
            console.log(err.message)
            await next()
        })
    },
    listAdmin: async (ctx) => {
        const goodsList = await mysql('cAwardGoods').select('*').whereNot('status', goodsUtils.GOODS_ITEM_STATUS.DELETED).orderBy('status', 'desc').orderBy('id', 'desc')
        ctx.state.data = {
            list: goodsList,
            total: goodsList.length
        }
    },
    listAdminPage: async (ctx) => {
        const httpRequest = ctx.request.query
        if (!httpRequest.start || isNaN(httpRequest.start)) {
            httpRequest.start = 0
        }
        let pageStart = Number(httpRequest.start)
        let pageSize = 20
        if (httpRequest.size && !isNaN(httpRequest.size)) {
            pageSize = httpRequest.size
        }

        const countData = await mysql('cAwardGoods').count('id as count').whereNot('status', goodsUtils.GOODS_ITEM_STATUS.DELETED)
        const goodsList = await mysql('cAwardGoods').select('*').whereNot('status', goodsUtils.GOODS_ITEM_STATUS.DELETED)
            .orderBy('status', 'desc').orderBy('id', 'desc')
            .limit(pageSize).offset(pageStart)

        let total = countData[0]['count']
        const hasMore = (total - pageStart) > goodsList.length
        ctx.state.data = {
            list: goodsList,
            total: total,
            hasMore,
            lastIndex: pageStart + goodsList.length
        }
    },
    publish: async (ctx) => {
        const httpRequest = ctx.request.body
        const PERMIT_STATUS = [goodsUtils.GOODS_ITEM_STATUS.CREATED, goodsUtils.GOODS_ITEM_STATUS.HIDDEN]
        const goodsList = await mysql('cAwardGoods').select('*').where({
            serial_id: httpRequest['serial_id']
        })

        if (!goodsList || !goodsList.length) {
            ctx.state.code = -1
            return
        }
        const goodsItem = goodsList[0]
        if (!PERMIT_STATUS.includes(Number(goodsItem.status))) {
            ctx.state.code = -1
            return
        }

        await mysql('cAwardGoods')
            .where('serial_id', httpRequest['serial_id'])
            .update('status', goodsUtils.GOODS_ITEM_STATUS.PUBLISHED)
        ctx.state.data = {
            item: goodsItem
        }
    },
    hidden: async (ctx) => {
        const httpRequest = ctx.request.body
        const goodsList = await mysql('cAwardGoods').select('*').where({
            serial_id: httpRequest['serial_id']
        })

        if (!goodsList || !goodsList.length) {
            ctx.state.code = -1
            return
        }
        const goodsItem = goodsList[0]
        if (Number(goodsItem.status) !== goodsUtils.GOODS_ITEM_STATUS.PUBLISHED) {
            ctx.state.code = -1
            return
        }

        await mysql('cAwardGoods')
            .where('serial_id', httpRequest['serial_id'])
            .update('status', goodsUtils.GOODS_ITEM_STATUS.HIDDEN)
        ctx.state.data = {
            item: goodsItem
        }
    }
}
