export {};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AMap: any;
    _AMapSecurityConfig: {
      securityJsCode: string;
    };
  }
}