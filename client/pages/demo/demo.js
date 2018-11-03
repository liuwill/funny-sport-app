// client/pages/demo/demo.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')


var userApi = {
  data: ''
}
userApi.set = (data) => {
  userApi.data = data
}
userApi.get = () => {
  return userApi.data
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    logged: false,
    user: {},
    inviter: {},
    loading: true
  },

  loginInvite: function () {
    if (this.data.logged) return

    util.showBusy('正在登录')

    const session = qcloud.Session.get()
    if (session) {
      // 第二次登录
      // 或者本地已经有登录态
      // 可使用本函数更新登录态
      qcloud.loginWithCode({
        success: res => {
          this.bindInvite(res)
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
          this.bindInvite(res)
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.showBusy('loading...')
    console.log('demo', options)
    this.setData({
      inviter: options
    })
    wx.showShareMenu({
      // 要求小程序返回分享目标信息
      withShareTicket: false
    });

    const that = this
    qcloud.request({
      url: `${config.service.host}/weapp/user/data`,
      login: true,
      success(result) {
        if (result.data.code === 500) {
          util.showFail(result.data.data.msg)
          return
        }
        const userData = result.data.data
        userApi.set(userData.user)
        // util.showModel('用户信息', '用户：' + userData.user.nickname)
        that.setData({
          loading: false,
          logged: true,
          user: userData.user
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
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
    console.log(userApi.get().id)
    const userData = userApi.get()
    return {
      title: '分享预览',
      path: `pages/demo/demo?uid=${userData.id}&name=${userData.nickname}`,
    }
  }
})
