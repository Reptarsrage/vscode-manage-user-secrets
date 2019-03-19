// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";

function GetUserSecretsId(fileContents: string): string | null {
  const regex = new RegExp(
    /(\<UserSecretsId\>)([\w\-]+)(\<\/UserSecretsId\>)/i
  );
  const groups = fileContents.match(regex);

  if (groups && groups.length === 4) {
    return groups[2];
  }

  return null;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "user-secrets" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "extension.manageUserSecrets",
    async (uri: vscode.Uri) => {
      // First parse the User Secrets Id from the csproj file
      const csprojFile = await vscode.workspace.openTextDocument(uri);
      const csprojContent = csprojFile.getText();
      const userSecretId = GetUserSecretsId(csprojContent);
      if (userSecretId === null) {
        vscode.window.showWarningMessage(
          "Unable to find UserSecretId in csproj. [See here for more info](https://docs.microsoft.com/en-us/aspnet/core/security/app-secrets#enable-secret-storage)"
        );
        return;
      }

      // Next determine where the user secrets file is
      let secretsPath;
      const osType = os.type();
      if (osType === "Windows_NT") {
        secretsPath = `${os.homedir()}\\AppData\\Roaming\\Microsoft\\UserSecrets\\${userSecretId}\\secrets.json`;
      } else if (osType === "Linux") {
        secretsPath = `${os.homedir()}/.microsoft/usersecrets/${userSecretId}/secrets.json`;
      } else if (osType === "Darwin") {
        secretsPath = `${os.homedir()}/.microsoft/usersecrets/${userSecretId}/secrets.json`;
      } else {
        vscode.window.showWarningMessage(
          `Unknown Operating System. ${osType} not supported.`
        );
        return;
      }

      // Check if path exists, if not, add it
      if (!fs.existsSync(path.dirname(secretsPath))) {
        fs.mkdirSync(path.dirname(secretsPath), { recursive: true });
      }

      // Check if file already exists, if not, intialize it
      if (!fs.existsSync(secretsPath)) {
        fs.writeFileSync(secretsPath, "{\n}");
      }

      // Open the user secrets file
      let doc = await vscode.workspace.openTextDocument(secretsPath);
      await vscode.window.showTextDocument(doc);
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
