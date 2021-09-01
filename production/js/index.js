
initApp = function() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $("body").fadeIn(500);
        uid = user.uid
        var email = user.email;
        var name = email.substring(0, email.lastIndexOf("@"));

        console.log(user);
        document.getElementById("username").innerHTML = `<a class="nav-link btn" href="index.html"><i class="far fa-user-circle"></i> ${name}</a>`
        fetchTasks();
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

new ClipboardJS('.btn');

const task_submit = document.getElementById("task_submit");

const task_submit_update = document.getElementById("task_submit_update");


const error_message = document.getElementById("error_message");
const success_message = document.getElementById("success_message");

const error_message_update = document.getElementById("error_message_update");
const success_message_update = document.getElementById("success_message_update");



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
  

  var random = makeid(10)

  var a = new Date(pending_date);
  console.log(a);
  var t_stamp = a.getTime()
  var task_deadline = t_stamp+'-'+random;


  var newRef = firebase.database().ref('users').child(firebase.auth().currentUser.uid).child('tasks');
  newRef.child(task_deadline).set({
      title: title,
      description: description,
      user_id: firebase.auth().currentUser.uid,
      task_timestamp: task_deadline,
      pending_date: pending_date,
      task_status: "Pending",
      t_stamp: t_stamp
    }).then(() => {

      task_submit.innerHTML =   `<button type="submit" class="w-25 btn btn-sm btn-success">Submit</button>`
      success_message.innerHTML = 'You task has been submitted!';
      console.log("Document successfully written!");
      document.getElementById("task_form").reset();
      error_message.innerHTML = '';
      success_message.innerHTML = '';

    }).catch((error) => {
      error_message.innerHTML = error.error_message;
      console.error("Error writing document: ", error);
    });
  }
  


$('#task_form_update').submit(function(evt) {
task_submit_update.innerHTML = `<button id="submit-button" type="button" class="btn btn-success btn-sm w-50 h-100" >Please wait <i class="fa fa-spinner fa-spin"></i></button>`
error_message_update.innerHTML = '';
success_message_update.innerHTML = '';

  // Target the form elements by their ids
  // And build the form object like this using jQuery:
  var formData = {
    "task_key": $('#task_key_update').val(),
    "task_title": $('#task_title_update').val(),
    "datetimepicker": $('#datetimepicker_update').val(),
    "task_description": $('#task_description_update').val()
    //$("input[name=nameGoesHere]").val();
  }

  evt.preventDefault(); //Prevent the default form submit action

  console.log(formData);
  pushTask_update(formData.task_key, formData.task_title, formData.datetimepicker, formData.task_description)
})

function pushTask_update(key , title, pending_date, description) {

  const current_date = Date.now();


  var newRef = firebase.database().ref('users').child(firebase.auth().currentUser.uid).child('tasks');
  newRef.child(key).update({
    title: title,
    description: description,
    user_id: firebase.auth().currentUser.uid,
    pending_date: pending_date
  }).then(() => {
    task_submit_update.innerHTML =   `<button type="submit" class="w-25 btn btn-sm btn-success">Update</button>`
    success_message_update.innerHTML = 'Task updated!';
    error_message_update.innerHTML = '';
    success_message_update.innerHTML = '';
    console.log("Document successfully written!");
  }).catch((error) => {
    error_message_update.innerHTML = error.error_message;
    console.error("Error writing document: ", error);
  });
}



const populate_tasks = document.getElementById('populate_tasks');
const populate_completed_tasks = document.getElementById('populate_completed_tasks');

let start = 0;

let default_no_of_pending_tasks = 5;
let default_no_of_completed_tasks = 2;

function loadMorePendingTasks() {
  /*default_no_of_pending_tasks = default_no_of_pending_tasks + 1000
  fetchPendingTasks()*/
  $('.populate_tasks li:hidden').show();
  if ($('.populate_tasks li').length == $('.populate_tasks li:visible').length) {
    $('#show-more').hide();
    $("#populate_tasks").removeClass("populate_tasks");
  }
}

function loadMoreCompletedTasks() {
  /*default_no_of_completed_tasks = default_no_of_completed_tasks + 1000
  fetchCompletedTasks()*/
  $('.populate_completed_tasks li:hidden').show();
  if ($('.populate_completed_tasks li').length == $('.populate_completed_tasks li:visible').length) {
    $('#show-more-1').hide();
    $("#populate_completed_tasks").removeClass("populate_completed_tasks");
  }
}


