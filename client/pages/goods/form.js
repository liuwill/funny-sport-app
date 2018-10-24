var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

// pages/goods/form.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: '',
        form: {
            image: '',
            title: '',
            content: '',
            score: '',
            price: '',
            stock: ''
        }
    },

    createGoods: function (e) {
        var that = this
        const formData = Object.assign({
            create_time: new Date()
        }, e.detail.value, { image: this.data.imgUrl })
        for (let key in formData) {
            if (!formData[key]) {
                util.showModel('表单未填完', key);
                return
            }
        }

        util.showBusy('请求中...')
        qcloud.request({
            url: `${config.service.host}/weapp/goods/admin/create`,
            // login: true,
            data: formData,
            method: 'POST',
            success(result) {
                util.showSuccess('商品添加成功')
                wx.navigateBack()
                // that.setData({
                //   requestResult: JSON.stringify(result.data)
                // })
            },
            fail(error) {
                util.showModel('创建失败', error);
                console.log('request fail', error);
            }
        })
    },

    // 上传图片接口
    doUpload: function () {
        var that = this

        // 选择图片
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                util.showBusy('正在上传')
                var filePath = res.tempFilePaths[0]

                // 上传图片
                wx.uploadFile({
                    url: config.service.uploadUrl,
                    filePath: filePath,
                    name: 'file',

                    success: function (res) {
                        util.showSuccess('上传图片成功')
                        console.log(res)
                        res = JSON.parse(res.data)
                        console.log(res)
                        that.setData({
                            imgUrl: res.data.imgUrl
                        })
                    },

                    fail: function (e) {
                        util.showModel('上传图片失败')
                    }
                })

            },
            fail: function (e) {
                console.error(e)
            }
        })
    },

    formSubmit: function () {
        console.log('111111111')
    },

    formReset: function () { },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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

    }
})
