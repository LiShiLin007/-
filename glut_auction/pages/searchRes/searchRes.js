// pages/searchRes/searchRes.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: null
  },

  async onLoad(options) {
    let keyWord = options.keyWord
    //查询数据库
    let count = await wx.cloud.database().collection('goods').where({
      name: wx.cloud.database().RegExp({
        regexp: '.*' + keyWord + '.*',     //根据keyWord模糊查询
        options: 'i'                       //不区分大小写
      })
    }).count()
    count = count.total
    var goods = []
    var t = 0
    for(let i = 0;i<count;i+=20){
      let good = await wx.cloud.database().collection('goods').skip(i).where({
        name: wx.cloud.database().RegExp({
          regexp: '.*' + keyWord + '.*',     //根据keyWord模糊查询
          options: 'i'                       //不区分大小写
        })
      }).get()
      for(let j = 0;j<good.data.length;j++){
        t++
        goods.push(good.data[j])
      }
      if(t>=count){
        this.setData({
          goods: goods
        })
      }
    }
  },

  toGoodsInfo(e){
    let goodsid = e.currentTarget.dataset.goodsid
    wx.navigateTo({
      url: '/pages/goods/goods?goodsid='+goodsid,
    })
  }

})