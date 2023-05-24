# outlook-rec-engine

Here's a summary of the functionality of the code:

1. It retrieves the category and articles cookies using the getCookie() function.
2. It checks if the category and articles cookies exist.
3. If the cookies exist, it logs the category object and iterates over the articles array to log each article.
4. If the cookies don't exist, it initializes the category object with default values and sets the articles array as empty.
5. It listens to the load event, which triggers whenever a new page or resource finishes loading.
6. It extracts the category and article name from the URL.
7. It increments the respective category count based on the new page category.
8. It adds the new article name to the articles array.
9. It updates the category and articles cookies with the updated data using the setCookie() function.
10. It logs the updated category object and articles array.
