# Next.js Example of how to use Dodgeball Client SDK

This example demonstrates how to use Dodgeball's client side SDK in a Next.js application.

## Running the example

1. Go to this directory: `cd ./client/web-next`
1. Add a `.env` file based on `.env.example`.
1. Run `npm install` to install the dependencies.
1. Run `npm run dev` to start the development server. If you want to use a specific port, you can run `npm run dev -- --port <port>`.
1. Visit `http://localhost:<port>` in your browser, you will see an error in the same terminal where you ran `npm run dev` - it will show simple information about the Dodgeball Client side initialization, and let you get a source token on demand.

## What is special about Next JS and Dodgeball?

The Dodgeball Client SDK must access end-user browser information to gather signals that relate to fraud risk. This information is only available on the client side, so the SDK must be initialized on the client side.

When the SDK is initialized on the server side, it throws an error because the server does not have access to the end-user browser information.

Since Next.js has a hybrid server and client side rendering model, you can initialize the SDK on the client side, but you need to make sure that you do it in a way that does not conflict with Next.js.

This example demonstrates how to do this by using a React Context to manage the Dodgeball instance.

For more information on how to use this Context approach with Next.js, see the [Next.js Documentation on Context Providers](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#using-context-providers).
