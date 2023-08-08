import { exec } from 'child_process';
import { DownloadClassVideoStrategy } from './DownloadClassVideoStrategy';
import { FileDownloader } from '../../file-downloader/domain/FileDownloader';

type ResourceType = 'video' | 'audio';

export class DownloadMergeStrategy implements DownloadClassVideoStrategy {
  constructor(readonly fileDownloader: FileDownloader) {}

  async downloadClassVideo(videoRequestUrl: string, outputPath: string): Promise<void> {
    const videoUrl = this.getVideoUrlFromRequest(videoRequestUrl);
    const audioUrl = this.getAudioUrlFromRequest(videoRequestUrl);

    await this.downloadOnlyResource('video', videoUrl);
    await this.downloadOnlyResource('audio', audioUrl);

    await this.mergeAudioAndVideo('video.mp4', 'audio.mp4', outputPath);
    this.removeResources();
  }

  removeResources() {
    console.log('Eliminando recursos temporales...');
    exec('rm video.mp4 audio.mp4');
  }

  async downloadOnlyResource(resourceType: ResourceType, resourceUrl: string) {
    console.log(`Descargando ${resourceType}...`);
    await this.fileDownloader.downloadFrom(resourceUrl, `${resourceType}.mp4`);
  }

  mergeAudioAndVideo(videoPath: string, audioPath: string, outputPath: string) {
    console.log('Combinando audio y video...');
    return new Promise((resolve, reject) => {
      exec(`ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac "${outputPath}"`, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(true);
      });
    });
  }

  getVideoUrlFromRequest(requestUrl: string) {
    const [videoIds, ...fragments] = requestUrl.split('/').slice(0, -3).reverse();
    const hdVideoId = videoIds.split(',')[1];
    const auxUrl = [hdVideoId, ...fragments].reverse().join('/').replace('/sep/', '/parcel/');

    return `${auxUrl}.mp4`;
  }

  getAudioUrlFromRequest(requestUrl: string): string {
    const partialUrlResult = requestUrl.replace(/\/video\/.*\/audio/, '/audio').replace('/sep/', '/parcel/');
    const [audioIds, ...fragments] = partialUrlResult.split('/').slice(0, -1).reverse();
    const audioId = audioIds.split(',')[1];
    const audioUrl = [audioId, ...fragments].reverse().join('/');

    return `${audioUrl}.mp4`;
  }
}
