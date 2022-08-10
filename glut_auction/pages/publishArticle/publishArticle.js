Page({
  data: {
    selectImgs: null,
    text: '',
    uploadImgs: []
  },
  selectImg() {
    wx.chooseImage({
      count: 9,
      success: (res) => {
        this.setData({
          selectImgs: res.tempFilePaths
        })
      }
    })
  },
  setText(e) {
    let text = e.detail.value
    this.setData({
      text: text
    })
  },
  //发表动态
  publish() {
    //校验数据
    if (this.data.text == '') {
      wx.showToast({
        title: '请输入内容',
        icon: 'error'
      })
    } else {
      this.uploadImages().then((resolve, reject) => {
        wx.showLoading({
          title: '发布中'
        })
        setTimeout(() => {}, 500)
        let imagesUrl = this.data.uploadImgs //云存储的图片列表
        let text = this.data.text //文本
        let publishTime = new Date().getTime() //发表时间
        let userInfo = wx.getStorageSync('userInfo') //发布者
        //发布时间戳转化为时间格式
        var util = require("../../util/time_transform.js")
        let timeFormat = util.js_date_time_noSecond(publishTime)
        wx.cloud.database().collection('article').add({
          data: {
            content: text,
            imagesUrl: imagesUrl,
            publishTime: publishTime,
            publisher: userInfo,
            publishFormatTime: timeFormat,
            comment:[],
            click:0,
            like:[]
          },
          success: (res) => {
            wx.hideLoading({
              success: (res) => {
                wx.showToast({
                  title: '发表成功',
                })
                wx.navigateBack({
                  delta: 1,
                })
              },
            })
          }
        })
      })
    }
  },
  //上传图片到云存储
  uploadImages() {
    let _this = this
    return new Promise(function (resolve, reject) {
      if (_this.data.selectImgs == null) {
        resolve('success')
        return
      } else {
        upload(0)
      }

      function upload(index) {
        var picnum = index + 1
        wx.showLoading({
          title: '上传第' + picnum + '张图片'
        })
        wx.cloud.uploadFile({
          cloudPath: 'articleImgs/' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000) + '.jpg', //给图片命名
          filePath: _this.data.selectImgs[index], //本地图片路径
          success: (res) => {
            _this.data.uploadImgs[index] = res.fileID
            wx.hideLoading({
              success: (res) => {},
            })
            //判断是否全部上传
            if (_this.data.selectImgs.length - 1 <= index) {
              console.log('已全部上传')
              resolve('success')
              return
            } else {
              upload(index + 1)
            }
          },
          fail: (err) => {
            reject('error')
            wx.showToast({
              title: '上传失败，请重新上传',
              type: 'none'
            })
          }
        })
      }
    })
  },
})