# PROJECT REPORT
# LegalAI: AI-Powered Legal Assistant & Case Recommendation System

**Submitted in partial fulfilment of the requirement for the award of the degree of**
**BACHELOR OF TECHNOLOGY**
**IN**
**COMPUTER SCIENCE & ENGINEERING**

**Submitted by:**
Kunal Singh Negi (Roll No: 2219534)
Adarsh Kaintura (Roll No: 2218183)

**Under the guidance of:**
Ms. Pallavi Semwal
ASSISTANT PROFESSOR

**Department of Computer Science and Engineering**
**Graphic Era Hill University**
**May, 2026**

---

## CANDIDATE’S DECLARATION

I/We hereby certify that the work which is being presented in the project progress report entitled “LegalAI: AI-Powered Legal Assistant & Case Recommendation System” in partial fulfillment of the requirements for the award of the Degree of Bachelor of Technology in Computer Science and Engineering in the Department of Computer Science and Engineering of the Graphic Era Hill University, Dehradun shall be carried out by the undersigned under the supervision of Ms. Pallavi Semwal, Assistant Professor, Department of Computer Science and Engineering, Graphic Era Hill University, Dehradun.

**Kunal Singh Negi**
**Adarsh Kaintura**

**Supervisor Name:** Ms. Pallavi Semwal
**Date:**

---

## ACKNOWLEDGEMENT

We express our profound gratitude to our project guide, Ms. Pallavi Semwal, Assistant Professor, Department of Computer Science and Engineering, for her continuous support, technical guidance, and encouragement throughout the development of this project. Her insights have been invaluable in shaping the architecture and implementation of LegalAI. We would also like to thank Graphic Era Hill University for providing the necessary resources and environment to successfully complete this endeavour.

**Kunal Singh Negi**  
**Adarsh Kaintura**

---

## ABSTRACT

The Indian legal system faces a significant challenge with millions of pending cases and a complex web of laws, sections, and precedents. Navigating this landscape is often overwhelming for both citizens and legal professionals. This project introduces **LegalAI**, an AI-powered legal assistant designed to bridge the gap between complex legal data and end-user needs. LegalAI leverages Machine Learning (ML) to provide intelligent case recommendations and lawyer suggestions based on natural language descriptions of legal scenarios.

The core methodology of LegalAI involves a robust ML pipeline utilizing **TF-IDF (Term Frequency-Inverse Document Frequency)** for text vectorization and the **Nearest Neighbors** algorithm for semantic similarity search. The system is trained on extensive datasets of Indian legal cases and lawyer profiles. When a user provides a legal scenario, LegalAI identifies the most similar historical cases from its database, extracts relevant legal tags, and uses these tags to recommend suitable lawyers specialized in the identified practice areas.

The system architecture consists of a modern, responsive frontend built with **React** and **Tailwind CSS**, offering a premium user experience. The backend is powered by **FastAPI**, providing high-performance RESTful endpoints for the ML pipeline. Data persistence and authentication are handled via **Supabase**, ensuring a secure and scalable environment.

Evaluation of the system demonstrates high relevance in case recommendations, effectively assisting users in understanding potential legal outcomes based on precedents. LegalAI democratization of legal knowledge by making complex case law accessible through a simple, interactive interface, thereby supporting informed decision-making in legal matters.

---

## LIST OF FIGURES

*   **Fig 1.** High-Level Architecture Diagram (Page 10)

---

## TABLE OF CONTENTS

1.  **CHAPTER 1: INTRODUCTION**
    *   1.1 Importance of AI in the Legal Domain
    *   1.2 Project Overview
    *   1.3 Machine Learning Techniques in Legal Tech
    *   1.4 Potential Impact and Applications
2.  **CHAPTER 2: OBJECTIVES**
    *   2.1 To Preprocess and Analyze Legal Datasets
    *   2.2 To Implement TF-IDF for Feature Extraction
    *   2.3 To Design a Case Recommendation Engine using Nearest Neighbors
    *   2.4 To Develop a Lawyer Recommendation Pipeline
    *   2.5 To Build a Responsive Web Application
3.  **CHAPTER 3: SOFTWARE AND HARDWARE REQUIREMENTS**
    *   3.1 Hardware Requirements
    *   3.2 Software Requirements
    *   3.3 System Requirements Specification (SRS)
