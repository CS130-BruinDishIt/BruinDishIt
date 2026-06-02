# Scraper for UCLA Dining

## Getting started

OPEN DUAL TERMINALS
In the first one, navigate to ../frontend  
In the second one, navigate to ../server 

In the ../server folder:
```
python -m venv .venv  # create python virtual env
source .venv/bin/activate   # activate virtual env
```

In the ../server/scraper folder:
```
pip install -r requirements.txt  # install packages
python scrape.py
```

Then return to ../server folder:
```
node app.js
```