import { DownloadClassVideoStrategy } from './DownloadClassVideoStrategy';
import { FileDownloader } from '../../file-downloader/domain/FileDownloader';

export class DownloadSimpleStrategy implements DownloadClassVideoStrategy {
  constructor(readonly fileDownloader: FileDownloader) {}

  async downloadClassVideo(videoRequestUrl: string, outputPath: string): Promise<void> {
    const videoUrl = this.parseVideoRequestUrl(videoRequestUrl);
    await this.fileDownloader.downloadFrom(videoUrl, outputPath);
  }

  parseVideoRequestUrl(url: string): string {
    const [videoIds, ...fragments] = url.split('/').slice(0, -3).reverse();
    const hdVideoId = videoIds.split(',')[1];
    const auxUrl = [hdVideoId, ...fragments].reverse().join('/').replace('/sep/', '/parcel/');
    const parsedVideoUrl = `${auxUrl}.mp4`;

    return parsedVideoUrl;
  }
}
