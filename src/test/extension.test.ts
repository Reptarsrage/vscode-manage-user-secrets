import * as assert from 'assert';
import * as os from 'os';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

import * as myExtension from '../extension';
import * as userSecrets from '../userSecrets';
import TestExtensionContext from './testExtensionContext';

describe('Extension Tests', () => {
  let sandbox: sinon.SinonSandbox;
  const expectedProjectPath =
    os.type() === 'Windows_NT'
      ? `${os.homedir()}\\Fake\\Path\\project.csproj`
      : `${os.homedir()}/fake/path/project.csproj`;
  const expectedSecretsPath =
    os.type() === 'Windows_NT' ? `${os.homedir()}\\Fake\\Path\\secrets.json` : `${os.homedir()}/fake/path/secrets.json`;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('activate', () => {
    it('registers command with visual studio', () => {
      // arrange
      const stubContext = new TestExtensionContext();
      const mockVscodeCommands = sandbox.mock(vscode.commands);
      mockVscodeCommands
        .expects('registerCommand')
        .withArgs('extension.manageUserSecrets', sinon.match.func)
        .once();

      // act
      myExtension.activate(stubContext);

      // assert
      assert.equal(stubContext.subscriptions.length, 1, 'Subscriptions contains registered command');
      mockVscodeCommands.verify();
    });

    it('calls dependencies with expected parameters', async () => {
      // arrange
      const expectedCsprojContent = 'CSPROJ CONTENT';
      const expectedId = 'test-id';

      const stubTextDocument: vscode.TextDocument = ({} as any) as vscode.TextDocument;
      const mockVscodeWorkspace = sandbox.mock(vscode.workspace);
      const mockVscodeWindow = sandbox.mock(vscode.window);
      const userSecretsMock = sandbox.mock(userSecrets);

      stubTextDocument.getText = sandbox.stub().returns(expectedCsprojContent);
      mockVscodeWorkspace
        .expects('openTextDocument')
        .withArgs(expectedProjectPath)
        .once()
        .resolves(stubTextDocument);

      mockVscodeWorkspace
        .expects('openTextDocument')
        .withArgs(expectedSecretsPath)
        .once()
        .resolves(stubTextDocument);

      mockVscodeWindow
        .expects('showTextDocument')
        .withArgs(stubTextDocument)
        .once()
        .resolves();

      userSecretsMock
        .expects('getUserSecretsId')
        .withArgs(expectedCsprojContent)
        .once()
        .returns(expectedId);

      userSecretsMock
        .expects('getUserSecretsLocation')
        .withArgs(expectedId)
        .once()
        .returns(expectedSecretsPath);

      userSecretsMock
        .expects('ensureUserSecretsPathAndFileExist')
        .withArgs(expectedSecretsPath)
        .once();

      // act
      await vscode.commands.executeCommand('extension.manageUserSecrets', vscode.Uri.parse(expectedProjectPath));

      // assert
      userSecretsMock.verify();
      mockVscodeWorkspace.verify();
      mockVscodeWindow.verify();
    });

    it('shows warning message when user secrets id is null', async () => {
      // arrange
      const expectedCsprojContent = 'CSPROJ CONTENT';
      const stubTextDocument: vscode.TextDocument = ({} as any) as vscode.TextDocument;
      const mockVscodeWorkspace = sandbox.mock(vscode.workspace);
      const mockVscodeWindow = sandbox.mock(vscode.window);
      const userSecretsMock = sandbox.mock(userSecrets);

      stubTextDocument.getText = sandbox.stub().returns(expectedCsprojContent);
      mockVscodeWorkspace
        .expects('openTextDocument')
        .withArgs(expectedProjectPath)
        .once()
        .resolves(stubTextDocument);

      mockVscodeWindow
        .expects('showWarningMessage')
        .withArgs(
          'Unable to find UserSecretId in csproj. [See here for more info](https://docs.microsoft.com/en-us/aspnet/core/security/app-secrets#enable-secret-storage)'
        )
        .once();

      userSecretsMock
        .expects('getUserSecretsId')
        .withArgs(expectedCsprojContent)
        .once()
        .returns(null);

      // act
      await vscode.commands.executeCommand('extension.manageUserSecrets', vscode.Uri.parse(expectedProjectPath));

      // assert
      userSecretsMock.verify();
      mockVscodeWorkspace.verify();
      mockVscodeWindow.verify();
    });

    it('shows warning message when user secrets path is null', async () => {
      // arrange
      const expectedCsprojContent = 'CSPROJ CONTENT';
      const expectedId = 'test-id';
      const stubTextDocument: vscode.TextDocument = ({} as any) as vscode.TextDocument;
      const mockVscodeWorkspace = sandbox.mock(vscode.workspace);
      const mockVscodeWindow = sandbox.mock(vscode.window);
      const userSecretsMock = sandbox.mock(userSecrets);

      stubTextDocument.getText = sandbox.stub().returns(expectedCsprojContent);
      mockVscodeWorkspace
        .expects('openTextDocument')
        .withArgs(expectedProjectPath)
        .once()
        .resolves(stubTextDocument);

      mockVscodeWindow
        .expects('showErrorMessage')
        .withArgs('Unable to locate User Secrets file location.')
        .once();

      userSecretsMock
        .expects('getUserSecretsId')
        .withArgs(expectedCsprojContent)
        .once()
        .returns(expectedId);

      userSecretsMock
        .expects('getUserSecretsLocation')
        .withArgs(expectedId)
        .once()
        .returns(null);

      // act
      await vscode.commands.executeCommand('extension.manageUserSecrets', vscode.Uri.parse(expectedProjectPath));

      // assert
      userSecretsMock.verify();
      mockVscodeWorkspace.verify();
      mockVscodeWindow.verify();
    });
  });
});
