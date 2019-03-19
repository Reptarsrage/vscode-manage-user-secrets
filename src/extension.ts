import * as vscode from 'vscode';
import { ensureUserSecretsPathAndFileExist, getUserSecretsId, getUserSecretsLocation } from './userSecrets';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('extension.manageUserSecrets', async (uri: vscode.Uri) => {
    // First parse the User Secrets Id from the csproj file
    const csprojFile = await vscode.workspace.openTextDocument(uri.fsPath);
    const csprojContent = csprojFile.getText();
    const userSecretId = getUserSecretsId(csprojContent);
    if (userSecretId === null) {
      vscode.window.showWarningMessage(
        'Unable to find UserSecretId in csproj. [See here for more info](https://docs.microsoft.com/en-us/aspnet/core/security/app-secrets#enable-secret-storage)'
      );
      return;
    }

    // Next determine where the user secrets file is
    const secretsPath = getUserSecretsLocation(userSecretId);
    if (secretsPath === null) {
      vscode.window.showErrorMessage('Unable to locate User Secrets file location.');
      return;
    }

    // Ensure location and file exist
    ensureUserSecretsPathAndFileExist(secretsPath);

    // Open the user secrets file
    const doc = await vscode.workspace.openTextDocument(secretsPath);
    const _ = await vscode.window.showTextDocument(doc);
  });

  context.subscriptions.push(disposable);
}
