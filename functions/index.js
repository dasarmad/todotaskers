const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { event } = require('firebase-functions/lib/providers/analytics');
admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const db = admin.database();
const firestore = admin.firestore();
exports.onCreateUser = functions.auth.user().onCreate((user) => {
    // ...
    var email = user.email;
    var name = email.substring(0, email.lastIndexOf("@"));
    var ref = db.ref();
    var usersRef = ref.child("users").child(user.uid);

    var response_message = "";

    const p = admin.auth().updateUser(user.uid, {
        displayName: name,
        disabled: true
    })

    p.then(function () {
        response_message = "Profile updated!"
        console.log(response_message); 
    })

    const current_date = Date.now()

    const promise = usersRef.set({
        displayName: name,
        email: user.email,
        user_id: user.uid,
        registration_date_timestamp: current_date
    });

    firestore.collection("users").doc(user.uid).set({
        displayName: name,
        email: user.email,
        user_id: user.uid,
        registration_date_timestamp: current_date,
        account_disabled: true
    })
    .then(() => {
        console.log("Document successfully written!");
    }).then(() => {
      //sendEmailToAdmin(user.email, user.uid, name)
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });

    const p2 = promise.then(function () {
        response_message = "Data Pushed"
        console.log(response_message); 
        return response_message
    })

    p2.catch(function (error) {
        response_message = `Error adding doc: ${error.message}`;
        console.error("Error adding doc: ", response_message);
        return response_message
    })

  });

function sendEmailToAdmin(email, uid, name) {
  admin.firestore().collection('mail').add({
    to: 'hitpeegl@gmail.com',
    message: {
      subject: `Todo Taskers - ${name} just make new account!`,
      html: `<b>New Registration!</b>
      <br>
      Hi admin, ${name} has registered. Currently, her/his account is disabled. 
      <br>
      <br>
      Please follow the instruction to enable their account:
      <ol type="1">
        <li> Open up Firestore Database. </li>
        <li> Search User-ID ( ${uid} ) in <code>users</code> collection. 
          <ul>
            <li><b>Username:</b> ${name}</li>
            <li><b>Email:</b> ${email}</li>
            <li><b>User-ID:</b> ${uid}</li>
          </ul>
        </li>  
        <li> Please enable their account by changing account_disabled: <code>false</code></li>
      </ol>
      <br>
      Regards, Todo Taskers Team!`,
    },
  })
}  

  exports.shareTask = functions.database
  .ref('users/{userid}/tasks/{taskid}')
  .onUpdate((snapshot, context) => {
    const newRef = admin.database().ref('shared-tasks');
    const snapValue = snapshot.after.val();
    const userid = context.params.userid;
    let userEmail;
    
    if (snapValue.task_shared === true) {
      admin.auth().getUser(userid)
      .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
        userEmail = userRecord.email;
      }).then(() => {
        newRef.child(snapValue.task_timestamp).once("value", function(snapshot) {
          if (snapshot.exists()) {
           
          } else{
            newRef.child(snapValue.task_timestamp).set({
              title: snapValue.title,
              description: snapValue.description,
              created_by: userEmail,
              task_timestamp: snapValue.task_timestamp,
              pending_date: snapValue.pending_date
            })
          }
        })
        
      }).catch((error) => {
        console.log('Error fetching user data:', error);
      });
    } else if (snapValue.task_shared === false && snapValue.task_status === "Completed") {
      var c_date = Date.now();
      newRef.child(snapValue.task_timestamp).once("value", function(snapshot) {
        if (snapshot.exists()) {
          
          newRef.child(snapValue.task_timestamp).remove();
          admin.database().ref('users').child(userid).child('completed-tasks').child(c_date).update({
            title: snapValue.title,
            description: snapValue.description,
            task_timestamp: snapValue.task_timestamp,
            pending_date: snapValue.pending_date,
            current_timestamp: c_date
          })
          admin.database().ref('users').child(userid).child('tasks').child(snapValue.task_timestamp).remove();
        } else{
          admin.database().ref('users').child(userid).child('completed-tasks').child(c_date).update({
            title: snapValue.title,
            description: snapValue.description,
            task_timestamp: snapValue.task_timestamp,
            pending_date: snapValue.pending_date,
            current_timestamp: c_date
          })
          admin.database().ref('users').child(userid).child('tasks').child(snapValue.task_timestamp).remove();
        }
      })
    }
    
    
    /*
    if (snapValue.task_shared === true && snapValue.task_status === "Completed") {
      const newRef = admin.database().ref('shared-tasks');
        newRef.child(snapValue.task_timestamp).update({
          task_status: "Completed"
        })
    } */
    return 'Task created as public access!'
  })


  exports.listenPublicTaskStatus = functions.database
  .ref('shared-tasks/{taskid}')
  .onUpdate((snapshot, context) => {
    const newRef = admin.database().ref('shared-tasks');
    const snapValue = snapshot.after.val();
    
    let user_id;
    
    if (snapValue.task_status === "Completed") {
      admin.auth().getUserByEmail(snapValue.created_by)
      .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
        user_id = userRecord.uid;
      }).then(() => {
        admin.database().ref('users').child(user_id).child('tasks').child(snapValue.task_timestamp).update({
          task_status: "Completed",
          task_shared: false
        })
      }).catch((error) => {
        console.log('Error fetching user data:', error);
      });
    } 
    return 'Task marked as completed!'
  })


  exports.UserAuthEnableDisable = functions.firestore
  .document('users/{userid}')
  .onUpdate((snapshot, context) => {
    const before = snapshot.before.data();
    const after = snapshot.after.data();
    const userid = context.params.userid;
    const userEmail = context.params.userEmail;
    
    console.log(userEmail);
  
    if (before.account_disabled === true && after.account_disabled === false) {  
        admin.auth().updateUser(userid, {
          disabled: false 
        }).then(() => {
          const status = `User having uid:${userid} has been enabled.`;
          console.log(status);
          return status;
        }).then(() => {
          //sendEmailToEnabledUsers(before.email, before.displayName, "Activated")
        }).catch((error) => {
            return `Error deleting user: ${error}`;
        });
    } else if (before.account_disabled === false && after.account_disabled === true) {
      admin.auth().updateUser(userid, {
        disabled: true 
      }).then(() => {
        const status = `User having uid:${userid} has been disabled.`;
        console.log(status);
        return status;
      }).then(() => {
        //sendEmailToDisabledUsers(before.email, before.displayName, "Deactivated")
      }).catch((error) => {
          return `Error deleting user: ${error}`;
        });
    } else {
      "else statement"
    } 
    return `Function executed!`;
});

