import type {} from "../backend";

declare module "../backend" {
  interface backendInterface {
    _initializeAccessControlWithSecret(adminToken: string): Promise<void>;
  }
  interface Backend {
    _initializeAccessControlWithSecret(adminToken: string): Promise<void>;
  }
}
