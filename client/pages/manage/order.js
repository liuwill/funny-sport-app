// pages/order/manage.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var generalUtil = require('../../utils/general.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        start: 0,
        hasMore: true,
        orderList: [],
        orderData: {}
    },

    confirmOrder: function(e) {
        let that = this
        util.showBusy('请求中...')
        qcloud.request({
            url: `${config.service.host}/weapp/order/admin/confirm`,
            // login: true,
            data: {
                order_id: e.target.dataset.orderid
            },
            method: 'POST',
            success(result) {
                util.showSuccess('处理成功')
                that.loadOrderList(true)
                // that.setData({
                //   requestResult: JSON.stringify(result.data)
                // })
            },
            fail(error) {
                util.showModel('操作失败', error);
                console.log('request fail', error);
            }
        })
    },

    loadOrderList: function (reload) {
        let queryStart = this.data.start
        let currentList = this.data.orderList
        if (reload) {
            queryStart = 0
            currentList = []
        }
        let that = this
        qcloud.request({
            url: generalUtil.buildGetUrl(`${config.service.host}/weapp/order/admin/list/page`, {
                start: queryStart
            }),
            success(result) {
                util.showSuccess('加载成功')
                const response = result.data.data
                that.setData({
                    orderData: response,
                    orderList: currentList.concat(response.list),
                    hasMore: response.hasMore,
                    start: response.lastIndex || 0
                })
            },
            fail(error) {
                util.showModel('订单加载失败', error);
                console.log('request fail', error);
            }
        })
    },

    loadMore: function () {
        this.loadOrderList()
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.loadOrderList(true)
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.loadOrderList(true)
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
