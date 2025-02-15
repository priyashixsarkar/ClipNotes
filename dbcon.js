const firebaseConfig = {
  apiKey: "AIzaSyCUSE0nNakeW5VzEeHGgYSAhuCnPyep5ME",
  authDomain: "clip-notes-project.firebaseapp.com",
  databaseURL: "https://clip-notes-project-default-rtdb.firebaseio.com",
  projectId: "clip-notes-project",
  storageBucket: "clip-notes-project.appspot.com",
  messagingSenderId: "1093280901008",
  appId: "1:1093280901008:web:cbfc757ff7796ad8edf515"
};
firebase.initializeApp(firebaseConfig);

let notesDB = firebase.database();
let remember = document.getElementById("remember");
let loadingText = document.getElementById("loading-text")

function setSubject(subName) {
  //let newSubRef = notesDB.child(userName).child(subName);
  let currentUserName = localStorage.getItem("currentUserName");
  let subjectCode = notesDB.ref("ClipNotes/" + currentUserName + "/Subjects").push().key;
  let newSubRef = notesDB.ref("ClipNotes/" + currentUserName + "/Subjects/" + subjectCode);
  newSubRef.set({ "SubjectName": subName }).then(() => {
    successNotification(subName + " folder created successfully");
  })
    .catch((error) => {
      errorNotification("Some error occurred. Try again");
    });
}

function updateSubject(subName, subCode)
{
  let currentUserName = localStorage.getItem("currentUserName");
  let subRef = notesDB.ref("ClipNotes/" + currentUserName + "/Subjects/" + subCode);
  subRef.update({ "SubjectName": subName }).then(() => {
    successNotification(subName + " folder updated successfully")
  })
    .catch((error) => {
      errorNotification("Error creating . Try again");
    });
}
//updateSubject("Computer", "-NtqYVvxB_PhQA3hmPdR")

//setSubject("Maths2");

function setTopic(topicName, content, date) {
  let currentUserName = localStorage.getItem("currentUserName");
  let currentSubject = localStorage.getItem("currentSubject");
  let topicCode = notesDB.ref("ClipNotes/" + currentUserName + "/Subjects/"+currentSubject + "/Topics").push().key;
  let topicRef = notesDB.ref("ClipNotes/" + currentUserName + "/Subjects/"+currentSubject + "/Topics/" + topicCode);
  let topicData = {
    title: topicName,
    content: content,
    date: "Added on " + date
  }
  topicRef.set(topicData).then(() => {
    successNotification("Topic set successfully");
  })
    .catch((error) => {
      errorNotification("Error setting topic. Try again");
    });
}

//setTopic("T2", "D1", "Any");
function updateTopic(topicName, content, date, topicCode)
{
  let currentUserName = localStorage.getItem("currentUserName");
  let currentSubject = localStorage.getItem("currentSubject");
  let topicRef = notesDB.ref("ClipNotes/" + currentUserName + "/Subjects/"+currentSubject + "/Topics/" + topicCode);
  let topicData = {
    title: topicName,
    content: content,
    date: "Updated on " + date
  }
  topicRef.update(topicData).then(() => {
    successNotification("Topic updated successfully");
  })
    .catch((error) => {
     errorNotification("Error updating topic. Try again");
    });
}

//updateTopic("T4", "D5", "Today", "-Ntq_n01_hA3XmdQ-Tm6")

function userSignUp(username, email, password) {
  getUserData(function (data) {
    for (uname in data) {
      if (uname == username) {
        errorNotification("This Username already exists. Try with a different username");
        return;
      }
      if (data[uname].email == email) {
        errorNotification("This Email is already registered");
        return;
      }
    }
    let encryptedPassword = encryptPassword(password);
    let userData = {
      password: encryptedPassword,
      email: email
    }

    notesDB.ref("ClipNotes").child(username).set(userData).then(() => {
      localStorage.setItem("currentUserName", username);
      history.replaceState(null, null, "subjects.html");
      window.location.href = "subjects.html";
    })
      .catch((error) => {
        errorNotification("Some error occurred. Try again");
      });
  })

}

