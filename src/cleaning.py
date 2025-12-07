import pandas as pd
import numpy as np
import re

def get_clean_data(save_file=False, expand=False, mini=False):
    """
    Calls the relevant cleaning helper functions and returns the DataFrame to be
    used for analysis
    """
    df = pd.read_csv("../data/tcpd_qh.tsv", sep="\t")
    df = delete_inconsistent_rows(df)
    df = standardize_state_names(df)
    df = standardize_constituency_names(df)
    df = split_date(df)
    df = trim_incomplete_years(df)

    # Create the mini dataset, used to count the frequency of topics mentioned
    # in the dataset. This is done before expanding the dataset, which would
    # duplicate the questions for each MP who asked them, inflating the
    # frequencies.
    if mini:
        mini = df[["year", "month", "subject"]]
        mini["subject"] = mini["subject"].str.lower()
        mini.to_csv("../www/mini.csv")
        return mini

    if save_file:
        df.to_csv("../data/questions.csv")
    
     # Make the dataset one row per question-MP
    if expand:
        df = expand_data(df)
        df = df.to_csv("../data/questions_expanded.csv")
    
    return df

####### Helper functions (sorted alphabetically) #######
def create_primary_cols(df):
    """
    (Deprecated: Each row is now copied N times, one per MP, if N MPs asked the
    same question)

    Each question can be asked by multiple MPs (from different states and parties).
    For now, the 'primary_<col>' column contains the first state/party appearing.
    This is a temporary measure before a more accurate approach is reached.
    """
    df["primary_state"] = df["state"].str.split(",").str[0]
    df["primary_party"] = df["party"].str.split(",").str[0]
    return df

def delete_inconsistent_rows(df):
    """
    In the .tsv file, some rows have misaligned columns and missing data.
    Where possible, these have been corrected manually to align with the
    rest of the data. If not, they have been removed.
    """

    return df.dropna()

def expand_data(df):
    """
    In the original data, each row is a question. The columns "state",
    "constituency", "constituency_type", "gender", "member", "party" can have
    multiple comma separated values if multiple MPs asked the same question.

    To ensure that each MP/state's contribution is recorded separately, we 
    transform the data to ensure that each row is unique per question and MP.
    """

    cols = ["state", "constituency", "constituency_type", "gender", "member", "party"]
    for col in cols:
        df[col] = df[col].str.split(",")

    # Source: https://sparkbyexamples.com/pandas/pandas-explode-multiple-columns
    df = df.explode(cols).reset_index(drop=True)

    print(df.head())

    for col in cols:
        df[col] = df[col].str.strip()

    return df


def split_date(df):
    """
    Splits the date column into day, month and year
    """
    df['date'] = pd.to_datetime(df['date'])
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df['day'] = df['date'].dt.day
    return df

def standardize_constituency_names(df):
    """
    Eventually, we split the comma separated constituency column to have one
    per row. Some constituencies have commas in the name, which are removed.
    """
    
    # Coochbehar constituency, stored as "Coochbehar(sc), District, Coochbehar"
    pattern = r"Coochbehar\(sc\),\s*District,\s*Coochbehar"
    df["constituency"] = df["constituency"].astype(str).apply(
        lambda s: re.sub(pattern, "Coochbehar", s)
    )

    # Two others found during manual testing
    df["constituency"] = df["constituency"].replace(
        "Lakhimpur, District, Lakhimpur", "Lakhimpur"
    )

    df["constituency"] = df["constituency"].replace(
        "Shahdol(st), District, Anooppur", "Shahdol"
    )

    return df

def standardize_state_names(df):
    """
    Some states changed their official names and others have spelling errors.
    This updates the state name to the most recent name.
    """

    df["state"] = df["state"].replace("Orissa", "Odisha")
    df["state"] = df["state"].replace("Chhatisgarh", "Chhattisgarh")
    return df

def trim_incomplete_years(df):
    """
    The years 1999 and 2019 do not have complete data, so we exclude them
    from the analysis
    """
    return df[(df["year"] > 1999) & (df["year"] < 2019)]

