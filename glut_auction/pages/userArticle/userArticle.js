Page({
  data: {
    articles: []
  },
  async onLoad(e) {
    let userOpenid = e.userOpenid
    //获取该用户动态个数
    let count = await wx.cloud.database().collection('article').where({
      _openid: userOpenid,
      lock:false
    }).count()
    count = count.total
    let totalList = []
    var num = 0
    let user = wx.getStorageSync('userInfo') //获取当前登录用户
    //查找该用户的所有动态
    for (let page = 0; page < count; page += 20) {
      let art = await wx.cloud.database().collection('article').orderBy('publishTime', 'desc').skip(page).where({
        _openid: userOpenid,
        lock:false
      }).get()
      let article = art.data
      for (let t = 0; t < article.length; t++) {
        article[t].praiseStatus = false //初始化用户点赞状态
        //对于每一条动态，判断当前用户是否点赞了
        if (article[t].like.length == 0) {
          totalList.push(article[t])
          num++
        } else {
          for (let j = 0; j < article[t].like.length; j++) {
            if (article[t].like[j] == user._id) {
              article[t].praiseStatus = true
              totalList.push(article[t])
              num++
              break
            }
            //用户没有点赞
            if (j == article[t].like.length - 1) {
              totalList.push(article[t])
              num++
            }
          }
        }
      }
    }
    if (num >= count) {
      this.setData({
        articles: totalList
      })
    }
  },
  //查看动态评论
  toArticle(e) {
    let articleId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/article/article?articleId=' + articleId,
    })
    //增加点击量
    const _ = wx.cloud.database().command
    wx.cloud.database().collection('article').doc(articleId).update({
      data: {
        click: _.inc(1)
      }
    })
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
  //点赞
  praise(e) {
    let user = wx.getStorageSync('userInfo')
    let articleId = e.currentTarget.dataset.articleid
    let index = e.currentTarget.dataset.ind
    if (this.data.articles[index].praiseStatus) {} else {
      let like = this.data.articles[index].like
      like.push(user._id)
      this.setData({
        ['articles[' + index + '].praiseStatus']: true,
        ['articles[' + index + '].like']: like
      })
      wx.cloud.database().collection('article').doc(articleId).update({
        data: {
          like: like
        }
      })
    }
  },
})