function fetchTasks() {
  fetchPendingTasks()
  fetchCompletedTasks()
}


function fetchPendingTasks() {
  //console.log(default_no_of_pending_tasks);
  var ref = firebase.database().ref('users').child(firebase.auth().currentUser.uid).child('tasks');
    console.log(ref);
    //.startAt(Date.now())
    ref.orderByKey().on("value", function(snapshot) {
      var content = ''
      var data = ''
      
      populate_tasks.innerHTML = '';
        if (snapshot.exists()) {
            
          var inc = 0
            console.log(`Snapshot:`);
            console.log(snapshot.key);
            console.log(snapshot.val());
        
            
            snapshot.forEach(function(childSnapshot) {
              if ( childSnapshot.exists()){
                inc++
                if (inc > 5) {
                  document.getElementById('show-more').style.display = 'block';
                  if ($('#populate_tasks li').length == $('#populate_tasks li:visible').length) {
                    $('#show-more').hide();
                  }
                }
                console.log(childSnapshot.val());
                var child_snap = childSnapshot.val();
                // Your modified getHTML function
                //const getHTML = message => _.unescape(message).replace('\\', '');
                var title = childSnapshot.child('title').val().replace(/(<br>|<\/br>|<br \/>)/mgi, "\n");
                var description = childSnapshot.child('description').val().replace(/(<br>|<\/br>|<br \/>)/mgi, "\n");
                var random = makeid(10)
                var randomID_dropdown = makeid(10)
                data += `<li class="list-group-item m-1 rounded" id="${childSnapshot.key}_li">
                          <div class="todo-indicator `
                          
                          if (Date.now() > childSnapshot.child('t_stamp').val()) {
                            data += `bg-secondary`
                          } else {
                            data += `bg-warning`
                          }
                            
                          data += `"></div>
                            <div class="widget-content p-0">
                              <div class="widget-content-wrapper ml-2">
                                  
                                  <div class="widget-content-left">
                                      <div class="widget-heading">${childSnapshot.child('title').val()}</div>
                                      <div class="widget-subheading">
                                          <div>`
                                          
                                          if (Date.now() > childSnapshot.child('t_stamp').val()) {
                                            data += `<b>Expired</b> <i>at</i> ${dateToTimestamp(childSnapshot.child('pending_date').val())}`
                                          } else {
                                            data += `<b>Expiry</b> - ${dateToTimestamp(childSnapshot.child('pending_date').val())}`
                                          }
                                          
                                          data += `<br><button class="badge badge-pill badge-info  btn btn-info" data-toggle="collapse" data-target="#${random}" aria-expanded="false" aria-controls="${random}">VIEW NOTES</button>
                                          </div>
                                      </div>
                                  </div>
                                  <div class="widget-content-right"> 
                                    <button class="border-0 btn-transition btn-sm btn btn-outline-success" onclick="markCompleted('${encodeURI(childSnapshot.child('title').val())}','${encodeURI(childSnapshot.child('pending_date').val())}','${encodeURI(childSnapshot.child('description').val())}','${encodeURI(childSnapshot.key)}')"> <i class="fa fa-check" aria-hidden="true"></i></button>
                                    
                                      <button class="btn btn-sm dropdown-toggle" type="button" id="${randomID_dropdown}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="fas fa-ellipsis-v text-dark"></i>
                                      </button>
                                      <div class="dropdown-menu" aria-labelledby="${randomID_dropdown}">
                                        <button class="dropdown-item btn " data-clipboard-text="https://todotaskers.web.app/shared-task.html?task=${childSnapshot.key}" onclick="shareTask('${encodeURI(childSnapshot.key)}','${encodeURI(childSnapshot.val())}')"><i class="far fa-copy" aria-hidden="true"></i> Copy Link</button>
                                        <button type="button" class="dropdown-item btn" data-toggle="modal" data-target="#exampleModalCenter" onclick="modalEdit('Edit','${encodeURI(childSnapshot.child('title').val())}','${encodeURI(childSnapshot.child('pending_date').val())}','${encodeURI(childSnapshot.child('description').val())}','${encodeURI(childSnapshot.key)}')"><i class="far fa-edit"></i> Edit</button>
                                        <button class="dropdown-item btn" data-toggle="modal" data-target="#exampleModalCenterDelete" onclick="modalEdit('Delete','${encodeURI(childSnapshot.child('title').val())}','${encodeURI(childSnapshot.child('pending_date').val())}','${encodeURI(childSnapshot.child('description').val())}','${encodeURI(childSnapshot.key)}')"><i class="far fa-trash-alt"></i> Delete</button> 
                                        
                                      </div>
                                    
                                    </div>
                              </div>
                          </div>
                          <div class="collapse" id="${random}">
                            <div class="card-body" style=" padding: 1.25rem 1.25rem 1.25rem 0.5rem;">
                              ${childSnapshot.child('description').val()}
                            </div>
                          </div>
                        </li>`

                content += `<div class="col-md-6 col-lg-4 animated fadeIn">
                <div class="card mb-4 shadow-sm">
                  <div class="card-body ">`

                    if(!childSnapshot.child('task_status').val()){
                      content+=`<p class="card-text rounded bg-warning text-dark p-1 d-inline-flex shadow-sm mr-1"><small class="tag font-weight-bold"><i class="fas fa-exclamation-circle"></i> Pending</small></p>`
                    } else {
                      content+=`<p class="card-text rounded bg-success text-white p-1 d-inline-flex shadow-sm mr-1"><small class="tag font-weight-bold"><i class="fas fa-check-circle"></i> Completed</small></p>`
                    }

                    content+=`<p class="card-text rounded bg-primary text-white p-1 d-inline-flex shadow-sm mr-1"><small class="tag font-weight-bold">Created at: ${timeConverter(childSnapshot.child('task_timestamp').val())}</small></p>
                    
                    <p class="card-title">${childSnapshot.child('title').val()}</p>
                    <p id="description" class="card-text text-justify">${childSnapshot.child('description').val()}</p>`

                    if (!childSnapshot.child('task_status').val()) {
                      content+=`<p> <small class="text-muted">by <span class="card-creator">${firebase.auth().currentUser.displayName}</span></small> </p>
                      <div class="d-flex justify-content-between align-items-center">
                        <div class="btn-group w-100">
                          <button type="button" class="btn btn-sm btn-outline-secondary" data-toggle="modal" data-target="#exampleModalCenter" onclick="viewTask('${childSnapshot.key}')">View</button>
                          <button type="button" class="btn btn-sm btn-outline-secondary" onclick="markCompleted('${childSnapshot.key}')">Mark Completed</button>
                          <button id="button_copy_link_${childSnapshot.key}" type="button" class="btn btn-sm btn-outline-secondary" data-clipboard-text="https://todotaskers.web.app/shared-task.html?task=${childSnapshot.key}" onclick="shareTask('${childSnapshot.key}','${childSnapshot.val()}')">Copy Link</button>
                        </div>`
                    } else {  
                      content+=`
                        <p> <small class="text-muted">by <span class="card-creator">${firebase.auth().currentUser.displayName}</span></small> </p>
                        <div class="d-flex justify-content-between align-items-center">
                          <div class="btn-group w-100">
                            <button type="button" class="btn btn-sm btn-outline-secondary" data-toggle="modal" data-target="#exampleModalCenter" onclick="viewTask('${childSnapshot.key}')">View</button>
                          </div>`
                    } 
                     
                      
                      content+=`</div>
                    </div>
                  </div>
                </div>`
                populate_tasks.innerHTML = data
                //reverseUL('populate_tasks')
                $(".animated").addClass("delay-1s");
              }
            });
          } else {

            document.getElementById('show-more').style.display = 'none';
            populate_tasks.innerHTML = `<div class="col-md-12 text-center">
            <img src="images/undraw_empty_street.svg" alt="No task exist" class="w-75 p-3"/>
            <p class="lead text-dark">No task exist!</p></div>`
          }
        });           
}

