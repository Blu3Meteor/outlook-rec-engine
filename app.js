const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const { exec } = require('child_process');
const { log } = require('console');

const app = express();
app.use(cookieParser());
app.use(bodyParser.json())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5500');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'outlookrecengine',
  connectionLimit: 10, // adjust the connection limit as per your requirements
});

function generateUniqueKey() {
    let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let keyLength = 6;
    let key = '';

    for (let i = 0; i < keyLength; i++) {
        randomIndex = rand(0, strlen(characters) - 1);
        key += characters[randomIndex];
    }

    return key;
}

function calculateJaccardIndex(arr1, arr2) {
  // Calculate the intersection of the two arrays
  const intersection = arr1.filter(value => arr2.includes(value));

  // Calculate the union of the two arrays
  const union = [...new Set([...arr1, ...arr2])];

  // Calculate the Jaccard Index
  const jaccardIndex = intersection.length / union.length;

  return jaccardIndex;
}

// Function to calculate article similarity
function calculateArticleSimilarity(article1Body, article2Body) {
  // Execute the Python script synchronously
  const pythonScript = exec('python', ['tf-idf.py', article1Body, article2Body]);

  console.log('Python script stdout:', pythonScript.stdout.toString());
  console.log('Python script stderr:', pythonScript.stderr.toString());
  console.log('Python script status:', pythonScript.status);

  if (pythonScript.error) {
    // Error occurred while executing the script
    console.error('Error:', pythonScript.error);
    return null;
  }

  // Get the stdout data of the Python script
  const result = pythonScript.stdout.toString().trim();

  if (pythonScript.status !== 0) {
    // Script exited with a non-zero code
    console.error('Python script exited with code', pythonScript.status);
    return null;
  }

  return result;
}



app.get('/', (req, res) => {
  const userIdCookie = req.cookies.user_id;

  if (userIdCookie) {
    // 'user_id' cookie exists
    const userId = userIdCookie;
    // Your code logic for handling the existing user
    res.send('Existing user');
    console.log(userId);
  } else {
    // 'user_id' cookie does not exist
    const userId = uuidv4();
    // Your code logic for handling a new user

    // Set the 'user_id' cookie
    res.cookie('user_id', userId);

    res.send('New user');
    console.log(userId);
  }
});

app.get('/data', (req, res) => {
  // Extract the clientID and value from the query parameters
  const clientID  = req.query.clientID;
  // console.log(clientID);

  pool.query('SELECT * FROM organizations WHERE orgKey = ?', [req.query.clientID], (error, results) => {
    if (error) {
      res.status(500).send('Error retrieving data');
    } 
    else {
      if (results.length > 0) {
        const orgData = JSON.parse(JSON.stringify(results[0]));;
        console.log(orgData);
        // Key exists in the database
        // Generate dynamic JavaScript code based on the key and value
        let dynamicCode = `
        console.log('Hello ${orgData.name}!');
        `;

        // set
        const userId = uuidv4();

        // Read cookie file
        fs.readFile('cookies.js', 'utf8', (error, contents) => {
          if (error) {
            console.error('Error:', error);
            return;
          }

          contents = contents.replace("@userID", userId)
          contents = contents.replace("@clientID", clientID)
          // console.log(contents);
          dynamicCode += contents;

          // Set the response headers
          res.setHeader('Content-Type', 'application/javascript');
          // console.log(dynamicCode);
          // Send the dynamic JavaScript code as the response
          res.send(dynamicCode);
        });
      } 
      else {
        // Key does not exist in the database
        res.status(404).send('Key not found');
      }
    }
  });
});

app.get('/orgs', (req, res) => {
  pool.query('SELECT * FROM organizations', (error, results) => {
    if (error) {
      res.status(500).send('Error retrieving users');
    } else {
      console.log(results);
      res.json(results);
    }
  });
});


app.post('/api/insertArticle', (req, res) => {
  // Create a database connection
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'outlookrecengine'
  });

  // Connect to the database
  // Connect to the MySQL server
  connection.connect((error) => {
    if (error) {
      console.error('Error connecting to MySQL:', error);
      return;
    }

    console.log('Connected to MySQL database');
  });

  let articleData = req.body;
  // let articleData = {
  //   title: 'value1',
  //   description: 'value2',
  //   tag: 'value3',
  //   summary: 'value4',
  //   body: 'value5',
  //   publish_date: new Date(),
  //   update_date: new Date(),
  //   author: 'value6',
  //   category: 'value6',
  //   subcategory: 'value7',
  //   slug: 'value8',
  //   client_id: 'value9'
  // };

  console.log(articleData);

  // Extract the keys and values from the JSON
  const keys = Object.keys(articleData);
  const values = Object.values(articleData);

  // Create the SQL INSERT statement dynamically
  const tableName = 'articles';
  const columns = keys.join(', ');
  const placeholders = keys.map(() => '?').join(', ');


  // Check if the record already exists
const selectSql = `SELECT * FROM ${tableName} WHERE title = ?`;

