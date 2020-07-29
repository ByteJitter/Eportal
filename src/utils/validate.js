export default class Validate {

  //校验手机号
  static verifyPhone(num) {
    let reg = /(^1(3[0-9]|4[5-8]|5[0-35-9]|66|8[0-9]|7[0-8]|9[89])\d{8}$)/;
    return reg.test(num);
  }

  //仅为正整数
  static numSeparator(value) {
    let reg = /^[0-9]*[1-9][0-9]*$/;
    return reg.test(value);
  }

  //最多两位小数
  static floatNumSeparator(value) {
    let reg = /^\d+(\.\d{0,2})?$/;
    return reg.test(value);
  }

  // 验证邮箱
  static verifyEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
  }

  // 纯字母
  static verifyAlphabets(str) {
    const reg = /^[A-Za-z]+$/
    return reg.test(str)
  }

  // 合法uri
  static verifyURL(textval) {
    const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
    return urlregex.test(textval)
  }

  // leon 校验是否是合法的ID
  static verifyId(textval) {
    const urlregex = /^[a-fA-F0-9]{24}$/;
    return urlregex.test(textval);
  }

  // Doris 校验小于5的最多两位小数
  static floatNumSeparatorLimit5(value) {
    let reg = /([1-4]\d*(\.\d*[1-9])?)|(0\.\d*[1-9])/;
    return reg.test(value);
  }

  // Doris 校验非空
  static isNull(value){
    let reg = /\S/;
    return reg.test(value);
  }

}