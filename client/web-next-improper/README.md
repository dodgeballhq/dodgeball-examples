# Next.js Improper Example of SSR error with Dodgeball

This example demonstrates an incorrect way to use the Dodgeball Client SDK with Next.js.

## Running the example

1. Go to this directory: `cd ./client/web-next-improper`
1. Add a `.env` file based on `.env.example`.
1. Run `npm install` to install the dependencies.
1. Run `npm run dev` to start the development server. If you want to use a specific port, you can run `npm run dev -- --port <port>`.
1. Visit `http://localhost:<port>` in your browser, you will see an error in the same terminal where you ran `npm run dev` - it will say something like: `unhandledRejection: ReferenceError: document is not defined`

## Why does this happen?

The Dodgeball Client SDK must access end-user browser information to gather signals that relate to fraud risk. This information is only available on the client side, so the SDK must be initialized on the client side.

When the SDK is initialized on the server side, it throws an error because the server does not have access to the end-user browser information.

Depending on your setup, Next.js may consider various components as [server side rendered (SSR)](https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering) or [client side rendered (CSR)](https://nextjs.org/docs/pages/building-your-application/rendering/client-side-rendering). In this example, the `page.tsx` is SSR.

## How to fix it?

See the `./client/web-next-improper-fixed` directory for an example of how to correct this specific error by using context providers, as referenced in the [Next.js documentation](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#using-context-providers).
