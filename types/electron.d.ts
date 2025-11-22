export interface ElectronAPI {
  getHomeDir: () => Promise<string>;
  checkDirExists: (path: string) => Promise<boolean>;
  selectDirectory: () => Promise<string | null>;
  readDir: (path: string) => Promise<string[]>;
  writeFile: (path: string, content: string) => Promise<boolean>;
  joinPath: (...args: string[]) => Promise<string>;
  deleteFile: (path: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
