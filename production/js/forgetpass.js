const send_div = document.getElementById("send_div");
const err = document.getElementById("error-message");
const success_msg = document.getElementById("form_content")

$('#sendResetPass-form').submit(function(evt) {
    send_div.innerHTML = `<button style="width: 40%;" id="submit-button" type="submit" class="btn btn-success btn-md" >Sending <i class="fa fa-spinner fa-spin"></i></button>`
    
    // Target the form elements by their ids
    // And build the form object like this using jQuery:
    var formData = {
      "login_email": $('#login_email').val()
    }

    evt.preventDefault(); //Prevent the default form submit action

    console.log(formData);
    send(formData.login_email)
})


function send(emailAddress) {
    firebase.auth().sendPasswordResetEmail(emailAddress).then(function () {   
        success_msg.innerHTML = `<div class="mt-2 mb-2 fade-in">                 
                                    <h5 align="left" class="col-form-label col-form-label-md pt-3"><i class="fas fa-check-circle text-success"></i> An email has been sent to you with instructions on how to reset your password.</h5>
                                    <div align="right" class="pt-2" style="width: 100%;">
                                        <button style="width: 40%;" type="button" class="btn btn-success btn-md" onclick="redirect()">OK <i class='fas fa-location-arrow'></i></button>
                                    </div>
                                </div>`

        console.log("Email sent");// Email sent.
    }).catch(function (error) {
        err.innerHTML = error.message;
        send_div.innerHTML = `<button style="width: 40%;" id="submit-button" type="submit" class="btn btn-success btn-md" >Send <i class="far fa-paper-plane"></i></button>`
        console.log(error);
    });
}

function redirect() {
    window.location.replace("login.html");
}