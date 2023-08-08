import { DownloadConfig } from '../../file-downloader/domain/DownloadConfig';
import { VideoDownloader } from '../../file-downloader/domain/VideoDownloader';

export class DownloadVideo {
  constructor(
    readonly videoDownloader: VideoDownloader,
    readonly downloadConfig: DownloadConfig,
  ) {}

  async run(): Promise<void> {
    await this.videoDownloader.download(this.downloadConfig);
  }
}
