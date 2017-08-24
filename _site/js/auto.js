window.onload = function() {

var gent = [51.054344, 3.721660]; // Start locatie
var zoom = 14; //Start zoom
/**
 * Map Setup Leaflet & Mapbox
 */
var mymap = L.map('mapid').setView(gent, zoom);

var standardMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiamVsbGR1dHIiLCJhIjoiY2ozeTh0cTcyMDAxMjJ3bGJhdTR1cHVsbCJ9.mEm-yeidnWPkrugmE0PaQA'
}).addTo(mymap);

/**
 * Huidige locatie opvragen en marker zetten
 */

var currentPosition = {
    _latlng: {
        lat: "",
        lng:""
    }
};
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition,showError);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
};

function showPosition(position) {
    currentPosition = L.marker([position.coords.latitude, position.coords.longitude],{icon: locationIcon}).addTo(mymap);
    currentPosition.bindPopup("Uw huidige locatie");
};

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            myLocation = {};
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            myLocation = {};
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            myLocation = {};
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            myLocation = {};
            break;
    }
}
getLocation();

/**
 * Standaardicoon voor popup aanpassen naar nieuw icoon Huidige locatie
 */
var locationIcon = L.icon({
    iconUrl: 'images/huidigelocatieicon.png',
    shadowUrl: 'images/parkingshadow.png',

    iconSize: [25,41], //grootte van icon
    shadowSize: [30,21], //grootte van schaduw
    iconAnchor: [12,41], //ankerpunt icon
    shadowAnchor: [0,21], // ankerpunt schaduw
    popupAnchor: [0, -50] //ankerpunt popup
});


/**
 * Haalt de zoekterm van de vorige pagina uit een cookie
 * google Places zoekt naar de locatie en maakt een marker op
 * dat bepaalde punt.
 */
function getCookie() {
    var name = "location=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

var request = {
    query: getCookie()
};
var eindLocatie = {};
var PP = document.createElement("p"); 


service = new google.maps.places.PlacesService(document.createElement('div'));
service.textSearch(request, callback);
function callback(results, status){
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            eindLocatie = L.marker([results[i].geometry.location.lat(), results[i].geometry.location.lng()], {icon: bestemmingIcon}).addTo(mymap); //voegt een marker toe
            eindLocatie.bindPopup(results[i].formatted_address).openPopup; //voegt een popup toe aan de marker met de zoekterm
            mymap.setView([results[i].geometry.location.lat(), results[i].geometry.location.lng()], zoom); // centreerd de kaart op de gekozen locatie
        }
    }

    getJSON(urlParking,
        function(data) {
            for(var i in data){ //for in loop voor elk object

                if (distanceLatLonM(data[i].latitude, data[i].longitude, currentPosition._latlng.lat, currentPosition._latlng.lng)<500||
                    distanceLatLonM(data[i].latitude,data[i].longitude, eindLocatie._latlng.lat, eindLocatie._latlng.lng)<500){
                        PP.innerHTML += data[i].name + ": " + "<span class='righttextalign'>" + data[i].parkingStatus.availableCapacity + " plaatsen vrij</span></br><hr>";
                    }

            }
                    
        },
        function(status) {
            console.log(status);
        }
    );

    document.getElementById('parkplaatsen').appendChild(PP);
}

/**
 * Standaardicoon voor popup aanpassen naar nieuw icoon Bestemming
 */
var bestemmingIcon = L.icon({
    iconUrl: 'images/bestemmingicon.png',
    shadowUrl: 'images/parkingshadow.png',

    iconSize: [25,41], //grootte van icon
    shadowSize: [30,21], //grootte van schaduw
    iconAnchor: [12,41], //ankerpunt icon
    shadowAnchor: [0,21], // ankerpunt schaduw
    popupAnchor: [0, -50] //ankerpunt popup
});

/**
 * functie voor berekenen afstand Lat Long naar Meter
 */

function distanceLatLonM(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
        var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
        var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c * 1000; // Distance in m
        return d;
}

/**
 * Database Import Bezetting Parking
*/ 

var urlParking = 'https://datatank.stad.gent/4/mobiliteit/bezettingparkingsrealtime.json';//Database met bezettingsgraad van de parkings in Gent

/**
 * 
 * @param {*string} url Url naar de online Database
 * @param {*function} successHandler Functie die uitgevoerd wordt bij succesvol laden DB
 * @param {*function} errorHandler Functie die uitgevoerd wordt bij falen laden DB
 */
