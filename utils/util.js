function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

var urlArr = ["wechat-mini/wx-login", "api/check-lunch"];//未登录可以使用的url
let ocrServer ="https://msd.coffeelandcn.cn/";
//let ocrServer = "https://devopsx.coffeelandcn.cn/";
//let Server = "https://devopsx.coffeelandcn.cn/"; //DEV
let Server = "https://devops.coffeelandcn.cn/"; //UAT
//let Server = "https://prd.wechat.service.agilent.com/"; //PRO
var arrRequest=[],isRequesting=false;
function NetRequest({ url, data, success, fail, complete, method = "POST", showload = true, host = Server}) {
  var obj = { url: url, data: data, success: success, fail: fail, complete: complete, method: method, showload: showload, host: host}; 
  if (showload) {
    wx.showLoading({
      title: '加载中，请稍候',
      mask: true
    })
  }
  var app=getApp();
  console.log(app.globalData.isLogin);
  if (isRequesting || (!app.globalData.isLogin && !in_array(url,urlArr))){
      arrRequest.push(obj);
      return;
   }
  isRequesting=true;
  _NetRequest(obj);
}

function in_array(stringToSearch, arrayToSearch) {
  for (var s = 0; s < arrayToSearch.length; s++) {
    var thisEntry = arrayToSearch[s].toString();
    if (thisEntry == stringToSearch) {
      return true;
    }
  }
  return false;
}

function _NetRequest({ url, data, success, fail, complete, method = "POST", showload = true, host = Server}){
  var tempUrl = url;
  var app = getApp();
  

  if (!in_array(url,urlArr)&&app.globalData.needCheck){     
     isRequesting = false;
     app.alertInfo();
     arrRequest=[];
     return false;
  }

  var _csrf = wx.getStorageSync('csrf');
  var version = "2.4.8.1";
  var csrfToken = wx.getStorageSync('csrfCookie')
  if (typeof (data) == 'object') {
    data._csrf = _csrf;
    data.version = version;
  } else {
    data = { '_csrf': _csrf, 'version': version };
  }

  var session_id = wx.getStorageSync('PHPSESSID');//本地取存储的sessionID
  if (session_id != "" && session_id != null) {
    var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'PHPSESSID=' + session_id + ";" + csrfToken }
  } else {
    var header = { 'content-type': 'application/x-www-form-urlencoded' }
  }

  console.log(session_id);
  url = host + url;
  wx.request({
    url: url,
    method: method,
    data: data,
    header: header,
    success: res => {
      console.log(url);
      console.log(res.data.csrfToken);
      if ((session_id == "" || session_id == null) && typeof (res.data.session_id) != "undefined") {
        console.log(res.data.session_id);
        wx.setStorageSync('PHPSESSID', res.data.session_id); //如果本地没有就说明第一次请求 把返回的session id 存入本地
        var str = res.header['Set-Cookie'] || res.header['set-cookie'];
        console.log(res.header);
        console.log(str);
        if (typeof (res.data.csrfToken) != 'undefined') {
          wx.setStorageSync('csrf', res.data.csrfToken);
          var m = str.match(/_csrf=(.)*?;/);
          if (m != null) {
            wx.setStorageSync('csrfCookie', m[0]);
          }
        }
      }

      if (!fail){
        fail=function(){
          wx.showModal({
            title: '请求失败',
            content: '发生错误，请联系客服。',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.switchTab({
                  url: '../index/index',
                })
              }
            }
          })
        }
      }

      let data = res.data
      res['statusCode'] === 200 ? success(data) : fail(res)
    },
    fail: function (e) {
      console.log(e);
      isRequesting = false; 
      arrRequest = [];
      
      if (tempUrl != "wechat-mini/wx-login" && (e.errMsg == "request:fail timeout" || e.errMsg == "request:fail ")){
        wx.hideLoading();
        wx.showModal({
          title: '请求失败',
          content: '请检查您的网络',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../index/index',
              })
            }
          }
        })
        return;
      }

      if (typeof (fail) == 'function') {
        fail(e);
      }else{
        wx.showModal({
          title: '请求失败',
          content: '请检查您的网络',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../index/index',
              })
            }
          }
        })
      }
    },
    complete: function () {
      if (typeof (complete) == 'function') {
        complete();
      }
      
      if (arrRequest.length == 0) {
        if (!app.globalData.isLoading && !app.globalData.isUploading) {
          wx.hideLoading()
        }
        isRequesting = false;
      } else {
        var obj = arrRequest.shift();
        _NetRequest(obj); 
      }
    }
  })
}


