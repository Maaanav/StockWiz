from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from sentence_transformers import SentenceTransformer
import fitz  # PyMuPDF
import numpy as np
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI()

# Load the embedding model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# MongoDB connection
try:
    client = MongoClient("mongodb://localhost:27017/")
    db = client["pdf_database"]
    collection = db["pdf_embeddings"]
    print("✅ Connected to MongoDB")
except ConnectionFailure:
    print("❌ Failed to connect to MongoDB")
    raise HTTPException(status_code=500, detail="Database connection error")

# Request model for storing PDF
class PDFRequest(BaseModel):
    pdf_path: str

# Request model for search query
class QueryRequest(BaseModel):
    query: str

# Function to extract text from a PDF
def extract_text_from_pdf(pdf_path):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text("text") + "\n"
    return text.strip()

# Store PDF embeddings in MongoDB
@app.post("/store_pdf")
async def store_pdf(request: PDFRequest):
    try:
        text = extract_text_from_pdf(request.pdf_path)
        if not text:
            raise HTTPException(status_code=400, detail="PDF is empty or unreadable")

        sentences = text.split(". ")  # Split into sentences
        embeddings = model.encode(sentences, convert_to_numpy=True)

        # Store sentences and embeddings in MongoDB
        docs = [{"text": sent, "embedding": emb.tolist()} for sent, emb in zip(sentences, embeddings)]
        collection.delete_many({})
        collection.insert_many(docs)

        return {"message": "✅ PDF processed and stored successfully", "total_sentences": len(sentences)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Search query in vector database
@app.post("/search")
async def search(request: QueryRequest):
    try:
        query_embedding = model.encode(request.query)

        # Retrieve all stored documents from MongoDB
        docs = list(collection.find({}, {"_id": 0, "text": 1, "embedding": 1}))
        if not docs:
            return {"response": "No documents found in the database."}

        # Convert stored embeddings to NumPy array
        embeddings = np.array([doc["embedding"] for doc in docs])

        # Ensure there are valid embeddings
        if embeddings.size == 0:
            return {"response": "Database has no valid embeddings."}

        # Compute similarity scores
        similarities = np.dot(embeddings, query_embedding) / (
            np.linalg.norm(embeddings, axis=1) * np.linalg.norm(query_embedding)
        )

        # Get the most relevant result
        best_idx = np.argmax(similarities)
        best_match = docs[best_idx]["text"]
        best_score = similarities[best_idx]

        if best_score < (np.mean(similarities) + 0.1):  # If similarity is low, fallback to Gemini API
            return {"response": "No relevant document found. Fetching answer from Gemini API..."}

        # ✅ Clean the response: Remove section numbers (e.g., "1.1 What is a Stock?")
        cleaned_response = " ".join(best_match.split("\n")[1:]).strip()

        return {"response": cleaned_response, "similarity": float(best_score)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
