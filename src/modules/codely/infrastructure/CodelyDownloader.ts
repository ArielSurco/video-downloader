import axios from 'axios';
import fs from 'fs';
import { DownloadConfig } from '../../file-downloader/domain/DownloadConfig';
import { VideoDownloader } from '../../file-downloader/domain/VideoDownloader';
import { WebScraper } from '../../web-scraper/domain/WebScraper';
import { FileDownloader } from '../../file-downloader/domain/FileDownloader';
import { AuthCredentials } from '../domain/AuthCredentials';
import { DownloadClassVideoStrategy } from '../domain/DownloadClassVideoStrategy';
import { DownloadSimpleStrategy } from '../domain/DownloadSimpleStrategy';
import { DownloadMergeStrategy } from '../domain/DownloadMergeStrategy';

export class CodelyDownloader extends VideoDownloader {
  private static readonly HOME_URL = 'https://pro.codely.com/library/';

  private static readonly SEARCHED_REQUESTS = {
    simpleStrategy: 'master.json?base64_init=1',
    mergeStrategy: 'master.json?base64_init=1&query_string_ranges=1',
  };

  private isLogged: boolean;

  private downloadClassVideoStrategy?: DownloadClassVideoStrategy;

  constructor(fileDownloader: FileDownloader, readonly scraper: WebScraper) {
    super(fileDownloader);
    this.isLogged = false;
  }

  async download(config: DownloadConfig): Promise<void> {
    try {
      await this.scraper.goTo(CodelyDownloader.HOME_URL);
      if (!this.isLogged) {
        await this.login(config.credentials);
      }

      console.log('Downloading class');
      await this.downloadClassVideo(config);
      await this.downloadClassDescription(config);
      console.log('Class download successfully');
    } catch (error) {
      console.log('Cannot download video', error);
    }
  }

  getDestinationFolder(config: DownloadConfig): string {
    const destinationFolder = `${config.destinationFolder}/${config.title}`;
    this.createFolderIfNotExists(destinationFolder);
    return destinationFolder;
  }

  createFolderIfNotExists(folderPath: string): void {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }

  getVideoPath(config: DownloadConfig): string {
    return `${this.getDestinationFolder(config)}/Clase.mp4`;
  }

  getVideoDescriptionPath(config: DownloadConfig): string {
    return `${this.getDestinationFolder(config)}/Descripción de la clase.txt`;
  }

  async downloadClassVideo(config: DownloadConfig): Promise<void> {
    const videoRequestUrl = await this.getVideoRequestUrl(config.sourceLink);

    if (videoRequestUrl.endsWith(CodelyDownloader.SEARCHED_REQUESTS.simpleStrategy)) {
      this.downloadClassVideoStrategy = new DownloadSimpleStrategy(this.fileDownloader);
    }
    if (videoRequestUrl.endsWith(CodelyDownloader.SEARCHED_REQUESTS.mergeStrategy)) {
      this.downloadClassVideoStrategy = new DownloadMergeStrategy(this.fileDownloader);
    }
    console.log(this.downloadClassVideoStrategy);
    await this.downloadClassVideoStrategy?.downloadClassVideo(
      videoRequestUrl,
      this.getVideoPath(config),
    );
  }

  async downloadClassDescription(config: DownloadConfig): Promise<void> {
    const videoDescription = await this.getVideoDescription();
    this.createVideoDescriptionFile(this.getVideoDescriptionPath(config), videoDescription);
  }

  async login(credentials: AuthCredentials): Promise<void> {
    try {
      await this.setSessionCookie(credentials);
      this.isLogged = true;
    } catch (error) {
      console.log(error);
    }
  }

  async getBearerToken(credentials: AuthCredentials): Promise<string> {
    try {
      const response = await axios.post('https://gql.pathwright.com/graphql?school_id=13172', {
        query: 'mutation ($username: String!, $password: String!, $invite_token: String) {\n  getToken(username: $username, password: $password, invite_token: $invite_token) {\n    token\n    user_id\n    created\n    __typename\n  }\n}',
        variables: {
          username: credentials.emailOrUsername,
          password: credentials.password,
        },
      }).then((res) => res.data);

      return response.data.getToken.token;
    } catch (_error) {
      throw this.invalidCredentialsError();
    }
  }

  async setSessionCookie(credentials: AuthCredentials): Promise<void> {
    try {
      const bearerToken = await this.getBearerToken(credentials);
      await this.scraper.fetch('https://pro.codely.com/api/private/session/', {
        method: 'GET',
        headers: {
          Authorization: `Token ${bearerToken}`,
        },
      });
    } catch (_error) {
      console.log(_error);
    }
  }

  async getVideoRequestUrl(url: string): Promise<string> {
    await this.scraper.goTo(url);
    await this.wait(5);
    console.log('Waiting for request url');
    const [request] = await Promise.all([
      this.scraper.interceptRequest({
        urlEndsWith: [
          CodelyDownloader.SEARCHED_REQUESTS.simpleStrategy,
          CodelyDownloader.SEARCHED_REQUESTS.mergeStrategy,
        ],
      }),
      this.scraper.iframeClick('iframe[src*=vimeo]', '.vp-video'),
    ]);
    return request.url;
  }

  parseVideoRequestUrl(url: string): string {
    const [videoIds, ...fragments] = url.split('/').slice(0, -1).reverse();
    const hdVideoId = videoIds.split(',')[3];
    const auxUrl = [hdVideoId, ...fragments].reverse().join('/').replace('/sep/', '/parcel/');
    const parsedVideoUrl = `${auxUrl}.mp4`;

    return parsedVideoUrl;
  }

  async getVideoDescription(): Promise<string> {
    const description = await this.scraper.getInnerText(
      '.sc-vglyk.llviSA',
      {
        parseAnchors: true,
        parseImages: true,
      },
    );

    return description;
  }

  createVideoDescriptionFile(filePath: string, videoDescription: string): void {
    if (videoDescription) {
      fs.writeFileSync(filePath, videoDescription);
    }
  }

  private invalidCredentialsError(): Error {
    return new Error('Invalid credentials');
  }

  private wait(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, seconds * 1000);
    });
  }
}
