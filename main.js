(function(){

  $(document).ready(initialize);

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyD6UE1fmG1ZqXqww_3TdoOXbJhFqn4AeOw",
    authDomain: "map-ex-bafc8.firebaseapp.com",
    databaseURL: "https://map-ex-bafc8.firebaseio.com",
    projectId: "map-ex-bafc8",
    storageBucket: "map-ex-bafc8.appspot.com",
    messagingSenderId: "675117857496"
  };

  var map;
  var lat = 0;
  var long = 0;
  var current_location;
  // var x = document.getElementById("demo");

  function initialize(){
    firebase.initializeApp(config);
    $('#submitButton').on('click',saveData);
    $('.modal').modal();
    findlocation();
  }

  function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
          zoom: 13,
          center: {lat:lat, lng:long}
        });
  }

  function addMarker(elat,elong){
    var latLng = new google.maps.LatLng(elat,elong);
    marker = new google.maps.Marker({
      map: map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });
  }

  function saveData(){
    var description = $('#description').val();

    var entry ={
      description: description,
      lat: lat,
      long: long,
    }

    var newEntryKey = firebase.database().ref().child('Entry').push().key;
    var updates = {};
    updates['/Entry/' + newEntryKey] = entry;

    firebase.storage().ref().child('images/entry/' + newEntryKey).put($('#uploadfile')[0].files[0]).then(function(snapshot){
      return firebase.database().ref().update(updates).then(function(){
        window.location.replace('./index.html');
      });
    }).catch(function(error){
      console.log(error);
    });
  }

  function findEntriesNearMe() {
    console.log('finding entries near me');
    // $('#story').empty();
    firebase.database().ref('Entry').once('value', function(snapshot){
      var entry = snapshot.val();

      for(var i in entry){
        var lat = entry[i].lat;
        var long = entry[i].long;
        var description = entry[i].description;
        var location = {lat : lat, long : long};
        // this is where we send the entry location to the haersine formula to
        // be compared against the current location of the user.

        addMarker(lat,long);
        firebase.storage().ref().child("images/entry/" + i).getDownloadURL().then(function(url) {
          console.log(description);
          console.log(url)
        }).catch(function(error) {
          console.log(error);
        });

      }
    });
  }

//=====all of this is geolocation
  function findlocation(){
    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    };

    function success(pos) {
      var crd = pos.coords;
      lat = crd.latitude;
      long = crd.longitude;
      current_location = {lat, long};
      initMap();
      findEntriesNearMe();
    };
    navigator.geolocation.watchPosition(success, error, options);
  }
//=============================



})();
