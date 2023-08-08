import { DownloadVideo } from './modules/file-downloader/application/downloadVideo';
import { CodelyDownloader } from './modules/codely/infrastructure/CodelyDownloader';
import { Puppeteer } from './modules/web-scraper/infrastructure/Puppeteer';
import { YoutubeDL } from './modules/file-downloader/infrastructure/YoutubeDL';

const courseTitle = 'Arquitectura Hexagonal en Frontend';

const classNumber = 2;
const classTitle = 'Hay lógica de negocio en el front';
const classUrl = 'https://pro.codely.com/library/arquitectura-hexagonal-en-frontend-197663/483637/path/step/241257995/';

(async () => {
  /* Use case configuration */
  const fileDownloader = new YoutubeDL();
  const scraper = new Puppeteer();
  await scraper.init();
  const videoDownloader = new CodelyDownloader(fileDownloader, scraper);

  const useCase = new DownloadVideo(videoDownloader);

  const config = {
    destinationFolder: `downloads/${courseTitle}`,
    credentials: {
      emailOrUsername: '',
      password: '',
    },
    sourceLink: classUrl,
    title: `${classNumber} - ${classTitle}`,
  };

  useCase.run(config);
})();
