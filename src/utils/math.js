
import {BigNumber} from 'bignumber.js';
function add(a, b) {
  a =  BigNumber(a);
  b =  BigNumber(b);
  return a.plus(b);
}
function multiply (a, b){
  a = BigNumber(a);
  b = BigNumber(b);
  return a.multipliedBy(b);
}
function divide(a, b){
  a = BigNumber(a);
  b = BigNumber(b);
  return a.dividedBy(b).toNumber();
}
function round(a,b) {
  let k = divide(a, b)
  let result = multiply(k,100)
  return  Math.round(result)
}
export {add,multiply,divide,round}
