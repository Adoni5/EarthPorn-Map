import praw
import re
import pymongo
import pprint
from pymongo import MongoClient
print("The beginning")
client = MongoClient()
db = client.earthpornDb
collection = db.topPosts

c = open("country.txt", "r")
s = open("states.txt", "r")

reddit = praw.Reddit(client_id="iurvMW51bb1xVA",
client_secret = "",
user_agent = "script: Scrape reddit titles",
username = "Adoni523",
password = "")

states = []
countries = []
tobeinserted ={}
finalList =[]

for lines in c:
    countries.append(lines)

for lines in s:
    states.append(lines)

print(len(countries))
print(len(states))

print(reddit.read_only)
print(reddit.user.me())
subreddit = reddit.subreddit('earthporn')
posts = []

for submission in subreddit.top(limit=1000):
    posts.append(submission.title)
    pprint.pprint(submission)
print("Got posts")
# for submission in subreddit.top(limit=1000):
#     posts.append(submission.title)

for i in posts:
    dict ={"post" : i}
    finalList.append(dict)

collection.insert_many(finalList)
print(len(finalList))


print("finished")