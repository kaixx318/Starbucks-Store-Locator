var map;
var markers = [];
var infoWindow;

//Initialise Google Maps
function initMap() {
    var singapore = {
        lat:1.3521,
        lng:103.8198
    }
    map = new google.maps.Map(document.getElementById('map'), {
    center: singapore,
    zoom: 8
    });
    infoWindow = new google.maps.InfoWindow(); //store info window
    setOnEnterListerner(); //search input responds to "enter"
    searchStore();  
}

//Function to respond to "Enter" on keyboard
function setOnEnterListerner() {
    var input = document.getElementById("user-search-input");
    input.addEventListener("keyup",function(event){
        if (event.keyCode === 13) {
            event.preventDefault();
            searchStore();
        }
    })
}

//Search for stores based on input
function searchStore() {
    var foundStores = [];
    var searchInput = document.getElementById('user-search-input').value;
    if(searchInput){
        stores.forEach(function(store){

            //Search by postal code
            var postal = store.address.postalCode.substring(0,6);
            if(postal == searchInput){
                foundStores.push(store);
            }

            //Search by location name
            var addressName = store.addressLines;
            addressName = addressName.join().toLowerCase(); //convert address to lowercase string
            if(addressName.includes(searchInput)){
                foundStores.push(store);
            }
        });
    }
    else {
        foundStores=stores; //show all stores if no user input
    }
    clearLocationMarkers(); //clear location markers if someone enters zipcode
    displayStores(foundStores); //display all the foundstores based on search input
    displayStoreMarkers(foundStores); //display store markers
    setOnClickListener(); //display pop up info window when clicked
}

//Clear all the location markers and info window
function clearLocationMarkers() {
    infoWindow.close();
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers.length = 0;
}

//Function to pop up info window when clicked on stores/markers
function setOnClickListener() {
    var storeElements = document.querySelectorAll('.store-container');
    storeElements.forEach(function(elem,index){
        elem.addEventListener('click',function(){
            google.maps.event.trigger(markers[index], 'click');
        })
    })
}

//Display store info on the container list
function displayStores(stores) {
    var storesHtml = "";
    stores.forEach(function(store, index){
        var address = store.addressLines;
        var name = store.name;
        if (address[2]== null){
            address[2]=""; //standardise all stores to have same address length
        }
        storesHtml += `
        <div class="store-container">
            <div class="store-container-background">
                <div store ="store-info-container">
                    <div class="store-address">
                        ${name}
                    </div>
                    <div class="store-phone-number">
                        <span>${address[0]}</span>
                        <br/>
                        <span>${address[1]}</span>
                        <br/>
                        <span>${address[2]}</span>
                    </div>
                </div>       
                <div class="store-number-container">
                    <div class="store-number">
                    ${index+1}
                    </div>
                </div>     
            </div>
        </div>
    `
    });
    document.querySelector('.store-list').innerHTML = storesHtml;
}

//Put markers on stores
function displayStoreMarkers(stores) {
    var bounds = new google.maps.LatLngBounds(); //bound for google map display
    stores.forEach(function(store,index){
        var latlng = new google.maps.LatLng( //get coordinates of stores
            store.coordinates.latitude,
            store.coordinates.longitude);
        var name = store.name;
        var address = store.addressLines;
        bounds.extend(latlng); //extend bounds to include all the locations
        createMarker(latlng,name,address,index);
    })
    map.fitBounds(bounds); //fit all the markers in the map
    }

// Create marker on map + Link to google map directions when icon clicked
function createMarker(latlng, name, address,index) {
    var encodeNameURI = encodeURIComponent(name);
    var html = `
        <div class="store-info-window">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeNameURI}" 
            style="text-decoration:none;">
            <div class="store-info-name">
                <div class="drinks-icon">
                    <i class="fas fa-coffee"></i>
                </div>
                <div class="store-name">
                    ${name}
                </div>
            </div>
            <div class="store-info-address">
                <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeNameURI}" 
                style="text-decoration:none;">
                    <div class="circle">
                        <i class="fas fa-location-arrow"></i>
                    </div>
                </a>
                <div class="store-address-name">
                    <span>${address[0]}</span>
                    <br/>
                    <span>${address[1]}</span>
                    <br/>
                    <span>${address[2]}</span>
                </div>
            </div>
            </a>
        </div>    
    `;
    var marker = new google.maps.Marker({
        map: map,
        position: latlng,
        label:`${index+1}`
    });

    //On click of the marker, set content to info window, then show info window
    google.maps.event.addListener(marker, "click", function() {
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
    });
    markers.push(marker); // append all marker to list
}