function getJSON(url, successHandler, errorHandler){
        var xhr = typeof XMLHttpRequest != 'undefined'
            ? new XMLHttpRequest()
            : new ActiveXObject('Microsoft.XMLHTTP');

        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4){
                if (xhr.status == 200) {
                    var data = (!xhr.responseType)?JSON.parse(xhr.response):xhr.response;
                    successHandler && successHandler(data);
                } else {
                    errorHandler && errorHandler(status);
                }
            }
        };
        xhr.open('get', url, true);
        xhr.responseType = 'json';
        xhr.send();
    
}
/**
 * Aanroepen van de database en bepaalde handeling uitvoeren als succes
 * indien een error: wegschrijven naar console
 */

//var PP = document.createElement("p"); 

getJSON(urlParking,
    function(data) {
        for(var i in data){ //for in loop voor elk object
            var marker = L.marker([data[i].latitude, data[i].longitude],{icon: parkingIcon}).addTo(mymap); //voegt een marker toe
            marker.bindPopup("<h3>"+data[i].name+"</h3><br /> <b> Vrije plaatsen: "+data[i].parkingStatus.availableCapacity+"</b>");
        }
                
    },
    function(status) {
        console.log(status);
    }
);

//document.getElementById('parkplaatsen').appendChild(PP);

var urlParkinglocaties = 'https://datatank.stad.gent/4/mobiliteit/parkinglocaties.geojson';

getJSON(urlParkinglocaties,
    function(data) {
        for (var i in data.coordinates){
            var marker = L.marker([data.coordinates[i]["1"], data.coordinates[i]["0"]],{icon: parkingSmall}).addTo(mymap); //voegt een marker toe
            marker.bindPopup("Parkinglocatie");
        }            
    },
    function(status) {
        console.log(status);
    }
);


/**
 * Standaardicoon voor popup aanpassen naar nieuw icoon Parking
 */
var parkingIcon = L.icon({
    iconUrl: 'images/parkingpopup.png',
    shadowUrl: 'images/parkingshadow.png',

    iconSize: [25,41], //grootte van icon
    shadowSize: [30,21], //grootte van schaduw
    iconAnchor: [12,41], //ankerpunt icon
    shadowAnchor: [0,21], // ankerpunt schaduw
    popupAnchor: [0, -50] //ankerpunt popup
});
var parkingSmall = L.icon({
    iconUrl: 'images/parkingsmall.png',
    shadowUrl: 'images/parkingshadow.png',

    iconSize: [18,29], //grootte van icon
    shadowSize: [30,21], //grootte van schaduw
    iconAnchor: [9,29], //ankerpunt icon
    shadowAnchor: [0,21], // ankerpunt schaduw
    popupAnchor: [0,-30] //ankerpunt popup
});

var taxiIcon = L.icon({
    iconUrl: 'images/taxi.png',
    shadowUrl: 'images/parkingshadow.png',

    iconSize: [25,41], //grootte van icon
    shadowSize: [30,21], //grootte van schaduw
    iconAnchor: [12,41], //ankerpunt icon
    shadowAnchor: [0,21], // ankerpunt schaduw
    popupAnchor: [0, -50] //ankerpunt popup
});
/**
 * PARKEER AUTOMATEN TOEVOEGEN AAN KAART
 * Enkel de automaten binnen de 200m van de start- en eindlocatie worden getoond
 * Worden ook enkel getoond vanaf een bepaald zoomlevel
 */
var urlParkeerautom = "https://datatank.stad.gent/4/mobiliteit/parkeerautomatentoekomstig.geojson"


var parkeerAutom = {};
var parkeerArray = [];
var parkAutomGroup = L.layerGroup();
var parkeerArrayIsSet = false; //moet dubbele markers in array voorkomen

var zoomLevel = mymap.getZoom();
var zoomFactor = 0;

mymap.on('zoom', function(){
    zoomFactor = zoomLevel - mymap.getZoom();
    zoomLevel = mymap.getZoom();
});

mymap.on('zoom', function(){
    if (zoomLevel == 15 && zoomFactor== -1){
        getJSON(urlParkeerautom,
            function(data) {
                if (parkeerArrayIsSet == false){
                    for (var i in data.coordinates){
                        if (distanceLatLonM(data.coordinates[i]["1"],data.coordinates[i]["0"], currentPosition._latlng.lat, currentPosition._latlng.lng)<200 ||
                        distanceLatLonM(data.coordinates[i]["1"],data.coordinates[i]["0"], eindLocatie._latlng.lat, eindLocatie._latlng.lng)<200){
                                parkeerAutom = L.marker([data.coordinates[i]["1"], data.coordinates[i]["0"]],{icon: parkautomIcon}).bindPopup("Parkeerautomaat"); //voegt een marker toe
                                parkeerArray.push(parkeerAutom);
                        }
                    }
                }
                 parkeerArrayIsSet = true;
                parkAutomGroup = L.layerGroup(parkeerArray);
                parkAutomGroup.addTo(mymap);
            },
            function(status) {
                console.log(status);
            }
        );
    };
    if (zoomLevel == 14 && zoomFactor== 1) {
            parkAutomGroup.remove();
    };
});




