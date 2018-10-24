const qcloud = require('../qcloud')
const { mysql } = qcloud
const goodsUtils = require('../utils/goods')

module.exports = {
    listAdmin: async (ctx) => {
        const orderList = await mysql('cAwardOrder').select('*').whereNot('status', goodsUtils.ORDER_STATUS.FILED)
            .orderBy('status').orderBy('id', 'desc')
        ctx.state.data = {
            list: orderList,
            total: orderList.length
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

        const orderCountData = await mysql('cAwardOrder').count('id as count').whereNot('status', goodsUtils.ORDER_STATUS.FILED)
        const orderList = await mysql('cAwardOrder').select('*').whereNot('status', goodsUtils.ORDER_STATUS.FILED)
            .orderBy('status').orderBy('id', 'desc')
            .limit(pageSize).offset(pageStart)

        let orderCount = orderCountData[0]['count']
        const hasMore = (orderCount - pageStart) > orderList.length
        ctx.state.data = {
            list: orderList,
            total: orderCount,
            hasMore,
            lastIndex: pageStart + orderList.length
        }
    },

    myOrders: async (ctx) => {
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

        const orderList = await mysql('cAwardOrder').select('*').where({
            user_id: existUser.id
        }).orderBy('status').orderBy('id', 'desc')
        const orderCount = orderList.length

        ctx.state.data = {
            list: orderList,
            total: orderCount
        }
    },
    myOrdersPage: async (ctx) => {
        if (!ctx.state.$wxInfo.loginState) {
            ctx.state.code = -1
            return
        }

        const wxUser = ctx.state.$wxInfo.userinfo
        const httpRequest = ctx.request.query

        const existUsers = await mysql('cUserInfo').select('*').where({ open_id: wxUser.openId })
        if (!existUsers || !existUsers.length) {
            ctx.state.code = -1
            return
        }
        const existUser = existUsers[0]

        if (!httpRequest.start || isNaN(httpRequest.start)) {
            httpRequest.start = 0
        }
        let pageSize = 20
        if (httpRequest.size && !isNaN(httpRequest.size)) {
            pageSize = httpRequest.size
        }

        const orderCount = await mysql('cAwardOrder').count('id', 'active').where({
            user_id: existUser.id
        })
        const orderList = await mysql('cAwardOrder').select('*').where({
            user_id: existUser.id
        }).orderBy('status').orderBy('id', 'desc')
            .limit(pageSize).offset(httpRequest.start)

        const hasMore = (orderCount - httpRequest.start) > orderList.length
        ctx.state.data = {
            list: orderList,
            total: orderCount,
            hasMore,
            lastIndex: httpRequest.start + orderList.length
        }
    },
    confirm: async (ctx) => {
        const httpRequest = ctx.request.body
        const orderList = await mysql('cAwardOrder').select('*').where({
            order_id: httpRequest['order_id']
        })

        if (!orderList || !orderList.length) {
            ctx.state.code = -1
            return
        }
        const orderItem = orderList[0]
        if (!orderItem.status !== goodsUtils.ORDER_STATUS.PAID) {
            ctx.state.code = -1
            return
        }

        await mysql('cAwardOrder')
            .where('order_id', httpRequest['order_id'])
            .update('status', goodsUtils.ORDER_STATUS.FINISHED)
        ctx.state.data = {
            item: orderItem
        }
    }
}
