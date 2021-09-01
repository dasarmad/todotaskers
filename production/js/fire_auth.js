const err = document.getElementById("err")

function redirectTo(params) {
    window.location.href = params
}

const login_div = document.getElementById("login_div");
$('#login-form').submit(function(evt) {
    login_div.innerHTML = `<button id="submit-button" type="button" class="btn btn-success btn-md w-100 h-100" >Logging-in <i class="fa fa-spinner fa-spin"></i></button>`
    
    // Target the form elements by their ids
    // And build the form object like this using jQuery:
    var formData = {
      "login_email": $('#login_email').val(),
      "login_password": $('#login_password').val()
      //$("input[name=nameGoesHere]").val();
    }

    evt.preventDefault(); //Prevent the default form submit action

    console.log(formData);
    doSignIn(formData.login_email, formData.login_password)
})

function doSignIn(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        redirectTo("index.html")
        // ...
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        err.innerHTML = errorMessage;
        login_div.innerHTML = `<button  id="submit-button" type="submit" class="btn btn-success btn-md w-100 h-100" >Next <i class="fas fa-arrow-right"></i></button>`
    
    });
}


const register_div = document.getElementById("register_div");
$('#register-form').submit(function(evt) {
    register_div.innerHTML = `<button id="submit-button" type="button" class="btn btn-success btn-md w-100 h-100" >Logging-in <i class="fa fa-spinner fa-spin"></i></button>`
    
    // Target the form elements by their ids
    // And build the form object like this using jQuery:
    var formData = {
      "login_email": $('#login_email').val(),
      "login_password": $('#login_password').val()
    }

    evt.preventDefault(); //Prevent the default form submit action

    console.log(formData);
    doSignUp(formData.login_email, formData.login_password)
})

function doSignUp(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Signed in 
    var user = userCredential.user;
    redirectTo("account-status.html")
    // ...
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    err.innerHTML = errorMessage
    register_div.innerHTML = `<button  id="submit-button" type="submit" class="btn btn-success btn-md w-100 h-100" >Next <i class="fas fa-arrow-right"></i></button>`
    // ..
  });
}