# dodgeball-examples-python

## Purpose
This project contains a simple Python Web Service demonstrating how to use the Dodgeball SDK for Python

## How to Use
To run this example:

1. Make sure you have poetry installed on your local machine.  If not, install it following the instructions at: https://python-poetry.org/docs/

2. Execute: poetry init

3. Paste your `PRIVATE_API_KEY` into a new file: `server/python/protected-service/.env`. Your `.env` should look like this:

```
PRIVATE_API_KEY="whatever-your-private-key-is"
BASE_URL="https://api.sandbox.dodgeballhq.com" # (Optional) set this to make calls to a Sandbox environment
```

4. Execute

>> poetry shell

In order to launch the Poetry Virtual Environment

5. Execute

>> python protected_service/protected_main.py