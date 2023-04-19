let booksList = document.querySelector(".booksContainer");
let renderPage = async () => {
  let disableVoting = true;
  let disabledBookMark = "none";
  booksList.innerHTML = "";
  let userBooks = [];
  if (sessionStorage.getItem("token")) {
    let response = await axios.get(
      "http://localhost:1447/api/users/me?populate=*",
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    document.querySelector(".logoutLink").classList.remove("hidden");
    document.querySelector(".userProfiletLink").classList.remove("hidden");
    document.querySelector(".loginLink").classList.add("hidden");
    document.querySelector(".registerLink").classList.add("hidden");
    document.querySelector(".welcome").classList.remove("hidden");
    document.querySelector("#siteDesc").classList.add("hidden");
    disableVoting = false;
    disabledBookMark = "inherit";
    let loggedInUsername = response.data.username;
    document.querySelector("#loggedInUsername").innerText =
      loggedInUsername.charAt(0).toUpperCase() + loggedInUsername.slice(1);
    userBooks = response.data.book;
    console.log(response);
    console.log(userBooks);
  }

  let response = await axios.get("http://localhost:1447/api/books?populate=*");
  console.log(response.data.data);
  let books = response.data.data;

  books.forEach((book) => {
    let bookDiv = document.createElement("div");
    bookDiv.setAttribute("class", "bookDiv");
    let imageDiv = document.createElement("div");
    imageDiv.setAttribute("class", "imgDiv");
    let ratingDiv = document.createElement("div");
    ratingDiv.setAttribute("class", "ratingDiv");
    let bookInfoDiv = document.createElement("div");
    bookInfoDiv.setAttribute("class", "bookInfoDiv");
    let ratingScore = document.createElement("p");
    ratingScore.innerText = `(${book.attributes.rating})`;
    let bookMarkBox = document.createElement("input");
    let labelForBookMark = document.createElement("label");
    labelForBookMark.setAttribute("class", "labelForBookMark");
    let bookMark = document.createElement("i");
    bookMark.setAttribute("class", "fa-regular fa-bookmark");
    bookMarkBox.setAttribute("type", "checkbox");
    labelForBookMark.append(bookMarkBox, bookMark);
    let starsDiv = document.createElement("div");
    starsDiv.setAttribute("class", "starsDiv");

    let bookRatings = Number(book.attributes.rating);
    for (let i = 1; i <= 5; i++) {
      let star = document.createElement("i");
      let labelForStars = document.createElement("label");
      let votingStars = document.createElement("input");
      if (i <= bookRatings) {
        star.setAttribute("class", "fa fa-star checked");
      } else {
        star.setAttribute("class", "fa-regular fa-star");
        star.style.color = "#ffa600";
      }

      votingStars.setAttribute("type", "radio");
      votingStars.setAttribute("class", "votingStars");
      votingStars.setAttribute("name", `${book.id}`);
      votingStars.setAttribute("value", i);
      votingStars.disabled = disableVoting;
      labelForBookMark.style.display = disabledBookMark;

      let votes = Number(book.attributes.votes);
      let totalScore = Number(book.attributes.totalScore);
      let avgScore = 0;
      votingStars.addEventListener("change", async () => {
        votes += 1;
        totalScore += Number(votingStars.value);
        avgScore = totalScore / votes;
        let roundavgScore = avgScore.toFixed(2);
        //console.log("total", totalScore);
        //console.log("starValue", Number(votingStars.value));
        //console.log("votes", votes);
        //console.log("avg", roundavgScore);
        bookRating(votingStars.name, roundavgScore, votes, totalScore);

        let response = await axios.get(
          `http://localhost:1447/api/users/${sessionStorage.getItem(
            "userId"
          )}?populate=*`
        );
        console.log(response);
        if (response.data.user_rating == null) {
          createUsersRating(votingStars.name, votingStars.value);
        } else {
          addToUsersRating(votingStars.name);
        }
      });

      //BOOKMARK STUFF
      if (userBooks.find((item) => item.title === book.attributes.title)) {
        bookMark.setAttribute("class", "fa-solid fa-bookmark");
        bookMarkBox.checked = true;
      }

      labelForStars.append(votingStars, star);
      starsDiv.append(labelForStars);
      ratingDiv.append(starsDiv, ratingScore);
    }

    imageDiv.innerHTML = `<img src="http://localhost:1447${book.attributes.image.data.attributes.url}" height="250" />`;
    bookInfoDiv.innerHTML = `<p><b>${book.attributes.title} </b></p>
    <p class="info"><b>Description:</b> ${book.attributes.description}</p>
    <p class="info"><b>Author:</b> ${book.attributes.author}</p>
    <p class="info"><b>Print length:</b> ${book.attributes.pages}  pages.</p>
    <p class="info"><b>Publication date:</b> ${book.attributes.publication_date}</p>`;
    bookInfoDiv.prepend(ratingDiv);
    bookDiv.prepend(labelForBookMark, imageDiv, bookInfoDiv);
    booksList.append(bookDiv);

    //BOOKMARK BTN
    bookMarkBox.addEventListener("change", () => {
      if (bookMarkBox.checked) {
        bookMark.setAttribute("class", "fa-solid fa-bookmark");
        addToReadingList(book.id);
        console.log("added!");
      } else {
        bookMark.setAttribute("class", "fa-regular fa-bookmark");
        removeFromReadingList(book.id);
        console.log("removed!");
      }

      console.log(bookMarkBox.checked);
    });
  });
};

///ADD TO READING LIST
let addToReadingList = async (bookId) => {
  let response = await axios.put(
    `http://localhost:1447/api/books/${bookId}`,
    {
      data: {
        user: {
          connect: [sessionStorage.getItem("userId")],
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  console.log(response);
};

///REMOVE FROM READING LIST
let removeFromReadingList = async (bookId) => {
  let response = await axios.put(
    `http://localhost:1447/api/books/${bookId}`,
    {
      data: {
        user: {
          disconnect: [sessionStorage.getItem("userId")],
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  console.log(response);
};

///----RATING-----
let bookRating = async (id, avgScore, votes, totalScore) => {
  let response = await axios.put(
    `http://localhost:1447/api/books/${id}`,
    {
      data: {
        votes: votes,
        rating: avgScore,
        totalScore: totalScore,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  renderPage();
};

let createUsersRating = async (bookId) => {
  let response = await axios.post(
    `http://localhost:1447/api/ratings`,
    {
      data: {
        user: {
          connect: [sessionStorage.getItem("userId")],
        },
        books: {
          connect: [bookId],
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  console.log(response);
};

let addToUsersRating = async (bookId) => {
  let usersResponse = await axios.get(
    `http://localhost:1447/api/users/${sessionStorage.getItem(
      "userId"
    )}?populate=*`
  );
  let userRatingId = await usersResponse.data.user_rating.id;
  let response = await axios.put(
    `http://localhost:1447/api/ratings/${userRatingId}`,
    {
      data: {
        books: {
          connect: [bookId],
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }
  );
  console.log(response);
};

let applyTheme = async () => {
  let response = await axios.get("http://localhost:1447/api/startpage");
  let theme = response.data.data.attributes.theme;
  //console.log(theme);
  document.body.classList.add(theme);
  document.querySelector("header").classList.add(theme);
  document.querySelector("footer").classList.add(theme);
  document.querySelector(".loginForm").classList.add(theme);
  document.querySelector(".header").classList.add(theme);
  document.querySelector(".footer").classList.add(theme);
  document.querySelector(".playStore").classList.add(theme);
  document.querySelector(".appStore").classList.add(theme);
  if (theme === "navy") {
    document.querySelector(".header").setAttribute("src", "./img/logo_darkmode.png");
    document.querySelector(".footer").setAttribute("src", "./img/logo_darkmode.png");
    document.querySelector(".playStore").setAttribute("src", "./img/Play_Store_Dark.png");
    document.querySelector(".appStore").setAttribute("src", "./img/App_Store_Dark.png");
  }else if (theme === "pink") {
    document.querySelector(".header").setAttribute("src", "./img/logo_pink.png");
    document.querySelector(".footer").setAttribute("src", "./img/logo_pink.png");
    document.querySelector(".playStore").setAttribute("src", "./img/Play_Store_pink.png");
    document.querySelector(".appStore").setAttribute("src", "./img/App_Store_pink.png");
    document.querySelector(".bigDuck").setAttribute("src", "./img/pinkduck.png");

  }
};

applyTheme();
renderPage();
