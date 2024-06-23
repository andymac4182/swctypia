import {is} from "./swctypia";
import {test1, TestType} from "./test1";

function testFunction() {
  return is<TestType>(test1);
}


function checkType() {
  is<TestType>(test1);
}

const constArrowCheckType = () => {
  is<TestType>(test1);
}

let letArrowCheckType = () => {
  is<TestType>(test1);
}