// pages/service_details/service_details.js
var app = getApp();
var util = require('../../utils/util.js');
var config = require('../../config.js');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    details:[],
    history:[],
    server: config.Server,
    TECH: 'N_srid:',
    SN: ';sn:',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('历史详情' + options.SrId);
    var that=this;
    util.NetRequest({
      url: 'site-mini/service-details',
      data: {
        'SrId': options.SrId,  
      },
      success: function (res) {
        //history数据分类
        console.log(res);
        console.log(res.SrHistoryDetails);
        console.log(res.SrHistoryDetails.SrHistory);
        that.setData({
          details: res.SrHistoryDetails,
          history: res.SrHistoryDetails.SrHistory
        })
      }
    })
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
// 联系客服
  MtaReport: function () {
    var app = getApp();
    app.mta.Event.stat("meqia", { "group": 'TECH' });
  },


  //再次报修
  clickToRepairAgain: function (e) {
    var sn = e.currentTarget.dataset.sn;
    util.NetRequest({
      url: 'sr/sr-confirm',
      data: {
        serial_number: sn
      },
      success: function (res) {
        console.log(res);
        if (res.success == true) {
          wx.navigateTo({
            url: '../confirm_info/confirm_info' + '?ProductId=' + res.ProductId + '&ProductDesc=' + res.ProductDesc + '&SerialNo=' + res.SerialNo + '&CpName=' + res.CpName + '&ShipToName=' + res.ShipToName + '&CanRepair=' + res.CanRepair,
          })
        }
      }
    })

  },

  //前往评价
  clickToEvaluate: function (e) {
    var Surveyid = e.currentTarget.dataset.surveyid;
    var SerialID = e.currentTarget.dataset.srid;
    wx.navigateTo({
      url: '../evaluate/evaluate?Surveyid=' + Surveyid + '&&SerialNo=' + SerialID
    })
  },

  //查看物流
  trackingNo: function (e) {
    var deliveryno = e.currentTarget.dataset.deliveryno;
    var sn = e.currentTarget.dataset.sn;
    wx.navigateTo({
      url: '../trackingNo/trackingNo?deliveryno=' + deliveryno + '&sn=' + sn
    })
  },

  //打开PDF
  clickToReport: function (e) {
    var url = util.Server + 'site/open-file?ServconfId=' + e.currentTarget.dataset.servconfId;
    wx.showLoading({
      title: '下载中...',
      mask: true
    })

    var downloadTask = wx.downloadFile({
      url: url,
      success: function (res) {
        console.log(res);
        var filePath = res.tempFilePath;
        console.log('filePath= ' + filePath);
        wx.openDocument({
          filePath: filePath,
          success: function (res) {
            console.log('打开文档成功')
          },
          fail: function (res) {
            console.log(res)
            wx.showModal({
              title: '提示',
              content: '报告显示错误。如果需要此报告，请返回，点击发起会话向客服索取。',
              showCancel: false,
            })
          }
        })
      },
      complete: function () {
        wx.hideLoading();
      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '报告下载失败，请检测网络。',
          showCancel: false,
        })
      },
    })
  },

  //查看我的评价
  clickToMyComment: function (e) {
    var Surveyid = e.currentTarget.dataset.surveyid;
    var SerialID = e.currentTarget.dataset.srid;
    wx.navigateTo({
      url: '../evaluation/evaluation?Surveyid=' + Surveyid + '&&SerialNo=' + SerialID
    })
  },
})