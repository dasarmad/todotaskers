window.addEventListener('load', function() {
  fetchTasks()
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


const populate_tasks = document.getElementById('populate_tasks');

fetchTasks = function () {
  var url_string = window.location.href
  var url = new URL(url_string);
  var task = url.searchParams.get("task");
  var ref = firebase.database().ref('shared-tasks').child(task);
    
    ref.orderByKey().on("value", function(snapshot) {
      var content = ''
      var data = ''
      populate_tasks.innerHTML = '';
        if (snapshot.exists()) {
                
            data += `<li class="list-group-item m-1 rounded" id="${snapshot.key}_li">
            <div class="todo-indicator `
            
            if (Date.now() > snapshot.child('pending_date').val()) {
              data += `bg-secondary`
            } else {
              data += `bg-warning`
            }
              
            data += `"></div>
              <div class="widget-content p-0">
                <div class="widget-content-wrapper ml-2">
                    
                    <div class="widget-content-left">
                        <div class="widget-heading">${snapshot.child('title').val()}</div>
                        <div class="widget-subheading">
                            <div>`
                            
                            if (Date.now() > snapshot.child('pending_date').val()) {
                              data += `Expired`
                            } else {
                              data += `Expiry - ${dateToTimestamp(snapshot.child('pending_date').val())}`
                            }
                            
                            data += `
                            </div>
                        </div>
                    </div>
                    <div class="widget-content-right"> 
                      <button class="border-0 btn-transition btn-sm btn btn-outline-success" onclick="markCompleted('${encodeURI(snapshot.child('title').val())}','${encodeURI(snapshot.child('pending_date').val())}','${encodeURI(snapshot.child('description').val())}','${encodeURI(snapshot.key)}')"> <i class="fa fa-check" aria-hidden="true"></i></button>
                    </div>
                </div>
            </div>
          </li>`


                content += `<div class="col-md-12 col-lg-6 animated fadeIn">
                <div class="card mb-4 shadow-sm">
                  <div class="card-body ">`

                    if(!snapshot.child('task_status').val()){
                      content+=`<p class="card-text rounded bg-warning text-dark p-1 d-inline-flex shadow-sm mr-1"><small class="tag font-weight-bold"><i class="fas fa-exclamation-circle"></i> Pending</small></p>`
                    } else {
                      content+=`<p class="card-text rounded bg-success text-white p-1 d-inline-flex shadow-sm mr-1"><small class="tag font-weight-bold"><i class="fas fa-check-circle"></i> Completed</small></p>`
                    }

                    content+=`<p class="card-text rounded bg-primary text-white p-1 d-inline-flex shadow-sm mr-1"><small class="tag font-weight-bold">Created at: ${timeConverter(snapshot.child('task_timestamp').val())}</small></p>
                    
                    <p class="card-title">${snapshot.child('title').val()}</p>
                    <p id="description" class="card-text text-justify">${snapshot.child('description').val()}</p>`

                    if (!snapshot.child('task_status').val()) {
                      content+=`<p> <small class="text-muted">by <span class="card-creator">${snapshot.child('created_by').val().substring(0, snapshot.child('created_by').val().lastIndexOf("@"))}</span></small> </p>
                      <div class="d-flex justify-content-between align-items-center">
                        <div class="btn-group w-100">
                          <button type="button" class="btn btn-sm btn-outline-secondary w-100" data-toggle="modal" data-target="#exampleModalCenter" onclick="viewTask('${snapshot.key}')">View</button>
                          <button id="button_mark_link_${snapshot.key}" type="button" class="btn btn-sm btn-outline-secondary w-100" onclick="markCompleted('${snapshot.key}')">Mark Completed</button>
                          <!--<button id="button_copy_link_${snapshot.key}" type="button" class="btn btn-sm btn-outline-secondary" onclick="shareTask('${snapshot.key}')">Copy Link</button>-->
                        </div>`
                    } else {  
                      content+=`
                        <p> <small class="text-muted">by <span class="card-creator">${snapshot.child('created_by').val().substring(0, snapshot.child('created_by').val().lastIndexOf("@"))}</span></small> </p>
                        <div class="d-flex justify-content-between align-items-center">
                          <div class="btn-group w-100">
                            <button type="button" class="btn btn-sm btn-outline-secondary" data-toggle="modal" data-target="#exampleModalCenter" onclick="viewTask('${snapshot.key}')">View</button>
                          </div>`
                    } 
                     
                      
                      content+=`</div>
                    </div>
                  </div>
                </div>`
                populate_tasks.innerHTML = data
            
          } else {
            populate_tasks.innerHTML = `<div class="col-md-12"><p class="lead text-dark">This task marked as completed. Thank You!</p></div>`
          }
        });           
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


function markCompleted(title, pending_date, description, key) {
  title = decodeURI(title)
  pending_date = decodeURI(pending_date)
  description = decodeURI(description)
  key = decodeURI(key)
  
    var c_date = Date.now()
    var sar = {uid: key, date: c_date}

    var objectDataString = JSON.stringify(sar);
    
    console.log(objectDataString);
    $.ajax({
      //crossDomain: true,
      url:"https://us-central1-todotaskers.cloudfunctions.net/markCompletePublicTask",
      type:"post",
      dataType: "json",
      contentType:"application/json",
      data: objectDataString,
      success: function (result) {
        console.log(result.res); 
        populate_tasks.innerHTML = `<div class="col-md-12"><p class="lead text-dark">This task marked as completed. Thank You!</p></div>`
          
      },
      error: function (result) {
        console.log("Got an error" + JSON.stringify(result.res));
        alert('Error: Something went wrong! Please try again.');
      }
    });
}