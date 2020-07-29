export default class common {
  //防止多次点击
  static throttle(fn, beginTime = 1500) {
    let lastTime = null;
    return function () {
      let nowTime = new Date();
      if (nowTime - lastTime > beginTime || !lastTime) {
        fn.apply(this, arguments);
        lastTime = nowTime;
      }
    };
  }
  /**
   * @Name: addition
   * @Description: 计算两个数之和，默认保留2位小数
   * @Param:  number1: 数字1，number2: 数字2，digits: 要保留的位数
   * @Return: Number,数字之和
   * @Author: Zander Xue
   * @Date: 2019-12-17 10:33:55
   */
  static addition(number1, number2, digits = 2) {
    if (typeof number1 !== 'number' || typeof number2 !== 'number' || digits % 1 !== 0) {
      return false;
    }
    return Number((number1 + number2).toFixed(digits));
  }
}