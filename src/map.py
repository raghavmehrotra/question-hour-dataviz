"""
Andhra Pradesh splits into Andhra Pradesh and Telangana in 2014, so the maps
need to be dynamically updated. This function merges GeoJSON files from multiple
years and corrects state borders where needed. The working GeoJSON is from 2020
when the union territories of Daman and Diu and Dadra and Nagar Haveli were
merged into one. Since the data only goes until 2018, these need to be split as
per their original configuration.
"""

import geopandas as gpd
import numpy as np

def merge_geojson_files():
    working = gpd.read_file("../data/india_states_post_2014.geojson")
    old = gpd.read_file("../data/india_states_pre_2014.geojson")

    # Make copies to split the states into two
    working.loc[len(working)] = working.iloc[7].copy()
    working.loc[len(working)-1, "st_nm"] = "Andhra Pradesh (pre)"

    working.loc[len(working)] = working.iloc[13].copy()
    working.loc[len(working)-1, "st_nm"] = "Daman & Diu"
    working.loc[len(working)-1, "id"] = "Daman & Diu"
    working.loc[13, "st_nm"] = "Dadra Nagar & Haveli"
    working.loc[13, "id"] = "Dadra Nagar & Haveli"

    ap_old_border = old[old["NAME_1"] == "Andhra Pradesh"]["geometry"]
    working["geometry"] = np.where(
        working["st_nm"] == "Andhra Pradesh (pre)",
        ap_old_border,
        working["geometry"]
    )

    daman_old_border = old[old["NAME_1"] == "Daman and Diu"]["geometry"]
    working["geometry"] = np.where(
        working["st_nm"] == "Daman & Diu",
        daman_old_border,
        working["geometry"]
    )

    dadra_old_border = old[old["NAME_1"] == "Dadra and Nagar Haveli"]["geometry"]
    working["geometry"] = np.where(
        working["st_nm"] == "Dadra Nagar & Haveli",
        dadra_old_border,
        working["geometry"]
    )

    # Standardizing names to match state counts
    working["id"] = np.where(
        working["id"] == "Andaman and Nicobar Islands",
        "Andaman & Nicobar Islands",
        working["id"]
    )

    working.to_file("../www/india_states.geojson", driver="GeoJSON")