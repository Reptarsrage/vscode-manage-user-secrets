import * as os from "os";
import * as fs from "fs";
import * as path from "path";

export function getUserSecretsId(fileContents: string): string | null {
  const regex = new RegExp(
    /(\<UserSecretsId\>)([\w\-]+)(\<\/UserSecretsId\>)/i
  );
  const groups = fileContents.match(regex);

  if (groups && groups.length === 4) {
    return groups[2];
  }

  return null;
}

export function getUserSecretsLocation(userSecretId: string): string | null {
  const osType = os.type();

  if (osType === "Windows_NT") {
    return `${os.homedir()}\\AppData\\Roaming\\Microsoft\\UserSecrets\\${userSecretId}\\secrets.json`;
  } else if (osType === "Linux") {
    return `${os.homedir()}/.microsoft/usersecrets/${userSecretId}/secrets.json`;
  } else if (osType === "Darwin") {
    return `${os.homedir()}/.microsoft/usersecrets/${userSecretId}/secrets.json`;
  }

  return null;
}

export function ensureUserSecretsPathAndFileExist(secretsPath: string) {
  // Check if path exists, if not, add it
  if (!fs.existsSync(path.dirname(secretsPath))) {
    fs.mkdirSync(path.dirname(secretsPath), { recursive: true });
  }

  // Check if file already exists, if not, intialize it
  if (!fs.existsSync(secretsPath)) {
    fs.writeFileSync(secretsPath, "{\n}");
  }
}
