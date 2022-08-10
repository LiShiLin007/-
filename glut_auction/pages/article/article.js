var articleID
var theuser
Page({
  data: {
    article: null,
    user: null,
    commentText:'',
    commentArr: [],
  },
  onLoad(option) {
    let articleId = option.articleId
    articleID = articleId
    wx.cloud.database().collection('article').doc(articleId).get({
      success: (res) => {
        this.setData({
          article: res.data,
          commentArr: res.data.comment.reverse()
        })
      }
    })
    //获取当前微信用户
    let userInfo = wx.getStorageSync('userInfo')
    theuser = userInfo //存当前全局变量
    this.setData({
      user: userInfo
    })
  },
  //获取评论内容
  setCommentText(e) {
    let context = e.detail.value
    this.setData({
      commentText: context
    })
  },
  //发表评论
  publishComment() {
    //判断是否登录
    if (!theuser) {
      wx.showToast({
        title: '请先登录',
        icon: 'error'
      })
      this.login()
    } else {
      let content = this.data.commentText //评论的内容
      let user = theuser //发表评论的用户
      let nowTime = new Date().getTime() //评论时间
      var util = require("../../util/time_transform.js")
      let nowTimeFormat = util.js_date_time(nowTime)
      //先取出原有的评论
      var comment = this.data.commentArr
      //封装成对象
      let comment1 = {
        comtent: content,
        user: user,
        publishTimeFormat: nowTimeFormat,
        publishTime: nowTime
      }
      //将新评论push到评论区
      comment.reverse().push(comment1)
      this.setData({
        commentArr: comment.reverse()
      })
      wx.showToast({
        title: '你的爱心已发送~',
        icon:'none'
      })
      //更新评论区到数据库
      wx.cloud.database().collection('article').doc(articleID).update({
        data: {
          comment: comment.reverse()
        },
        success: () => {
          //清空输入框
          this.setData({
            commentText:''
          })
        },
        fail:(err)=>{
          wx.showToast({
            title: '未知错误'+err,
            icon:'error'
          })
        }
      })
    }

  },
  //预览图片
  previewImg(e) {
    //获取当前动态的图片列表
    let imagesUrl = e.currentTarget.dataset.images
    //获取点击的图片索引
    let index = e.currentTarget.dataset.index
    wx.previewImage({
      urls: imagesUrl, //所有要预览的图片的地址集合 数组形式
      current: imagesUrl[index] //当前图片地址
    })
  },
  login() {
    wx.getUserProfile({
      desc: '获取用户信息',
      success: res => {
        wx.showToast({
          title: '登录成功',
        })
        var user = res.userInfo
        //检查数据库是否有该用户
        wx.cloud.database().collection('userInfo').where({
          _openid: user._openid
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
                  theuser=res.data[0]
                  this.setData({
                    user: res.data[0]
                  })
                  try {
                    wx.setStorageSync('userInfo', res.data[0])
                  } catch (e) {
                  }
                }
              })
            } else {
              //已经添加过了
              this.setData({
                user: res.data[0]
              })
              theuser=res.data[0]
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
})