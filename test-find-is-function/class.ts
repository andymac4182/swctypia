import {is} from "./swctypia";
import {test1, TestType} from "./test1";


class TestClass {
  constructor() {
    is<TestType>(test1);
  }
}