/**
 * Standaardicoon voor popup aanpassen naar nieuw icoon Parkeerautomaat
 */
var parkautomIcon = L.icon({
    iconUrl: 'images/parkautom.png',
    shadowUrl: 'images/parkingshadow.png',

    iconSize: [25,41], //grootte van icon
    shadowSize: [30,21], //grootte van schaduw
    iconAnchor: [12,41], //ankerpunt icon
    shadowAnchor: [0,21], // ankerpunt schaduw
    popupAnchor: [0, -50] //ankerpunt popup
});



/**
 * Voegt de kaartlaag van Tomtom met trafficflow toe aan de kaart
 */

var trafficMap = L.tileLayer('https://api.tomtom.com/traffic/map/4/tile/flow/relative-delay/{z}/{x}/{y}.png{key}', {
     tms: false,
     attribution: "Verkeersinformatie door Tomtom",
     opacity: 0.7,
     key: "?key=GSOOmhRUjrwOlv4gtlX86BMCdhAr1hgE"
}).addTo(mymap);

/**
 * Voegt de kaartlaag van Tomtom met trafficincidents toe aan de kaart
 */

var incidentMap = L.tileLayer('https://api.tomtom.com/traffic/map/4/tile/incidents/s1/{z}/{x}/{y}.png{key}', {
     tms: false,
     attribution: "Verkeersinformatie door Tomtom",
     opacity: 0.7,
     key: "?key=GSOOmhRUjrwOlv4gtlX86BMCdhAr1hgE"
}).addTo(mymap);


/**
 * Maakt een layergroup overlays
 */
var overlays = {
    "Verkeersdrukte": trafficMap,
    "Verkeersincidenten": incidentMap,
};

/**
 * Maakt een layer controller waarbij de overlays uit of ingeschakeld kunnen worden.
 */
L.control.layers("", overlays).addTo(mymap);

/**
 * Berekenen van de reistijden en wegschrijven naar de DOM
 */

var reistijdObject = {
    brusselgent: {
        traject: "Brussel - Gent",
        start: {lat: 50.871557, lng: 4.287810},
        end: {lat: 51.037383, lng: 3.733143}},
    antwerpengent: {
        traject: "Antwerpen - Gent",
        start: {lat: 51.190788, lng: 4.412466},
        end: {lat: 51.037383, lng: 3.733143}},
    oostendegent: {
        traject: "Oostende - Gent",
        start: {lat: 51.219017, lng: 2.923636},
        end: {lat: 51.037383, lng: 3.733143}},
    kortrijkgent: {
        traject: "Kortrijk - Gent",
        start: {lat: 50.814343, lng: 3.268458},
        end: {lat: 51.037383, lng: 3.733143}},
};

for(var i in reistijdObject) {

    var directionsService = new google.maps.DirectionsService();
    var start = reistijdObject[i].start;
    var end = reistijdObject[i].end;

    var date = new Date(Date.now());
    var request = {
        origin: start,
        destination: end,
        travelMode: 'DRIVING',
        drivingOptions: {
            departureTime: date
        }
    };
    
    directionsService.route(request, function(result, status) {
        if (status == 'OK') {
        var t = document.createElement("p");
        startLoc= result.routes[0].legs[0].start_location;
        if (startLoc == "(50.8713565, 4.287413499999957)"){
            traject = "Brussel - Gent";
        }; 
        if (startLoc == "(51.1907805, 4.4124663000000055)"){
            traject = "Antwerpen - Gent";
        };
        if (startLoc == "(51.21839689999999, 2.923574300000041)"){
            traject = "Oostende - Gent";
        };
        if (startLoc == "(50.8145271, 3.2677426000000196)"){
            traject = "Kortrijk - Gent";
        };
        t.innerHTML = traject + ": <span class='rightalign'>" + result.routes[0].legs[0].duration_in_traffic.text + "</span><hr>";
        document.getElementById('stedenduur').appendChild(t);
        }
    });
}


    


} // End of ONLOAD function