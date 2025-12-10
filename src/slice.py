# Generate slices of the data for various front end charts

import pandas as pd
import numpy as np

def get_state_counts(save_file=False):
    df = pd.read_csv("../data/questions_expanded.csv")

    # If multiple MPs are from the same state, their questions should not count
    # twice.
    df = df.drop_duplicates(subset=["state", "id"]).reset_index(drop=True)
    state_counts = df.groupby(["year", "state"]).size().reset_index(name="count")

    # Source: https://geographyhost.com/lok-sabha-seats-state-wise/
    seats = {
        # States
        "Andhra Pradesh (pre)": 42,  # undivided AP before Telangana split
        "Andhra Pradesh": 25,
        "Arunachal Pradesh": 2,
        "Assam": 14,
        "Bihar": 40,
        "Chhattisgarh": 11,
        "Goa": 2,
        "Gujarat": 26,
        "Haryana": 10,
        "Himachal Pradesh": 4,
        "Jammu & Kashmir": 5,
        "Jharkhand": 14,
        "Karnataka": 28,
        "Kerala": 20,
        "Madhya Pradesh": 29,
        "Maharashtra": 48,
        "Manipur": 2,
        "Meghalaya": 2,
        "Mizoram": 1,
        "Nagaland": 1,
        "Odisha": 21,
        "Punjab": 13,
        "Rajasthan": 25,
        "Sikkim": 1,
        "Tamil Nadu": 39,
        "Telangana": 17,
        "Tripura": 2,
        "Uttar Pradesh": 80,
        "Uttarakhand": 5,
        "West Bengal": 42,

        # Union Territories (UTs)
        "Andaman & Nicobar Islands": 1,
        "Chandigarh": 1,
        "Dadra Nagar & Haveli": 1,
        "Daman & Diu": 1,
        "Delhi": 7,
        "Lakshadweep": 1,
        "Puducherry": 1,
    }

    state_counts["count_per_mp"] = state_counts["count"] / state_counts["state"].str.strip().map(seats)

    # Until 2014, use the undivided Andhra Pradesh numbers. After that, use the split numbers for
    # Telangana and Andhra Pradesh
    state_counts["count_per_mp"] = state_counts["count"] / np.where(
        state_counts["state"].str.strip().eq("Andhra Pradesh") & (state_counts["year"] <= 2014),
        state_counts["state"].str.strip().map({"Andhra Pradesh": seats["Andhra Pradesh (pre)"]}),
        state_counts["state"].str.strip().map(seats)
    )

    state_counts["count_per_mp_rounded"] = state_counts["count_per_mp"].fillna(0).round().astype(int)

    if save_file:
        state_counts.to_csv("../data/state_counts.csv")


def get_topic_counts():
    """
    The HTML displays a prepopulated bar graph with the frequencies of topics
    mentioned in the subjects of each question. This code calculates those
    frequencies.
    """
    df = pd.read_csv("../www/mini.csv")

    term_counts = {
        "health": 0,
        "legal": 0,
        "border": 0,
        "nuclear": 0,
        "climate": 0
    }

    for term in term_counts:
        term_counts[term] = df["subject"].str.contains(term, case=False).sum()