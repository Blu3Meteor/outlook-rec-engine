from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import sys

articles = []
# Retrieve the command-line arguments
articles.append(sys.argv[1])
articles.append(sys.argv[2])

print("Current Article:", articles[0])
print("Search Article:", articles[1])

# Create TF-IDF vectorizer
vectorizer = TfidfVectorizer()

# Compute TF-IDF matrix
tfidf_matrix = vectorizer.fit_transform(articles)

# Calculate cosine similarity
similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)

# Print similarity matrix
print(similarity_matrix[0][1])
