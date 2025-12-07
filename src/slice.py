# Generate slices of the data for various front end charts
import pandas as pd

def get_state_counts(save_file=False):
    df = pd.read_csv("../data/questions_expanded.csv")

    # If multiple MPs are from the same state, their questions should not count
    # twice.
    df = df.drop_duplicates(subset=["state", "id"]).reset_index(drop=True)
    state_counts = df.groupby(["year", "state"]).size().reset_index(name="count")

    if save_file:
        state_counts.to_csv("../data/state_counts.csv")