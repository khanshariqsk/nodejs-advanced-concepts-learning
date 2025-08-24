import { IncomingMessage, ServerResponse } from "http";

export interface ButterRequest extends IncomingMessage {
  body: any;
}

export interface ButterResponse extends ServerResponse {
  status(code: number): this;
  json(body: any): void;
  sendFile(path: string, contentType?: string): Promise<void>;
}

export type RouteHandler = (req: ButterRequest, res: ButterResponse) => void;

export type Middleware = {
  req: IncomingMessage;
  res: ButterResponse;
  next: () => void;
};

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

declare class Butter {
  constructor();
  listen(port: number, cb?: () => void): void;
  route(method: HttpMethod, path: string, cb: RouteHandler): void;
  beforeEach(cb: Middleware): void;
}

export = Butter;
