window.onload = function(){

/**
 * Zorgt ervoor dat de gebruiker doorverwezen wordt naar de 
 * pagina van het vervoermiddel dat hij aangegeven heeft.
 * De locatie wordt meegegeven met window.name zodat het beschikbaar
 * is op de volgende pagina.
 */

    var locForm = document.getElementById("locForm")
    locForm.onsubmit = function redirect(e) {

        e.preventDefault();
        document.cookie = "location =" + locForm.locat.value + ";path=/";
        window.location = locForm.transp.value;
    }
/**
 * Voegt de Google Places zoekbar toe.
 * Men kan dus gebruik maken van de autofill.
 */
var standardBounds = new google.maps.LatLngBounds( //bepaald het kader waarbinnen de zoektermen gespecifieerd worden
  new google.maps.LatLng(51.012670, 3.647824),
  new google.maps.LatLng(51.112838, 3.831590));

var input = document.getElementById("goTo");

var autocomplete = new google.maps.places.Autocomplete(input);

autocomplete.setOptions({ //zet instellingen autocomplete
  bounds: standardBounds,
  types: ['geocode'] //zorgt ervoor dat enkel plaatsen met een vast adres getoond worden
})


}