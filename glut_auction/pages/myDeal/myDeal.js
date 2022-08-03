Page({

  data:{
    myDeals: null,
    callStatus: false
  },
  onShow(){
    let userInfo = wx.getStorageSync('userInfo')
    var goods = []
    wx.cloud.database().collection('goods').orderBy('end_time','desc').where({
      auctioning: false,
      buyer_openid: userInfo._openid
    }).get({
      success: (res)=>{
        goods = res.data
        let n = res.data.length
        var util = require("../../util/time_transform.js")
        var t = 0
        for(let i = 0;i<n;i++){
          let endTimeFormat = util.js_date_time(goods[i].end_time*1000)
          goods[i].endTimeFormat = endTimeFormat
          t++
          if(t >= n){
            this.setData({
              myDeals: goods
            })
          }
        }
      }
    })
  },
  callStatus(e){
    let openId = e.currentTarget.dataset.openId
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
  }
})