export class Cookie {
  name: string;

  value: string;

  domain: string;

  expires?: number;

  constructor(stringCookie: string, domain: string) {
    const [nameAndValue, ...rest] = stringCookie.split(';');
    const [name, value] = nameAndValue.split('=');
    const expiresValue = rest.find((field) => field.includes('Max-Age'))?.split('=')[1];

    this.name = name;
    this.value = value;
    this.domain = domain;
    this.expires = Number(expiresValue);
  }
}
