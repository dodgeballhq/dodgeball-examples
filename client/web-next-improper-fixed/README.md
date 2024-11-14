# Next.js Example of how to fix SSR error with Dodgeball

This example demonstrates how to fix the error discussed in `./client/web-next-improper`

## Running the example

1. Go to this directory: `cd ./client/web-next-improper-fixed`
1. Add a `.env` file based on `.env.example`.
1. Run `npm install` to install the dependencies.
1. Run `npm run dev` to start the development server. If you want to use a specific port, you can run `npm run dev -- --port <port>`.
1. Visit `http://localhost:<port>` in your browser, you will see an error in the same terminal where you ran `npm run dev` - it will show simple information about the Dodgeball Client side initialization, and let you get a source token on demand.

## What does this approach do differently?

1. Adds a React Context, that we called `./src/app/contexts/DodgeballProvider` in this example - this context manages Dodgeball in way that does not conflict with Next.js
1. Wraps the server component (in our example we put it all the way up at `.src/app/layout.tsx`) in the Dodgeball Provider, setting parameters like the public api key and api url at this level
1. Makes sure that any component using Dodgeball's client side SDK gets the instance via `useDodgeballContext` on a client side component marked up with the `"use client"` directive. In our example this is `./src/app/components/clientComponentExample.tsx`
1. Inside `ClientComponentExample` we also show how to interact with dodgeball by getting a source token on demand, or just using the context.
1. We also show how using the `useDodgeballContext` hook in the `ClientComponentExample` allows you to have a common dodgeball instance across multiple distinct client components (in our example we have two `ClientComponentExample` components, but if you watch the page load, you can see that they are using the same dodgeball instance).

For more information on how to use this Context approach with Next.js, see the [Next.js Documentation on Context Providers](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#using-context-providers).
