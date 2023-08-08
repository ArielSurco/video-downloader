export interface DownloadClassVideoStrategy {
  downloadClassVideo(videoRequestUrl: string, outputPath: string): Promise<void>;
}