function fetchCompletedTasks() {
  var ref = firebase.database().ref('users').child(firebase.auth().currentUser.uid).child('completed-tasks');
    console.log(ref);
    ref.orderByKey().on("value", function(snapshot) {
      var content = ''
      var data = ''
      populate_completed_tasks.innerHTML = '';
        if (snapshot.exists()) {
            var inc = 0
            console.log(`Snapshot:`);
            console.log(snapshot.key);
            console.log(snapshot.val());
        
            
            snapshot.forEach(function(childSnapshot) {
              if ( childSnapshot.exists()){
                inc++
                if (inc > 2) {
                  document.getElementById('show-more-1').style.display = 'block';
                  if ($('#populate_completed_tasks li').length == $('#populate_completed_tasks li:visible').length) {
                    $('#show-more-1').hide();
                  }
                }
                console.log(childSnapshot.val());
                var child_snap = childSnapshot.val();
                // Your modified getHTML function
                //const getHTML = message => _.unescape(message).replace('\\', '');
                var title = childSnapshot.child('title').val().replace(/(<br>|<\/br>|<br \/>)/mgi, "\n");
                var description = childSnapshot.child('description').val().replace(/(<br>|<\/br>|<br \/>)/mgi, "\n");
                var random = makeid(10)
                var randomID_dropdown = makeid(10)
                data += `<li class="list-group-item m-1 rounded" id="${childSnapshot.key}_li">
                          <div class="todo-indicator bg-success"></div>
                            <div class="widget-content p-0">
                              <div class="widget-content-wrapper ml-2">
                                  
                                  <div class="widget-content-left">
                                      <div class="widget-heading">${childSnapshot.child('title').val()}</div>
                                      <div class="widget-subheading">
                                          <div>`
                                          
                                            data += `<b>Completed</b> - ${timeConverter(childSnapshot.child('current_timestamp').val())}`
                                          
                                          
                                          data += `<br><button class="badge badge-pill badge-info btn btn-info" data-toggle="collapse" data-target="#${random}" aria-expanded="false" aria-controls="${random}">VIEW NOTES</button>
                                          </div>
                                      </div>
                                  </div>
                                  <div class="widget-content-right"> 
                                      <button class="border-0 btn-transition btn-sm btn btn-outline-danger" data-toggle="modal" data-target="#exampleModalCenterDelete" onclick="modalEdit('Delete_Completed','${encodeURI(childSnapshot.child('title').val())}','${encodeURI(childSnapshot.child('pending_date').val())}','${encodeURI(childSnapshot.child('description').val())}','${encodeURI(childSnapshot.key)}')"><i class="far fa-trash-alt"></i></button>

                                    <!--
                                      <button class="btn btn-sm dropdown-toggle" type="button" id="${randomID_dropdown}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="fas fa-ellipsis-v text-dark"></i>
                                      </button>
                                      <div class="dropdown-menu" aria-labelledby="${randomID_dropdown}">
                                        <button class="dropdown-item btn " data-clipboard-text="https://todotaskers.web.app/shared-task.html?task=${childSnapshot.key}" onclick="shareTask('${childSnapshot.key}','${childSnapshot.val()}')"><i class="far fa-copy" aria-hidden="true"></i> Copy Link</button>
                                        <button type="button" class="dropdown-item btn" data-toggle="modal" data-target="#exampleModalCenter" onclick="modalEdit('Edit','${childSnapshot.child('title').val()}','${childSnapshot.child('pending_date').val()}','${childSnapshot.child('description').val()}','${childSnapshot.key}')"><i class="far fa-edit"></i> Edit</button>
                                        <button class="dropdown-item btn" data-toggle="modal" data-target="#exampleModalCenterDelete" onclick="modalEdit('Delete','${childSnapshot.child('title').val()}','${childSnapshot.child('pending_date').val()}','${childSnapshot.child('description').val()}','${childSnapshot.key}')"><i class="far fa-trash-alt"></i> Delete</button> 
                                        
                                      </div>
                                    -->
                                    </div>
                              </div>
                          </div>
                          <div class="collapse" id="${random}">
                            <div class="card-body" style=" padding: 1.25rem 1.25rem 1.25rem 0.5rem;">
                              ${childSnapshot.child('description').val()}
                            </div>
                          </div>
                        </li>`

                content += `<div class="col-md-6 col-lg-4 animated fadeIn">
                <div class="card mb-4 shadow-sm">
                  <div class="card-body ">`

                    if(!childSnapshot.child('task_status').val()){
                      content+=`<p class="card-text rounded bg-warning text-dark p-1 d-inline-flex shadow-sm mr-1"><small class="tag font-weight-bold"><i class="fas fa-exclamation-circle"></i> Pending</small></p>`
                    } else {
                      content+=`<p class="card-text rounded bg-success text-white p-1 d-inline-flex shadow-sm mr-1"><small class="tag font-weight-bold"><i class="fas fa-check-circle"></i> Completed</small></p>`
                    }

                    content+=`<p class="card-text rounded bg-primary text-white p-1 d-inline-flex shadow-sm mr-1"><small class="tag font-weight-bold">Created at: ${timeConverter(childSnapshot.child('task_timestamp').val())}</small></p>
                    
                    <p class="card-title">${childSnapshot.child('title').val()}</p>
                    <p id="description" class="card-text text-justify">${childSnapshot.child('description').val()}</p>`

                    if (!childSnapshot.child('task_status').val()) {
                      content+=`<p> <small class="text-muted">by <span class="card-creator">${firebase.auth().currentUser.displayName}</span></small> </p>
                      <div class="d-flex justify-content-between align-items-center">
                        <div class="btn-group w-100">
                          <button type="button" class="btn btn-sm btn-outline-secondary" data-toggle="modal" data-target="#exampleModalCenter" onclick="viewTask('${childSnapshot.key}')">View</button>
                          <button type="button" class="btn btn-sm btn-outline-secondary" onclick="markCompleted('${childSnapshot.key}')">Mark Completed</button>
                          <button id="button_copy_link_${childSnapshot.key}" type="button" class="btn btn-sm btn-outline-secondary" data-clipboard-text="https://todotaskers.web.app/shared-task.html?task=${childSnapshot.key}" onclick="shareTask('${childSnapshot.key}','${childSnapshot.val()}')">Copy Link</button>
                        </div>`
                    } else {  
                      content+=`
                        <p> <small class="text-muted">by <span class="card-creator">${firebase.auth().currentUser.displayName}</span></small> </p>
                        <div class="d-flex justify-content-between align-items-center">
                          <div class="btn-group w-100">
                            <button type="button" class="btn btn-sm btn-outline-secondary" data-toggle="modal" data-target="#exampleModalCenter" onclick="viewTask('${childSnapshot.key}')">View</button>
                          </div>`
                    } 
                     
                      
                      content+=`</div>
                    </div>
                  </div>
                </div>`
                
                populate_completed_tasks.innerHTML = data
                reverseUL('populate_completed_tasks')
                $(".animated").addClass("delay-1s");
              }
            });
          } else {
            document.getElementById('show-more-1').style.display = 'none';
          
            populate_completed_tasks.innerHTML = `<div class="col-md-12 text-center">
            <img src="images/undraw_empty_street.svg" alt="No task exist" class="w-75 p-3"/>
            <p class="lead text-dark text-center">No task exist!</p></div>`
          }
        });           
}

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

