import mysql.connector
import spacy
import html


def decode_html_entities(text):
    return html.entities.entitydefs.get(text)

# Establish a connection to the database
connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="outlookrecengine"
)

# Create a cursor object to execute SQL queries
cursor = connection.cursor()

# Fetch the articles with 'classified' field as 0
select_query = "SELECT article_id, body, tag FROM articles WHERE classified = 0"

cursor.execute(select_query)

rows = cursor.fetchall()

# Iterate over the rows and print the title and text
for row in rows:
    id, text, tags = row
    tags = tags.lower()
    content_tags = tags.split(",")

    # Load English tokenizer, tagger, parser and NER
    nlp = spacy.load("en_core_web_sm")
    text = html.unescape(text)
    doc = nlp(text.lower())
    # Analyze syntax
    # print("Noun phrases:", [chunk.text for chunk in doc.noun_chunks])
    # print("Verbs:", [token.lemma_ for token in doc if token.pos_ == "VERB"])

    # Find named entities, phrases and concepts
    # for entity in doc.ents:
    #     print(entity.text, entity.label_)

    for entity in doc.ents:
        if ((entity.label_ == "ORG" or entity.label_ == "PERSON" or entity.label_ == "GPE" or entity.label_ == "LOC") and entity.text not in content_tags):
            # print(entity.text, entity.label_)
            tag = html.unescape(entity.text.strip())
            content_tags.append(tag)

    # print("Content Tags: ", content_tags)

    # Define the SQL query to update the content tags
    update_query = "UPDATE articles SET tag = %s, body = %s, classified = 1 WHERE article_id = %s"

    # Convert the content tags to a comma-separated string
    content_tags_str = html.unescape(",".join(content_tags))

    # Update the 'content_tags' field for the current article
    cursor.execute(update_query, (content_tags_str, text, id,))

# Commit the changes to the database
connection.commit()
print("Database changes committed, number of entries affected: ", len(rows))

# Close the cursor and connection
cursor.close()
connection.close()
