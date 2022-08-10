//时间戳转换成日期时间，传入时间精确到毫秒
function js_date_time(unixtime) {
  var date = new Date(unixtime) 
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();
  var second = date.getSeconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;//年月日时分秒
  // return y + '-' + m + '-' + d + ' ' + h + ':' + minute;
  // return y + '-' + m + '-' + d;
}
function js_date_time_noSecond(unixtime) {
  var date = new Date(unixtime) 
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();
  var second = date.getSeconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  // return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;//年月日时分秒
  return y + '-' + m + '-' + d + ' ' + h + ':' + minute;
  // return y + '-' + m + '-' + d;
}
module.exports = {
  js_date_time: js_date_time,
  js_date_time_noSecond: js_date_time_noSecond
}
