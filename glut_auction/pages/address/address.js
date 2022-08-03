// pages/address/address.js
Page({

  data: {
    address: null,
    dialog: false,
    dialog1: false
  },
  onLoad(options) {
    this.getAddress()
  },
  getAddress() {
    let userInfo = wx.getStorageSync('userInfo')
    wx.cloud.database().collection('address').where({
      _openid: userInfo._openid
    }).get({
      success: (res) => {
        this.setData({
          address: res.data
        })
        console.log(res.data)
      }
    })
  },
  toAddAddress() {
    this.setData({
      dialog: true
    })
  },
  toEditAddress(){
    this.setData({
      dialog1: true
    })
  },
  //添加地址等信息
  addAddress(e) {
    console.log(e.detail.value)
    let info = e.detail.value
    //合法手机号和QQ号码
    if (this.ValidatePhone(info.phone) && this.validateQQ(info.qq)) {
      wx.showLoading({
        title: '正在提交...',
      })
      //添加到数据库
      wx.cloud.database().collection('address').add({
        data: {
          address: info.address,
          name: info.name,
          phone: info.phone,
          qq: info.qq
        },
        success: (res) => {
          let _this = this
          //一秒后重新向数据库发起请求
          setTimeout(function () {
            wx.hideLoading({
              success: (res) => {
                //刷新页面数据
                _this.getAddress()
                _this.setData({
                  dialog: false
                })
              }
            })
          }, 1000)
        }
      })
    }
    //手机号或QQ号不合法
    else {
      wx.showToast({
        title: '手机号或QQ格式有误！',
        icon: "none"
      })
    }
  },
    //修改地址等信息
    editAddress(e) {
      let info = e.detail.value
      //合法手机号和QQ号码
      if (this.ValidatePhone(info.phone) && this.validateQQ(info.qq)) {
        wx.showLoading({
          title: '正在提交...',
        })
        //添加到数据库
        wx.cloud.database().collection('address').doc(this.data.address[0]._id).update({
          data: {
            address: info.address,
            name: info.name,
            phone: info.phone,
            qq: info.qq
          },
          success: (res) => {
            let _this = this
            //一秒后重新向数据库发起请求
            setTimeout(function () {
              wx.hideLoading({
                success: (res) => {
                  //刷新页面数据
                  _this.getAddress()
                  _this.setData({
                    dialog1: false
                  })
                }
              })
            }, 1000)
          }
        })
      }
      //手机号或QQ号不合法
      else {
        wx.showToast({
          title: '手机号或QQ格式有误！',
          icon: "none"
        })
      }
    },
  //校验手机号
  ValidatePhone(val) {
    var isPhone = /^(0|86|17951)?(13[0-9]|15[012356789]|18[0-9]|14[57]|17[678])[0-9]{8}$/ //手机号码
    if (isPhone.test(val)) {
      return true;
    } else {
      return false;
    }
  },
  //校验QQ号
  validateQQ(val) {
    var reg_qq = /^[1-9][0-9]{4,9}$/gim
    if (reg_qq.test(val)) {
      return true
    } else {
      return false
    }
  }

})