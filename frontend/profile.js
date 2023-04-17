let userInfo = async () => {
  let response = await axios.get(
    "http://localhost:1447/api/users/me?populate=*",
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  let loggedInUsername = response.data.username;
  document.querySelector("#loggedInUsername").innerText =
    loggedInUsername.charAt(0).toUpperCase() + loggedInUsername.slice(1);

  document.querySelector("#loggedInEmail").innerText = response.data.email;
};

let usersVotedList = async () => {
  document.querySelector(".ratingUl").innerHTML = "";
  let sort = document.querySelector(".sorting2").value;
  let usersResponse = await axios.get(
    `http://localhost:1447/api/users/${sessionStorage.getItem(
      "userId"
    )}?populate=*`
  );
  if (usersResponse.data.user_rating == null) {
    console.log("no vote");
  } else {
    let userRatingId = await usersResponse.data.user_rating.id;
    let response = await axios.get(
      `http://localhost:1447/api/ratings/${userRatingId}?populate=*`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    let usersBooks = response.data.data.attributes.books.data;
    //console.log(usersBooks);
    if (sort === "Rating") {
      usersBooks.sort((a, b) => b.attributes.rating - a.attributes.rating);
    } else if (sort === "Author") {
      usersBooks.sort((a, b) =>
        a.attributes.author.localeCompare(b.attributes.author)
      );
    } else if (sort === "Title") {
      usersBooks.sort((a, b) =>
        a.attributes.title.localeCompare(b.attributes.title)
      );
    }

    usersBooks.forEach(async (book) => {
      let response = await axios.get(
        `http://localhost:1447/api/books/${book.id}?populate=*`
      );
      //console.log(response);
      let bookDiv = document.createElement("div");
      bookDiv.setAttribute("class", "bookDiv");
      let bookInfo = document.createElement("li");
      let imgDiv = document.createElement("div");
      imgDiv.setAttribute("class", "bookImgDiv");
      imgDiv.innerHTML = `<img src="http://localhost:1447${response.data.data.attributes.image.data.attributes.url}" height="200" />`;
      bookInfo.innerHTML = `<span class="title">${book.attributes.title}</span> <span class="rating">(${book.attributes.rating})</span><br>
    <span class="author">${book.attributes.author}</span>`;
      bookDiv.prepend(imgDiv, bookInfo);
      document.querySelector(".ratingUl").append(bookDiv);
    });
  }
};

let usersReadingList = async () => {
  document.querySelector(".readingUl").innerHTML = "";
  let sort = document.querySelector(".sorting1").value;
  let response = await axios.get(
    `http://localhost:1447/api/users/${sessionStorage.getItem(
      "userId"
    )}?populate=*`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );

  //console.log(response.data.book);
  let usersBooks = response.data.book;
  if (usersBooks == 0) {
    console.log("no books");
  } else {
    if (sort === "Rating") {
      usersBooks.sort((a, b) => b.rating - a.rating);
    } else if (sort === "Author") {
      usersBooks.sort((a, b) => a.author.localeCompare(b.author));
    } else if (sort === "Title") {
      usersBooks.sort((a, b) => a.title.localeCompare(b.title));
    }
  }

  usersBooks.forEach(async (book) => {
    let response = await axios.get(
      `http://localhost:1447/api/books/${book.id}?populate=*`
    );
    //console.log(response);
    let bookDiv = document.createElement("div");
    bookDiv.setAttribute("class", "bookDiv");
    let removeBtn = document.createElement("button");
    removeBtn.innerText = "Remove";
    removeBtn.setAttribute("class", "removeBtn");
    let bookInfo = document.createElement("li");
    let imgDiv = document.createElement("div");
    imgDiv.setAttribute("class", "bookImgDiv");
    imgDiv.innerHTML = `<img src="http://localhost:1447${response.data.data.attributes.image.data.attributes.url}" height="200" />`;
    bookInfo.innerHTML = `<span class="title">${book.title}</span> <span class="rating">(${book.rating})</span><br>
    ${book.author}`;
    bookDiv.prepend(removeBtn,imgDiv, bookInfo);
    document.querySelector(".readingUl").append(bookDiv);


    removeBtn.addEventListener("click", async() => {
       await removeFromReadingList(book.id);
       window.location.reload();
    }
    );
  });
};

document.querySelector(".sorting1").addEventListener("change", () => {
  usersReadingList();
});

document.querySelector(".sorting2").addEventListener("change", () => {
  usersVotedList();
});

userInfo();
usersReadingList();
usersVotedList();
