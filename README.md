# dodgeball-examples

## Purpose
This repository contains simple example applications to get you started with Dodgeball.

## How to Use
To orchestrate and protect the full user-journey, Dodgeball offers SDKs for both the server and client side.

The `client` folder contains all client-side examples (i.e. code that runs on the customer's device):
- [Web (Javascript)](#web-javascript)

The `server` folder contains all server-side examples:
- [NodeJS](#nodejs)
- [ASP.NET](#asp-net-example)

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

### ASP.NET

The ASP.NET examples are contained in the `server/dotnet` folder. To start the ASP.NET example server, do the following:

1. Paste your `DODGEBALL_PRIVATE_API_KEY` into `server/dotnet/ProtectedService/.env`. Your private API key can be found in the Dodgeball Trust Console in the Developer Center under the API Keys tab.

2. Run the following commands:

```
cd server/dotnet/ProtectedService
dotnet watch
```

This will spin up a simple ASP.NET example HTTP server listening on port `3020`.

Now that you've got the server configured and started, try modifying it!

Take a look at the `ProtectedService/ClientTransactionController.cs` file for an example of how to call a checkpoint called `PAYMENT` in Dodgeball. You'll see how to send data to a checkpoint and how to use the SDK to handle the response. Play around with modifying your `PAYMENT` checkpoint in the Dodgeball Trust Console to see how you can orchestrate your application's trust and safety logic.

## Client-Side Examples

### Web (JavaScript)

The Web example is found in `client/web` and can be started by following these steps:

1. Paste your `DODGEBALL_PUBLIC_API_KEY` into a new file: `client/web/.env`. Your `.env` should look like this:

```
REACT_APP_DODGEBALL_PUBLIC_API_KEY="whatever-your-public-key-is"
REACT_APP_DODGEBALL_API_URL="https://api.sandbox.dodgeballhq.com" # (Optional) set this to make calls to a Sandbox environment
```

2. Run these commands:

Install dependencies:
```
npm install
```

Start the server:
```
npm start
```

This will start a simple React app that allows you to easily call checkpoints and evaluate their responses. It is configured to send POST requests to a dodgeball-examples server listening to `http://localhost:3020/checkpoint`.
