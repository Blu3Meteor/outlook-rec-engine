// Retrieve the category object and article array from the cookie or initialize them if the cookie doesn't exist.
// let category = getCookie('category');
// let articles = getCookie('articles');

let user_id = "@userID";
let client_id = "@clientID"
console.log(user_id,"user_id");
let temp_user = getCookie('user_id');
console.log(temp_user,"temp_user");
if (temp_user){
  user_id=temp_user
}else{
  setCookie('user_id',user_id,30);
}
console.log(user_id,"final user_id");

const title = document.getElementsByTagName("title")[0].innerHTML;
// console.log("Page title: ", title.innerHTML);

const description = document.querySelector('meta[name="description"]').getAttribute('content');
// console.log("Description: ", description);

const articleTagMetaTags = document.querySelectorAll('meta[property="article:tag"]');
let tagArray = Array.from(articleTagMetaTags).map(tagMetaTag => tagMetaTag.getAttribute('content'));
// Convert 'tags' array to JSON string
tag = "";
for (let i = 0; i < tagArray.length; i++) {
  tag += tagArray[i] + ", ";
}
// tag = JSON.stringify(tag);
console.log("Tags :", tag);


const summary = document.querySelector('.story-summary').textContent.trim();
// console.log("Summary: ", summary);



let body;
let publish_date;
let update_date;
let author;
const scriptElements = document.querySelectorAll('script[type="application/ld+json"]');
for (const scriptElement of scriptElements) {
  const jsonLD = JSON.parse(scriptElement.textContent);
  if (jsonLD.articleBody) {
    body = jsonLD.articleBody;
    // console.log("Article Body: ",articleBody);
    publish_date = jsonLD.datePublished;
    console.log("Published: ", publish_date);
    update_date = jsonLD.dateModified;
    // console.log("Modified: ", update_date);
    author = jsonLD.author[0].name;
    // console.log("Author: ", author);
  }
}

publish_date = new Date(publish_date).toISOString();
update_date = new Date(update_date).toISOString();



const category = document.querySelector('meta[property="article:section"]').getAttribute('content');
// console.log("Category: ", category);


const url = window.location.href;
const urlParts = url.split('/');
const slug = urlParts[urlParts.length - 1];
// console.log("Slug: ", slug);

// console.log("Current Client: ", client_id);


let articleData = {
  title,
  description,
  tag,
  summary,
  body,
  publish_date,
  update_date,
  author,
  category,
  slug,
  client_id,
  user_id
};

console.log("Article Data:", articleData);


// Send the articleData JSON to insert article API
const apiUrl = 'http://localhost:3000/api/insertArticle';

fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(articleData),
})
  .then(response => response)
  .then(data => {
    console.log('Article data sent successfully:', data);
  })
  .catch(error => {
    console.error('Error sending article data:', error);
  });

function setCookie(key, value, expirationDays) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + expirationDays);

  const cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; expires=${expirationDate.toUTCString()}; path=/`;
  document.cookie = cookieString;
}

function getCookie(key) {
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();

    if (cookie.startsWith(`${encodeURIComponent(key)}=`)) {
      const cookieValue = decodeURIComponent(cookie.substring(key.length + 1));
      
      // Parse the JSON value if it exists, or return the value as is
      try {
        return JSON.parse(cookieValue);
      } catch (error) {
        return cookieValue;
      }
    }
  }

  return null;
}