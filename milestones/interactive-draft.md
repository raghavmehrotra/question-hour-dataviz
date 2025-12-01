# Exploring the Lok Sabha's Question Hour Data

Raghav Mehrotra

## Goal

My goal is to allow a user to explore the Indian Lok Sabha's Question Hour data for slices of the data that pertain to them.
This personalization currently takes two main forms -- it allows the user to understand how MPs from a particular state have participated in the QH over time, as well as how the user's topic of interest compares to certain existing topics/themes that were discussed from 2000-2018.

I am hoping to extend this to include a geospatial visualization, where users can interact with a clickable map to see all the questions that MPs from a particular constituency have asked from 2000-2018. I have more details on this below.

I had initally wanted to do a scrollytelling article, but I will focus more of my efforts on the map. In its current form, the webpage corresponds to the Option B ensemble in the assignment. With the map, it will be Option B + C.

The webpage currently has placeholder text/descriptions, which I will update after writing all the code.

## Data Challenges
For the text search, I am currently using a mini dataset that only searches for the subject of a question, not the entire question or answer text. I did this for two reasons: (1) to get the prototype and D3 working (2) because the dataset itself is ~300k rows and wasn't sure if I would have rendering lags in the browser for a full text search across a large corpus. This is something I am incrementally exploring at this stage. The user experience will remain the same regardless, just the number of matches might increase.

I am using the real data for the Altair graphs.

I have also found Parliamentary constituency and state shapefiles [here](http://projects.datameet.org/maps/), which I intend to add to the webpage in the final iteration. My initial reservation was that geospatial analysis would be difficult given shifting borders, but I discovered that constituency boundaries have actually not changed since 2002 (except in the new states that have been created). This will make a geospatial viz more achievable, and I intend to model my work on [this](https://www.pinklistindia.com) website that provides constituency level interactivity. Now that I have the categorical and text analysis working (although with styling still needed), I can dedicate time to this section.

## Walk Through
The strength of the QH data lies in the rich text in each question. The Lok Sabha debates a variety of issues, including agriculture, climate change, nuclear energy, etc.

In the third visual, the user is given this context and prompted to enter text about a topic of their choosing. The prompt is "Enter a topic to see how it compares to some of the others discussed in the Lok Sabha." Before the user enters their string, they are able to see the results for 5 pre-computed strings in a bar chart: "health", "legal", "border", "nuclear" and "climate." The length of each bar chart corresponds to the number of times that word appears in the subject of a question in the entire dataset (2000 to 2018). These bars appear sorted in descending order.

When the user clicks submit, a new bar appears on the bar chart indicating the number of times their string appears in the subjects of questions. This bar is a different colour, allowing the user to compare the number of occurrences to the predefined selection. The number of occurrences is supposed to be a proxy for the importance of that topic in Lok Sabha discussions.

The first two interactives are Altair graphs that allow a user to see how MPs from a particular state engage with the QH.


## Questions
1. Do you anticipate rendering lags if I search a corpus of 300k+ rows x 200-300 word long text for a substring for the bar graph? The easiest way to do this would be to simply try, but if there are best practices to know beforehand, that would be helpful. I will also post on Ed.
2. I am still trying to solve the issue of a single question (row) being asked by (corresponding to) multiple MPs (therefore multiple states, constituencies, etc). So far, I have retained only the first person (and state, constituency) who appears in the list, but this is misleading. One way to solve this is to make N distinct rows for such questions, one per MP. Do you have suggestions for any other way to handle this?