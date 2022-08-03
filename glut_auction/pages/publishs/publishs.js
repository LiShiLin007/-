Page({

  data: {
    goods: null,
    auctionStatus: true,
    callStatus: false
  },

  onLoad(options) {},
  onShow() {
    let user = wx.getStorageSync('userInfo')
    let publishid = user._id
    this.getPublishGoods(publishid)
  },

  //查找自己发布的商品
  async getPublishGoods(publisherid) {
    let count = wx.cloud.database().collection('goods').where({
      publisher_id: publisherid
    }).count()
    count = (await count).total
    var goods = []
    var t = 0
    for(let i = 0;i< count;i+=20){
      let good = await wx.cloud.database().collection('goods').orderBy('start_time','desc').skip(i).where({
        publisher_id: publisherid
      }).get()
      for(let j =0;j<good.data.length;j++){
        t++
        goods.push(good.data[j])
      }
      if(t >= count){
        this.setData({
          goods: goods
        })
      }
    }
  },

  toGoods(e) {
    let goodsid = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/goods/goods?goodsid=' + goodsid,
    })
  },

  doPublish() {
    wx.navigateTo({
      url: '/pages/doPublish/doPublish',
    })
  },

  isauction() {
    console.log('点击了正在竞拍')
    this.setData({
      auctionStatus: true
    })
  },
  noauction() {
    this.setData({
      auctionStatus: false
    })
  },
  callStatus(e){
    let openId = e.currentTarget.dataset.buyer
    //获取卖家联系方式
    wx.cloud.database().collection('address').where({
      _openid: openId
    }).get({
      success: (res) => {
        this.setData({
          address: res.data
        })
      }
    })
    this.setData({
      callStatus: true
    })
  },
  closeCall(){
    this.setData({
      callStatus: false
    })
  },
  copyPhone(){
    wx.setClipboardData({
      data: this.data.address[0].phone,
      success: (res) => {
        wx.showToast({
          title: '复制成功',
        })
      }
    })
  },
  copyQQ(){
    wx.setClipboardData({
      data: this.data.address[0].qq,
      success: (res) => {
        wx.showToast({
          title: '复制成功',
        })
      }
    })
  },
  //删除物品
  delete(e) {
    let delId = e.currentTarget.dataset.delid
    //删除之前查询是否有人参与了竞拍，有竞拍记录时不允许删除
    wx.cloud.database().collection('goodsAuctionRecord').where({
      goodsID: delId
    }).get({
      success: (res) => {
        if (res.data.length > 0) {
          wx.showToast({
            title: '不允许删除有出价记录的物品',
            icon: 'none'
          })
        } else {
          //允许删除
          wx.showModal({
            title: '删除商品',
            content: '是否要删除该物品？',
            success: (res) => {
              if (res.confirm) {
                wx.showLoading({
                  title: '正在删除'
                })

                wx.cloud.database().collection('goods').doc(delId).remove({
                  success: (res) => {
                    setTimeout(() => {
                      wx.hideLoading({
                        success: (res) => {
                          wx.showToast({
                            title: '删除成功',
                          })
                        },
                      })
                      this.onShow()
                    }, 500)
                  }
                })
              }
            }
          })
        }
      }
    })
  }
})