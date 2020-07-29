// const conf = {
//   imgHost:"http://localhost:8080/static/repairOrder/"
//   // imgHost: "https://et.belstar.com.cn/static/"  
// }
// module.exports = conf ;

function imgHost() {
  let Host = window.location.protocol + "//" + window.location.host + "/static/repairOrder/";
  return Host;
}
export { imgHost };

