module.exports = {
  hello: async ctx => {
    ctx.state.data = {
      msg: 'Hello World'
    }
  },
  user: async ctx => {
    ctx.state.data = {
      msg: ctx.state.$wxInfo.userinfo
    }
  }
}