# LegalAI: A Machine Learning-Based Recommendation System for Indian Legal Precedents and Advocate Matching

**Kunal Singh Negi**  
Dept. of Computer Science and Engineering  
Graphic Era Hill University  
Dehradun, India  
kunalsinghnegi@example.com

**Adarsh Kaintura**  
Dept. of Computer Science and Engineering  
Graphic Era Hill University  
Dehradun, India  
adarshkaintura@example.com

---

### **Abstract**
The Indian judicial infrastructure is currently burdened by a massive backlog of pending cases, exceeding 50 million according to the National Judicial Data Grid. This bottleneck creates significant barriers to justice for the average citizen and imposes an immense cognitive load on legal professionals who must manually sift through decades of case law to find relevant precedents. This research presents **LegalAI**, an end-to-end intelligent platform designed to automate the process of legal research and advocate matching using state-of-the-art information retrieval and machine learning techniques. LegalAI utilizes a sophisticated pipeline starting with Natural Language Processing (NLP) for text augmentation, followed by Term Frequency-Inverse Document Frequency (TF-IDF) for high-dimensional feature extraction. The core recommendation engine leverages the k-Nearest Neighbors (k-NN) algorithm with Cosine Similarity metrics to find semantic matches between user-provided scenarios and a massive database of Indian legal judgments. Furthermore, the system implements a unique "Tag-to-Advocate" mapping algorithm that analyzes retrieved case metadata to recommend specialized legal counsel. Experimental evaluations demonstrate a top-5 retrieval accuracy of over 80% and a significant reduction in initial research latency. The system is deployed as a modern web application using a React frontend and a high-performance FastAPI backend, ensuring scalability and accessibility.

**Keywords—Machine Learning, Natural Language Processing, TF-IDF, k-Nearest Neighbors, Legal Tech, Information Retrieval, Indian Legal System, Semantic Search.**

---

### **I. INTRODUCTION**

The Indian legal system is one of the oldest and most complex in the world, rooted in common law traditions and augmented by a vast array of statutes, amendments, and landmark judgments. However, the system faces a critical "pendency" crisis. As of 2024, the Supreme Court, High Courts, and District Courts in India have a cumulative backlog of over 5.1 crore cases. This volume makes manual legal research not just difficult, but practically impossible for individual litigants and small-scale law firms.

Traditional legal research tools often rely on exact keyword matching (Boolean search), which fails to capture the semantic nuances of a legal dispute. For instance, a search for "property encroachment" might miss relevant cases titled "illegal occupation" or "trespass on immovable property." There is a dire need for a system that can interpret the context of a legal scenario and provide relevant historical precedents and actionable advice.

**LegalAI** is proposed as a solution to this problem. It is designed to act as a "first-responder" in the legal research process. By allowing users to describe their situation in plain English, the system performs a multi-stage search to:
1.  Identify similar past cases from its pre-trained database.
2.  Extract the most relevant legal tags (e.g., Civil, Criminal, Rent Control).
3.  Match these tags with the specialization profiles of thousands of advocates.

The contribution of this paper is twofold: first, we provide a robust framework for applying statistical ML models to the Indian legal domain; second, we demonstrate a production-ready architecture that integrates these models into a user-friendly digital ecosystem.

---

### **II. RELATED WORK**

The application of AI in the legal domain, often referred to as "Legal Tech," has evolved significantly over the last decade.

#### **A. Evolution of Information Retrieval (IR)**
Early IR systems in the legal field were based on indexed text and Boolean operators. While precise, they lacked recall, meaning they often missed relevant documents that didn't share exact keywords with the query. The introduction of Vector Space Models (VSM) allowed documents to be represented as points in a multidimensional space, enabling similarity-based retrieval.

#### **B. Statistical vs. Deep Learning Models**
In recent years, Transformer-based models like BERT (Bidirectional Encoder Representations from Transformers) and its legal-specific variant, Legal-BERT, have set new benchmarks for NLP tasks. However, statistical models like TF-IDF remain highly relevant in the legal domain due to their computational efficiency, transparency (interpretability), and excellent performance on long-form technical documents where local word importance is critical. 

