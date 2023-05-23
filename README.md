# dodgeball-examples

## Purpose
This repository contains simple example applications to get you started with Dodgeball.

## How to Use
To orchestrate and protect the full user-journey, Dodgeball offers SDKs for both the server and client side.

The `client` folder contains all client-side examples (i.e. code that runs on the customer's device):
- [Web (Javascript)](#web-javascript)

The `server` folder contains all server-side examples:
- [NodeJS](#nodejs)
- [Python](#python)
- [.NET](#dotnet)

You should use these examples along with the [official Dodgeball documentation](https://docs.dodgeballhq.com) to experiment with your Dodgeball account. You will need a [free Dodgeball account](https://app.dodgeballhq.com/signup) to run these examples. 

Once you have an account, login, visit the **Checkpoint Studio**, then create a new checkpoint called `PAYMENT`. Open the **Step Palette**, then drag and drop an *Allow* step into your checkpoint. Drag an arrow from the *PAYMENT* step to the *Allow* step to connect them. Then click the **Publish** button in the top-right of your screen.

Fantastic, now you're ready to experiment with Dodgeball! Follow the instructions for your preferred server language. While running a Dodgeball SDK on the client-side is optional, using it is highly recommended to gather device intelligence and enable progressive user-friction.

## Server-Side Examples

### NodeJS

The NodeJS examples are contained in the `server/nodejs` folder. To start the NodeJS example server, do the following:

1. Paste your `DODGEBALL_PRIVATE_API_KEY` into a new file: `server/nodejs/.env`. Your `.env` should look like this:

```
DODGEBALL_PRIVATE_API_KEY="whatever-your-private-key-is"
DODGEBALL_API_URL="https://api.sandbox.dodgeballhq.com" # (Optional) set this to make calls to a Sandbox environment
```

2. Run the following commands:

```
cd server/nodejs
npm install
npm start
```

This will spin up a simple express HTTP server listening on port 3020.

Now that you've got the server configured and started, try modifying it!

### Python

The Python examples are contained in the `server/python` folder. To start the Python example server, do the following:

1. Paste your `DODGEBALL_PRIVATE_API_KEY` into a new file: `server/python/protected-service/.env`. Your `.env` should look like this:

```
DODGEBALL_PRIVATE_API_KEY="whatever-your-private-key-is"
DODGEBALL_API_URL="https://api.sandbox.dodgeballhq.com" 
```

2.  Make sure you have poetry installed on your local machine.  If not, install it following the instructions at: https://python-poetry.org/docs/


3. To initialize the poetry infrastructure, execute once:
```
cd server/python/protected-service
poetry init
```

4. To execute the python server example, execute (in the same directory):

```
poetry shell
python protected_service/protected_main.py
```

This will spin up a simple express HTTP server listening on port 3020.

Now that you've got the server configured and started, try modifying it!

### .NET

The .NET examples are contained in the `server/dotnet` folder. To start the .NET example server, do the following:

1. Paste your `DODGEBALL_PRIVATE_API_KEY` into a new file: `server/dotnet/ProtectedService/.env`. Your `.env` should look like this:

```
DODGEBALL_PRIVATE_API_KEY="whatever-your-private-key-is"
DODGEBALL_API_URL="https://api.sandbox.dodgeballhq.com" 
```

2. Make sure you have the full .NET environment installed on your machine.  We will describe how to proceed from the command line, but you may find it simpler to execute using your favorite IDE.

3. Change directory to ProtectedService and build to validate that all packages are installed

```
cd ProtectedService
dotnet build
```

4. Now run your server by executing:
```
  dotnet run
```

Now that you've got the server configured and started, try modifying it!



## Client-Side Examples

### Web (JavaScript)

The Web example is found in `client/web` and can be started by following these steps:

1. Paste your `DODGEBALL_PUBLIC_API_KEY` into a new file: `client/web/.env`. Your `.env` should look like this:

```
REACT_APP_DODGEBALL_PUBLIC_API_KEY="whatever-your-public-key-is"
REACT_APP_DODGEBALL_API_URL="https://api.sandbox.dodgeballhq.com" # (Optional) set this to make calls to a Sandbox environment
```

2. Run these commands:

```
cd client/web
npm install
npm start
```

This will start a simple React app that allows you to easily call checkpoints and evaluate their responses. It is configured to send POST requests to a dodgeball-examples server listening to `http://localhost:3020/checkpoint`.
