window.onload = function() {

var gent = [51.054344, 3.721660]; // Start locatie
var zoom = 12; //Start zoom
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

var urlParkinglocaties = 'https://datatank.stad.gent/4/mobiliteit/parkinglocaties.geojson';

getJSON(urlParkinglocaties,
    function(data) {
        for (var i in data.coordinates){
            var marker = L.marker([data.coordinates[i]["1"], data.coordinates[i]["0"]],{icon: parkingIcon}).addTo(mymap); //voegt een marker toe
            marker.bindPopup("Parkinglocatie");
        }            
    },
    function(status) {
        console.log(status);
    }
);

var urlVerkeersinfo = 'https://datatank.stad.gent/4/mobiliteit/verkeersberichten.json';

getJSON(urlVerkeersinfo,
    function(data) {
        for (var i in data.geometry){
            var marker = L.marker([data.geometry.coordinates[i]["1"], data.geometry.coordinates[i]["0"]],{icon: taxiIcon}).addTo(mymap); //voegt een marker toe
        }
        console.log('succes');            
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
 * VOORLOPIG IS DIT NOG TE ZWAAR EN VERTRAAGT DIT DE SITE TE VEEL
 * INDIEN MOGELIJK ZOEKEN NAAR OPLOSSING WAARBIJ BV. ENKEL
 * AUTOMATEN DICHTBIJ GELADEN WORDEN
 *
var urlParkeerautom = "https://datatank.stad.gent/4/mobiliteit/parkeerautomatentoekomstig.geojson"

var parkeerAutom = "";

getJSON(urlParkeerautom,
    function(data) {
        for (var i in data.coordinates){
            var parkeerAutom = L.marker([data.coordinates[i]["1"], data.coordinates[i]["0"]],{icon: parkautomIcon}).addTo(mymap); //voegt een marker toe
            parkeerAutom.bindPopup("Parkeerautomaat");
        }            
    },
    function(status) {
        console.log(status);
    }
);

/**
 * Standaardicoon voor popup aanpassen naar nieuw icoon Parkeerautomaat
 *
var parkautomIcon = L.icon({
    iconUrl: 'images/parkautom.png',
    shadowUrl: 'images/parkingshadow.png',

    iconSize: [25,41], //grootte van icon
    shadowSize: [30,21], //grootte van schaduw
    iconAnchor: [12,41], //ankerpunt icon
    shadowAnchor: [0,21], // ankerpunt schaduw
    popupAnchor: [0, -50] //ankerpunt popup
});
*/

/**
 * Haalt de zoekterm van de vorige pagina uit window.name
 * google Places zoekt naar de locatie en maakt een marker op
 * dat bepaalde punt.
 */

var request = {
    query: window.name
};
var mapCenterLat = ""; 
var mapCenterLng = ""; //variabelen aanmaken voor nieuwe Lat en Lng;

service = new google.maps.places.PlacesService(document.createElement('div'));
service.textSearch(request, callback);
function callback(results, status){
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            var marker = L.marker([results[i].geometry.location.lat(), results[i].geometry.location.lng()]).addTo(mymap); //voegt een marker toe
            marker.bindPopup(results[i].formatted_address).openPopup; //voegt een popup toe aan de marker met de zoekterm
            mymap.setView([results[i].geometry.location.lat(), results[i].geometry.location.lng()], zoom); // centreerd de kaart op de gekozen locatie
        }
    }
}

window.name = ""; //Cleart window.name

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
    "Verkeersincidenten": incidentMap    
};

/**
 * Maakt een layer controller waarbij de overlays uit of ingeschakeld kunnen worden.
 */
L.control.layers("", overlays).addTo(mymap);

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
        t.innerHTML = traject + ": <span class='rightalign'>" + result.routes[0].legs[0].duration_in_traffic.text + "</span>";
        document.getElementById('stedenduur').appendChild(t);
        }
    });
}


    


} // End of ONLOAD function