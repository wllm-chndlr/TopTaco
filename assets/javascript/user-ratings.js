// Initialize Firebase
var config = {
   apiKey: "AIzaSyAWF_HOzVwnPQnSy2_DFn4EV6KXvID7IiA",
   authDomain: "top-taco-93ba2.firebaseapp.com",
   databaseURL: "https://top-taco-93ba2.firebaseio.com",
   projectId: "top-taco-93ba2",
   storageBucket: "",
   messagingSenderId: "774600990759"
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

  // Append train details to the table
  $("#tacoRating").append(tacoz.userRating);
  
// Handle the errors
}, function(errorObject) {
  console.log("Errors handled: " + errorObject.code);
});