const time_transform = require("../../util/time_transform.js")

var goods_id
var myTime //计数器
Page({

  data: {
    goodsInfo: null,
    publisher: null,
    auctionRecord: null,
    clock: '',
    changePrice: null //出价
  },

  onLoad(options) {
    let goodsId = options.goodsid
    //将id存起来给onshow用
    goods_id = goodsId
    //获取商品信息
    this.getGoodsInfo(goodsId)
    //倒计时
    this.countdown(goodsId)
  },
  onPullDownRefresh() {
    wx.showLoading({
      title: '刷新中',
    })
    setTimeout(() => {
      this.getGoodsInfo(goods_id)
      wx.hideLoading({
        success: (res) => {},
      })
    }, 1000)
  },
  onShow() {
    this.getGoodsInfo(goods_id)
    this.getAuctionRecord()
  },

  //根据商品id查询商品
  getGoodsInfo(goodsId) {
    wx.cloud.database().collection('goods').doc(goodsId).get({
      success: (res) => {
        this.setData({
          goodsInfo: res.data,
          changePrice: res.data.current_price + 1
        })
        //根据发布者id去用户表中查询商品发布者信息
        wx.cloud.database().collection('userInfo').doc(res.data.publisher_id).get({
          success: (res) => {
            this.setData({
              publisher: res.data
            })
          }
        })
      }
    })
  },
  //底部加减价格
  addPrice() {
    var price = this.data.changePrice
    price++
    this.setData({
      changePrice: price
    })
  },
  downPrice() {
    var price = this.data.changePrice
    if (price > this.data.goodsInfo.current_price + 1) {
      price--
      this.setData({
        changePrice: price
      })
    } else {
      wx.showToast({
        title: '出价应当高于当前价！',
        icon: 'none'
      })
    }
  },

  //竞拍者出价
  putPrice() {
    //获取出价
    let price = this.data.changePrice
    //获取出价用户
    let userInfo = wx.getStorageSync('userInfo')
    //获取出价时间
    let nowTime = new Date().getTime()
    //转化为时间格式
    var util = require("../../util/time_transform.js")
    let timeFormat = util.js_date_time(nowTime)
    //弹窗确认
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'error'
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/login/login',
        })
      }, 500)
    } else {
      if(this.data.goodsInfo.auctioning){
        wx.showModal({
          title: '确认出价',
          content: '价高者得，竞拍结束价高者可在竞拍记录中查看卖家联系信息，感谢您的参与！',
          success: (res) => {
            if (res.confirm) {
              wx.showLoading({
                title: '正在出价...',
              })
              //保存竞拍记录到数据库
              wx.cloud.database().collection('goodsAuctionRecord').add({
                  data: {
                    goodsID: goods_id,
                    userInfo: userInfo,
                    putPrice: price,
                    auctionTime: nowTime,
                    auctionTimeFormat: timeFormat
                  },
                  success: res => {}
                }),
                //更新当前价
                wx.cloud.database().collection('goods').doc(goods_id).update({
                  data: {
                    current_price: price
                  }
                })
              let _this = this
              setTimeout(function () {
                wx.hideLoading({
                  success: (res) => {
                    wx.showToast({
                      title: '出价成功',
                    })
                    //刷新页面数据
                    _this.onShow()
                  }
                })
              }, 500)
            } else {}
          }
        })
      }
      else{
        wx.showToast({
          title: '竞拍已结束',
          icon:'error'
        })
      }
    }
  },

  //获取商品用户竞拍记录
  getAuctionRecord() {
    wx.cloud.database().collection('goodsAuctionRecord').orderBy('putPrice', 'desc').where({
      goodsID: goods_id
    }).get({
      success: (res) => {
        this.setData({
          auctionRecord: res.data
        })
      }
    })
  },

  //获取竞拍结束时间，并计算倒计时
  countdown(goodsId) {
    wx.cloud.database().collection('goods').doc(goodsId).get({
      success: res => {
        //取出竞拍结束时间，精确到秒
        let auctionEndtime = res.data.end_time
        console.log(res)
        //获取当前系统时间,只精确到秒
        var nowTime = new Date().getTime() / 1000
        //剩余时间总的秒数
        var totalSecond = Math.floor(auctionEndtime - nowTime)
        console.log('剩余秒数', totalSecond)
        //计算倒计时
        this.doCountdown(totalSecond)
      }
    })
  },

  //计算商品倒计时
  doCountdown(totalSecond) {
    let _this = this
    //每隔一秒执行一次代码
    if (totalSecond > 0) {
      var myTime = setInterval(() => {
        //如果竞拍已经结束
        if (totalSecond < 0) {
          _this.setData({
            clock: '已经截止'
          })
          //确认商品结束竞拍，确定出价最高者为买家
          wx.cloud.database().collection('goodsAuctionRecord').orderBy('putPrice', 'desc').where({
            goodsID: goods_id
          }).get({
            success: (res) => {
              let buyerOpenId = res.data[0]._openid
              //更新数据库,结束竞拍
              wx.cloud.database().collection('goods').doc(goods_id).update({
                data: {
                  buyer_openid: buyerOpenId,
                  auctioning: false
                },
                success: (res) => {
                  //重新获取商品信息，停止用户出价
                  this.getGoodsInfo(goods_id)
                }
              })

            }
          })
          clearInterval(myTime)
          return
        } else {
          //执行计算
          var time = _this.formatTime(totalSecond)
          _this.setData({
            clock: '剩余' + time
          })
        }
        totalSecond--;
      }, 1000)
    }else{
      this.setData({
        clock: '已经截止'
      })
    }
  },

  //倒计时时间格式化
  formatTime(totalSecond) {
    //剩余天数
    var day = Math.floor(totalSecond / 3600 / 24)
    //n天后剩余小时数
    var hour = Math.floor(totalSecond / 3600 % 24)
    //n天n小时后剩余分钟数
    var min = Math.floor(totalSecond / 60 % 60)
    //n天n小时n分钟后剩余秒数
    var sec = Math.floor(totalSecond % 60)
    return day + "天" + hour + "小时" + min + "分" + sec + "秒"
  }
})