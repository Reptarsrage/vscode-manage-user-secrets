import * as assert from 'assert';
import * as fs from 'fs';
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
      sandbox.stub(path, 'dirname').returns(expectedDir);

      fsMock
        .expects('existsSync')
        .withArgs(expectedDir)
        .once()
        .returns(false);

      fsMock
        .expects('existsSync')
        .withArgs(expectedPath)
        .once()
        .returns(false);

      fsMock
        .expects('mkdirSync')
        .withArgs(expectedDir, { recursive: true })
        .once();

      fsMock
        .expects('writeFileSync')
        .withArgs(expectedPath, '{\n}')
        .once();

      // act
      ensureUserSecretsPathAndFileExist(expectedPath);

      // assert
      fsMock.verify();
    });

    it("skips directory and creates file if directory exists but file doesn't", () => {
      // arrange
      const expectedDir = '/home/a/path';
      const expectedPath = `${expectedDir}/file.json`;
      const fsMock = sandbox.mock(fs);
      sandbox.stub(path, 'dirname').returns(expectedDir);

      fsMock
        .expects('existsSync')
        .withArgs(expectedDir)
        .once()
        .returns(true);

      fsMock
        .expects('existsSync')
        .withArgs(expectedPath)
        .once()
        .returns(false);

      fsMock.expects('mkdirSync').never();
      fsMock
        .expects('writeFileSync')
        .withArgs(expectedPath, '{\n}')
        .once();

      // act
      ensureUserSecretsPathAndFileExist(expectedPath);

      // assert
      fsMock.verify();
    });

    it('skips directory file if both exist', () => {
      // arrange
      const expectedDir = '/home/a/path';
      const expectedPath = `${expectedDir}/file.json`;
      const fsMock = sandbox.mock(fs);
      sandbox.stub(path, 'dirname').returns(expectedDir);

      fsMock
        .expects('existsSync')
        .withArgs(expectedDir)
        .once()
        .returns(true);

      fsMock
        .expects('existsSync')
        .withArgs(expectedPath)
        .once()
        .returns(true);

      fsMock.expects('mkdirSync').never();
      fsMock.expects('writeFileSync').never();

      // act
      ensureUserSecretsPathAndFileExist(expectedPath);

      // assert
      fsMock.verify();
    });
  });
});
