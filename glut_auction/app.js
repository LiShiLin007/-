// app.js
App({
  onLaunch(){
    wx.cloud.init({
      env: 'glut-auction-7gkhm0vfc61cc184',
      traceUser: true
    })
    try{
      let user =  wx.getStorageSync('userInfo')
      if(user){
        this.globalData.user_openid = user._openid
        this.globalData.userInfo = user
      }else{
        wx.switchTab({
          url: '/pages/login/login',
        })
      }
    }catch(e){
      console.log('获取缓存失败',e)
    }
    },
    // setGlobalUserInfo(){
    //   //调用云函数
    //   wx.cloud.callFunction({
    //     name: 'get_openId',
    //     success: res => {
    //       //获取用户openid
    //       this.globalData.user_openid = res.result.openid
    //       //查询数据库中openid是否存在用户
    //       wx.cloud.database().collection('userInfo').where({
    //         _openid: res.result.openid
    //       }).get({
    //         success: res => {
    //           this.globalData.userInfo = res.data[0]
    //         }
    //       })
    //     }  
    //   })
    // },
    //全局数据
    globalData:{
      //用户id
      user_openid:'',
      userInfo: null
    }
})



