
initApp = function() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      uid = user.uid
      var email = user.email;
      var name = email.substring(0, email.lastIndexOf("@"));

      console.log(user);
      document.getElementById("username").innerHTML = `<a class="nav-link btn" href="index.html"><i class="far fa-user-circle"></i> ${name}</a>`
      //fetchTasks();
    } else {
      window.location.replace("login.html");
    }
  }, function(error) {
    console.log(error);
  });
};

window.addEventListener('load', function() {
  initApp()
});

function doLogout() {
  firebase.auth().signOut().then(() => {
      window.location.replace("login.html");
      // Sign-out successful.
  }).catch((error) => {
      alert(error.message)
      // An error happened.
  });
}

const task_submit = document.getElementById("task_submit");
const error_message = document.getElementById("error_message");
const success_message = document.getElementById("success_message");

$('#task_form').submit(function(evt) {
task_submit.innerHTML = `<button id="submit-button" type="button" class="btn btn-success btn-sm w-50 h-100" >Please wait <i class="fa fa-spinner fa-spin"></i></button>`
error_message.innerHTML = '';
success_message.innerHTML = '';

  // Target the form elements by their ids
  // And build the form object like this using jQuery:
  var formData = {
    "task_title": $('#task_title').val(),
    "datetimepicker": $('#datetimepicker').val(),
    "task_description": $('#task_description').val()
    //$("input[name=nameGoesHere]").val();
  }

  evt.preventDefault(); //Prevent the default form submit action

  console.log(formData);
  pushTask(formData.task_title, formData.datetimepicker, formData.task_description)
})

function pushTask(title, pending_date, description) {

const current_date = Date.now();

var newRef = firebase.database().ref('users').child(firebase.auth().currentUser.uid).child('tasks');
newRef.child(current_date).set({
    title: title,
    description: description,
    user_id: firebase.auth().currentUser.uid,
    task_timestamp: current_date,
    pending_date: pending_date,
    task_status: "Pending"
  }).then(() => {
    task_submit.innerHTML =   `<button type="submit" class="w-25 btn btn-sm btn-success">Submit</button>`
    success_message.innerHTML = 'You task has been submitted!';
    console.log("Document successfully written!");
  }).catch((error) => {
    error_message.innerHTML = error.error_message;
    console.error("Error writing document: ", error);
  });
}

setInterval(currentDateTime, 1000)

function currentDateTime() {
  var a = new Date();
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var nowHour = a.getHours();
      var nowMinutes = a.getMinutes();
      var sec = a.getSeconds();

    var suffix = nowHour >= 12 ? "PM" : "AM";
    nowHour = (suffix == "PM" & (nowHour > 12 & nowHour < 24)) ? (nowHour - 12) : nowHour;
    nowHour = nowHour == 0 ? 12 : nowHour;
    nowMinutes = nowMinutes < 10 ? "0" + nowMinutes : nowMinutes;
    var currentTime = date + ' ' + month + ' ' + year + ' - ' + nowHour + ":" + nowMinutes + ' ' + suffix;
            document.getElementById("live_time").innerHTML = `<p class="card-text border rounded border-primary text-primary p-1 d-inline-flex shadow-sm" >
            <small class="tag font-weight-bold">
              ${currentTime}
            </small>
          </p>`;
  return currentTime
}
