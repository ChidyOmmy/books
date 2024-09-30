# Books app api documentation

`http://locahost:8000/` This endpoint accepts a `GET` request and returns an object with a `users` key with all users in an array like so.

```
{
  "users": [
    {
      "_id": "66f7391424d7943bc06acfe0",
      "username": "chidy",
      "likedBooks": [
        "66f7396b24d7943bc06acfe5"
      ],
      "favorites": [
        "66f7396b24d7943bc06acfe5"
      ]
    }
  ]
}
```

`http://localhost:8000/register` this endpoint accepts a `POST` request, content type of JSON and a body of username, password keys.

```
POST http://localhost:8000/register
Content-Type: application/json

{
    "username": "chidy",
     "password": "ommy"
}
```

If a username already exists it will return a 404 status and an error

```
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 40
ETag: W/"28-rWgO+ZERy9gi43ELxhD6dS3CqEM"
Date: Mon, 30 Sep 2024 21:17:06 GMT
Connection: keep-alive
keep-alive: timeout=5

{
  "error": "username chidy already exist"
}
```

If a field is missing it will return a 400 Bad Request status and a message

```
POST http://localhost:8000/register
Content-Type: application/json

{
    "username": "chidy"
}
```

```
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 41
ETag: W/"29-EVSHiaQomgaTVwVmkSJO7VzMeqo"
Date: Mon, 30 Sep 2024 21:23:08 GMT
Connection: keep-alive
keep-alive: timeout=5

{
  "message": "Fill in all required fields"
}
```

`http://localhost:8000/login` This endpoint accepts a POST request and will return the same response as `/register` if a required field is not provided and a 200 status if login successfull and returns authentication tokens which maybe stored inside localStorage, a cookie or in context API.

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 500
ETag: W/"1f4-iLASx27NBgWbaLIrHzNr+zoA24s"
Date: Mon, 30 Sep 2024 21:29:02 GMT
Connection: keep-alive
keep-alive: timeout=5

{
  "message": "Logged in",
  "user": {
    "id": "66f7391424d7943bc06acfe0",
    "username": "chidy"
  },
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZjczOTE0MjRkNzk0M2JjMDZhY2ZlMCIsInVzZXJuYW1lIjoiY2hpZHkiLCJpYXQiOjE3Mjc3MzE3NDIsImV4cCI6MTcyNzczMTc4Mn0.2O_fFGAc0Gyn8cplG_wGa6Gr3Jb-jnixL1GPN21sGvs",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZjczOTE0MjRkNzk0M2JjMDZhY2ZlMCIsInVzZXJuYW1lIjoiY2hpZHkiLCJpYXQiOjE3Mjc3MzE3NDIsImV4cCI6MTcyNzczMTgwMn0.gzr9QJ7QN95rzjA5RDxI_YEC3Mj746tIeKOVt9J2YF4"
}
```

`GET http://localhost:8000/refresh` This endpoint is for refreshing authentication token before they expire. It returns new authentication tokens if the available ones are valid and haven't expired yet. The refresh token has to be passed within the Authorization header and if all fails the user will have to login again for new authentication tokens.

```
GET http://localhost:8000/refresh HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZjcxNTcyMWVlNzEzMTNlODlmMDI3ZSIsInVzZXJuYW1lIjoibWltaSIsImlhdCI6MTcyNzQ2OTAwMiwiZXhwIjoxNzI3NDY5MDYyfQ.MGnepOFnt1jqQFDdfsxFPY6qTBshqMd732dMWtno6e8
```

`GET http://localhost:8000/books?limit=5` This endpoint returns books sorted by those eith the most likes and by default returns 10 books unless limit query is provided with any number of books, e.g `&limit=20`

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 820
ETag: W/"334-rwMwOlPwtUogHEPwYSdLljLUQeY"
Date: Mon, 30 Sep 2024 21:44:33 GMT
Connection: keep-alive
keep-alive: timeout=5

{
  "books": [
    {
      "_id": "66f7396b24d7943bc06acfe5",
      "title": "House",
      "cover": "images/1727478121666.7175.png",
      "authors": [
        "66f7391424d7943bc06acfe0"
      ],
      "likeCount": 1,
      "commentsCount": 0
    },
    {
      "_id": "66f73c6924d7943bc06acfe9",
      "title": "House",
      "cover": "images/1727478888322.058.png",
      "authors": [
        "66f7391424d7943bc06acfe0"
      ],
      "likeCount": 0,
      "commentsCount": 0
    },
    {
      "_id": "66f73ca324d7943bc06acfef",
      "title": "Star",
      "cover": "images/1727478946842.9902.png",
      "authors": [
        "66f7391424d7943bc06acfe0"
      ],
      "likeCount": 0,
      "commentsCount": 3
    },
    {
      "_id": "66f75f0af40d862585783a6b",
      "title": "Moon",
      "cover": "images/1727487753477.9624.png",
      "authors": [
        "66f7391424d7943bc06acfe0"
      ],
      "likeCount": 0,
      "commentsCount": 0
    },
    {
      "_id": "66f75f18f40d862585783a71",
      "title": "Jupiter",
      "cover": "images/1727487767260.6658.png",
      "authors": [
        "66f7391424d7943bc06acfe0"
      ],
      "likeCount": 0,
      "commentsCount": 0
    }
  ]
}
```

`POST http://localhost:8000/books/create` This endpoint creates a book and only accept an authenticated user and adds them as the first author of the book. The body accepts an image as the book `cover`, `title` for the book and `authorID` which is the authenticated user ID

