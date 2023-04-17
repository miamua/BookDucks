///----LOGIN-----
let loginIdentifier = document.querySelector("#identifier");
let loginPass = document.querySelector("#login-password");
let login = async () => {
  let response = await axios.post("http://localhost:1447/api/auth/local", {
    identifier: loginIdentifier.value,
    password: loginPass.value,
  })
  .then((response) => {
    sessionStorage.setItem("token", response.data.jwt);
    sessionStorage.setItem("userId", response.data.user.id);
    window.location.href = "./index.html";
  })
  .catch((error) => {
    if (error.response) {
      //status code out of the range of 2xx
      console.log(error.response.data);
      alert(`${error.response.data.error.message}, Plase try again.`);
    } else if (error.request) {
      //The request was made but no response was received
      console.log(error.request);
    } else {
      //Error on setting up the request
      console.log("Error", error.message);
    }
  });
};

///----REGISTER-----
let username = document.querySelector("#username");
let email = document.querySelector("#email");
let regisPassword = document.querySelector("#regis-password");
let register = async () => {
  let response = await axios
    .post("http://localhost:1447/api/auth/local/register", {
      username: username.value,
      email: email.value,
      password: regisPassword.value,
    })
    .then((response) => {
      alert("User has been created! Please login :)");
      window.location.href = "./login.html";
    })
    .catch((error) => {
      if (error.response) {
        //status code out of the range of 2xx
        console.log(error.response.data);
        alert(`${error.response.data.error.message}, Plase try again.`);
      } else if (error.request) {
        //The request was made but no response was received
        console.log(error.request);
      } else {
        //Error on setting up the request
        console.log("Error", error.message);
      }
    });
};

///----LOGOUT-----
let logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("userId");
  window.location.href = "./index.html";
};