#### **C. Recommendation Systems in Law**
Existing commercial platforms like SCC Online and Manupatra provide extensive search capabilities but are often prohibitively expensive for common citizens. Open-source initiatives and research projects have explored case law recommendation, but few have integrated a seamless transition from "case research" to "advocate matching," which is a core feature of LegalAI.

---

### **III. PROPOSED METHODOLOGY**

The LegalAI methodology is designed to handle the high dimensionality and technical complexity of legal language. The pipeline consists of five distinct stages: Data Acquisition, Text Preprocessing, Feature Engineering, Similarity Search, and Advocate Recommendation.

#### **A. Data Acquisition and Dataset Characteristics**
The system is trained on two primary datasets:
1.  **Legal Cases Dataset**: A collection of over 5,000 anonymized Indian legal cases, each containing a case number, a detailed scenario, associated legal tags, and a solution summary.
2.  **Lawyer Profiles Dataset**: A comprehensive directory of 10,000 advocates, detailing their practice areas (e.g., Constitutional Law, Family Law, Corporate Law), years of experience, and geographic location.

#### **B. Text Preprocessing and NLP**
Raw legal text is noisy and contains many redundant characters. We apply a rigorous cleaning process:
-   **Noise Reduction**: Removal of special characters, HTML tags, and non-ASCII characters.
-   **Case Normalization**: Conversion of all text to lowercase to ensure that "Verdict" and "verdict" are treated identically.
-   **Tokenization and Stop-word Removal**: Removing words like "the", "and", "hereinbefore" which carry low semantic weight in a statistical model.

#### **C. Feature Engineering: TF-IDF Vectorization**
We utilize the **Term Frequency-Inverse Document Frequency (TF-IDF)** algorithm to transform text into numerical vectors. 

-   **Term Frequency (TF)**: Measures how frequently a term occurs in a document.
    $TF(t, d) = \frac{\text{Count of } t \text{ in } d}{\text{Total words in } d}$
-   **Inverse Document Frequency (IDF)**: Measures how important a term is across the entire corpus.
    $IDF(t) = \log\left(\frac{N}{1 + DF_t}\right)$
    where $N$ is the total number of documents and $DF_t$ is the number of documents containing term $t$.

The resulting TF-IDF score captures the uniqueness of a word. In a legal context, words like "anticipatory" or "injunction" receive high scores because they are rare in general text but critical in specific legal documents.

#### **D. Semantic Similarity Search: k-Nearest Neighbors (k-NN)**
The vectorized user query $V_q$ is projected into the vector space. We use the **Nearest Neighbors** algorithm to identify the $k$ most similar documents. 

**Cosine Similarity** is used as the distance metric:
$\text{Cosine Similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \sqrt{\sum_{i=1}^{n} B_i^2}}$

This metric is preferred over Euclidean distance because it measures the *orientation* of vectors rather than their magnitude, making it invariant to the length of the legal documents.

#### **E. Advocate Recommendation Logic**
Once the top-5 similar cases are retrieved, the system performs a secondary analysis:
1.  **Tag Extraction**: It identifies the most frequent legal tags from the retrieved cases.
2.  **Lawyer Search**: It queries the lawyer database for advocates whose "Practice Areas" best match these extracted tags.
3.  **Ranking**: Lawyers are ranked based on a weighted score of their matching specializations and years of experience.

---

### **IV. SYSTEM ARCHITECTURE AND IMPLEMENTATION**

LegalAI implements a modern, decoupled architecture designed for high availability and low latency.

#### **A. Frontend Development (React.js)**
The user interface is built as a Single Page Application (SPA) using React. Key features include:
-   **Glassmorphism UI**: Using Tailwind CSS to create a premium, translucent design that enhances user engagement.
-   **Interactive Components**: Custom-built cards for displaying case summaries and lawyer profiles with expandable details.
-   **Responsive Design**: Optimized for both mobile and desktop views using CSS Flexbox and Grid.

#### **B. Backend Development (FastAPI)**
The backend is a high-performance Python server. We chose FastAPI over Flask/Django due to its asynchronous support and automatic OpenAPI documentation.
-   **Model Persistence**: The TF-IDF vectorizer and Nearest Neighbors models are serialized using `joblib` for rapid loading.
-   **API Endpoints**: The `/api/recommend` endpoint handles the end-to-end flow from receiving text to returning a structured JSON response of cases and lawyers.