connection.query(selectSql, [articleData.title], (error, results) => {
  if (error) {
    console.error('Error checking existing record:', error);
    res.status(500).send('Error checking existing record');
    return;
  }

  if (results.length > 0) {
    // Record already exists
    console.log("Record already exists with title " + articleData.title);
    res.send("Record already exists with title " + articleData.title);
    return;
  }

  // Record does not exist, perform the INSERT operation
  const insertSql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

  connection.query(insertSql, values, (insertError, insertResults) => {
    if (insertError) {
      console.error('Error storing JSON data:', insertError);
      res.status(500).send('Error storing JSON data');
      return;
    }

    res.send('JSON data stored successfully!');
    console.log('Inserted ID:', insertResults.insertId);
  });
});
});

app.get('/api/getRelatedStories', (req, res) => {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'outlookrecengine'
  });

  connection.connect((error) => {
    if (error) {
      console.error('Error connecting to MySQL:', error);
      return;
    }

    console.log('Connected to MySQL database');

    const collectionID = 12;

    const selectRelatedStories = `SELECT relation_id FROM related_stories WHERE collection_id = ?`;
    // console.log(selectRelatedStories);
    // console.log("Checking for existing matches...");
    connection.query(selectRelatedStories, [collectionID], (error, results) => {
      // console.log(results);
      if (error) {
        console.error('Error checking existing matches:', error);
      }
      if (results.length > 0) {
        // Article has been matched before
        const relatedStories = JSON.parse(JSON.stringify(results));;
        // console.log(relatedStories);
        const relatedStoryIDs = [];
        for (let i = 0; i < relatedStories.length; i++) {
          relatedStoryIDs.push(relatedStories[i].relation_id);
        }
        console.log(relatedStoryIDs);

        const selectRelatedSlugs = `SELECT slug FROM articles where article_id = ?`;
        
        for (let i = 0; i < relatedStoryIDs.length; i++) {
          connection.query(selectRelatedSlugs, [relatedStoryIDs[i]], (slugError, slugResults) => {
            if (slugError) {
              console.error("Error checking related slugs:", slugError);
            }
            if (slugResults.length > 0) {
              const relatedSlugs = [];
              for (let i = 0; i < slugResults.length; i++) {
                relatedSlugs.push(JSON.parse(JSON.stringify(slugResults[i])));
              }
              console.log(relatedSlugs);
            }
          })
        }

      }
      else {
        // Article has not been matched yet

        // Get article tags
        selectArticleTags = `SELECT tag FROM articles WHERE article_id=?`;
        connection.query(selectArticleTags, [collectionID], (tagError, tagResults) => {
          if (tagError) {
            console.error("Error fetching article tags:", tagError);
          }
          if (tagResults) {
            // console.log("Tag Results:",tagResults);
            tags = String(JSON.parse(JSON.stringify(tagResults[0])).tag);
            tags = tags.split(",");
            // console.log(tags);

            selectSearchTags = `SELECT tag FROM articles WHERE article_id!=?`;
            connection.query(selectSearchTags, [collectionID], (searchTagError, searchTagResults) => {
              if (searchTagError) {
                console.error("Error fetching search tags:", searchTagError);
              }
              if (searchTagResults) {
                // console.log(searchTagResults);
                const searchTags = [];
                for (let i = 0; i < searchTagResults.length; i++) {
                  searchTags.push(String(JSON.parse(JSON.stringify(searchTagResults[i])).tag).split(","));
                }
                // console.log(searchTags);
                const jaccardIndex = [];
                for (let i = 0; i < searchTags.length; i++) {
                  jaccardIndex.push(100 * calculateJaccardIndex(tags, searchTags[i]));
                }
                console.log("Jaccard Index:", jaccardIndex);                
              }
            })
          }
        })

        selectArticleBody = `SELECT body FROM articles where article_id=?`;
        connection.query(selectArticleBody, [collectionID], (bodyError, bodyResults) => {
          if (bodyError) {
            console.error("Error fetching article body:", bodyError);
          }
          if (bodyResults) {
            // console.log("Article Body:", bodyResults);
            currentArticleBody = String(JSON.parse(JSON.stringify(bodyResults[0])).body);
            // console.log(("Article Body:", currentArticleBody));
            selectSearchBodies = `SELECT body from articles where article_id!=?`;
            connection.query(selectSearchBodies, [collectionID], (searchBodyError, searchBodyResults) => {
              if (searchBodyError) {
                console.error("Error fetching search bodies:", searchBodyError);
              }
              if (searchBodyResults) {
                const searchBodies = [];
                const tfIDFScores = [];
                for (let i = 0; i < 1; i++) {
                  searchBodies.push(String(JSON.parse(JSON.stringify(searchBodyResults[i])).body));
                  // console.log(searchBodies);
                }
                const similarityScore = calculateArticleSimilarity(currentArticleBody, searchBodies[0]);
                console.log('Similarity Score:', similarityScore);
              }
            })
          }
        })
      }
    })
  });

});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

// // Run the Python script when the app starts
// exec('content_tags.py', (error, stdout, stderr) => {
//   if (error) {
//     console.error(`Error executing Python script: ${error.message}`);
//     return;
//   }
//   if (stderr) {
//     console.error(`Python script stderr: ${stderr}`);
//     return;
//   }
//   console.log(`Python script output: ${stdout}`);
// });