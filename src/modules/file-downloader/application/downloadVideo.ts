import { DownloadConfig } from '../domain/DownloadConfig';
import { VideoDownloader } from '../domain/VideoDownloader';

export class DownloadVideo {
  constructor(
    readonly videoDownloader: VideoDownloader,
  ) {}

  async run(downloadConfig: DownloadConfig): Promise<void> {
    await this.videoDownloader.download(downloadConfig);
  }
}
