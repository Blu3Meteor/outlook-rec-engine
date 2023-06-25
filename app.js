const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');



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





  // handling scraping
  // const url = req.query.url;
  // const url = "https://www.outlookindia.com/national/manipur-s-peace-committee-an-exercise-in-futility-as-violence-continues-news-296425";

  // // Fetch the HTML from the provided URL
  // axios.get(url)
  //   .then(response => {
  //     const html = response.data;

  //     // Load the HTML into Cheerio
  //     const $ = cheerio.load(html);

  //     // Extract the desired data from the HTML
  //     const title = $('meta[property="og:title"]').attr('content');
  //     const description = $('meta[property="og:description"]').attr('content');
  //     const tags = [];
  //     // Extract the article:tag properties
  //     $('meta[property="article:tag"]').each((index, element) => {
  //       const tag = $(element).attr('content');
  //       tags.push(tag);
  //     });
  //     const summary = $('p.story-summary').text().trim();
  //     // Extract the JSON-LD script containing the article data
  //     const script = $('script[type="application/ld+json"]').html();
  //     // Parse the JSON data
  //     const jsonData = JSON.parse(script);
  //     // Extract the articleBody from the JSON data
  //     const articleBody = jsonData.articleBody;
  //     const publish_date = $('meta[property="article:published_time"]').attr('content');
  //     const update_date = $('meta[property="article:modified_time"]').attr('content');
  //     const author = jsonData.author;
  //     const category = $('meta[property="article:section"]').attr('content');
  //     const subcategory = "subcategory";
  //     const slug = url.parse(url).pathname.split('/').pop();
  //     const client_id = clientID;
  //     const user_id = req.cookies.user_id

  //     let articleData = {
  //       title,
  //       description,
  //       tags,
  //       summary,
  //       articleBody,
  //       publish_date,
  //       update_date,
  //       author,
  //       category,
  //       subcategory,
  //       slug,
  //       client_id,
  //       user_id
  //     };

  //     console.log(articleData);

  //     // Send the articleData JSON to your API using axios or any other HTTP client library
  //     axios.post('http://localhost:3000/api/insertArticle', articleData)
  //       .then(apiResponse => {
  //         console.log(apiResponse.data);
  //         res.send('Data scraped and sent to API');
  //       })
  //       .catch(error => {
  //         console.error('Error sending data to API:', error);
  //         res.status(500).send('Error sending data to API');
  //       });
  //   })
  //   .catch(error => {
  //     console.error('Error fetching HTML:', error);
  //     res.status(500).send('Error fetching HTML');
  //   });


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


})


app.listen(3000, () => {
  console.log('Server started on port 3000');
});







