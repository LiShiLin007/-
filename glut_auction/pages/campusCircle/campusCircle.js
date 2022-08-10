Page({
  data: {
    articles: [],
    page: 1,
    total: 0,
  },
  onShow() {
    //获取数据库第一页全部动态
    this.getList()
    //每次进入页面初始化显示的页面
    this.setData({
      page: 1
    })
  },
  //底部刷新函数
  onReachBottom: function () {
    //判断是否加载完
    if (this.data.page * 20 >= this.data.total) {
      wx.showToast({
        title: '我是有底线哒~',
        icon: 'none'
      })
    } else {
      this.getNextList()
    }
  },
  //获取初始数据
  async getList() {
    //获取数据库总的数据长度
    let count = await wx.cloud.database().collection('article').where({
      lock:false
    }).count()
    count = count.total
    this.setData({
      total: count
    })
    wx.cloud.database().collection('article').orderBy('publishTime', 'desc').where({
      lock:false
    }).get({
      success: (res) => {
        let article = res.data
        let user = wx.getStorageSync('userInfo') //获取当前登录用户
        for (let t = 0; t < article.length; t++) {
          article[t].praiseStatus = false //初始化用户点赞状态
          //对于每一条动态，判断当前用户是否点赞了
          for (let j = 0; j < article[t].like.length; j++) {
            if (article[t].like[j] == user._id) {
              article[t].praiseStatus = true
              break
            }
          }
          if (t >= article.length - 1) {
            this.setData({
              articles: article
            })
          }
        }
      }
    })
  },
  //获取下一页数据并添加到总数据里面
  getNextList() {
    let page = this.data.page
    wx.cloud.database().collection('article').skip(page * 20).orderBy('publishTime', 'desc').where({
      lock: false
    }).get({
      success: (res) => {
        let totalList = this.data.articles //先取出前面已经获取的数据
        let article = res.data
        let user = wx.getStorageSync('userInfo') //获取当前登录用户
        let num = 0
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
          if (num >=article.length) {
            console.log('数据', totalList)
            this.setData({
              articles: totalList, //覆盖数据
              page: page + 1 //页数加一
            })
          }
        }
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
  //去发表动态
  publishArticle() {
    wx.navigateTo({
      url: '/pages/publishArticle/publishArticle',
    })
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
  //访问其他人的动态
  toUserArticle(e) {
    let userOpenid = e.currentTarget.dataset.useropenid
    wx.navigateTo({
      url: '/pages/userArticle/userArticle?userOpenid=' + userOpenid,
    })
  }
})