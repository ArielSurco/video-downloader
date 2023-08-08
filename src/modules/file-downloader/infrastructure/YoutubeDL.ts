import { exec } from 'child_process';
import { FileDownloader } from '../domain/FileDownloader';

export class YoutubeDL implements FileDownloader {
  private static readonly YTDL_PATH = 'youtube-dl.exe';

  async downloadFrom(url: string, destinationPath: string): Promise<void> {
    const command = `${YoutubeDL.YTDL_PATH} -o "${destinationPath}" "${url}"`;
    await new Promise((resolve, reject) => {
      exec(command, (error) => {
        if (error) {
          console.log(error);
          reject(error);
        }
        resolve(true);
      });
    });
  }
}
