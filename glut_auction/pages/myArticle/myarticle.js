Page({
  data:{
    articles: null
  },
  async onLoad(){
    let user = wx.getStorageSync('userInfo')
    let count = await wx.cloud.database().collection('article').where({
      _openid: user._openid
    }).count()
    count = count.total
    let articles = []
    var num = 0
    //查找该用户的所有动态
    for(let t = 0;t <count;t+=20){
     let article = await wx.cloud.database().collection('article').orderBy('publishTime','desc').skip(t).where({
        _openid: user._openid
      }).get()
      for(let i = 0;i<article.data.length;i++){
        articles.push(article.data[i])
        num++
      }
      if(num >= count){
        this.setData({
          articles: articles
        })
      }
    }
  },
  //设置私密
  setLock(e){
    let status = e.detail.value
    let id = e.currentTarget.dataset.switchid  //动态id
    let index = e.currentTarget.dataset.lockindex  //动态下标
    //设置私密
    if(status){
      this.setData({
        ['articles['+index+'].lock']:true
      })
      wx.cloud.database().collection('article').doc(id).update({
        data:{
          lock: true
        }
      })
    }
    //设置非私密
    else{
      this.setData({
        ['articles['+index+'].lock']:false
      })
      wx.cloud.database().collection('article').doc(id).update({
        data:{
          lock: false
        }
      })
    }
  },
    //查看动态评论
    toArticle(e) {
      let articleId = e.currentTarget.dataset.id
      wx.navigateTo({
        url: '/pages/article/article?articleId=' + articleId,
      })
    },
})