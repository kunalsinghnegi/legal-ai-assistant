import streamlit as st
import pandas as pd
import joblib
import re
from scipy import sparse

def clean_text(s):
    if not isinstance(s, str):
        return ""
    s = s.replace("\n", " ").strip()
    s = re.sub(r"\s+", " ", s)
    return s.lower()

@st.cache_resource
def load_models():
    try:
        case_df = pd.read_csv("legal_cases_dataset_fixed.csv")
        case_tfidf = joblib.load("tfidf_vectorizer.joblib")
        case_X = sparse.load_npz("tfidf_matrix.npz")
        case_nn = joblib.load("nn_model.joblib")

        lawyer_df = pd.read_csv("lawyers_dataset_nn_ready.csv")
        lawyer_tfidf = joblib.load("lawyer_tfidf_vectorizer.joblib")
        lawyer_X = sparse.load_npz("lawyer_tfidf_matrix.npz")
        lawyer_nn = joblib.load("lawyer_nn_model.joblib")

        return (
            case_df, case_tfidf, case_nn,
            lawyer_df, lawyer_tfidf, lawyer_nn
        )

    except Exception as e:
        st.error(f"❌ Error loading files: {e}")
        return [None] * 6

def get_similar_cases(user_text, df, tfidf, nn, k=5):
    cleaned = clean_text(user_text)
    if not cleaned:
        return []

    v = tfidf.transform([cleaned])
    distances, indices = nn.kneighbors(v, n_neighbors=k)
    similarities = 1 - distances.flatten()

    results = []
    for idx, sim in zip(indices.flatten(), similarities):
        row = df.iloc[idx]
        results.append({
            "case_number": row["case_number"],
            "similarity": float(sim),
            "scenario_text": row["scenario_text"],
            "tags": row["tags"],
            "solution_summary": row["solution_summary"]
        })
    return results

def extract_case_tags(case_results):
    tags = []
    for case in case_results:
        if isinstance(case["tags"], str):
            tags.extend(case["tags"].split(","))

    tags = [t.strip().lower() for t in tags if t.strip()]
    return list(set(tags))  

def get_lawyer_suggestions_from_tags(tags, df, tfidf, nn, k=5):
    if not tags:
        return []

    query_text = " ".join(tags)
    v = tfidf.transform([query_text])
    distances, indices = nn.kneighbors(v, n_neighbors=k)
    similarities = 1 - distances.flatten()

    results = []
    for idx, sim in zip(indices.flatten(), similarities):
        row = df.iloc[idx]
        results.append({
            "lawyer_name": row["lawyer_name"],
            "practice_area": row["practice_area"],
            "experience_years": row["experience_years"],
            "city": row["city"],
            "contact_email": row["contact_email"],
            "match_score": float(sim)
        })

    return results

st.set_page_config(page_title="Legal Case & Lawyer Recommendation", layout="wide")
st.title("⚖ Legal Case & Lawyer Recommendation System")

(
    case_df,
    case_tfidf,
    case_nn,
    lawyer_df,
    lawyer_tfidf,
    lawyer_nn
) = load_models()

if case_df is not None:

    user_input = st.text_area(
        "📝 Enter your legal scenario:",
        height=160,
        placeholder="Describe your legal issue in detail..."
    )

    if st.button("🔍 Find Similar Cases & Lawyers"):
        if not user_input.strip():
            st.warning("⚠ Please enter a legal scenario.")
        else:
            st.subheader("📚 Top Similar Legal Cases")
            case_results = get_similar_cases(
                user_input, case_df, case_tfidf, case_nn
            )

            if not case_results:
                st.info("No similar cases found.")
            else:
                for i, res in enumerate(case_results, start=1):
                    st.markdown(f"### {i}. Case Number: {res['case_number']}")
                    st.markdown(f"**Similarity Score:** `{res['similarity']:.4f}`")

                    with st.expander("📄 Scenario Description"):
                        st.write(res["scenario_text"])

                    with st.expander("🏷 Tags"):
                        st.write(res["tags"])

                    with st.expander("⚖ Solution Summary"):
                        st.write(res["solution_summary"])

                    st.markdown("---")

            case_tags = extract_case_tags(case_results)

            st.subheader("🏷 Extracted Legal Tags")
            if case_tags:
                st.write(", ".join(case_tags))
            else:
                st.info("No tags extracted.")

            st.subheader("👨‍⚖ Recommended Lawyers")

            lawyer_results = get_lawyer_suggestions_from_tags(
                case_tags, lawyer_df, lawyer_tfidf, lawyer_nn
            )

            if not lawyer_results:
                st.info("No suitable lawyers found.")
            else:
                for row in lawyer_results:
                    st.markdown(f"""
                    ### 👤 {row['lawyer_name']}
                    **Practice Area:** {row['practice_area']}  
                    **Experience:** {row['experience_years']} years  
                    **City:** {row['city']}  
                    **Email:** {row['contact_email']}  `
                    """)
                    st.markdown("---")

st.success("✅ System running with Case → Tags → Lawyer ML Pipeline")
