import {is} from "./swctypia";
import {test1, TestType} from "./test1";

while (test1.name === "test1") {
  is<TestType>(test1);
}

do {
  is<TestType>(test1);
} while (test1.name === "test1");

do {
  is<TestType>(test1);
} while (is<TestType>(test1));
