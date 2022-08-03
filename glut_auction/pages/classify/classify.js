Page({
  data: {
    clickId:"",
    classifys: null,
    goods: null,
  },

  onLoad(options) {
    //获取数据库分类信息
    wx.cloud.database().collection('classifys').get({
      success: (res) => {
        this.setData({
          classifys: res.data,
          clickId: res.data[0]._id //将数据库的第一个分类id 设置位默认点击的分类
        })
      }
    })
    this.getGoods()
  },
  onShow(){

  },
  onPullDownRefresh(){
    wx.showLoading({
      title: '刷新中',
    })
    setTimeout(()=>{
      this.getGoods()
      wx.hideLoading({
        success: (res) => {},
      })
    },1000)
  },

  async getGoods(){
    wx.showLoading({
      title: '加载中',
    })
    let count = await wx.cloud.database().collection('goods').count()
    count = count.total
    let goods = []
    var t = 0
    for(let i = 0;i<count;i+=20){
    let good = await wx.cloud.database().collection('goods').orderBy('start_time','desc').skip(i).get()
      for(let j = 0;j<good.data.length;j++){
        t++
        goods.push(good.data[j])
      }
      if(t >= count){
        this.setData({
          goods: goods
        })
        wx.hideLoading({
          success: (res) => {},
        })
      }
    }

  },
  onClickClassify(e){
    let classifyId = e.target.dataset.id;
    this.setData({
      clickId:classifyId
    })
  },
  toGoodsInfo(e){
    let goodsId = e.currentTarget.dataset.goodsid;
    wx.navigateTo({
      url: '/pages/goods/goods?goodsid=' + goodsId,
    })
    //增加商品点击量
    const _ = wx.cloud.database().command
    wx.cloud.database().collection('goods').doc(goodsId).update({
      data:{
        clicks: _.inc(1)
      }
    })
  },

})