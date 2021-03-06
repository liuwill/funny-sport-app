// pages/goods/shop.js
// pages/goods/goods.js

var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var generalUtil = require('../../utils/general.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestResult: {},
        hasMore: true,
        start: 0,
        goodsData: {},
        goodsList: [],
        userData: {}
    },

    loadUser: function () {
        let that = this

        qcloud.request({
            url: generalUtil.buildGetUrl(`${config.service.host}/weapp/user/data`),
            success(result) {
                if (result.data.code === 500) {
                    util.showFail(result.data.data.msg)
                    return
                }

                const response = result.data.data
                that.setData({
                    userData: response.user
                })
            }
        })
    },
    listGoods: function (reload) {
        let queryStart = this.data.start
        let currentList = this.data.goodsList
        if (reload) {
            queryStart = 0
            currentList = []
        }
        let that = this

        qcloud.request({
            url: generalUtil.buildGetUrl(`${config.service.host}/weapp/goods/list/page`, {
                start: queryStart
            }),
            success(result) {
                if (result.data.code === 500) {
                    util.showFail(result.data.data.msg)
                    return
                }

                util.showSuccess('加载成功')
                const response = result.data.data
                that.setData({
                    goodsData: response,
                    goodsList: currentList.concat(response.list),
                    hasMore: response.hasMore,
                    start: response.lastIndex || 0
                })
            },
            fail(error) {
                util.showModel('商品加载失败', error);
                console.log('request fail', error);
            }
        })
    },

    exchangeGoods: function (e) {
        let that = this
        util.showBusy('请求中...')
        qcloud.request({
            url: `${config.service.host}/weapp/goods/exchange`,
            // login: true,
            data: {
                serial_id: e.target.dataset.serial
            },
            method: 'POST',
            success(result) {
                if (result.data.code === 500) {
                    util.showFail(result.data.data.msg)
                    return
                }

                util.showSuccess('下单成功')
                wx.navigateTo({
                    url: '../manage/order'
                })
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

    triggerLoadMore: function () {
        this.listGoods()
        // wx.startPullDownRefresh()
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.listGoods(true)
        this.loadUser()
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
        var context = this
        this.listGoods(true)

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
