import * as assert from "assert";

import { getUserSecretsId } from "../userSecrets";

suite("User Secrets Tests", function() {
  suite("getUserSecretsId", function() {
    test("finds user id", function() {
      // arrange
      const expectedId = "test-12345-abcd-1ABD-C14cd-gF4g0";
      const content = `<Project Sdk="Microsoft.NET.Sdk.Web"><PropertyGroup><UserSecretsId>${expectedId}</UserSecretsId></PropertyGroup></Project>`;

      // act
      var actual = getUserSecretsId(content);

      // assert
      assert.equal(expectedId, actual, "UserSecretsId should match");
    });

    test("returns null if not found", function() {
      // arrange
      const content = `<Project Sdk="Microsoft.NET.Sdk.Web"><PropertyGroup><LangVersion>latest</LangVersion></PropertyGroup></Project>`;

      // act
      var actual = getUserSecretsId(content);

      // assert
      assert.equal(null, actual, "UserSecretsId is null");
    });

    test("returns null if malformed", function() {
      // arrange
      const expectedId = "test-12345-abcd-1ABD-C14cd-gF4g0";
      const content = `<Project Sdk="Microsoft.NET.Sdk.Web"><PropertyGroup><UserSecretsId>${expectedId}</PropertyGroup></Project>`;

      // act
      var actual = getUserSecretsId(content);

      // assert
      assert.equal(null, actual, "UserSecretsId is null");
    });
  });
});
