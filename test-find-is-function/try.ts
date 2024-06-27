import {is} from "./swctypia";
import {test1, TestType} from "./test1";

try {
  is<TestType>(test1);
} catch (error) {
  is<TestType>(error);
} finally {
  is<TestType>(test1);
}