function uploadImg(urlList,callback){
  var session_id = wx.getStorageSync('PHPSESSID');//本地取存储的sessionID
  if (session_id != "" && session_id != null) {
    var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'PHPSESSID=' + session_id }
  } else {
    var header = { 'content-type': 'application/x-www-form-urlencoded' }
  }

  //console.log(session_id);
  var url = Server + "api/upload-img";
  var completeNum=0;
  var returnUrlList=[];
  for (var i in urlList){
    wx.uploadFile({
      url: url,
      filePath: urlList[i],
      name: 'img',
      formData:{
          key:i
      },
      header: header,
      success:function(res){
        completeNum++;
        var obj = JSON.parse(res.data);
        returnUrlList[obj.key] = obj.url;
        if (urlList.length == completeNum) {
          callback(returnUrlList);
        }
      },
      fail: function (e) {
        fail();
      },
      complete: function () {
        //wx.hideLoading()
      }
    })
  }
}


//判断是否绑定,true为绑定，false为未绑定
function IsCertificate(success,fail){
  NetRequest({
    url: 'auth/check-bind',
    success: function (res) {
      if (res.success == true) {
        success();
      } else {
        fail();
      }
    }
  })
}

//判断是否为工作时间,true为是工作时间，false为非工作时间
function checkWorktime(success,fail) {
  NetRequest({
    url: 'util/get-worktime',
    success: function (res) {
      if (res == 1) {
        success();
      } else {
        fail();
      }
    }
  });
}

function checkEmpty(obj,arrInput){
  var isEmpty=false;
  for (var i in arrInput){
    if (obj[arrInput[i]].trim().length==0){
      isEmpty=true;
      return isEmpty;
    }
  }
  return isEmpty;
}

function getUserInfo(cb){
  var user=wx.getStorageSync('userInfo');
  if (user==""){//user不存在
    NetRequest({
      url: "api/get-userinfo", success: function (res) {
        if (res.success) {
          user = res.info;
          wx.setStorageSync('userInfo',user);
          cb(user);
        } else {
          wx.showModal({
            title: '发生错误',
            content: '加载失败',
            showCancel: false
          })
        }
      },
      fail: function () {
        wx.showModal({
          title: '发生错误',
          content: '加载失败',
          showCancel: false
        })
      }
    });
  }else{
    cb(user);
  }
}

function backHome(){
  console.log('backHome')
  wx.switchTab({
    url: '../index/index',
  })
}

//检测是否存在，如存在就调用返回，不存在就直接跳转
function chen_navigateTo(name,url){
    var pages=getCurrentPages();
    var backPageNum=0;
    for(var i in pages){
      if (pages[i].route == name){
        backPageNum=pages.length-1-i;
          break;
       }
    }

    if(backPageNum>0){
      wx.navigateBack({
        delta: backPageNum
      })
    }else{
      wx.navigateTo({
          url:url
      })
    }
}


module.exports = {
  formatTime: formatTime,
  NetRequest: NetRequest,
  IsCertificate: IsCertificate,
  Server: Server,
  ocrServer: ocrServer,
  uploadImg: uploadImg,
  checkEmpty: checkEmpty,
  getUserInfo: getUserInfo,
  checkWorktime: checkWorktime,
  backHome: backHome,
  chen_navigateTo: chen_navigateTo
}
