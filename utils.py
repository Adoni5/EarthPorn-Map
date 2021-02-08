import pandas as pd


def count_countries_and_states(posts, countries, states):
    """
    Iterate Posts in lower case counting the occurencies of countries and states, returning them in a dictionary
    Parameters
    ----------
    posts: list of tuple
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
    df["lower_title"] = df[0].str.lower()
    country_count = {
        country: (
            int(df["lower_title"].str.contains(country.lower()).sum()),
            df[df["lower_title"].str.contains(country.lower())][1].values.tolist(),
            df[df["lower_title"].str.contains(country.lower())][0].values.tolist()
        )
        for country in countries
    }
    state_count = {
        state_name: (
            int(
                df["lower_title"]
                .str.contains(f"{state_name.lower()}|\\W{state_code.lower()}\\W")
                .sum()
            ),
            df[df["lower_title"].str.contains(f"{state_name.lower()}|\\W{state_code.lower()}\\W")][
                1
            ].values.tolist(),
            df[df["lower_title"].str.contains(f"{state_name.lower()}|\\W{state_code.lower()}\\W")][
                0
            ].values.tolist()
        )
        for (state_code, state_name) in states.items()
    }
    country_count.update(state_count)
    return country_count
