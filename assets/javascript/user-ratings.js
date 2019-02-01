// ********************************** MODAL - LOADING RESULTS **********************************

$(document).ready(function(){
  $('#modal1').modal();
  $('#modal1').modal('open'); 
  $('.parallax').parallax();
});

// ********************************** TAP TARGET **********************************

$("#menu").on("click", function(event) {
  $('.tap-target').tapTarget('open');
});

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
$(".submit-taco-rating").on("click", function(event) {

  event.preventDefault();

  // Grabs button value
  var buttonValue = $(this).attr("value");
  console.log(buttonValue);

  // Grabs user rating
  var inputID = "#x".replace("x", buttonValue);
  var userRating = $(inputID).val().trim();
  console.log(userRating);

  // Grabs taco id
  var tacoID = $(this).attr("data-id");
  console.log(tacoID);

  // Organize user ratings by unique taco id
  var reference = tacoID + "/";

  console.log(reference);
  console.log(userRating);

  // Uploads rating data to the database
  database.ref(reference).push({
    userRating: userRating,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  });

  // Notification that rating has been added
  Materialize.toast('Rating submitted!', 3000, 'orange rounded');

  // Clear all the text boxes after submission
  $("#rating-input").val("");
  
  Materialize.updateTextFields();
  
});

// Firebase watcher + initial loader + order
database.ref().orderByChild("dateAdded").on("child_added", function(childSnapshot) {
  
  // Store the snapshot.val() in a variable for convenience
  var tacoz = childSnapshot.val().newRating;

  // Append rating details to the div
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
    zoom: 12
  });

  var request = {
    location: austin,
    radius: "100",
    query: "tacos in austin" //text search, can change the query string to anything e.g. shoe stores. 
  };

  infowindow = new google.maps.InfoWindow();
        
  var service = new google.maps.places.PlacesService(map);
  service.textSearch(request, callback);
}

function callback(results, status, pagination) {
  // console.log('running callback provided to google')
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      // createMarker(results[i]);

      if ("formatted_address" in results[i]) {

      results[i].cleanAddressGoogle = results[i].formatted_address.replace(/\s|\./g, '').split(',')[0];
      googleResults.push(results[i])
      
      var splitAddress = googleResults[i].formatted_address.replace(/\s|\./g, '').split(',')[0];
     
      }
    }

  }

  if (pagination.hasNextPage) {
    pagination.nextPage();
  } else {
    googleComplete();
  }

}

console.log(googleResults);

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
var facebookIds = [];

function aggregateResults(resultsFb) {
    for (var i = 0; i < resultsFb.length; i++) {
        var facebookId = resultsFb[i].id;
        var inResults = jQuery.inArray(facebookId, facebookIds);
        if (inResults === -1) {
          if ("street" in resultsFb[i].location && "overall_star_rating" in resultsFb[i]) {
            resultsFb[i].cleanAddressFb = resultsFb[i].location.street.replace(/\s|\./g, '').split(',')[0];
            facebookResults.push(resultsFb[i]);

          }
        }
        facebookIds.push(facebookId);
    }
}

