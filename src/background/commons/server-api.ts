import { ApiError } from './types/errors';
import { appVersion } from '@/src/misc/chrome';

export class ServerApi {
  constructor(private readonly baseUrl: string, private token?: string) {}

  public setToken(token: string) {
    this.token = token;
  }

  public async post<T>(path: string, body: T, headers: any = {}) {
    const isFormData = body instanceof FormData;
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        ...(isFormData
          ? {}
          : {
              'Content-Type': 'application/json',
            }),
        ...this.getCommonHeaders(),
        ...headers,
      },
      body: (isFormData && body) || JSON.stringify(body),
    });

    if (response.status == 401) {
      throw new ApiError('Unauthenticated request', 401);
    }

    if (!response.ok) {
      throw new ApiError(response.statusText, response.status);
    }

    return response.json();
  }

  public async get<T>(path: string, query: T, headers: any = {}) {
    const queryParams = new URLSearchParams(query as unknown as any).toString();
    const response = await fetch(
      `${this.baseUrl}${path}${(query && queryParams.length > 0 && '?' + queryParams) || ''}`,
      {
        method: 'GET',
        headers: { ...this.getCommonHeaders(), ...headers },
      },
    );

    if (response.status == 401) {
      throw new ApiError('Unauthenticated request', 401);
    }

    if (!response.ok) {
      throw new ApiError(response.statusText, response.status);
    }

    return response.json();
  }

  private getAuthToken() {
    return `Bearer ${this.token}`;
  }

  private getCommonHeaders() {
    return {};
  }

  public postWithAuth<T>(path: string, body: T, headers: any = {}) {
    return this.post(path, body, {
      authorization: this.getAuthToken(),
      ...this.getCommonHeaders(),
      ...headers,
    });
  }

  public getWithAuth<T>(path: string, query: T, headers: any = {}) {
    return this.get(path, query, {
      authorization: this.getAuthToken(),
      ...this.getCommonHeaders(),
      ...headers,
    });
  }
}
