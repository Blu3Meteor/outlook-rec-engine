// Retrieve the category object and article array from the cookie or initialize them if the cookie doesn't exist.
let category = getCookie('category');
let articles = getCookie('articles');

if (category) {
  // Access category properties as needed
  console.log(category);
}

if (articles) {
  // Access the articles array and iterate over its elements
  articles.forEach(function(article) {
    console.log(article);
  });
}


if (!category) {
  category = {
    national: 0,
    business: 0,
    crypto: 0,
    travel: 0,
    sports: 0,
    entertainment: 0
  };
}

if (!articles) {
  articles = [];
}

window.addEventListener('load', function() {
  // This callback function code will run whenever a new page or resource finishes loading.

  // Example: Log the URL of the newly opened page.
  let newPageURL = window.location.href;

  const testString = "https://www.outlookindia.com/national/equal-work-unequal-benefits-the-struggle-of-ad-hoc-teachers-for-permanence-and-dignity-news-288857"
  let newURLPaths = testString.split("/");

  // Split the URL to extract the category and article name.
  // let newURLPaths = newPageURL.split("/");
  let newPageCategory = newURLPaths[3];
  let newPageTitle = newURLPaths[4];

  // Increment the respective category count.
  switch (newPageCategory) {
    case "national":
      category.national++;
      break;

    case "business":
      category.business++;
      break;

    case "crypto":
      category.crypto++;
      break;

    case "travel":
      category.travel++;
      break;

    case "sports":
      category.sports++;
      break;

    case "art-entertainment":
      category.entertainment++;
      break;

    default:
      break;
  }

  // Add the new article name to the articles array.
  articles.push(newPageTitle);

  // Update the cookie with the updated category and article information.
  setCookie('category', JSON.stringify(category), 30);
  setCookie('articles', JSON.stringify(articles), 30);

  console.log(category);
  console.log(articles);
});

// Function to set a cookie
function setCookie(key, value, expirationDays) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + expirationDays);

  const cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; expires=${expirationDate.toUTCString()}; path=/`;
  document.cookie = cookieString;
}

// Function to retrieve a cookie and parse the value if it exists
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