function reverseUL(id) {
  ul = $(`#${id}`); // your parent ul element
  ul.children().each(function(i,li){ul.prepend(li)})
}

function dateToTimestamp(d) {
  if (d){
      var a = new Date(d);
      console.log(a);
  }    
  console.log(a.getTime());
  return timeConverter(a.getTime())
}   

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp);
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
            
  return currentTime
}

/*function viewTask(key) {

  var ref = firebase.database().ref('users').child(firebase.auth().currentUser.uid).child('tasks');
    console.log(ref);
    ref.child(key).orderByKey().on("value", function(snapshot) {
      var title = snapshot.child('title').val()
      var description = snapshot.child('description').val()

      console.log(title);
      console.log(description);

      document.getElementById('exampleModalLongTitle').innerHTML = title;
      document.getElementById('exampleModalLongBody').innerHTML = description;
    })

  
}*/

function markCompleted(title, pending_date, description, key) {

  title = decodeURI(title)
  pending_date = decodeURI(pending_date)
  description = decodeURI(description)
  key = decodeURI(key)
  
  const current_date = Date.now();

  var newRef = firebase.database().ref('users').child(firebase.auth().currentUser.uid).child('tasks');
  newRef.child(key).update({
    task_status: "Completed",
    task_shared: false
  }).then(() => {
    $(`#${key}_li`).fadeOut();  
  }).catch((error) => {
    console.error("Error updating Task: ", error);
    alert(error.message);
  });
}

