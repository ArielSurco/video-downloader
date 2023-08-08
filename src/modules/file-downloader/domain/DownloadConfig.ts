import { AuthCredentials } from '../../codely/domain/AuthCredentials';

export interface DownloadConfig {
  sourceLink: string;
  destinationFolder: string;
  title: string;
  credentials: AuthCredentials;
}
