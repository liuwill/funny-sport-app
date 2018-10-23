// pages/goods/goods.js

var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestResult: {},
        goodsList: {
            list: [],
        }
    },

    listGoods: function () {
        let that = this
        qcloud.request({
            url: `${config.service.host}/weapp/goods/admin/list`,
            success(result) {
                util.showSuccess('加载成功')
                that.setData({
                    goodsList: result.data.data
                })
            },
            fail(error) {
                util.showModel('商品加载失败', error);
                console.log('request fail', error);
            }
        })
    },

    publishGoods: function (e) {
        let that = this
        util.showBusy('请求中...')
        qcloud.request({
            url: `${config.service.host}/weapp/goods/admin/publish`,
            // login: true,
            data: {
                serial_id: e.target.dataset.serial
            },
            method: 'POST',
            success(result) {
                util.showSuccess('上架成功')
                that.listGoods()
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
    hiddenGoods: function (e) {
        let that = this
        util.showBusy('请求中...')
        qcloud.request({
            url: `${config.service.host}/weapp/goods/admin/hidden`,
            // login: true,
            data: {
                serial_id: e.target.dataset.serial
            },
            method: 'POST',
            success(result) {
                util.showSuccess('下架成功')
                that.listGoods()
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

    triggerPullDown: function () {
        wx.startPullDownRefresh()
    },
    getGoodsInfo: function () { },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.listGoods()
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

    },

    onPullDownRefresh: function () {
        var context = this
        this.listGoods()

        wx.stopPullDownRefresh();
    }
})
