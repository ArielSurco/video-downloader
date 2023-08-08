export interface FileDownloader {
  downloadFrom(url: string, destinationPath: string): Promise<void>;
}
