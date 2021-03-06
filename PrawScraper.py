import os
import logging.config
import csv
import json

import praw
import yaml
from dotenv import load_dotenv


# configure logging
from tqdm import tqdm

from utils import count_countries_and_states

with open("confs/logging.yaml", "r") as fh:
    config_dict = yaml.load(fh, Loader=yaml.FullLoader)

# load env variables
load_dotenv()

logging.config.dictConfig(config_dict)
logger = logging.getLogger("EarthPorn")
logger.info("Script is starting...")
logger.info("Connecting to Mongo DB")

logger.info("Reading in the states and countries file...")
with open("files/country.txt", "r") as fh, open(
    "files/statesArray.csv", "r"
) as states_fh:
    countries = [line.strip() for line in fh.readlines()]
    state_dict = {
        state_code: state_name for state_name, state_code in csv.reader(states_fh)
    }
    logger.info("Connecting to reddit....")
    reddit = praw.Reddit(
        client_id="iurvMW51bb1xVA",
        client_secret=os.getenv("CLIENT_SECRET"),
        user_agent="script: Scrape reddit titles",
        username="Adoni523",
        password=os.getenv("REDDIT_PASSWORD"),
    )

    subreddit = reddit.subreddit("earthporn")
    posts = [
        (
            submission.title,
            submission.preview["images"][0]["source"]["url"],
            submission.preview["images"][0]["resolutions"],
        )
        for submission in tqdm(
            subreddit.top(limit=1000), desc="Processing posts", total=1000
        )
    ]
    counts = count_countries_and_states(posts, countries, state_dict)
    with open("files/country_data_counts.json", "w") as fh:
        json.dump(counts, fh)
    logger.info("finished")
