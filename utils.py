import pandas as pd


def count_countries_and_states(posts, countries, states):
    """
    Iterate Posts in lower case counting the occurencies of countries and states, returning them in a dictionary
    Parameters
    ----------
    posts: list of str
        Text from top 1000 posts from the EarthPorn subreddit.
    countries: list of str
        List of countries in the world
    states: dict
        State code to state name
    Returns
    -------
    dict
        Parsed counts of countries and states
    """

    df = pd.DataFrame(posts)
    df[0] = df[0].str.lower()
    country_count = {
        country: int(df[0].str.contains(country.lower()).sum()) for country in countries
    }
    state_count = {
        state_name: int(df[0].str.contains(f"{state_name.lower()}|\\W{state_code.lower()}\\W").sum())
        for (state_code, state_name) in states.items()
    }
    country_count.update(state_count)
    return country_count
