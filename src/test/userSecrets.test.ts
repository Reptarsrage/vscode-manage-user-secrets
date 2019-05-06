import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';

import { ensureUserSecretsPathAndFileExist, getUserSecretsId, getUserSecretsLocation } from '../userSecrets';

describe('User Secrets Tests', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getUserSecretsId', () => {
    it('finds user id', () => {
      // arrange
      const expectedId = 'test-12345-abcd-1ABD-C14cd-gF4g0';
      const content = `<Project Sdk="Microsoft.NET.Sdk.Web"><PropertyGroup><UserSecretsId>${expectedId}</UserSecretsId></PropertyGroup></Project>`;

      // act
      const actual = getUserSecretsId(content);

      // assert
      assert.equal(actual, expectedId, 'UserSecretsId should match');
    });

    it('returns null if not found', () => {
      // arrange
      const content = `<Project Sdk="Microsoft.NET.Sdk.Web"><PropertyGroup><LangVersion>latest</LangVersion></PropertyGroup></Project>`;

      // act
      const actual = getUserSecretsId(content);

      // assert
      assert.equal(actual, null, 'UserSecretsId is null');
    });

    it('returns null if malformed', () => {
      // arrange
      const expectedId = 'test-12345-abcd-1ABD-C14cd-gF4g0';
      const content = `<Project Sdk="Microsoft.NET.Sdk.Web"><PropertyGroup><UserSecretsId>${expectedId}</PropertyGroup></Project>`;

      // act
      const actual = getUserSecretsId(content);

      // assert
      assert.equal(actual, null, 'UserSecretsId is null');
    });
  });

  describe('getUserSecretsLocation', () => {
    it('returns correct path for Windows operating system', () => {
      // arrange
      const expectedUserSecretId = 'test-12345-abcd-1ABD-C14cd-gF4g0';
      const expectedHomePath = '%HOMEPATH%';
      sandbox.stub(os, 'type').returns('Windows_NT');
      sandbox.stub(os, 'homedir').returns(expectedHomePath);

      // act
      const actual = getUserSecretsLocation(expectedUserSecretId);

      // assert
      assert.equal(
        actual,
        `${expectedHomePath}\\AppData\\Roaming\\Microsoft\\UserSecrets\\${expectedUserSecretId}\\secrets.json`,
        'Path matches expected path'
      );
    });

    it('returns correct path for Linux operating system', () => {
      // arrange
      const expectedUserSecretId = 'test-12345-abcd-1ABD-C14cd-gF4g0';
      const expectedHomePath = '%HOMEPATH%';
      sandbox.stub(os, 'type').returns('Linux');
      sandbox.stub(os, 'homedir').returns(expectedHomePath);

      // act
      const actual = getUserSecretsLocation(expectedUserSecretId);

      // assert
      assert.equal(
        actual,
        `${expectedHomePath}/.microsoft/usersecrets/${expectedUserSecretId}/secrets.json`,
        'Path matches expected path'
      );
    });

    it('returns correct path for MacOS operating system', () => {
      // arrange
      const expectedUserSecretId = 'test-12345-abcd-1ABD-C14cd-gF4g0';
      const expectedHomePath = '%HOMEPATH%';
      sandbox.stub(os, 'type').returns('Darwin');
      sandbox.stub(os, 'homedir').returns(expectedHomePath);

      // act
      const actual = getUserSecretsLocation(expectedUserSecretId);

      // assert
      assert.equal(
        actual,
        `${expectedHomePath}/.microsoft/usersecrets/${expectedUserSecretId}/secrets.json`,
        'Path matches expected path'
      );
    });

    it('returns null for unknown operating system', () => {
      // arrange
      const expectedUserSecretId = 'test-12345-abcd-1ABD-C14cd-gF4g0';
      sandbox.stub(os, 'type').returns('Poop');

      // act
      const actual = getUserSecretsLocation(expectedUserSecretId);

      // assert
      assert.equal(actual, null, 'Path matches expected path');
    });
  });

  describe('ensureUserSecretsPathAndFileExist', () => {
    it("creates directory and file if they don't exist", () => {
      // arrange
      const expectedDir = '/home/a/path';
      const expectedPath = `${expectedDir}/file.json`;
      const fsMock = sandbox.mock(fs);
      const onErrorStub = sandbox.stub();
      sandbox.stub(path, 'dirname').returns(expectedDir);

      fsMock
        .expects('ensureDirSync')
        .withArgs(expectedDir)
        .once();

      fsMock
        .expects('pathExistsSync')
        .withArgs(expectedPath)
        .once()
        .returns(false);

      fsMock
        .expects('writeJSONSync')
        .withArgs(expectedPath, {})
        .once();

      // act
      ensureUserSecretsPathAndFileExist(expectedPath, onErrorStub);

      // assert
      fsMock.verify();
      assert.equal(false, onErrorStub.called);
    });

    it('catches error when fails and calls callback', () => {
      // arrange
      const expectedDir = '/home/a/path';
      const expectedPath = `${expectedDir}/file.json`;
      const fsMock = sandbox.mock(fs);
      const onErrorStub = sandbox.stub();
      sandbox.stub(path, 'dirname').returns(expectedDir);

      fsMock
        .expects('ensureDirSync')
        .withArgs(expectedDir)
        .once()
        .throws();

      // act
      ensureUserSecretsPathAndFileExist(expectedPath, onErrorStub);

      // assert
      assert.equal(true, onErrorStub.called);
      fsMock.verify();
    });

    it("skips directory and creates file if directory exists but file doesn't", () => {
      // arrange
      const expectedDir = '/home/a/path';
      const expectedPath = `${expectedDir}/file.json`;
      const fsMock = sandbox.mock(fs);
      const onErrorStub = sandbox.stub();
      sandbox.stub(path, 'dirname').returns(expectedDir);

      fsMock
        .expects('ensureDirSync')
        .withArgs(expectedDir)
        .once();

      fsMock
        .expects('pathExistsSync')
        .withArgs(expectedPath)
        .once()
        .returns(false);

      fsMock
        .expects('writeJSONSync')
        .withArgs(expectedPath, {})
        .once();

      // act
      ensureUserSecretsPathAndFileExist(expectedPath, onErrorStub);

      // assert
      fsMock.verify();
      assert.equal(false, onErrorStub.called);
    });

    it('skips directory file if both exist', () => {
      // arrange
      const expectedDir = '/home/a/path';
      const expectedPath = `${expectedDir}/file.json`;
      const fsMock = sandbox.mock(fs);
      const onErrorStub = sandbox.stub();
      sandbox.stub(path, 'dirname').returns(expectedDir);

      fsMock
        .expects('ensureDirSync')
        .withArgs(expectedDir)
        .once()
        .returns(true);

      fsMock
        .expects('pathExistsSync')
        .withArgs(expectedPath)
        .once()
        .returns(true);

      fsMock.expects('writeJSONSync').never();

      // act
      ensureUserSecretsPathAndFileExist(expectedPath, onErrorStub);

      // assert
      fsMock.verify();
      assert.equal(false, onErrorStub.called);
    });
  });
});
