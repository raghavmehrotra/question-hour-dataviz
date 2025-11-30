from os import replace
import pandas as pd
import numpy as np

def get_clean_data(save_file=True, mini=False):
    """
    Calls the relevant cleaning helper functions and returns the DataFrame to be
    used for analysis
    """
    df = pd.read_csv("../data/tcpd_qh.tsv", sep="\t")
    df = delete_inconsistent_rows(df)
    df = standardize_state_names(df)
    df = create_primary_cols(df)
    df = split_date(df)
    df = trim_incomplete_years(df)

    # To load less data into the browser. Always update the mini file
    if mini:
        mini = df[["year", "month", "subject"]]
        mini["subject"] = mini["subject"].str.lower()
        mini.to_csv("../www/mini.csv")
        return mini
    
    if save_file:
        df.to_csv("../questions.csv")

    return df

def delete_inconsistent_rows(df):
    """
    In the .tsv file, some rows have misaligned columns and missing data.
    Where possible, these have been corrected to align with the rest of the data.
    If not, they have been removed.
    """

    # TODO: Correct the data where possible. For now, removing all na.
    return df.dropna()

def split_date(df):
    """
    Splits the date column into day, month and year
    """
    df['date'] = pd.to_datetime(df['date'])
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df['day'] = df['date'].dt.day
    return df

def trim_incomplete_years(df):
    """
    The years 1999 and 2019 do not have complete data, so we exclude them
    from the analysis
    """
    return df[(df["year"] > 1999) & (df["year"] < 2019)]

def create_primary_cols(df):
    """
    Each question can be asked by multiple MPs (from different states and parties).
    For now, the 'primary_<col>' column contains the first state/party appearing.
    This is a temporary measure before a more accurate approach is reached.
    """
    df["primary_state"] = df["state"].str.split(",").str[0]
    df["primary_party"] = df["party"].str.split(",").str[0]
    return df

def standardize_state_names(df):
    df["state"] = df["state"].replace("Orissa", "Odisha")
    return df