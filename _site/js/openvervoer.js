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
 * Database Import Bezetting Parking
*/ 

var urlTaxi = 'https://datatank.stad.gent/4/mobiliteit/taxilocaties.geojson';//Database met bezettingsgraad van de parkings in Gent

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

getJSON(urlTaxi,
    function(data) {
        for (var i in data.coordinates){
            var marker = L.marker([data.coordinates[i]["1"], data.coordinates[i]["0"]],{icon: fietsIcon}).addTo(mymap); //voegt een marker toe
            marker.bindPopup("Taxi's");
        }            
    },
    function(status) {
        console.log(status);
    }
);

/**
 * Standaardicoon voor popup aanpassen naar nieuw icoon Fietsvoorziening
 */
var fietsIcon = L.icon({
    iconUrl: 'images/fietsicon.png',
    shadowUrl: 'images/parkingshadow.png',

    iconSize: [25,41], //grootte van icon
    shadowSize: [30,21], //grootte van schaduw
    iconAnchor: [12,41], //ankerpunt icon
    shadowAnchor: [0,21], // ankerpunt schaduw
    popupAnchor: [0, -50] //ankerpunt popup
});

var urlCambio = '';

getJSON(urlCambio,
    function(data) {
        for (var i in data.coordinates){
            var marker = L.marker([data.coordinates[i]["1"], data.coordinates[i]["0"]],{icon: fietsIcon}).addTo(mymap); //voegt een marker toe
            marker.bindPopup("Taxi's");
        }            
    },
    function(status) {
        console.log(status);
    }
);

var urlDelijn = 'https://datatank.stad.gent/4/mobiliteit/delijnhalteslijn21';

getJSON(urlDelijn,
    function(data) {
        for (var i in data){
            var marker = L.marker([data.rtLijnRitten.rtDoortochten.coordinaat.lt[i]["1"], data.rtLijnRitten.rtDoortochten.coordinaat.ln[i]["0"]],{icon: fietsIcon}).addTo(mymap);
            marker.bindPopup("Taxi's");
        }            
    },
    function(status) {
        console.log(status);
    }
);

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

}