function userSignIn(username, password) {
  getUserData(function (data) {
    for (uname in data) {
      if (uname == username) {
        userFound = true;
        let passwordFromUser = encryptPassword(password);
        let passwordFromDb = data[username].password;
        if (passwordFromUser == passwordFromDb) {
          localStorage.setItem("currentUserName", username);
          history.replaceState(null, null, "subjects.html");
          if (remember.checked)
          {
              localStorage.setItem("ClipNotesUserName", username);
          }
          window.location.href = "subjects.html"
          return;
        }
        else {
          errorNotification("Invalid Username or Password");
          return;
        }
      }
    }
    errorNotification("This username does not exist");
    //console.log(userFound);
  })
}


// Function to encrypt the password
function encryptPassword(password) {
  let encryptedPassword = "";
  for (let i = 0; i < password.length; i++) {
    let ascii = password.charCodeAt(i);
    if (i % 2 == 0) {
      ascii++;
    }
    else {
      ascii--;
    }
    encryptedPassword += String.fromCharCode(ascii);
  }
  return encryptedPassword;
}

//Function to decrypt the password
/*
function decryptPassword(password) {
  let decryptedPassword = "";
  for (let i = 0; i < password.length; i++) {
    let ascii = password.charCodeAt(i);
    if (i % 2 == 0) {
      ascii--;
    }
    else {
      ascii++;
    }
    decryptedPassword += String.fromCharCode(ascii);
  }
  return decryptedPassword;
}
*/

function getUserData(callback) {
  let dataFetched = false;
  var timeout = setTimeout(function () {
    if (!dataFetched) {
      console.log("Data fetching took too long. Running another code.");

    }
  }, 10000);

  notesDB.ref("ClipNotes").once('value', function (data) {
    dataFetched = true;
    clearTimeout(timeout);
    let userDataObject = data.val();
    callback(userDataObject);
  });
}

function fetchSubjects(callback) {
  let subjectFetched = false;
  let timeout = setTimeout(function () {
    if (!subjectFetched) {
      loadingText.innerText = "Loading Subjects is taking longer than expected.\n Please check your internet connection and try refreshing the page"

    }
  }, 10000);
  let currentUserName = localStorage.getItem("currentUserName");
  let userSubjectData = notesDB.ref("ClipNotes/" + currentUserName + "/Subjects");

  userSubjectData.once('value')
    .then(function (data) {
      subjectFetched = true;
      clearTimeout(timeout);
      var subjectsObject = data.val();
      callback(subjectsObject);
    })
    .catch(function (error) {
      console.error("Error getting data:", error);
    });
}

function fetchTopics(callback)
{
  let topicFetched = false;
  let timeout = setTimeout(function () {
    if (!topicFetched) {
      loadingText.innerText = "Loading Topics is taking longer than expected.\n Please check your internet connection and try refreshing the page"

    }
  }, 10000);
  let currentSubject = localStorage.getItem("currentSubject");
  let currentUserName = localStorage.getItem("currentUserName");
  let userTopicData = notesDB.ref("ClipNotes/" + currentUserName + "/Subjects/" + currentSubject + "/Topics");
  userTopicData.once('value')
    .then(function (data) {
      topicFetched = true;
      clearTimeout(timeout);
      var topicsObject = data.val();
      callback(topicsObject);
    })
    .catch(function (error) {
      console.error("Error getting data:", error);
    });
}

function removeSubject(subCode, callback)
{
  let currentUserName = localStorage.getItem("currentUserName");
  let subjectToRemove = notesDB.ref("ClipNotes/" + currentUserName + "/Subjects/" + subCode);
  subjectToRemove.remove()
  .then(function() {
    successNotification("Subject deleted successfully");
    callback();
  })
  .catch(function(error) {
    successNotification("Error deleting subject. Try again");
  });
}

function removeTopic(topicCode, callback)
{
  let currentUserName = localStorage.getItem("currentUserName");
  let currentSubject = localStorage.getItem("currentSubject");
  // console.log(currentSubject);
  let topicToRemove = notesDB.ref("ClipNotes/" + currentUserName + "/Subjects/" + currentSubject + "/Topics/" + topicCode);
  topicToRemove.push()
  topicToRemove.remove().then(function() {
    successNotification("Topic deleted successfully");
    callback();
  })
  .catch(function(error) {
    errorNotification("Error deleting topic. Try again");
  });
}