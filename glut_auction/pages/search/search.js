// pages/search/search.js
Page({

  data: {
      searchWord:''
  },
  onLoad(options) {
    
  },
  confirmKeyWord(e){
    let keyWord = e.detail.value
    if(!keyWord){
      wx.showToast({
        title: '输入不能为空！',
        icon: 'error'
      })
    }else{
      //跳转页面并查询数据库
      wx.navigateTo({
        url: '/pages/searchRes/searchRes?keyWord='+ keyWord,
      })
    }
  },
  setKeyWord(e){
    let keyWord = e.detail.value
    this.setData({
      searchWord: keyWord
    })
  },
  onSearch(){
    let keyWord = this.data.searchWord
    if(!keyWord){
      wx.showToast({
        title: '输入不能为空！',
        icon: 'error'
      })
    }else{
      //跳转页面并查询数据库
      wx.navigateTo({
        url: '/pages/searchRes/searchRes?keyWord='+ keyWord,
      })
    }
  },

})