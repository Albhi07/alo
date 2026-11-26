// Just enough of Deno's globals to type-check the Edge Functions with the app's TypeScript.
declare const Deno: {
  env: { get(name: string): string | undefined }
  serve(handler: (req: Request) => Response | Promise<Response>): void
}
