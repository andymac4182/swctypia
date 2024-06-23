import {is} from "./swctypia";
import {test1, TestType} from "./test1";

for (const key in test1) {
  is<TestType>(test1);
}

for (const item of [test1]) {
  is<TestType>(test1);
}
for(let i = 0; i < 10; i++) {
  is<TestType>(test1);
}