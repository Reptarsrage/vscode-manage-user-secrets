import * as vscode from 'vscode';

import DummyMemento from './dummyMemento';

// mock of the extension context for vscode
export default class TestExtensionContext implements vscode.ExtensionContext {
  public subscriptions: Array<{ dispose(): {} }> = [];
  public workspaceState: vscode.Memento = new DummyMemento();
  public globalState: vscode.Memento = new DummyMemento();
  public extensionPath = '';
  public storagePath = '';
  public globalStoragePath = '';
  public logPath = '';

  public asAbsolutePath(relativePath: string): string {
    return '';
  }
}
