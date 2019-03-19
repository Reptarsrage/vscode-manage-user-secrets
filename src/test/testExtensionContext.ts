import * as vscode from 'vscode';

import DummyMemento from './dummyMemento';

// mock of the extension context for vscode
export default class TestExtensionContext implements vscode.ExtensionContext {
  subscriptions: Array<{ dispose(): {} }> = [];
  workspaceState: vscode.Memento = new DummyMemento();
  globalState: vscode.Memento = new DummyMemento();
  extensionPath = '';
  storagePath = '';
  globalStoragePath = '';
  logPath = '';

  asAbsolutePath(relativePath: string): string {
    return '';
  }
}