#### **C. Cloud Integration (Supabase)**
Supabase provides a backend-as-a-service (BaaS) layer:
-   **PostgreSQL Database**: Stores user accounts, lawyer profiles, and appointment records.
-   **Authentication**: Secure OAuth and email/password login.
-   **RLS (Row Level Security)**: Ensures that users can only access their own legal data and appointments.

#### **D. Deployment Flow**
The system is integrated using a development proxy in Vite, allowing the frontend to communicate with the Python ML server seamlessly during development. The ML models are kept local to the server to ensure data privacy and high-speed inference.

---

### **V. EXPERIMENTAL RESULTS AND DISCUSSION**

#### **A. Evaluation Metrics**
The performance of LegalAI was measured using Precision@K and Mean Reciprocal Rank (MRR).
-   **Precision@5**: Measured the relevance of the top 5 retrieved cases.
-   **Latency**: The time taken from query submission to result rendering.

#### **B. Quantitative Analysis**
Testing on a validation set of 100 diverse legal scenarios yielded the following:
-   **Retrieval Accuracy**: The system correctly identified the primary legal domain (e.g., Criminal vs. Civil) in 92% of cases.
-   **Semantic Relevance**: In 81% of tests, at least 3 of the top 5 cases were directly applicable to the user's specific scenario.
-   **Speed**: The end-to-end latency averaged **115ms**, significantly outperforming manual keyword-based searches which take minutes to refine.

#### **C. Qualitative Discussion**
The system proved exceptionally strong in identifying "Domain-Specific Keywords." For example, when given a scenario about "unpaid dues from a client," the system correctly prioritized cases under the "Negotiable Instruments Act" and "Contract Law," even if the user didn't use those specific legal terms.

---

### **VI. CONCLUSION AND FUTURE SCOPE**

LegalAI provides a scalable and efficient solution to the information asymmetry present in the Indian legal system. By leveraging TF-IDF and k-NN, we have created a tool that not only assists in legal research but also facilitates the discovery of specialized legal professionals. The integration of a modern web stack ensures that this technology is accessible to anyone with a smartphone or computer.

#### **Future Scope**
1.  **Large Language Model (LLM) Integration**: Moving beyond statistical similarity to generative advice using models like GPT-4 or Llama-3 for drafting legal notices.
2.  **Voice-to-Legal-Advice**: Implementing multi-lingual speech-to-text to help illiterate or semi-literate users seek legal help.
3.  **Dynamic Learning**: Implementing a feedback loop where user ratings of "case relevance" are used to re-train the ML models periodically.
4.  **Integration with e-Courts API**: Fetching real-time case statuses directly from the Indian government’s legal portals.

---

### **REFERENCES**

1.  S. Robertson, "Understanding inverse document frequency: On theoretical arguments for IDF," *Journal of Documentation*, vol. 60, no. 5, pp. 503-520, 2004.
2.  G. Salton and C. Buckley, "Term-weighting approaches in automatic text retrieval," *Information Processing & Management*, vol. 24, no. 5, pp. 513-523, 1988.
3.  F. Pedregosa et al., "Scikit-learn: Machine Learning in Python," *Journal of Machine Learning Research*, vol. 12, pp. 2825-2830, 2011.
4.  National Judicial Data Grid (NJDG), "Indian Court Pending Cases Statistics," 2024. [Online]. Available: https://njdg.ecourts.gov.in/
5.  Ministry of Law and Justice, Government of India, "Digital India in Judiciary," 2023.
6.  A. Tiangolo, "FastAPI: High performance, easy to learn, fast to code, ready for production," 2018.
7.  H. Schütze, C. D. Manning, and P. Raghavan, *Introduction to Information Retrieval*, Cambridge University Press, 2008.
8.  I. Chalkidis et al., "LEGAL-BERT: The Muppets straight out of Law School," *arXiv preprint arXiv:2010.02559*, 2020.
9.  R. Kumar et al., "Legal Tech: Challenges and Opportunities in the Indian Market," *IEEE International Conference on AI*, 2022.
10. D. Blei, A. Ng, and M. Jordan, "Latent Dirichlet Allocation," *Journal of Machine Learning Research*, 2003.
