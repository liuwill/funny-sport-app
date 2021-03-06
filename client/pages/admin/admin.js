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
let currentStep = 0
let stepStorage = {
    set: (val) => {
        currentStep = val
    },
    get: () => {
        return currentStep
    }
}

Page({
    data: {
        userInfo: {},
        logged: false,
        takeSession: false,
        requestResult: ''
    },
    // 用户登录示例
    bindGetUserInfo: function () {
        if (this.data.logged) return

        util.showBusy('正在登录')

        const session = qcloud.Session.get()

        if (session) {
            // 第二次登录
            // 或者本地已经有登录态
            // 可使用本函数更新登录态
            qcloud.loginWithCode({
                success: res => {
                    this.setData({ userInfo: res, logged: true })
                    util.showSuccess('登录成功')
                },
                fail: err => {
                    console.error(err)
                    util.showModel('登录错误', err.message)
                }
            })
        } else {
            // 首次登录
            qcloud.login({
                success: res => {
                    this.setData({ userInfo: res, logged: true })
                    util.showSuccess('登录成功')
                },
                fail: err => {
                    console.error(err)
                    util.showModel('登录错误', err.message)
                }
            })
        }
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
        if (!this.data.logged) {
            util.showModel('登录提醒', '请先登录');
            return
        }
        const session = qcloud.Session.get()

        getWxRunResult(function (err, runData) {
            util.showBusy('请求中...')
            qcloud.request({
                url: `${config.service.host}/weapp/utils/decrypt`,
                data: Object.assign({
                    skey: session.skey,
                    encrypted: runData.encryptedData
                }, runData),
                method: 'POST',
                success(result) {
                    if (result.data.code === 500) {
                        util.showFail(result.data.data.msg)
                        return
                    }
                    const response = result.data.data
                    util.showSuccess('今日步数：' + response.run.current)
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
        if (!this.data.logged) {
            util.showModel('登录提醒', '请先登录');
            return
        }

        util.showBusy('请求中...')
        var that = this
        qcloud.request({
            url: `${config.service.host}/weapp/demo/user`,
            login: true,
            success(result) {
                if (result.data.code === 500) {
                    util.showFail(result.data.data.msg)
                    return
                }
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
    checkRealStep: function() {
        if (!this.data.logged) {
            util.showModel('登录提醒', '请先登录');
            return
        }
        const session = qcloud.Session.get()

        getWxRunResult(function (err, runData) {
            util.showBusy('请求中...')
            qcloud.request({
                url: `${config.service.host}/weapp/award/check/all`,
                data: Object.assign({
                    skey: session.skey,
                    encrypted: runData.encryptedData
                }, runData),
                method: 'POST',
                success(result) {
                    if (result.data.code === 500) {
                        util.showFail(result.data.data.msg)
                        return
                    }
                    const response = result.data.data
                    const currentStep = response.list[0].current
                    stepStorage.set(currentStep)
                    util.showSuccess('今日步数：' + currentStep)
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
    checkStep: function () {
        if (!this.data.logged) {
            util.showModel('登录提醒', '请先登录');
            return
        }

        var that = this
        qcloud.request({
            url: `${config.service.host}/weapp/award/check/step`,
            // login: true,
            data: {
                step: StepApi.fetch()
            },
            method: 'POST',
            success(result) {
                if (result.data.code === 500) {
                    util.showFail(result.data.data.msg)
                    return
                }

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
    pickStepAward: function() {
        if (!this.data.logged) {
            util.showModel('登录提醒', '请先登录');
            return
        }
        const session = qcloud.Session.get()

        getWxRunResult(function (err, runData) {
            util.showBusy('请求中...')
            qcloud.request({
                url: `${config.service.host}/weapp/award/pick/step`,
                data: Object.assign({
                    step: stepStorage.get(),
                    skey: session.skey,
                    encrypted: runData.encryptedData
                }, runData),
                method: 'POST',
                success(result) {
                    if (result.data.code === 500) {
                        util.showFail(result.data.data.msg)
                        return
                    }
                    const response = result.data.data
                    util.showSuccess('领取步数积分成功')
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
    acceptStepAward: function () {
        if (!this.data.logged) {
            util.showModel('登录提醒', '请先登录');
            return
        }

        var that = this
        qcloud.request({
            url: `${config.service.host}/weapp/award/accept/step`,
            // login: true,
            data: {
                step: StepApi.fetch()
            },
            method: 'POST',
            success(result) {
                if (result.data.code === 500) {
                    util.showFail(result.data.data.msg)
                    return
                }

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
        console.log('admin', options)
        wx.showShareMenu({
            // 要求小程序返回分享目标信息
            withShareTicket: true
        });

        /*
        const session = qcloud.Session.get()
        if (session) {
            util.showBusy('登录请求中...')
            // 第二次登录
            // 或者本地已经有登录态
            // 可使用本函数更新登录态
            qcloud.loginWithCode({
                success: res => {
                    this.setData({ userInfo: res, logged: true })
                    util.showSuccess('登录成功')
                },
                fail: err => {
                    console.error(err)
                    util.showModel('登录错误', err.message)
                }
            })
        }
        */
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '转发dom',
            path: `pages/index/index`,
            success: function (res) {
                // 转发成功
                console.log("转发成功:" + JSON.stringify(res));
                var shareTickets = res.shareTickets;
                // if (shareTickets.length == 0) {
                //   return false;
                // }
                // //可以获取群组信息
                // wx.getShareInfo({
                //   shareTicket: shareTickets[0],
                //   success: function (res) {
                //     console.log(res)
                //   }
                // })
            },
            fail: function (res) {
                // 转发失败
                console.log("转发失败:" + JSON.stringify(res));
            }
        }
    }
})
