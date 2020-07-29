// 看板小程序，时间处理方法

// 传入时间戳，返回 2020-01-02
function formatDate(date) {
  let dd = new Date(date);
  let y = dd.getFullYear();
  let m = dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
  let d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
  return y + "-" + m + "-" + d;
}

function getNextDate (date, day) {//获取某一天的后一天，1代表后一天，-1代表前一天
  let dd = new Date(date);
  dd.setDate(dd.getDate() + day);
  let y = dd.getFullYear();
  let m = dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
  let d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
  return y + "-" + m + "-" + d;
}

//获取今天日期格式2020-20-20
function getCurrentDate(format) {
  let now = new Date();
  let year = now.getFullYear(); //得到年份
  let month = now.getMonth();//得到月份
  let date = now.getDate();//得到日期
  let day = now.getDay();//得到周几
  let hour = now.getHours();//得到小时
  let minu = now.getMinutes();//得到分钟
  let sec = now.getSeconds();//得到秒
  month = month + 1;
  if (month < 10) month = "0" + month;
  if (date < 10) date = "0" + date;
  if (hour < 10) hour = "0" + hour;
  if (minu < 10) minu = "0" + minu;
  if (sec < 10) sec = "0" + sec;
  let time = "";
  //精确到天
  if (format == 1) {
    time = year + "-" + month + "-" + date;
  }
  //精确到分
  else if (format == 2) {
    time = year + "-" + month + "-" + date + " " + hour + ":" + minu + ":" + sec;
  }
  return time;
}
module.exports = {
  formatDate: formatDate,
  getNextDate: getNextDate,
  getCurrentDate: getCurrentDate
}