function shareTask(key, snapshot) {
  
  snapshot = decodeURI(snapshot)
  key = decodeURI(key)

  var newRef = firebase.database().ref('users').child(firebase.auth().currentUser.uid).child('tasks');
  //var pushRef = firebase.database().ref('users').child(firebase.auth().currentUser.uid).child('tasks').push();
  //var pushKey = pushRef.key;
  newRef.child(key).update({
    task_shared: true,
    //shared_key: pushKey 
  }).then(() => {
    console.log("Task successfully updated!");
    
  }).catch((error) => {
    console.error("Error updating Task: ", error);
    alert(error.message);
  });
}


const extra_div = document.getElementById("extra");
const important_message = document.getElementById("important-message");


const exampleModalLongTitle = document.getElementById('exampleModalLongTitle');
const exampleModalLongBody = document.getElementById('exampleModalLongBody');

const exampleModalLongTitleDelete = document.getElementById('exampleModalLongTitleDelete');
const exampleModalLongBodyDelete = document.getElementById('exampleModalLongBodyDelete');

const task_key_update = document.getElementById('task_key_update');
const task_title_update = document.getElementById('task_title_update');
const div_task_description_update = document.getElementById('div_task_description');
const pending_date_time_update = document.getElementById('pending_date_time_update');
const datetimepicker_update = document.getElementById('datetimepicker_update');

