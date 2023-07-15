import nltk
import html
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import sys


def calculate_similarity(article1, article2):

    article1 = html.unescape(article1)
    article2 = html.unescape(article2)

    # Tokenize and preprocess the text
    tokens1 = word_tokenize(article1.lower())
    tokens2 = word_tokenize(article2.lower())

    # Remove stopwords and perform lemmatization
    stop_words = set(stopwords.words("english"))
    lemmatizer = WordNetLemmatizer()
    filtered_tokens1 = [lemmatizer.lemmatize(
        token) for token in tokens1 if token.isalnum() and token not in stop_words]
    filtered_tokens2 = [lemmatizer.lemmatize(
        token) for token in tokens2 if token.isalnum() and token not in stop_words]

    # Convert the preprocessed tokens back to text
    processed_text1 = ' '.join(filtered_tokens1)
    processed_text2 = ' '.join(filtered_tokens2)

    # Calculate TF-IDF vectors
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([processed_text1, processed_text2])

    # Calculate cosine similarity
    similarity = cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])[0][0]

    return similarity


# Example usage
article1 = sys.argv[1]
article2 = sys.argv[2]
similarity_score = calculate_similarity(article1, article2)
print(similarity_score * 100)
