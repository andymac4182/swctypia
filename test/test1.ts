import {is} from './swctypia'

export interface TestType {
  name: string;
}

export const test1: TestType = {
  name: "test1",
}

is<TestType>(test1);
