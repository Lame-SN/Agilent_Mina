// pages/self_service/self_service.js

var util = require('../../utils/util.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    searchIconFlag: true,
    currentTab: 0,
    instrumentList: ["气相色谱", "液相色谱", "气质联用", "液质联用","气相色谱2"],
    dataList: [],
    TECH:'T'
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   var that  = this;

    util.NetRequest({
      url: 'site-mini/self-service',
      success: function (res) {
        console.log(res);
        var data = that.sortList(res);
         that.setData({
           dataList: data
         })
      }
    });
  },

sortList: function(list){
  var data = list.data;
  var dataL = list.data.length;
  var hots = list.hots;
  for (var i = 0; i < dataL; i++){
    for (var key in hots){
      if (data[i].id == key){
        data[i].category = hots[key];
        }
     }
  }
 return data;
},
 /**
   * 热点问题跳转
   */
  clickToFaqDetails:function(e){
    console.log(e)
    var id = e.currentTarget.dataset.id; 
    wx.navigateTo({
      url: '../faq_details/faq_details?id='+id,
    })

  },
  
  bindInput:function(e){
    var inputLength = e.detail.value.length;
    if (inputLength){
      this.setData({ searchIconFlag: false });
    }else{
      this.setData({ searchIconFlag: true });
    }
  },

  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },

  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },

   /** 
     * 点击问题分类进入faq页面
     */
  clickToFaq: function(e){
    console.log(e);
      var id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '../faq/faq?id='+id,
      })
  }
})