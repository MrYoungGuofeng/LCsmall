// pages/login/login.js
var utilBox = require("../../../../utils/utilBox.js");
var network = require("../../../../utils/network.js");
Page({
  data: {
    orderInfo: "",
    node: ""
  },
  onLoad: function (options) {
    var id = wx.getStorageSync('id');
    var that = this;
    let userInfo = wx.getStorageSync("userInfo");
    let reg = /[\W\w]*(JSESSIONID\=[\w\d\-]*)[\W\w]*/;
    let arr = reg.exec(userInfo.adminPassword);
    let cookie = RegExp.$1;
    wx.request({
      url: utilBox.urlheader + "/product/ProjectEstablish/queryMap", //仅为示例，并非真实的接口地址
      data: [id],
      header: {
        'content-type': 'application/json', // 默认值
        cookie: cookie
      },
      method: 'post',
      success: function (res) {
        res.data.info[0].acreage = parseInt(res.data.info[0].acreage)
        if (res.data.info[0].orderDetail.appointment != null) {
          var dateTime = res.data.info[0].orderDetail.appointment.startTime
          res.data.info[0].orderDetail.appointment.startTime = that.updateTime(dateTime)
        }
        console.log(res.data.info[0].entryReports)
        wx.setStorageSync('userInfos', res.data.info[0])
        that.setData({
          orderInfo: res.data.info[0],
          node: res.data.info[0].entryReports
        })
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  godisclose: (e) => {
    var id = e.currentTarget.dataset.index
    var tit = e.currentTarget.dataset.tit
    wx.setStorageSync('nodeId', id)
    wx.setStorageSync('nodeName', tit)
    wx.navigateTo({
      url: '../disclose/disclose?'
    })
  },
  updateTime(dateTime) {
    var date = ''
    date = dateTime.split(' ')
    return date[0]
  },
  login: () => {
    wx.switchTab({
      url: '../orderOwner/orderOwner',
    })
  },
  onShow() {
    this.onLoad()
  }
})