/**
 * ajax 服务路由集合
 */
const router = require('koa-router')({
    prefix: '/weapp'
})
const controllers = require('../controllers')

// 从 sdk 中取出中间件
// 这里展示如何使用 Koa 中间件完成登录态的颁发与验证
const { auth: { authorizationMiddleware, validationMiddleware } } = require('../qcloud')

router.get('/demo', controllers.demo.hello)
router.get('/demo/user', validationMiddleware, controllers.demo.user)

router.post('/utils/decrypt', validationMiddleware, controllers.demo.decrypt)

// --- 步数检查功能 --- //
// 检查是否有可以领取的积分
router.post('/award/check/step', validationMiddleware, controllers.award.checkStep)
// 领取步数积分
router.post('/award/accept/step', validationMiddleware, controllers.award.acceptStepAward)

// --- 商品相关接口 --- //
// 列出所有商品
router.get('/goods/admin/list', controllers.goods.listAdmin)
// 创建商品
router.post('/goods/admin/create', validationMiddleware, controllers.goods.create)
// 发布商品
router.post('/goods/admin/publish', validationMiddleware, controllers.goods.publish)
// 下架商品
router.post('/goods/admin/hidden', validationMiddleware, controllers.goods.hidden)

// --- 订单相关接口 --- //
// 列出所有订单
router.get('/order/admin/list', controllers.order.listAdmin)

// 获取可用商品列表
router.get('/goods/list', controllers.goods.list)
// 单个商品信息查询
router.get('/goods/info', controllers.goods.info)
// 兑换商品
router.post('/goods/exchange', validationMiddleware, controllers.goods.exchange)

// --- 登录与授权 Demo --- //
// 登录接口
router.get('/login', authorizationMiddleware, controllers.login)
// 用户信息接口（可以用来验证登录态）
router.get('/user', validationMiddleware, controllers.user)

// --- 图片上传 Demo --- //
// 图片上传接口，小程序端可以直接将 url 填入 wx.uploadFile 中
router.post('/upload', controllers.upload)

// --- 信道服务接口 Demo --- //
// GET  用来响应请求信道地址的
router.get('/tunnel', controllers.tunnel.get)
// POST 用来处理信道传递过来的消息
router.post('/tunnel', controllers.tunnel.post)

// --- 客服消息接口 Demo --- //
// GET  用来响应小程序后台配置时发送的验证请求
router.get('/message', controllers.message.get)
// POST 用来处理微信转发过来的客服消息
router.post('/message', controllers.message.post)

module.exports = router
