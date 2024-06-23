import {is} from "./swctypia";
import {test1, TestType} from "./test1";

if (test1.name === "test1") {
  is<TestType>(test1);
}