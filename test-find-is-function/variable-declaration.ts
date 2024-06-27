import {is} from "./swctypia";
import {test1, TestType} from "./test1";

const testIs = is<TestType>(test1);

const testArray = [is<TestType>(test1)];



const testTurnary = test1.name === "test22" ? is<TestType>(test1) : undefined;

const objectTest = {
  isCheck: is<TestType>(test1),
}