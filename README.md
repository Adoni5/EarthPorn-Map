# Parser for the top 1000 earthporn posts.

## Setup
```bash
git clone https://github.com/Adoni5/EarthPorn-Map
```

```bash
cd EarthPorn-Map
python -m venv earthporn
pip install -r requirements.txt
```

Register for reddit keys [here](https://www.reddit.com/wiki/api)


Create a .env file in the EarthPorn-Map directory. Add your reddit secret key and password - 
```bash
REDDIT_PASSWORD="<Reddit-Passowrd>"
CLIENT_SECRET=="Reddit-client-secret"
```

## Running
```bash
python PrawScraper.py
```
The output will be output to EartPorn-Map/files/country_data_counts.json

## Visualisation 

An observable notebook that can be forked to use the data can be found [here](https://observablehq.com/@adoni5).