4.  **CHAPTER 4: PROJECT METHODOLOGY**
    *   4.1 Data Ingestion and CSV Processing
    *   4.2 Text Preprocessing and NLP
    *   4.3 Feature Engineering with TF-IDF
    *   4.4 Recommendation Algorithm: K-Nearest Neighbors
    *   4.5 System Architecture (React + FastAPI + Supabase)
5.  **CHAPTER 5: IMPLEMENTATION AND RESULTS**
    *   5.1 System Setup
    *   5.2 ML Pipeline Execution
    *   5.3 UI/UX Design and Navigation
    *   5.4 Result Analysis
6.  **CHAPTER 6: CONCLUSION AND FUTURE SCOPE**
    *   6.1 Conclusion
    *   6.2 Future Scope
7.  **REFERENCES**
8.  **APPENDIX A (CODE SNIPPETS)**

---

## ABBREVIATIONS

*   **AI** – Artificial Intelligence
*   **API** – Application Programming Interface
*   **CSV** – Comma Separated Values
*   **KNN** – K-Nearest Neighbors
*   **ML** – Machine Learning
*   **NLP** – Natural Language Processing
*   **TF-IDF** – Term Frequency-Inverse Document Frequency
*   **UI/UX** – User Interface / User Experience

---

## CHAPTER 1: INTRODUCTION

### 1.1 Importance of AI in the Legal Domain
The legal sector has traditionally been document-heavy and reliant on manual research. In India, where the judicial system is overburdened with a massive backlog of cases, the need for technological intervention is critical. Artificial Intelligence (AI) and Machine Learning (ML) offer the potential to automate routine tasks, such as case law research, document drafting, and identifying legal precedents. By leveraging NLP and semantic search, AI can help lawyers and clients find relevant information in seconds, a task that would otherwise take hours of manual effort.

### 1.2 Project Overview
**LegalAI** is an AI-powered platform designed to assist users in navigating legal challenges. The system allows users to describe their legal issues in plain language. Using a pre-trained ML model, it analyzes the description and retrieves similar cases from a database of thousands of Indian legal records. Furthermore, it analyzes the tags associated with these similar cases to suggest the most appropriate lawyers from its database, ensuring that users get specialized legal help.

### 1.3 Machine Learning Techniques in Legal Tech
This project utilizes classical yet highly effective ML techniques:
*   **TF-IDF**: Used to convert legal text into numerical vectors that capture the importance of specific words within a document relative to the entire dataset.
*   **Nearest Neighbors**: An unsupervised learning algorithm used to find the most "similar" vectors in the high-dimensional space created by TF-IDF. This is ideal for recommendation systems where the goal is to find items similar to a query.

### 1.4 Potential Impact and Applications
*   **Legal Research**: Accelerating the process of finding relevant precedents for lawyers.
*   **Access to Justice**: Helping common citizens understand their legal standing by comparing their issues with past cases.
*   **Lawyer Discovery**: Streamlining the process of finding the right lawyer based on specific case requirements.

---

## CHAPTER 2: OBJECTIVES

The primary objective of LegalAI is to provide a unified platform for legal assistance and lawyer recommendation.

*   **2.1 To Preprocess and Analyze Legal Datasets**: Cleaning and formatting CSV datasets containing case summaries and lawyer profiles.
*   **2.2 To Implement TF-IDF for Feature Extraction**: Converting textual legal scenarios into numerical representations for machine processing.
*   **2.3 To Design a Case Recommendation Engine**: Implementing the Nearest Neighbors algorithm to retrieve top-N similar cases.
*   **2.4 To Develop a Lawyer Recommendation Pipeline**: Creating a logic that maps case tags to lawyer specializations.
*   **2.5 To Build a Responsive Web Application**: Developing a modern frontend using React and a fast backend using FastAPI.

---

## CHAPTER 3: SOFTWARE AND HARDWARE REQUIREMENTS

### 3.1 Hardware Requirements
*   **Processor**: Intel Core i5/i7 (8th Gen or above) or AMD Ryzen 5/7.
*   **RAM**: 8 GB (Minimum), 16 GB (Recommended).
*   **Storage**: 500 MB for application files and local models.

### 3.2 Software Requirements
*   **OS**: Windows 10/11, macOS, or Linux.
*   **Languages**: Python 3.9+, TypeScript/JavaScript.
*   **Frameworks**: FastAPI (Backend), Vite/React (Frontend).
*   **Libraries**: Scikit-learn, Pandas, Joblib (ML), Tailwind CSS, Shadcn/UI (Styling).
*   **Database**: Supabase (PostgreSQL + Auth).

