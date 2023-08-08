/* eslint-disable no-param-reassign */
import puppeteer, { Browser, HTTPRequest, Page } from 'puppeteer';
import { WebScraper } from '../domain/WebScraper';
import { InterceptedRequest } from '../domain/InterceptedRequest';
import { RequestInterceptionConfig } from '../domain/RequestInterceptionConfig';
import { InnerTextConfig } from '../domain/InnerTextConfig';

export class Puppeteer implements WebScraper {
  private browser?: Browser;

  private page?: Page;

  async init() {
    this.browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
      headless: true,
      args: [
        '--no-sandbox',
        '--disabled-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });
    this.page = await this.browser.newPage();
  }

  async goTo(url: string): Promise<void> {
    if (!this.page) {
      throw this.noInitializedPageError();
    }

    await this.page.goto(url);
  }

  async typeInInput(selector: string, text: string): Promise<void> {
    if (!this.page) {
      throw this.noInitializedPageError();
    }

    await this.page.waitForSelector(selector, {
      timeout: 10000,
    });
    await this.page.$eval(
      selector,
      (el, value) => {
        el.setAttribute('value', value);
      },
      text,
    );
  }

  async click(selector: string, waitForRedirect: boolean): Promise<void> {
    if (!this.page) {
      throw this.noInitializedPageError();
    }

    await this.page.waitForSelector(selector, {
      timeout: 10000,
    });

    if (waitForRedirect) {
      await Promise.all([
        this.page.waitForNavigation({ timeout: 10000 }),
        this.page.click(selector),
      ]);
      return;
    }

    await this.page.click(selector);
  }

  async mouseClick(x: number, y: number, waitForRedirect?: boolean): Promise<void> {
    if (!this.page) {
      throw this.noInitializedPageError();
    }

    if (waitForRedirect) {
      await Promise.all([
        this.page.waitForNavigation({ timeout: 10000 }),
        this.page.mouse.click(x, y),
      ]);
      return;
    }

    await this.page.mouse.click(x, y);
  }

  async iframeClick(iframeSelector: string, elementSelector: string): Promise<void> {
    if (!this.page) {
      throw this.noInitializedPageError();
    }

    await this.page.waitForSelector(iframeSelector);
    const iframeElement = await this.page.$(iframeSelector);
    const frame = await iframeElement?.contentFrame();
    await frame?.waitForSelector(elementSelector);
    await frame?.click(elementSelector);
  }

  async fetch(url: string, config: RequestInit): Promise<Response> {
    if (!this.page) {
      throw this.noInitializedPageError();
    }

    const response = await this.page.evaluate(
      (urlToFetch, configToFetch) => new Promise<Response>((resolve, reject) => {
        fetch(urlToFetch, configToFetch)
          .then((res) => resolve(res))
          .catch((error) => reject(error));
      }),
      url,
      config,
    );

    return response;
  }

  async interceptRequest(
    interceptionConfig: RequestInterceptionConfig,
  ): Promise<InterceptedRequest> {
    if (!this.page) {
      throw this.noInitializedPageError();
    }

    const request = await this.page.waitForRequest(
      (req: HTTPRequest) => this.matchRequest(req, interceptionConfig),
    );

    return {
      url: request.url(),
    };
  }

  async waitForSelector(selector: string): Promise<void> {
    if (!this.page) {
      throw this.noInitializedPageError();
    }

    await this.page.waitForSelector(selector);
  }

  matchRequest(
    request: HTTPRequest,
    interceptionConfig: RequestInterceptionConfig,
  ): boolean {
    const url = request.url();

    if (Array.isArray(interceptionConfig.urlEndsWith)) {
      return interceptionConfig.urlEndsWith.some((urlEndsWith) => url.endsWith(urlEndsWith));
    }

    return url.endsWith(interceptionConfig.urlEndsWith);
  }

  async getInnerText(selector: string, config: InnerTextConfig): Promise<string> {
    if (!this.page) {
      throw this.noInitializedPageError();
    }

    await this.page.waitForSelector(selector);

    if (config.parseAnchors) {
      await this.page.$$eval(`${selector} a`, (elements) => {
        elements.forEach((element) => {
          const href = element.getAttribute('href') ?? '';
          element.innerHTML += ` (${href})`;
        });
      });
    }

    if (config.parseImages) {
      await this.page.$$eval(`${selector} img`, (elements) => {
        elements.forEach((element) => {
          const src = element.getAttribute('src') ?? '';
          element.innerHTML = src;
        });
      });
    }

    const innerText = await this.page.$$eval(selector, (elements) => {
      const elementsText = elements.map((element) => element.textContent);
      return elementsText.join('\n');
    });

    return innerText;
  }

  currentUrl(): string {
    if (!this.page) {
      throw this.noInitializedPageError();
    }

    return this.page.url();
  }

  noInitializedPageError(): Error {
    return new Error('Page not initialized');
  }
}
