declare namespace Deno {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}