function modalEdit(request, title, pending_date, description, key) {

  title = decodeURI(title)
  pending_date = decodeURI(pending_date)
  description = decodeURI(description)
  key = decodeURI(key)

  if (request === "Edit") {
    task_key_update.value = key;
    exampleModalLongTitle.innerHTML = 'Edit Task';
    task_title_update.value = title;
    datetimepicker_update.value = pending_date
    //pending_date_time.innerHTML = 'Current pending date is '+ pending_date; 
    div_task_description.innerHTML = `<textarea id="task_description_update" name="task_description_update" class="form-control form-control-md" placeholder="Notes just for the creator" rows="4" required="" >${description}</textarea>`

  } else if (request === "Delete") {
    exampleModalLongTitleDelete.innerHTML = 'Are you sure to delete task?';
    exampleModalLongBodyDelete.innerHTML = `<form method="post">
            <div >
              <input type="hidden"  class="form-control form-control-md" placeholder="KEY" required="" value="${key}" disabled>
              <div class="form-group">
                <input type="text" class="form-control form-control-md" placeholder="Title" required="" value="${title}" disabled>
              </div>
              <div class="form-group">
                <input type="text" class="form-control form-control-md" id="datetimepicker_delete" placeholder="Pending date" required="" value="${pending_date}" disabled>
              </div>
                    
              <div class="form-group">
                <textarea class="form-control form-control-md" placeholder="Notes just for the creator" rows="4" required="" disabled>${description}</textarea>
              </div>
              <div class="form-group">
                <small class="text-success" id="success_message_delete"></small>
                <small class="text-danger" id="error_message_delete"></small>
              </div>
              <div id="task_submit" class="form-group w-100" style="display: inline-flex;">
                <button type="button" class="w-50 btn btn-sm btn-outline-danger" onclick="hideModal('exampleModalCenterDelete')">No</button>
                &nbsp
                <button type="button" class="w-50 btn btn-sm btn-danger" onclick="delTask('tasks', '${key}')">Yes</button>
              </div>
              
            </div>
          </form>`
  } else if (request === "Delete_Completed") {
    exampleModalLongTitleDelete.innerHTML = 'Are you sure to delete task?';
    exampleModalLongBodyDelete.innerHTML = `<form method="post">
        <div >
          <input type="hidden"  class="form-control form-control-md" placeholder="KEY" required="" value="${key}" disabled>
          <div class="form-group">
            <input type="text" class="form-control form-control-md" placeholder="Title" required="" value="${title}" disabled>
          </div>
          <div class="form-group">
            <input type="text" class="form-control form-control-md" id="datetimepicker_delete" placeholder="Pending date" required="" value="${pending_date}" disabled>
          </div>
                
          <div class="form-group">
            <textarea class="form-control form-control-md" placeholder="Notes just for the creator" rows="4" required="" disabled>${description}</textarea>
          </div>
          <div class="form-group">
            <small class="text-success" id="success_message_delete_c"></small>
            <small class="text-danger" id="error_message_delete_c"></small>
          </div>
          <div id="task_submit" class="form-group w-100" style="display: inline-flex;">
            <button type="button" class="w-50 btn btn-sm btn-outline-danger" onclick="hideModal('exampleModalCenterDelete')">No</button>
            &nbsp
            <button type="button" class="w-50 btn btn-sm btn-danger" onclick="delTask('completed-tasks', '${key}')">Yes</button>
          </div>
          
        </div>
      </form>`
  }
  
  

}

//const exampleModalCenter = document.getElementById('exampleModalCenter');

function delTask(ref_path, key) {
  var newRef = firebase.database().ref('users').child(firebase.auth().currentUser.uid).child(ref_path);
  newRef.child(key).remove().then(() => {
    hideModal('exampleModalCenterDelete');
    $(`#${key}_li`).fadeOut();
  }).catch((error) => {
    console.error("Error deleting node: ", error);
    alert('Error while deleting!', error.message)
  });
  
}

// To hide modal after 3 seconds
function hideModal(id) {
  $(`#${id}`).modal('hide');
}