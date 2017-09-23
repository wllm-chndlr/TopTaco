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

// Define map
var map;
// Define infowindow
var infowindow;
//Define results array
var arr = [];

//initiMap function, places map with location centered
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

function googleComplete() {
  googleComplete = true;

  if (facebookComplete) {
    compareRatings();
  }
}

function facebookComplete() {
  facebookComplete = true;

  if (googleComplete) {
    compareRatings();
  }
}

  function callback(results, status, pagination) {
    console.log('running callback provideed togoogle')
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        createMarker(results[i]);
            //console.log(results[i]);
            //console.log(results.length);
        arr.push(results[i])
            
        //console.log(arr[i].name)
        //console.log(arr[i].formatted_address)
        //console.log(arr[i].rating)
      }
      
      console.log(arr);
    }

    if (pagination.hasNextPage) {
      pagination.nextPage();
    } else {
      googleComplete();
    }
  }

  var p = arr[0];



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