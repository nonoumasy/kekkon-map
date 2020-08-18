mapboxgl.accessToken = 'pk.eyJ1Ijoibm9ub3VtYXN5IiwiYSI6ImNrY3JhcXNwMjB6OTYyc2xlb3o3dGNhcnkifQ.BPoX_ntbnFKaazWerS9VsA'

// add to map
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/nonoumasy/ckdhfzyw50pbg1imcpdi81x61',
    center: [139.7520, 35.6404],
    zoom: 13.5,
    bearing: 0,
    pitch: 60,
    scrollZoom: true
})

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

/**
* Assign a unique id to each store. You'll use this `id`
*/
locations.features.forEach(function (store, i) {
    store.properties.id = i
})

map.on('load', function (e) {
    /**
       * This is where your '.addLayer()' used to be, instead
       * add only the source without styling a layer
      */
    map.addSource("places", {
        type: "geojson",
        data: locations,
        cluster: true,
        clusterMaxZoom: 15, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    /**
     * Add all the things to the page:
     * - The location listings on the side of the page
     * - The markers onto the map
    */
    buildLocationList(locations);
    addMarkers();
});


/**
       * Add a marker to the map for every store listing.
      **/
function addMarkers() {
    /* For each feature in the GeoJSON object above: */
    locations.features.forEach(function (marker) {
        /* Create a div element for the marker. */
        var el = document.createElement('div');
        /* Assign a unique `id` to the marker. */
        el.id = "marker-" + marker.properties.id;
        /* Assign the `marker` class to each marker for styling. */
        el.className = 'marker';
        el.style.backgroundImage = 'url(' + marker.properties.gx_media_links + ')'

        /**
         * Create a marker using the div element
         * defined above and add it to the map.
        **/
        new mapboxgl.Marker(el, { offset: [0, 0] })
            .setLngLat(marker.geometry.coordinates)
            .addTo(map);

        /**
         * Listen to the element and when it is clicked, do three things:
         * 1. Fly to the point
         * 2. Close all other popups and display popup for clicked store
         * 3. Highlight listing in sidebar (and remove highlight for all other listings)
        **/
        el.addEventListener('click', function (e) {
            /* Fly to the point */
            flyToStore(marker);
            /* Close all other popups and display popup for clicked store */
            createPopUp(marker);
            /* Highlight listing in sidebar */
            var activeItem = document.getElementsByClassName('active');
            e.stopPropagation();
            if (activeItem[0]) {
                activeItem[0].classList.remove('active');
            }
            var listing = document.getElementById('listing-' + marker.properties.id);
            listing.classList.add('active');
        });
    });
}


function buildLocationList(data) {
    data.features.forEach(function (store, i) {
        /**
         * Create a shortcut for `store.properties`,
         * which will be used several times below.
        **/
        var prop = store.properties;

        /* Add a new listing section to the sidebar. */
        var listings = document.getElementById('listings');
        var listing = listings.appendChild(document.createElement('div'));
        /* Assign a unique `id` to the listing. */
        listing.id = "listing-" + prop.id;
        /* Assign the `item` class to each listing for styling. */
        listing.className = 'item';


        /* Add details to the individual listing. */
        var details = listing.appendChild(document.createElement('div'));
        if (prop.name) {
            details.innerHTML += prop.description;
        }

        /* Add the link to the individual listing created above. */
        var link = listing.appendChild(document.createElement('a'));
        link.href = '#';
        link.className = 'title';
        link.id = "link-" + prop.id;
        link.innerHTML = prop.name;



        /**
         * Listen to the element and when it is clicked, do four things:
         * 1. Update the `currentFeature` to the store associated with the clicked link
         * 2. Fly to the point
         * 3. Close all other popups and display popup for clicked store
         * 4. Highlight listing in sidebar (and remove highlight for all other listings)
        **/
        link.addEventListener('click', function (e) {
            for (var i = 0; i < data.features.length; i++) {
                if (this.id === "link-" + data.features[i].properties.id) {
                    var clickedListing = data.features[i];
                    flyToStore(clickedListing);
                    createPopUp(clickedListing);
                }
            }
            var activeItem = document.getElementsByClassName('active');
            if (activeItem[0]) {
                activeItem[0].classList.remove('active');
            }
            this.parentNode.classList.add('active');
        });
    });
}

// This will let you use the .remove() function later on
if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function () {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

/*
 * Use Mapbox GL JS's `flyTo` to move the camera smoothly
 * a given center point.
**/
function flyToStore(currentFeature) {
    map.flyTo({
        center: currentFeature.geometry.coordinates,
        pitch: 60,
        bearing: 0,
        zoom: 18
    });
}

function createPopUp(currentFeature) {
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    if (popUps[0]) popUps[0].remove();
    var popup = new mapboxgl.Popup({ closeOnClick: true, offset: [-30, 80] })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(`<img src=${currentFeature.properties.gx_media_links} />` + '<h3>' + currentFeature.properties.name + '</h3>')
        .addTo(map);
}

document.getElementById('fly').addEventListener('click', function () {
    // Fly to a random location by offsetting the point -74.50, 40
    // by up to 5 degrees.
    map.flyTo({
        center: [139.6120, 35.6604],
        zoom: 10.5,
        bearing: 0,
        pitch: 50,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });
});
