from fastapi import FastAPI
from models import Article

app = FastAPI()

@app.get("/health")
async def root():
    return {"status": "ok"}

@app.post("/articles/validate")
async def validate_article(article: Article):
    return {"message": "Valid article", "data": article}