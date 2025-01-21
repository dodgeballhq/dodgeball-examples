# Dodgeball Finfire Example

This example is a full stack implementation of Dodgeball. It is meant as a reference for an example Dodgeball implementation in a Fintech banking application.

This example is built with Next.js, TypeScript, TailwindCSS, and Dodgeball.

## Dodgeball Setup

To run this example, you will need to set up a Dodgeball account and get the API keys. You can do this by following the instructions in the [Dodgeball documentation](https://docs.dodgeballhq.com/docs/getting-started/setup).

## Dodgeball API Keys

You will need to set up a `.env` file in the root of the project based on the `.env.example` file.

## Installation

```bash
yarn install
```

## Configuring Prisma with SQLite as a Database

```bash
yarn run prisma:generate
yarn run prisma:migrate
```

## Running the Example

```bash
yarn dev
```

Or if you want to use a specific port (e.g. 3015):

```bash
yarn dev --port 3015
```