---

## CHAPTER 4: PROJECT METHODOLOGY

### 4.0 System Architecture Overview

![LegalAI Architecture Diagram](file:///C:/Users/kunalnegi/.gemini/antigravity/brain/ada6a645-ef57-47fb-9e77-c721731d9253/legalai_architecture_diagram_1777054217040.png)
*Fig 1. High-Level Architecture Diagram of LegalAI*

### 4.1 Data Ingestion and CSV Processing
The system uses two primary CSV files:
1.  `legal_cases_dataset_fixed.csv`: Contains case numbers, scenarios, tags, and solution summaries.
2.  `lawyers_dataset_nn_ready.csv`: Contains lawyer names, practice areas, experience, and contact details.

### 4.2 Text Preprocessing and NLP
Raw user input is cleaned by removing newlines, extra spaces, and converting to lowercase. This ensures consistency between the query and the trained models.

### 4.3 Feature Engineering with TF-IDF
We use `TfidfVectorizer` to learn the vocabulary of the legal datasets. The model transforms text into vectors where each dimension represents a word's weight, calculated as:
`TF-IDF(t, d) = TF(t, d) * IDF(t)`
Where `TF` is term frequency and `IDF` is inverse document frequency.

### 4.4 Recommendation Algorithm: K-Nearest Neighbors (KNN)
The system uses the `NearestNeighbors` algorithm with cosine similarity to find the k-closest cases to the user's query vector.
*   **Query Phase**: User input → Vectorized Input → KNN Search → Top-5 Cases.
*   **Lawyer Phase**: Extract Tags from Top Cases → Vectorize Tags → KNN Search in Lawyer Dataset → Top-5 Lawyers.

### 4.5 System Architecture
LegalAI follows a decoupled architecture:
1.  **Client-Side**: React SPA with Tailwind CSS for a modern "Glassmorphism" design.
2.  **API Layer**: FastAPI server handling ML inference.
3.  **Cloud Layer**: Supabase for user authentication, profile storage, and appointment management.

---

## CHAPTER 5: IMPLEMENTATION AND RESULTS

### 5.1 System Setup
The project environment was set up using `npm` for the frontend and `pip` for the backend. The ML models were trained using a Jupyter Notebook and exported as `.joblib` files for fast loading in the FastAPI application.

### 5.2 ML Pipeline Execution
The backend successfully loads:
- Case TF-IDF Matrix (`tfidf_matrix.npz`)
- Lawyer NN Model (`lawyer_nn_model.joblib`)
- Datasets for real-time lookup.

### 5.3 Result Analysis
Testing with a scenario like "Tenant-landlord dispute over security deposit" yielded:
- **Similar Cases**: Cases related to property rental disputes.
- **Tags**: Property, Rental, Security Deposit.
- **Lawyers**: Recommended lawyers with "Civil" or "Real Estate" practice areas.

---

## CHAPTER 6: CONCLUSION AND FUTURE SCOPE

### 6.1 Conclusion
LegalAI demonstrates that ML can be effectively applied to the legal domain to provide actionable insights. By combining case recommendation with lawyer discovery, it provides a comprehensive tool for anyone seeking legal guidance in India.

### 6.2 Future Scope
*   **Integration with LLMs**: Using models like GPT-4 to provide more conversational and detailed legal advice alongside recommendations.
*   **Voice Interface**: Allowing users to describe their scenarios via voice.
*   **Multi-language Support**: Expanding to Hindi and other regional languages for better inclusivity.

---

## REFERENCES
1.  "TF-IDF: A Statistical Measure for Information Retrieval", Robertson, S. (2004).
2.  "Scikit-learn: Machine Learning in Python", Pedregosa et al. (2011).
3.  "FastAPI Documentation", Tiangolo.
4.  "Indian Legal System Overview", Ministry of Law and Justice.

---

## APPENDIX A (CODE SNIPPETS)

**ML Inference Logic (FastAPI):**
```python
@app.post("/api/recommend")
def recommend(data: QueryRequest):
    # 1. Get Similar Cases
    v = case_tfidf.transform([clean_text(data.query)])
    distances, indices = case_nn.kneighbors(v, n_neighbors=5)
    
    # 2. Extract Tags and Recommend Lawyers
    cases = get_similar_cases(data.query)
    tags = extract_tags(cases)
    lawyers = recommend_lawyers(tags)
    
    return {"cases": cases, "tags": tags, "lawyers": lawyers}
```