function sendEmailToEnabledUsers(email, name, status) {
  admin.firestore().collection('mail').add({
    to: `${email}`,
    message: {
      subject: `Todo Taskers - Your account is ${status}.`,
      html: `Hi <b>${name}</b>, We make an action on your account!
      <br>
        Your account (${email}) is ${status} now, You can login from here: <a href="https://todotaskers.web.app/login.html">todotaskers.web.app</a> & enjoy Todo Taskers.
      <br>
      <br>
      Have a great day, Todo Taskers Team!`,
    },
  })
}  

function sendEmailToDisabledUsers(email, name, status) {
  admin.firestore().collection('mail').add({
    to: `${email}`,
    message: {
      subject: `Todo Taskers - Your account is ${status}.`,
      html: `Hi <b>${name}</b>, We make an action on your account!
      <br>
        Your account (${email}) is ${status} now. If you see, it should activated, Please reply to this email. Definitely, we'll look into this matter.
      <br>
      <br>
      Have a great day, Todo Taskers Team!`,
    },
  })
}  


exports.markCompletePublicTask = functions.https.onRequest((req, res) => {
  // Set CORS headers for preflight requests
  // Allows GETs from any origin with the Content-Type header
  // and caches preflight response for 3600s

  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  } 
  
  if (req.method === 'POST') {

    switch (req.get('content-type')) {
      // '{"name":"John"}'
      case 'application/json':
        ({name} = req.body);
        console.log(req.body.uid);
        const newRef = admin.database().ref('shared-tasks');
        newRef.child(req.body.uid).update({
          task_status: "Completed",
          current_timestamp: req.body.date
        }).then(() => {
          console.log(`Task ${req.body.uid} successfully updated!`);
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({res:"Task marked as completed."}));
        }).catch((error) => {
          console.error("Error updating Task: ", error);
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({res: error.message}));
        });
        
        break;
  
      // 'John', stored in a Buffer
      case 'application/octet-stream':
        name = req.body.toString(); // Convert buffer to a string
        break;
  
      // 'John'
      case 'text/plain':
        name = req.body;
        break;
  
      // 'name=John' in the body of a POST request (not the URL)
      case 'application/x-www-form-urlencoded':
        ({name} = req.body);
        break;
    }

    
    //res.send('Hello World!');
  }
});