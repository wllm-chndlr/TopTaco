// ********************************** FIREBASE/USER RATING **********************************

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

var userRating = 0;

// Button to submit taco rating
$("#submit-taco-rating").on("click", function(event) {

  event.preventDefault();
  
  // Grabs user rating
  userRating = $("#rating-input").val().trim();
  console.log(userRating);

  // // Creates local temporary object for holding rating data
  // var newRating = {
  //   userRating: userRating
  // };

  // Uploads train data to the database
  database.ref().push({
    newRating: userRating,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  });

  // Notification that train details have been added
  Materialize.toast('Rating submitted!', 3000, 'orange rounded');

  // Clear all the text boxes after submission
  $("#rating-input").val("");
  
  Materialize.updateTextFields();
  
});

// Firebase watcher + initial loader + order
database.ref().orderByChild("dateAdded").on("child_added", function(childSnapshot) {
  
  // Store the snapshot.val() in a variable for convenience
  var tacoz = childSnapshot.val().newRating;

  // Append train details to the div
  $("#tacoRating").append(tacoz);
  
// Handle the errors
}, function(errorObject) {
  console.log("Errors handled: " + errorObject.code);
});

// ********************************** GOOGLE API **********************************

// Define map
var map;
// Define infowindow
var infowindow;
//Define results array
var googleResults = [];
var cleanAddressGoogle = "";
var name = "";
var rating = "";
var address = "";
var splitAddress = "";

//initMap function, places map with location centered
function initMap() {
  var austin = {lat: 30.2672, lng: -97.7431};

  map = new google.maps.Map(document.getElementById('map'), {
    center: austin,
    zoom: 15
  });

  var reqeust = {
    location: austin,
    radius: "100",
    query: "tacos in austin" //text search, can change the query string to anything e.g. shoe stores. 
  }

  infowindow = new google.maps.InfoWindow();
        
  var service = new google.maps.places.PlacesService(map);
  service.textSearch(reqeust, callback);
}

function callback(results, status, pagination) {
  // console.log('running callback provided to google')
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);

      results[i].cleanAddressGoogle = results[i].formatted_address.replace(/\s|\./g, '').split(',')[0];
      googleResults.push(results[i])
      
      var splitAddress = googleResults[i].formatted_address.replace(/\s|\./g, '').split(',')[0];

      // $('#name1').text(googleResults[0].name);
      // $('#address1').text(googleResults[0].formatted_address.split(',')[0]);
      
    }

  }

  if (pagination.hasNextPage) {
    pagination.nextPage();
  } else {
    googleComplete();
  }

}

console.log(googleResults);

// var p = googleResults[0];

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
  map: map,
  position: place.geometry.location
});

google.maps.event.addListener(marker, 'click', function() {
  infowindow.setContent(place.name);
  infowindow.open(map, this);
  });
}

// ********************************** FACEBOOK API **********************************

var facebookResults = [];

function aggregateResults(resultsFb) {
    for (var i = 0; i < resultsFb.length; i++) {
        var inResults = jQuery.inArray(resultsFb[i], facebookResults);
        if (inResults === -1) {
          if ("street" in resultsFb[i].location) {
              resultsFb[i].cleanAddressFb = resultsFb[i].location.street.replace(/\s|\./g, '').split(',')[0];
              facebookResults.push(resultsFb[i]);
          }
        }
    }
}

function getFacebookResults() {
  var fbSearches = ["Taco", "DosBatos", "Chuy's"];

  var fbAppID = "1293487770758016";
  var fbAppSecret = "e0911eecb55544d6de189dd6ad7d169b";

  var fbBaseURL = "https://graph.facebook.com/v2.10/search?";
  var fbSearchPlaces = "type=place&center=30.2666,-97.7333&distance=15000&limit=100&q="; // meters
  var fbSearchFields = "&fields=name,rating_count,overall_star_rating,cover,location,website";
  var fbToken = "&access_token=" + fbAppID + "|" + fbAppSecret;
  var queryURL = ""

  for (var i = 0; i < fbSearches.length; i++) {

    queryURL = fbBaseURL + fbSearchPlaces + fbSearches[i] + fbSearchFields + fbToken;

    $.ajax({
          url: queryURL,
          method: "GET"
      }).done(function(response) {
          // console.log("facebook done!");
          var resultsFb = response.data;
          aggregateResults(resultsFb);
      });
  }
  facebookComplete();
}

getFacebookResults();
console.log(facebookResults);

// ********************************** CROSS-CHECKING **********************************

function googleComplete() {
  googleComplete = true;

  if (facebookComplete) {
    // findDuplicates();
  }
}

function facebookComplete() {
  facebookComplete = true;

  if (googleComplete) {
    // findDuplicates();
  }
  else {
    //
  }
}