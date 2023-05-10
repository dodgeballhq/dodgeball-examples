# dodgeball-examples-python

## Purpose
This project contains a simple Python Web Service demonstrating how to use the Dodgeball SDK for Python

## How to Use
To run this example:

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

4. To execute the python server example, execute, in server/python/protected-service:

```
poetry shell
python protected_service/protected_main.py
```
