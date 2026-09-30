import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import joblib

df = pd.read_csv("dataset.csv")

model = Pipeline([
    ("vectorizer", CountVectorizer()),
    ("classifier", MultinomialNB())
])

model.fit(df["yorum"], df["etiket"])

joblib.dump(model, "model.pkl")

print("Model kaydedildi.")