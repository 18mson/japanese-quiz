declare const Deno: {
  test: any;
  env: {
    get(key: string): string | undefined;
  };
  [key: string]: any;
};

declare module "https://*" {
  const value: any;
  export default value;
  export const assertEquals: any;
  export const createClient: any;
  export const serve: any;
  export const corsHeaders: any;
}

declare module "jsr:*" {
  const value: any;
  export default value;
  export const assertEquals: any;
}
