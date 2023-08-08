import { exec } from 'child_process';
import { FileDownloader } from '../domain/FileDownloader';

export class Curl implements FileDownloader {
  // eslint-disable-next-line class-methods-use-this
  downloadFrom(url: string, destinationPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`curl -o ${destinationPath} ${url}`, (error) => {
        if (error) {
          reject(error);
        }

        resolve();
      });
    });
  }
}
