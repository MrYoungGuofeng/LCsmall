var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
//引入封装好的请求模块
var utilBox = require("../../../../utils/utilBox.js");
var network = require("../../../../utils/network.js");

Page({
  data: {
    tabs: [
      // "待服务", 
      "服务中", 
      "已放弃",
      "已完成"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    currentTab: 0,
    inputShowed: false,
    inputVal: "",
    navLeftId:0,//左侧列表的id号    
    listInfo:[
      {"name":"全程"},
      { "name": "精装" },
      { "name": "毛培" },
      { "name": "决算" },
      { "name": "单次水电" },
      { "name": "单次泥工" }
      ],
    orderdataeList:[],
    search:'',
    isRefresh: false,
  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log(sliderWidth)
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 3,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex,
          currentTab:0
        });
      }
    });
    //服务类型查询
    let userInfo = wx.getStorageSync("userInfo");
    let reg = /[\W\w]*(JSESSIONID\=[\w\d\-]*)[\W\w]*/;
    let arr = reg.exec(userInfo.adminPassword);
    let cookie = RegExp.$1;
    wx.request({
      url: utilBox.urlheader + "product/serviceType/find", 
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
        cookie: cookie
      },
      method: 'post',
      success: function (res) {
        // console.log(res.data.info.list)
        let navLeftData = res.data.info.list;
        that.setData({
          listInfo: navLeftData,
          navLeftId: navLeftData[0].id
        })
        let topId = parseInt(that.data.activeIndex)+1
        that.getRightData(topId, that.data.navLeftId,'')
      },
      fail:function(err){
        console.log(err)
      }
    })
  },
  confirm(e){
    if (e.detail.value==''){
      wx.showToast({
        icon: 'none',
        title: '请输入搜索内容',
      })
    }else{
      let topId = parseInt(this.data.activeIndex) + 1
      this.getRightData(topId, this.data.navLeftId, e.detail.value)
      this.setData({
        search: '',
      })
    }
    
  },
  clickTab: function(e){
    var that = this;
    this.setData({
      currentTab: e.target.dataset.current,
      navLeftId: e.currentTarget.dataset.currenttabid
    })
    let topId = parseInt(this.data.activeIndex) + 1
    this.getRightData(topId, this.data.navLeftId,'')
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id,
      currentTab: 0,
    });
    let topId = parseInt(this.data.activeIndex)+1
    this.getRightData(topId, this.data.currentTab,'')
  },
  onShow(){
    // 返回时刷新页面
    if (this.data.isRefresh == true) {
      let topId = parseInt(this.data.activeIndex) + 1
      this.getRightData(topId, this.data.navLeftId, '')
    }   
  },
  goassociationReport:function(e){
    wx.setStorageSync('isEdit', 1)
    let reportId = e.currentTarget.dataset.reportid
    let phone = e.currentTarget.dataset.phone
    wx.navigateTo({
      url: '../associationReport/associationReport?reportId=' + reportId + '&phone=' + phone,
    })
  },
  gopresent: function (val){
    wx.setStorageSync('isEdit', 0)
    let orderId = val.currentTarget.dataset.reportid
    var types = val.currentTarget.dataset.type
    var typeName=this.data.listInfo[this.data.currentTab].serName
    let orderNum = val.currentTarget.dataset.num
    wx.setStorageSync('id', orderId)
    wx.setStorageSync('orderNum', orderNum)
    if (typeName == "陪签服务" || typeName == "装修规划" || typeName == "全案服务"){
      wx.navigateTo({
        url: '../accompany/accompany',
      })
    } else if (typeName == ""){
      wx.showToast({
        icon: 'none',
        title: '此项类别为空',
      })
    }else{
      wx.navigateTo({
        url: '../supervisor/supervisor',
      })
    } 
  },
  // 右侧数据请求
  getRightData(topNav, leftNav, keyword){
    var that=this;
    let userInfo = wx.getStorageSync("userInfo");
    let reg = /[\W\w]*(JSESSIONID\=[\w\d\-]*)[\W\w]*/;
    let arr = reg.exec(userInfo.adminPassword);
    let cookie = RegExp.$1;
    wx.request({
      url: utilBox.urlheader + "/product/workList/queryType?typeId=" + leftNav, //仅为示例，并非真实的接口地址
      data: {
        isAccepted: topNav,
        keyword: keyword
      },
      header: {
        'content-type': 'application/json', // 默认值
        cookie: cookie
      },
      method: 'post',
      success: function (res) {
        let data = res.data.info
        console.log(res)
        var newData=[]
        if(data!=null){
          for (let i = 0; i < data.length; i++) {
            let obj = {}
            obj.name = data[i].projectEstablish.orderDetail.name;
            obj.phone = data[i].projectEstablish.orderDetail.phone;
            obj.vipPhone = data[i].projectEstablish.orderDetail.vipPhone;
            obj.orderNum = data[i].projectEstablish.orderDetail.orderNumber;
            obj.add = data[i].projectEstablish.orderDetail.detailAddress;
            obj.types = that.data.tabs[that.data.activeIndex];
            obj.typedata = data[i].projectEstablish.orderDetail.categoryName
            if (data[i].projectEstablish.orderDetail.categoryName==null){
              if (data[i].projectEstablish.orderDetail.serviceType.serName=='全程监理'){
                obj.typedata='监理'
              } else if (data[i].projectEstablish.orderDetail.serviceType.serName=='陪签服务'){
                obj.typedata='陪签'
              }
              // obj.typedata = data[i].projectEstablish.orderDetail.serviceType.serName
            } 
            obj.reportId = data[i].projectEstablishId;
            obj.node = data[i].projectEstablish.entryReports
            var index = -1;
            if (obj.node.length>2){
              for (let j = 0; j < obj.node.length; j++) {
                if (obj.node[j].okCount == obj.node[j].reportCount) {
                  index=j
                }
              }
              if(index==-1){
                obj.node=obj.node.splice(0,2)
              } else if (index == obj.node.length-1){
                obj.node = obj.node.splice(index, 1)
              }else{
                obj.node = obj.node.splice(index, 2)
              }
            }
            newData.push(obj)
          }
        }
        that.setData({
          orderdataeList: newData
        })
        // console.log(that.data.orderdataeList)
        return newData
      },
      fail: function (err) {
        console.log(err)
      }
    })
  }
});