import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

export function getUserSecretsId(fileContents: string): string | null {
  const regex = new RegExp(/(\<UserSecretsId\>)([\w\-]+)(\<\/UserSecretsId\>)/i);
  const groups = fileContents.match(regex);

  if (groups && groups.length === 4) {
    return groups[2];
  }

  return null;
}

export function getUserSecretsLocation(userSecretId: string): string | null {
  const osType = os.type();

  if (osType === 'Windows_NT') {
    return `${os.homedir()}\\AppData\\Roaming\\Microsoft\\UserSecrets\\${userSecretId}\\secrets.json`;
  } else if (osType === 'Linux') {
    return `${os.homedir()}/.microsoft/usersecrets/${userSecretId}/secrets.json`;
  } else if (osType === 'Darwin') {
    return `${os.homedir()}/.microsoft/usersecrets/${userSecretId}/secrets.json`;
  }

  return null;
}

export function ensureUserSecretsPathAndFileExist(secretsPath: string, onError: (err: Error) => void) {
  try {
    // Check if path exists, if not, add it
    const dirName = path.dirname(secretsPath);
    fs.ensureDirSync(dirName);

    // Check if file already exists, if not, intialize it
    if (!fs.pathExistsSync(secretsPath)) {
      fs.writeJSONSync(secretsPath, {});
    }
  } catch (err) {
    onError(err);
  }
}
