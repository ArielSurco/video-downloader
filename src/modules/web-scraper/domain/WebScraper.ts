import { InnerTextConfig } from './InnerTextConfig';
import { InterceptedRequest } from './InterceptedRequest';
import { RequestInterceptionConfig } from './RequestInterceptionConfig';

export interface WebScraper {
  goTo(url: string): Promise<void>;
  typeInInput(selector: string, text: string): Promise<void>;
  click(selector: string, waitForRedirect?: boolean): Promise<void>;
  mouseClick(x: number, y: number, waitForRedirect?: boolean): Promise<void>;
  iframeClick(iframeSelector: string, elementSelector: string): Promise<void>;
  currentUrl(): string;
  fetch(url: string, config: RequestInit): Promise<Response>;
  interceptRequest(interceptionConfig: RequestInterceptionConfig): Promise<InterceptedRequest>;
  waitForSelector(selector: string): Promise<void>;
  getInnerText(selector: string, config: InnerTextConfig): Promise<string>;
}
