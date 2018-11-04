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

const defaultState = {
    logged: false,
    user: {},
    loading: true
}
Page({

  /**
   * 页面的初始数据
   */
  data: Object.assign({
    inviter: {},
  }, defaultState),

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
          this.setData({ userInfo: res, logged: true })
          this.loadUserData()
          util.showSuccess('登录成功')
          this.bindInvite(res)
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
          this.loadUserData()
          util.showSuccess('登录成功')
          this.bindInvite(res)
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
    console.log('demo', options)
    this.setData({
      inviter: options
    })
    wx.showShareMenu({
      // 要求小程序返回分享目标信息
      withShareTicket: false
    });

    const session = qcloud.Session.get()
    if (!session) {
      this.setData({
        loading: false,
      })
      return
    }
    this.loadUserData()
  },

  loadUserData: function() {
    util.showBusy('loading...', 3000)

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

  logout: function () {
    qcloud.clearSession()
    this.setData(Object.assign({}, defaultState, { loading: false }))
  },

  bindInvite: function(loginData) {
    util.showBusy('loading...')

    const that = this
    qcloud.request({
      url: `${config.service.host}/weapp/invite`,
      login: true,
      data: {
        uid: this.data.inviter.id
      },
      method: 'POST',
      success(result) {
        if (result.data.code === 500) {
          util.showFail(result.data.data.msg)
          return
        }
        const userData = result.data.data
        // userApi.set(userData.user)
        console.log(userData)
        util.showModel('邀请成功', '成功接受邀请')
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
