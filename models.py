from pydantic import BaseModel, field_validator, Field
from typing import List, Optional
from datetime import datetime

class Article(BaseModel):
    # Required fields
    title: str
    body: str
    category: str
    
    # Optional fields
    slug: Optional[str] = None
    tag: List[str] = []  # Default to empty list
    publish_date: Optional[datetime] = None
    update_date: Optional[datetime] = None
    author: Optional[str] = None
    description: Optional[str] = None
    summary: Optional[str] = None
    
    # # Validator for tags
    # @validator('tag', pre=True)
    # def split_tags(cls, v):
    #     if isinstance(v, str):
    #         return [t.strip() for t in v.split(",") if t.strip()]
    #     return v if v else []

    # V2 field validator
    @field_validator('tag', mode='before')
    @classmethod
    def split_tags(cls, v):
        if isinstance(v, str):
            return [t.strip() for t in v.split(",") if t.strip()]
        return v if v else []
    
class RecommendationItem(BaseModel):
    article_id: int
    title: str
    slug: str
    publish_date: Optional[datetime]
    score: Optional[float] = None  # Only populated if debug=True

class RecommendationResponse(BaseModel):
    source_article_id: int
    recommendations: List[RecommendationItem]