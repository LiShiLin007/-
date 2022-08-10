// pages/login/login.js
Page({
  data: {
    userInfo: null,
    hasUser: false
  },
  onShow(option) {
    try {
      let user = wx.getStorageSync('userInfo')
      if (user) {
        this.setData({
          userInfo: user,
          hasUser: true
        })
      }
    } catch (e) {
      console.log('获取缓存失败', e)
    }

  },

  login() {
    wx.getUserProfile({
      desc: '获取用户信息',
      success: res => {
        var user = res.userInfo
        //设置全局用户信息
        app.globalData.userInfo = user
        app.globalData.user_openid = user._openid
        //设置局部用户信息
        this.setData({
          userInfo: user,
          hasUser: true
        })
        //检查数据库是否有该用户
        wx.cloud.database().collection('userInfo').where({
          _openid: app.globalData.user_openid
        }).get({
          success: res => {
            //原先没有添加，这里添加
            if (!res.data[0]) {
              //将数据添加到数据库
              wx.cloud.database().collection('userInfo').add({
                data: {
                  avatarUrl: user.avatarUrl,
                  nickName: user.nickName
                },
                success: res => {
                  try {
                    wx.setStorageSync('userInfo', res.data[0])
                  } catch (e) {
                  }
                }
              })
            } else {
              //已经添加过了
              //添加用户到本地缓存
              try {
                wx.setStorageSync('userInfo', res.data[0])
              } catch (e) {
              }
            }
          }
        })
      }
    })
  },
  logout(){
    wx.showModal({
      cancelColor: 'cancelColor',
      content: '是否注销？',
      success: (res)=>{
        if(res.confirm){
          this.setData({
            hasUser: false,
            userInfo: null
          })
          try{
            wx.removeStorageSync('userInfo')
          }
          catch(e){
          }
        }
      }
    })
 
  },
  toAddress() {
    wx.navigateTo({
      url: '/pages/address/address',
    })
  },
  //我发布的
  publisher() {
    wx.navigateTo({
      url: '/pages/publishs/publishs',
    })
  },
  //我参与的
  myAuction() {
    wx.navigateTo({
      url: '/pages/participates/participates',
    })
  },
  //交易记录
  myDeal() {
    wx.navigateTo({
      url: '/pages/myDeal/myDeal',
    })
  },
  //个人动态
  myarticle(){
    wx.navigateTo({
      url: '/pages/myArticle/myarticle',
    })
  },
  //问题反馈
  feedback(){
    wx.navigateTo({
      url: '/pages/feedback/feedback',
    })
  }
})
const app = getApp()