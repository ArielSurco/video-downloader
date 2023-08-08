import { DownloadConfig } from './DownloadConfig';
import { FileDownloader } from './FileDownloader';

export abstract class VideoDownloader {
  constructor(protected fileDownloader: FileDownloader) {}
  abstract download(config: DownloadConfig): Promise<void>;
}
