export interface GithubFileInfoType {
  name: string;
  path: string;
  size: number;
  url: string;
  type: FileType;
  download_url: string;
}

export enum FileType {
  Dir = 'dir',
  File = 'file',
}

export interface ConfigType {
  name: string;
  description?: string;
}

export interface mapEventPropertiesType {
  id: number;
  title: string;
  content: string;
  author: string;
  flagged: boolean;
  actualDate: Date;
}
