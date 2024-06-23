import {is} from "./swctypia";
import {test1, TestType} from "./test1";

switch (test1.name) {
  case "test1":
    is<TestType>(test1);
    break;
  default:
    is<TestType>(test1);
}