from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import pandas as pd
import joblib
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/css", StaticFiles(directory="css"), name="css")
app.mount("/js", StaticFiles(directory="js"), name="js")
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

@app.get("/")
def home():
    return FileResponse("jusgesto/index.htm")

@app.get("/about")
def about():
    return FileResponse("jusgesto/about.htm")

@app.get("/lawyer")
def lawyer():
    return FileResponse("jusgesto/lawyer.htm")

def clean_text(s):
    if not isinstance(s, str):
        return ""
    s = s.replace("\n", " ").strip()
    s = re.sub(r"\s+", " ", s)
    return s.lower()

case_df = pd.read_csv("legal_cases_dataset_fixed.csv")
case_tfidf = joblib.load("tfidf_vectorizer.joblib")
case_nn = joblib.load("nn_model.joblib")

lawyer_df = pd.read_csv("lawyers_dataset_nn_ready.csv")
lawyer_tfidf = joblib.load("lawyer_tfidf_vectorizer.joblib")
lawyer_nn = joblib.load("lawyer_nn_model.joblib")

class QueryRequest(BaseModel):
    query: str

def get_similar_cases(text, k=5):
    v = case_tfidf.transform([clean_text(text)])
    distances, indices = case_nn.kneighbors(v, n_neighbors=k)
    similarities = 1 - distances.flatten()

    cases = []
    for idx, sim in zip(indices.flatten(), similarities):
        row = case_df.iloc[idx]
        cases.append({
            "case_number": row["case_number"],
            "similarity": float(sim),
            "tags": row["tags"],
            "solution_summary": row["solution_summary"]
        })
    return cases

def extract_tags(cases):
    tags = []
    for c in cases:
        if isinstance(c["tags"], str):
            tags.extend(c["tags"].split(","))
    return list(set(t.strip().lower() for t in tags if t.strip()))

def recommend_lawyers(tags, k=5):
    query = " ".join(tags)
    v = lawyer_tfidf.transform([query])
    distances, indices = lawyer_nn.kneighbors(v, n_neighbors=k)

    lawyers = []
    for idx in indices.flatten():
        row = lawyer_df.iloc[idx]
        lawyers.append({
            "name": row["lawyer_name"],
            "area": row["practice_area"],
            "city": row["city"],
            "email": row["contact_email"]
        })
    return lawyers

@app.post("/api/recommend")
def recommend(data: QueryRequest):
    cases = get_similar_cases(data.query)
    tags = extract_tags(cases)
    lawyers = recommend_lawyers(tags)

    return {
        "message": "Based on similar legal cases, here is the analysis and recommended lawyers.",
        "cases": cases,
        "tags": tags,
        "lawyers": lawyers
    }
