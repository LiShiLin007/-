Page({

  data: {
    myRecord: null
  },

  async onLoad(){
    wx.showLoading({
      title: '加载中',
    })
    let userInfo = wx.getStorageSync('userInfo')
    //获取用户个人的竞拍记录
    let count = await wx.cloud.database().collection('goodsAuctionRecord').where({
      _openid: userInfo._openid
    }).count()
    count = count.total
    if(count==0){
      wx.hideLoading({
        success: (res) => {},
      })
    }
    let allRecord = []
    for(let i = 0;i<count;i+=20){
      var goodsRecords = await wx.cloud.database().collection('goodsAuctionRecord').skip(i).orderBy('auctionTime','desc').where({
        _openid: userInfo._openid
      }).get()
      for(let j =0;j<goodsRecords.data.length;j++){
        allRecord.push(goodsRecords.data[j])
      }
    }
    //为每一个竞拍记录添加所属的商品信息
    var t = 0
    for(let i = 0;i< allRecord.length;i++){
      let goodsId = allRecord[i].goodsID
      wx.cloud.database().collection('goods').doc(goodsId).get({
        success: res => {
          allRecord[i].goodsInfo= res.data
          t++
          if(t>=allRecord.length){
            this.setData({
              myRecord: allRecord
            })
            wx.hideLoading({
              success: (res) => {},
            })
          }
        }
      })
    }
  },
  toGoods(e) {
    let goodsid = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/goods/goods?goodsid=' + goodsid,
    })
  }
})