function getFacebookResults() {
  var fbSearches = ["Taco", "Dos Batos", "Veracruz All Natural", "Tacos Guerrero"];

  var fbAppID = "1293487770758016";
  var fbAppSecret = "e0911eecb55544d6de189dd6ad7d169b";

  var fbBaseURL = "https://graph.facebook.com/v2.10/search?";
  var fbSearchPlaces = "type=place&center=30.2666,-97.7333&distance=15000&limit=100&q="; // meters
  var fbSearchFields = "&fields=name,rating_count,overall_star_rating,cover,location,website";
  var fbToken = "&access_token=" + fbAppID + "|" + fbAppSecret;

  for (var i = 0; i < fbSearches.length; i++) {

    queryURL = fbBaseURL + fbSearchPlaces + fbSearches[i] + fbSearchFields + fbToken;

    $.ajax({
          url: queryURL,
          method: "GET"
      }).done(function(response) {
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
    findDuplicates();
  }
}

function facebookComplete() {
  facebookComplete = true;

  if (googleComplete) {
    findDuplicates();
  }
  else {
    //
  }
}

var topTaco = [];

function findDuplicates() {

  for (var queso = 0; queso < googleResults.length; queso++) {

    for (var guac = 0; guac < facebookResults.length; guac++) {

      if (googleResults[queso].cleanAddressGoogle.substr(0, 8) === facebookResults[guac].cleanAddressFb.substr(0, 8)) {

          var tacoObject = {};

          tacoObject.ID = facebookResults[guac].id.substr(0, 6);
          tacoObject.Name = googleResults[queso].name;
          tacoObject.GRating = googleResults[queso].rating;
          tacoObject.FRating = facebookResults[guac].overall_star_rating;
          tacoObject.AvgRating = parseFloat(((googleResults[queso].rating + facebookResults[guac].overall_star_rating) / 2).toFixed(2));
          tacoObject.FRatingCount = facebookResults[guac].rating_count;
          tacoObject.Address = facebookResults[guac].location.street;
          tacoObject.Lon = facebookResults[guac].location.longitude;
          tacoObject.Lat = facebookResults[guac].location.latitude;

          if ("cover" in facebookResults[guac]) {
              tacoObject.Photo = facebookResults[guac].cover.source;
          }
          else {
              tacoObject.Photo = "https://orig00.deviantart.net/1986/f/2008/005/d/5/taco_by_taco911.jpg";
          }

          if ("website" in facebookResults[guac]) {
              tacoObject.Website = facebookResults[guac].website;
          }
          else {
              tacoObject.Website = "#";
          }

          topTaco.push(tacoObject);

      }
    }
  }
  console.log(topTaco);
  if (topTaco != undefined && topTaco.length > 24) {
    topTaco = sortTacos(topTaco);
    topTaco = getUserRatings(topTaco);
    displayResults(topTaco);
    addTacosToMap(topTaco);
    $('#modal1').modal('close');
  }
}

function sortTacos(topTaco) {

  topTaco.sort(function(obj1, obj2) {
    return obj2.AvgRating - obj1.AvgRating;
  });

  return topTaco;
}

function displayResults(topTaco) {
  for (var j = 0; j < 11; j++) {
    $("#name" + j).html(topTaco[j].Name);
    $("#button" + j).attr("data-id", topTaco[j].ID);
    $("#image" + j).attr("src", "assets/images/" + topTaco[j].ID + ".jpg");
    $("#address" + j).html(topTaco[j].Address);     
    $("#website" + j).attr("href", topTaco[j].Website);

    if (topTaco[j].URating !== null) {
        $("#rating" + j).html(topTaco[j].AvgRating.toFixed(2) + " / " + topTaco[j].URating.toFixed(2));
    }
    else {
        $("#rating" + j).html(topTaco[j].AvgRating.toFixed(2));
    }
  }
}

function addTacosToMap(topTaco) {
  var bounds = new google.maps.LatLngBounds();

  for (var k = 0; k < 10; k++) {
    var label = k.toString();
    var latLng = new google.maps.LatLng(topTaco[k].Lat, topTaco[k].Lon);
    var icon = "./assets/icons/taco-medium.png";
    var tacoMarker = new google.maps.Marker({
        position: latLng,
        title: topTaco[k].Name,
        label: {fontWeight: "bold", text: label, fontfamily: "Homenaje"},
        map: map,
        icon: icon,
        visible: true
    });
    bounds.extend(tacoMarker.getPosition());
  }
  map.setCenter(bounds.getCenter());
  map.fitBounds(bounds);
}

function getUserRatings(topTaco) {
    var userRatings = [];

    for (var l = 0; l < 10; l++) {
        var tacoID = topTaco[l].ID;
        var tableThing = tacoID + "/";  // todo: what is this?
        var ref = firebase.database().ref(tableThing);
        ref.once("value", function (snapshot) {
            snapshot.forEach(function (messageSnapshot) {
                var userEntry = messageSnapshot.val();
                var userRating = messageSnapshot.val().userRating;
                userRatings.push(parseFloat(userRating));
            });
        });

        if (userRatings.length > 0) {
            var sum;
            var avg;
            sum = userRatings.reduce(function(a, b) { return a + b; });
            avg = sum / userRatings.length;
        }
        else {
            avg = null;
        }
        
        topTaco[l].URating = avg;

        userRatings = [];
    }
    return topTaco;
}