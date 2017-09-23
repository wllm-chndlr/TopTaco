// Initialize Firebase
var config = {
  apiKey: "AIzaSyDYHtujNwrjbWo4W27RWfhsdRW0isii6j0",
  authDomain: "top-taco-fa533.firebaseapp.com",
  databaseURL: "https://top-taco-fa533.firebaseio.com",
  projectId: "top-taco-fa533",
  storageBucket: "",
  messagingSenderId: "490159101789"
};
 firebase.initializeApp(config);

// Assign Firebase database to a variable
var database = firebase.database();

// Button to submit taco rating
$("#submit-taco-rating").on("click", function(event) {

  event.preventDefault();
  
  // Grabs user rating
  var userRating = $("#rating-input").val().trim();
  console.log(userRating);

  // Creates local temporary object for holding train data
  var newRating = {
    userRating: userRating
  };

  // Uploads train data to the database
  database.ref().push(newRating);

  // Notification that train details have been added
  Materialize.toast('Rating submitted!', 3000, 'orange rounded');

  // Clear all the text boxes after submission
  $("#rating-input").val("");
  
  Materialize.updateTextFields();
  
});

// Firebase watcher + initial loader + order
database.ref().orderByChild("dateAdded").on("child_added", function(snapshot) {
  
  // Store the snapshot.val() in a variable for convenience
  var tacoz = snapshot.val();

  // Append train details to the div
  $("#tacoRating").append(tacoz.userRating);
  
// Handle the errors
}, function(errorObject) {
  console.log("Errors handled: " + errorObject.code);
});