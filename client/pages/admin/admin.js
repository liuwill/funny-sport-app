//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

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
  checkStep: function() {
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
  acceptStepAward: function() {
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
  }
})
