export class HttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  async getJson<T>(path: string, headers: Record<string, string> = {}): Promise<HttpClientResponse<T>> {
    const response: Response = await fetch(`${this.baseUrl}${path}`, { headers });
    const body: unknown = await response.json();
    return {
      status: response.status,
      body: body as T,
    };
  }
}

export interface HttpClientResponse<T> {
  status: number;
  body: T;
}
