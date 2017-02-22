/*
 * This file should contain code for the following tasks:
 * 1. Create a new account.
 * 2. Sign in an existing account.
 * 3. Redirect a user to chat.html once they are logged in/signed up.
 */

// Store our DOM elements
var loginForm = document.getElementById("login-form");
var loginEmail = document.getElementById("login-email");
var loginPassword = document.getElementById("login-password");
var loginButton = document.getElementById("login-button");
var finishedSignUp = true;


// Function for displaying an error.

function displayError(errorMessage) {
    signupError.textContent = errorMessage;
    signupError.classList.add("active");
}

// When the user logs in, send the email and password to firebase.
// Firebase will determine whether or not the user logged in correctly.
loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var email = loginEmail.value;
    var password = loginPassword.value;

    // If the login was successful, the .then callback will be called.
    // Otherwise, the .catch callback will be called,
    // with an error object containing the error message.
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function() {
    })
    .catch(function(error) {
    });
});

var signupForm = document.getElementById("signup-form");
var signupName = document.getElementById("signup-name");
var signupEmail = document.getElementById("signup-email");
var signupPassword = document.getElementById("signup-password");
var signupPasswordConfirm = document.getElementById("signup-password-confirm");
var signupError = document.getElementById("signup-error");

signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    signupError.classList.remove("active");
    finishedSignUp = false;

    var displayName = signupName.value;
    var email = signupEmail.value;
    var password = signupPassword.value;
    var passwordConfirm = signupPasswordConfirm.value;

    if (password !== passwordConfirm) {
        displayError("The two given passwords do not match. Please try again.");
    } else {
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function (user) {

            // Update their display name and profile picture
            // displayName , photoURL
            user.updateProfile({
                displayName: displayName,
                photoURL: "https://www.gravatar.com/avatar/" + md5(email)
            }).then(function() {
                // Send verification email
                user.sendEmailVerification()
                .then(function() {
                    window.location.href = "chat.html";
                }, function(error) {
                    displayError("There was an error sending the verification email. Please try again or contact support.");
                });
            }, function(error) {
                displayError(error.message);
            });
            
            // Redirect to chat page (dont do this until the other two actions have completed succesfully)
            finishedSignUp = true;
        })
        .catch(function (error) {
            displayError(error.message);
        });
    }
});

// This callback is called whenever the user's logged in state changes,
// e.g. when the page first loads, when a user logs in, when a user logs out.
firebase.auth().onAuthStateChanged(function(user) {
  // If the user parameter is truthy,
  // the user is logged in.
    if (user) {
        if (finishedSignUp === true) {
            window.location.href = "chat.html";
        }
    } else {
        // Otherwise, they have not signed in.
    }
});

