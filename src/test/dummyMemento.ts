import * as vscode from 'vscode';

export default class DummyMemento implements vscode.Memento {
  public get<T>(key: string): Promise<T | undefined> {
    return Promise.resolve(undefined);
  }

  // tslint:disable-next-line: no-any
  public update(key: string, value: any): Promise<void> {
    return Promise.resolve();
  }
}
