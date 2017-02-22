/*
 * This file should contain code for the following tasks:
 * 1. Display the list of chat messages.
 * 2. Send a new message.
 * 3. Allow a user to edit and delete their own messages.
 * 4. Allow a user to log out.
 * 5. Redirect a user to index.html if they are not logged in.
 */
var messagesList = document.getElementById("messages");
var logoutButton = document.getElementById("logout");
var chatTitle = document.getElementById("chat-title");
var signupError = document.getElementById("signup-error");
var currentUser;

logoutButton.addEventListener("click", function (e) {
    firebase.auth().signOut();
});


function displayError(errorMessage) {
    signupError.textContent = errorMessage;
    signupError.classList.add("active");
}

firebase.auth().onAuthStateChanged(function(user) {
    // If the user is logged in, user will be an object (truthy).
    // Otherwise, it will be null (falsey).
    if (user) {
        currentUser = firebase.auth().currentUser;
        // Connect to firebase
        var database = firebase.database();
        var messages = database.ref('channels/general').limitToLast(100);
        chatTitle.textContent = "Chat";

        // This event listener will be called for each item
        // that has been added to the list.
        // Use this to generate each chat message,
        // both on initial page load and whenever someone creates a new message.
        messages.on('child_added', function(data) {
            var id = data.key;
            var message = data.val();
            var text = message.text;
            var timestamp = message.timestamp;
            var editedTimestamp = message.editedTimestamp;
            var displayName = message.displayName;
            var photoURL = message.photoURL;

            var currMsg = document.createElement("li");
            currMsg.classList.add("list-group-item", "msg-li");
            currMsg.id = id;
            var currMsgPhotoURL = document.createElement("img");
            currMsgPhotoURL.src = photoURL;
            currMsgPhotoURL.classList.add("pull-left", "img-circle");
            var currMsgDisplayName = document.createElement("div");
            currMsgDisplayName.textContent = displayName + " says...";
            currMsgDisplayName.classList.add("chat-text", "chat-name");
            var currMsgText = document.createElement("div");
            currMsgText.innerText = text;
            currMsgText.classList.add("chat-text", "chat-message");
            var currMsgTimestamp = document.createElement("div");
            currMsgTimestamp.innerText = "at " + moment(timestamp).format("MMMM Do YYYY, h:mm:ss a").toString();
            currMsgTimestamp.classList.add("chat-text", "chat-timestamp");
            var currEditedTimestamp = document.createElement("div");
            currEditedTimestamp.classList.add("chat-text", "chat-timestamp");
            if(editedTimestamp !== "") {
                currEditedTimestamp.innerText = "edit at " + moment(editedTimestamp).format("MMMM Do YYYY, h:mm:ss a").toString();
            }

            var currMsgDelete = document.createElement("button");
            currMsgDelete.innerText = "delete";
            currMsgDelete.addEventListener("click", function(e) {
                e.preventDefault();

                var confirm = window.confirm("Are you sure you want to delete this message?");
                if(confirm) {
                    database.ref("channels/general/" + id).remove();
                }
            });
            var currMsgDeleteLi = document.createElement("li");
            currMsgDeleteLi.appendChild(currMsgDelete);
            var currMsgEdit = document.createElement("button");
            currMsgEdit.innerText = "edit";
            currMsgEdit.addEventListener("click", function(e) {
                e.preventDefault();

                var editedText = window.prompt("Please enter a new message", message.text);
                editedMsg = {
                    text: editedText,
                    timestamp: timestamp,
                    displayName: displayName,
                    photoURL: photoURL,
                    editedTimestamp: new Date().getTime()
                }
                database.ref("channels/general/" + id).update(editedMsg);
            });
            var currMsgEditLi = document.createElement("li");
            currMsgEditLi.appendChild(currMsgEdit);
            var editAndDelete = document.createElement("ul");
            editAndDelete.classList.add("pull-right", "list-inline");
            editAndDelete.appendChild(currMsgEditLi);
            editAndDelete.appendChild(currMsgDeleteLi);

            currMsg.appendChild(editAndDelete);
            currMsg.appendChild(currMsgPhotoURL);
            currMsg.appendChild(currMsgDisplayName);
            currMsg.appendChild(currMsgTimestamp);
            currMsg.appendChild(currEditedTimestamp);
            currMsg.appendChild(currMsgText);
            messagesList.appendChild(currMsg);
        });

        // This event listener will be called whenever an item in the list is edited.
        // Use this to update the HTML of the message that was edited.
        messages.on('child_changed', function(data) {
            var id = data.key;
            var message = data.val();
            var currMsg = document.querySelector("#" + id + " .chat-message");
            currMsg.innerText = message.text;
        });

        // This event listener will be called whenever an item in the list is deleted.
        // Use this to remove the HTML of the message that was deleted.
        messages.on('child_removed', function(data) {
            var id = data.key;
            var msgToDelete = document.getElementById(id);
            messagesList.removeChild(msgToDelete);

        });

    } else {
        // If the user is not logged in, redirect to index.html
        window.location.href = "index.html";
    }
});

var messageForm = document.getElementById("message-form");
var messageInput = document.getElementById("message-input");


// When the user submits the form to send a message,
// add the message to the list of messages.
messageForm.addEventListener("submit", function (e) {
    e.preventDefault();

    signupError.classList.remove("active");

    // Connect to the firebase data
    var database = firebase.database();

    // Get the current user
    currentUser = firebase.auth().currentUser;

    // Get the ref for your messages list
    var messages = database.ref('channels/general');

    // Get the message the user entered
    var message = messageInput.value;

    if(currentUser.emailVerified) {
        // Create a new message and add it to the list.
        messages.push({
            text: message,
            timestamp: new Date().getTime(), // unix timestamp in milliseconds
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            editedTimestamp: ""
        })
        .then(function () {
            messageInput.value = "";
        })
        .catch(function(error) {
        });

    messageInput.focus();
    } else {
        displayError("Please verify your email before posting. Please check your mail.");
        currentUser.sendEmailVerification();
    }
});
