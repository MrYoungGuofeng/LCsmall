 // pages/login/login.js
var utilBox = require("../../../../utils/utilBox.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderInfo:"",
    tabs: [
      {
        name: '陪签备忘录',
        list: ['后期可能存在的增项', '材料工艺项目', '施工图纸建议', '合同记录','其他注意事项及疑义事项']
      },
      {
        name: '数据收集表',
        list: ['数据收集表']
      },
      {
        name: '基础信息表',
        list: ['业主基本信息','房屋基本信息','需求信息']
      }
    ],
    activeIndex: 0,
    sliderLeft: 0,
    projectId:'',
  },
  onLoad: function (options) {
    var id = wx.getStorageSync('id')
    this.setData({
      projectId:id
    })
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
        console.log(res)
        res.data.info[0].acreage=parseInt(res.data.info[0].acreage)
        wx.setStorageSync('pqOrderInfo', res.data.info[0])
        if (res.data.info[0].duration!=null && res.data.info[0].duration.indexOf("月") == -1){
          res.data.info[0].duration = res.data.info[0].duration+"个月"
        }
        that.setData({
          orderInfo: res.data.info[0]
        })
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  towantAdd(e){
    var goWantAdd = e.currentTarget.dataset.towantadd
    var goDetail = ''
    if (goWantAdd =='后期可能存在的增项'){
      goDetail = '../../wantAddEidt/wantAddEidt';
    } else if (goWantAdd =='材料工艺项目'){
      goDetail = '../../materialScience/materialScience';
    } else if (goWantAdd == '施工图纸建议') {
      goDetail = '../onstructionDrawings/onstructionDrawings';
    } else if (goWantAdd == '合同记录') {
      goDetail = '../../presentationBox/contractProposal/contractProposal';
    } else if (goWantAdd == '其他注意事项及疑义事项') {
      goDetail = '../../orderother/orderother';
    } else if (goWantAdd == '数据收集表') {
      goDetail = '../dataInfo/dataInfo';
    } else if (goWantAdd == '业主基本信息') {
      goDetail = '../../orderbasic/orderbasic';
    } else if (goWantAdd == '房屋基本信息') {
      goDetail = '../../orderHose/orderHose';
    } else{
      goDetail = '../../demandinformaction/demandinformaction';
    }
    goDetail += '?projectId=' + this.data.projectId
    wx.navigateTo({
      url: goDetail,
    })
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  quickLogon: () => {
    wx.navigateTo({
      url: '../quickLogon/quickLogon'
    })
  },
  missCipher: () => {
    wx.navigateTo({
      url: '../missCipher/missCipher',
    })
  },
  login: () => {
    wx.switchTab({
      url: '../orderOwner/orderOwner',
    })
  },
})