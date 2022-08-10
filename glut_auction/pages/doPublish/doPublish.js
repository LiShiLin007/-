var dateTimePicker = require('../../util/dateTimer.js')
Page({

  data: {
    end_time: '',
    dateTimeArray: '', //时间数组
    startYear: 2022, //最小年份
    endYear: 2050, // 最大年份
    end_time_p: '', //显示的结束时间
    classifys: null,
    objectIndex: 0, //默认显示位置
    selectImgs: null,
    uploadImgs: []
  },

  onLoad(options) {
    // 获取完整的年月日 时分秒，以及默认显示的数组
    var obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear)
    this.setData({
      end_time: obj.dateTime,
      dateTimeArray: obj.dateTimeArray,
    })
    //获取数据库分类信息
    wx.cloud.database().collection('classifys').get({
      success: (res) => {
        this.setData({
          classifys: res.data
        })
      }
    })
  },
  //选择分类
  selectClassify(e) {
    this.setData({
      objectIndex: e.detail.value
    })
  },
  //选择图片
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
  //上传图片到云存储,异步函数，防止图片还没上传，就执行插入云数据库
  uploadImages() {
    let _this = this
    return new Promise(function (resolve, reject) {
      function upload(index) {
        var picnum = index+1
        wx.showLoading({
          title: '上传第' + picnum + '张图片'
        })
        console.log(_this.data.selectImgs)
        wx.cloud.uploadFile({
          cloudPath: 'goodsImgs/' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000) + '.jpg', //给图片命名
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
      upload(0)
    })
  },
  //提交表单,保存商品到云数据库
  submit(e) {
    let dateEndTime = Date.parse(this.data.end_time_p) / 1000; //转时间戳,精确到毫秒
    console.log('time',this.data.end_time_p)
    let goodsName = e.detail.value.name //商品名
    let startPrice = e.detail.value.start_price //起拍价
    let describe = e.detail.value.describe //商品描述
    let publisherId = wx.getStorageSync('userInfo')._id //获取发布者id
    let startTime = Math.floor(new Date().getTime() / 1000) //起拍时间默认为当前时间
    let classId = this.data.classifys[this.data.objectIndex]._id // 当前选择的分类
    //先上传图片再添加到云数据库
    //点击提交的时候再次校验输入是否有误
    if (!this.data.isNum || !this.data.checkDescribe) {
      wx.showToast({
        title: '起拍价或描述输入不符，请重新输入',
        icon: 'none'
      })
    } else if(goodsName=='' || startPrice==null || classId=='' || this.data.end_time_p=='' || this.data.selectImgs==null){
      wx.showToast({
        title: '每一项输入信息都不能为空',
        icon: 'none'
      })
    }else{
      this.uploadImages().then((resolve, reject) => {
        let imagesUrl = this.data.uploadImgs //云存储的图片列表
        wx.showLoading({
          title: '发布中'
        })
        setTimeout(() => {}, 500)
        wx.cloud.database().collection('goods').add({
          data: {
            name: goodsName,
            start_price: startPrice *1,
            describe: describe,
            current_price: startPrice *1,
            images: imagesUrl,
            publisher_id: publisherId,
            end_time: dateEndTime,
            clicks: 0,
            class_id: classId,
            start_time: startTime,
            auctioning: true
          },
          success: (res) => {
            wx.hideLoading({
              success: (res) => {
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
  reset() {
    //重置图片和时间
    this.setData({
      selectImgs: null,
      end_time: null,
      end_time_p: null
    })
  },
  //处理选择的时间
  changeDateTime(e) {
    let dateTimeArray = this.data.dateTimeArray,
      {
        type,
        param
      } = e.currentTarget.dataset;
    this.setData({
      [type]: e.detail.value,
      [param]: dateTimeArray[0][e.detail.value[0]] + '-' + dateTimeArray[1][e.detail.value[1]] + '-' + dateTimeArray[2][e.detail.value[2]] + ' ' + dateTimeArray[3][e.detail.value[3]] + ':' + dateTimeArray[4][e.detail.value[4]] + ':' + dateTimeArray[5][e.detail.value[5]]
    })
  },
  //滑动时间触发
  changeDateTimeColumn(e) {
    var dateArr = this.data.dateTimeArray,
      {
        type
      } = e.currentTarget.dataset,
      arr = this.data[type];
    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
    this.setData({
      dateTimeArray: dateArr,
      [type]: arr
    })
  },
  //校验价格输入格式
  checkPrice(e) {
    let price = e.detail.value
    let isNum = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/
    if (isNum.test(price)) {
      this.setData({
        isNum: true
      })
    } else {
      this.setData({
        isNum: false
      })
      wx.showToast({
        title: '起拍价输入有误',
        icon: 'none'
      })
    }
  },
  //校验描述，不能输入数字，防止透露联系方式
  checkDescribe(e) {
    let describe = e.detail.value
    let notNum = /[0-9]$/
    if (notNum.test(describe)) {
      wx.showToast({
        title: '描述不能含有数字',
        icon: 'none'
      })
      this.setData({
        checkDescribe: false
      })
    } else {
      this.setData({
        checkDescribe: true
      })
    }
  }
})