```
POST http://localhost:8000/books/create
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
Accept: application/json

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="title"

Pluto
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="authorId"

66f7391424d7943bc06acfe0
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="cover"; filename="file.png"
Content-Type: image/png

< ./utils/file.png
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

`PUT http://localhost:8000/books/add-authors ` This endpoint requires a `bookID` and authors which can be a string of the user ID or an array of users ids, which will then be added as authors of the book

```
PUT http://localhost:8000/books/add-authors
Content-Type: application/json

{
    "bookId": "66f7396b24d7943bc06acfe5",
    "authors": ["66f7391424d7943bc06acfe0"]
}
```

`
GET http://localhost:8000/books/:id` This is a dynamic ednpoint where `:id` can be any book's id, such as `GET http://localhost:8000/books/66f73ca324d7943bc06acfef` and will return the requested book

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 371
ETag: W/"173-3rt6Jq4Ite4eFgoEZVLqi+v2cLM"
Date: Mon, 30 Sep 2024 21:56:03 GMT
Connection: keep-alive
keep-alive: timeout=5

{
  "book": {
    "_id": "66f73ca324d7943bc06acfef",
    "title": "Star",
    "cover": "images/1727478946842.9902.png",
    "authors": [
      {
        "_id": "66f7391424d7943bc06acfe0",
        "username": "chidy"
      }
    ],
    "likes": [],
    "comments": [
      {
        "_id": "66f73cfb24d7943bc06acff7",
        "text": "first comment"
      },
      {
        "_id": "66f73fe524d7943bc06acffd",
        "text": "first comment"
      },
      {
        "_id": "66f747c9606ab84e93ecacdf",
        "text": "second comment"
      }
    ],
    "__v": 4
  }
}
```

`POST http://localhost:8000/books/:id/like ` This will toggle the book into the user's liked books

```
POST http://localhost:8000/books/66f7396b24d7943bc06acfe5/like
Content-Type: application/json

{
    "userId": "66f7391424d7943bc06acfe0"
}
```

```
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 230
ETag: W/"e6-doIxPNgYa/kqQbXsI7942rgnyIM"
Date: Mon, 30 Sep 2024 21:59:23 GMT
Connection: keep-alive
keep-alive: timeout=5

{
  "message": "added to liked books",
  "book": {
    "_id": "66f7396b24d7943bc06acfe5",
    "title": "House",
    "cover": "images/1727478121666.7175.png",
    "authors": [
      "66f7391424d7943bc06acfe0"
    ],
    "likes": [
      "66f7391424d7943bc06acfe0"
    ],
    "comments": [],
    "__v": 9
  }
}
```

`POST http://localhost:8000/books/:id/favorite ` This will add the book into the user's favorite books

```
POST http://localhost:8000/books/66f7396b24d7943bc06acfe5/favorite
Content-Type: application/json

{
    "userId": "66f7391424d7943bc06acfe0"
}
```

```
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 191
ETag: W/"bf-4mk9ZGVLp1BtUdEpTHd/rfwCu7Y"
Date: Mon, 30 Sep 2024 22:02:06 GMT
Connection: keep-alive
keep-alive: timeout=5

{
  "message": "added  book to favorites",
  "user": {
    "_id": "66f7391424d7943bc06acfe0",
    "username": "chidy",
    "likedBooks": [
      "66f7396b24d7943bc06acfe5"
    ],
    "favorites": [
      "66f7396b24d7943bc06acfe5"
    ],
    "__v": 11
  }
}
```

`POST http://localhost:8000/books/:id/comment` This will add a comment to the book

```
POST http://localhost:8000/books/66f73ca324d7943bc06acfef/comment
Content-Type: application/json

{
    "userId": "66f7391424d7943bc06acfe0",
    "text": "new comment"
}
```

```
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 177
ETag: W/"b1-ZuILsI7Jf74ml2nPCoZCQCbbKMM"
Date: Mon, 30 Sep 2024 22:03:49 GMT
Connection: keep-alive
keep-alive: timeout=5

{
  "message": "comment added to book",
  "comment": {
    "user": "66f7391424d7943bc06acfe0",
    "book": "66f73ca324d7943bc06acfef",
    "text": "new comment",
    "_id": "66fb204566c762e1f35713e1",
    "__v": 0
  }
}

```
