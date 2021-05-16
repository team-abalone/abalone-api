import { expect } from "chai";

// begin a test suite of one or more tests
describe("#sum()", function () {
  // add a test hook
  beforeEach(function () {
    // ...some logic before each test is run
  });

  it("should add numbers", function () {
    // add an assertion
    expect(7 + 8).to.equal(15);
  });
});
