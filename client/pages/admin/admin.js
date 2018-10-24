//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

/**
 * 微信登录，获取 code 和 encryptData
 */
function getWxRunResult(cb) {
    wx.getWeRunData({
        success(res) {
            const encryptedData = res.encryptedData
            cb(null, {
                iv: res.iv,
                encryptedData: encryptedData
            })
        },
        fail(runError) {
            cb(new Error('获取微信用户信息失败，请检查网络状态'), null)
        }
    })
}

let randStep = Math.round(Math.random() * 10000)
let StepApi = {
    fetch: () => {
        return randStep
    },
    accept: () => {
        randStep += Math.round(Math.random() * 10000)
    }
}

Page({
    data: {
        userInfo: {},
        logged: false,
        takeSession: false,
        requestResult: ''
    },
    getLocation: function () {
        wx.getLocation({
            type: 'wgs84',
            success(res) {
                const latitude = res.latitude
                const longitude = res.longitude
                const speed = res.speed
                const accuracy = res.accuracy
                // console.log(latitude, longitude, speed, accuracy, res)
                util.showModel('当前位置', 'latitude:' + latitude + ', longitude:' + longitude)
            }
        })
    },
    viewRunData: function () {
        const session = qcloud.Session.get()

        getWxRunResult(function (err, runData) {
            qcloud.request({
                url: `${config.service.host}/weapp/utils/decrypt`,
                data: Object.assign({
                    skey: session.skey,
                    encrypted: runData.encryptedData
                }, runData),
                method: 'POST',
                success(result) {
                    util.showSuccess('获取步数成功')
                    console.log(result)
                    //   wx.navigateBack()
                    // that.setData({
                    //   requestResult: JSON.stringify(result.data)
                    // })
                },
                fail(error) {
                    util.showModel('创建失败', error);
                    console.log('request fail', error);
                }
            })
        })
    },
    visitUserInfo: function () {
        util.showBusy('请求中...')
        var that = this
        qcloud.request({
            url: `${config.service.host}/weapp/demo/user`,
            login: true,
            success(result) {
                const userData = result.data.data
                util.showModel('用户：' + userData.msg.nickName, '省:' + userData.msg.province + ';市:' + userData.msg.city)
                that.setData({
                    requestResult: JSON.stringify(result.data)
                })
            },
            fail(error) {
                util.showModel('请求失败', error);
                console.log('request fail', error);
            }
        })
    },
    checkStep: function () {
        var that = this
        qcloud.request({
            url: `${config.service.host}/weapp/award/check/step`,
            // login: true,
            data: {
                step: StepApi.fetch()
            },
            method: 'POST',
            success(result) {
                util.showSuccess('请求成功完成')
                that.setData({
                    requestResult: JSON.stringify(result.data)
                })
            },
            fail(error) {
                util.showModel('请求失败', error);
                console.log('request fail', error);
            }
        })
    },
    acceptStepAward: function () {
        var that = this
        qcloud.request({
            url: `${config.service.host}/weapp/award/accept/step`,
            // login: true,
            data: {
                step: StepApi.fetch()
            },
            method: 'POST',
            success(result) {
                util.showSuccess('请求成功完成')
                StepApi.accept()
                that.setData({
                    requestResult: JSON.stringify(result.data)
                })
            },
            fail(error) {
                util.showModel('请求失败', error);
                console.log('request fail', error);
            }
        })
    },

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
})
