// test if already logged in
fetch("/token", {
  method: "GET",
  credentials: "include",
  redirect: "manual",
})
  .then((res) => {
    if (res.status != 200) throw res.status;
    window.location.href = `${window.location}dashboard`;
  })
  .catch((err) => {});

window.addEventListener("load", () => {
  const loginForm = document.getElementById("login-form");
  const passwordField = document.getElementById("password");
  const errorMessage = document.getElementById("error-message");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      password: passwordField.value,
    };

    fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    })
      .then(async (res) => {
        if (res.status != 200) throw res.status;
        window.location.href = `${window.location}dashboard`;
      })
      .catch((err) => {
        switch (err) {
          case 401:
            errorMessage.innerText = "Invalid password.";
            break;
          case 418:
            errorMessage.innerText = "That doesn't work big brain boi.";
            break;
          default:
            errorMessage.innerText = "Something went wrong, try again later.";
            break;
        }
        errorMessage.style.display = "block";
      });
  });

  passwordField.addEventListener("keypress", () => {
    HideErrorMessage();
  });

  function HideErrorMessage() {
    errorMessage.style.display = "";
    errorMessage.innerText = "";
  }
});
