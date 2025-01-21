# dodgeball-examples

## Purpose

This repository contains simple example applications to get you started with Dodgeball.

## How to Use

To orchestrate and protect the full user-journey, Dodgeball offers SDKs for both the server and client side.

The `client` folder contains all client-side examples (i.e. code that runs on the customer's device):

- [Web (React)](#web-react)
- [Web (Typescript)](#web-vite-typescript)

The `server` folder contains all server-side examples:

- [node-js](#node-js)
- [node-ts](#node-ts)
- [Python](#python)
- [.NET](#.NET)
- [Golang](#golang)

The `complete` folder contains example applications that have full stack implementations of Dodgeball. These are used to illustrate more specific use cases and scenarios.

- [Finfire](https://github.com/dodgeballhq/dodgeball-examples/tree/main/complete/finfire/README.md)

You should use these examples along with the [official Dodgeball documentation](https://docs.dodgeballhq.com) to experiment with your Dodgeball account. You will need a [free Dodgeball account](https://app.dodgeballhq.com/signup) to run these examples.

Once you have an account, login, visit the **Checkpoint Studio**, then create a new checkpoint called `PAYMENT`. Open the **Step Palette**, then drag and drop an *Allow* step into your checkpoint. Drag an arrow from the *PAYMENT* step to the *Allow* step to connect them. Then click the **Publish** button in the top-right of your screen.

Fantastic, now you're ready to experiment with Dodgeball! Follow the instructions for your preferred server language. While running a Dodgeball SDK on the client-side is optional, using it is highly recommended to gather device intelligence and enable progressive user-friction.

## Server-Side Examples

### node-js

The node-js examples are contained in the `server/node-js` folder. To start the node-js example server, do the following:

1. Paste your `DODGEBALL_PRIVATE_API_KEY` into a new file: `server/node-js/.env`. Your `.env` should look like this:

``` #.env
DODGEBALL_PRIVATE_API_KEY="whatever-your-private-key-is"
DODGEBALL_API_URL="https://api.sandbox.dodgeballhq.com" # (Optional) set this to make calls to a Sandbox environment
```

2. Run the following commands:

``` #bash
cd server/node-js
npm install
npm start
```

This will spin up a simple express HTTP server listening on port 3020.

Now that you've got the server configured and started, try modifying it!

### node-ts

1. Copy the `.env.example` file's contents into a new `.env` file. Enter your configuration details in the `.env` file.

2. Run the following commands:

``` #bash
cd server/node-ts
npm install
npm start
```

This will spin up a simple express HTTP server listening on port 3020.

Now that you've got the server configured and started, try modifying it!

### Python

The Python examples are contained in the `server/python` folder. To start the Python example server, do the following:

1. Paste your `DODGEBALL_PRIVATE_API_KEY` into a new file: `server/python/protected-service/.env`. Your `.env` should look like this:

``` #.env
DODGEBALL_PRIVATE_API_KEY="whatever-your-private-key-is"
DODGEBALL_API_URL="https://api.sandbox.dodgeballhq.com" 
```

2. Make sure you have poetry installed on your local machine.  If not, install it following the instructions at: <https://python-poetry.org/docs/>

3. To initialize the poetry infrastructure, execute once:

``` #bash
cd server/python/protected-service
poetry init
```

4. To execute the python server example, execute (in the same directory):

``` #bash
poetry shell
python protected_service/protected_main.py
```

This will spin up a simple express HTTP server listening on port 3020.

Now that you've got the server configured and started, try modifying it!

### .NET

The .NET examples are contained in the `server/dotnet` folder. To start the .NET example server, do the following:

1. Paste your `DODGEBALL_PRIVATE_API_KEY` into a new file: `server/dotnet/ProtectedService/.env`. Your `.env` should look like this:

``` #.env
DODGEBALL_PRIVATE_API_KEY="whatever-your-private-key-is"
DODGEBALL_API_URL="https://api.sandbox.dodgeballhq.com" 
```

2. Make sure you have the full .NET environment installed on your machine.  We will describe how to proceed from the command line, but you may find it simpler to execute using your favorite IDE.

3. Change directory to ProtectedService and build to validate that all packages are installed

``` #bash
cd ProtectedService
dotnet build
```

4. Now run your server by executing:

``` #bash
  dotnet run
```

Now that you've got the server configured and started, try modifying it!

### GOLANG

The Golang examples are contained in the `server/golang` folder. To start the Golang example server, do the following:

1. Paste your `DODGEBALL_PRIVATE_API_KEY` into a new file: `server/golang/.env`. Your `.env` should look like this:

``` #.env
DODGEBALL_PRIVATE_API_KEY="whatever-your-private-key-is"
DODGEBALL_API_URL="https://api.sandbox.dodgeballhq.com" 

Optionally, you may add a Timout Line, as in:
CHECKPOINT_TIMEOUT=100
```

2. Make sure you have the full Golang environment installed on your machine.  We will describe how to proceed from the command line, but you may find it simpler to execute using your favorite IDE.

3. Change directory to Golang and build to validate that all packages are installed

``` #bash
cd golang
go mod download
```

4. Now run your server by executing:

``` #bash
  go run .
```

Now that you've got the server configured and started, try modifying it!

### PHP

The PHP examples are contained in the `server/php/protected-service` folder. To start the PHP example server, do the following:

1. Copy the `.env.example` file's contents into a new `.env` file. Paste your `DODGEBALL_PRIVATE_API_KEY` into your new `.env` file. Your `.env` should look like this:

``` #.env
DODGEBALL_PRIVATE_API_KEY="whatever-your-private-key-is"
DODGEBALL_API_URL="https://api.sandbox.dodgeballhq.com" # (Optional) set this to make calls to a Sandbox environment

# Lots of other settings...
```

2. Run the following commands:

``` #bash
cd server/php/protected-service
composer update
php artisan serve
```

This will spin up a simple Laravel HTTP server listening on port 3020.

Now that you've got the server configured and started, try modifying it!

## Client-Side Examples

### Web (React)

The Web example is found in `client/web-react` and can be started by following these steps:

1. Paste your `DODGEBALL_PUBLIC_API_KEY` into a new file: `client/web/.env`. Your `.env` should look like this:

``` #.env
REACT_APP_DODGEBALL_PUBLIC_API_KEY="whatever-your-public-key-is"
REACT_APP_DODGEBALL_API_URL="https://api.sandbox.dodgeballhq.com" # (Optional) set this to make calls to a Sandbox environment
```

2. Run these commands:

``` #base
cd client/web-react
npm install
npm start
```

This will start a simple React app that allows you to easily call checkpoints and evaluate their responses. It is configured to send POST requests to a dodgeball-examples server listening to `http://localhost:3020/checkpoint`.

### Web (Typescript)

The Web example is found in `client/web-vite-typescript` and can be started by following these steps:

1. Copy the `.env.example` file's contents into a new `.env` file. Enter your configuration details in the `.env` file.
2. Run these commands:

``` #bash
cd client/web-vite-typescript
npm install
npm start
```

This will start a Vanilla Typescript Vite app that allows you to easily call checkpoints and evaluate their responses. It is configured to send POST requests to a dodgeball-examples server listening to `http://localhost:3020/checkpoint`.
