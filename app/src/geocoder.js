/**
 * GeocodingLocation
 * @param container
 * @param plugin
 * @param config
 */
function GeocodingLocation(container, plugin, config) {
    this.config = config;
    this.plugin = plugin;
    this.container = container;
    this.containerResultsList = null;

    this.buildHTML();
}

/**
 * buildHTML
 */
GeocodingLocation.prototype.buildHTML = function () {
    var template =
        '<div class="gr-wgs-homestore-panel-address-wrapper">' +
        '<label>' + this.config.L10n.searchAroundMeTitle + '</label>' +
        '<form class="gr-wgs-homestore-panel-searchBlock-form">' +
        '<input class="gr-wgs-homestore-panel-searchBlock-btn gr-wgs-homestore-panel-address-btn" type="text" placeholder="' + this.config.L10n.autocompletePlaceholder + '"/>' +
        '</form>' +
        '<div class="gr-wgs-homestore-panel-address-reset"></div>' +
        '</div>' +
        '<div class= "gr-wgs-homestore-panel-address-results gr-wgs-pac-container"></div>';

    this.container.insertAdjacentHTML('beforeend', template);
    this.containerResultsList = this.container.querySelector('.gr-wgs-homestore-panel-address-results');

    var self = this;

    // handle the key events on the input to trigger a search or navigate in the results list 
    this.container.querySelector('input').addEventListener('keyup', function (event) {
        // key enter
        if (event.keyCode === 13) {
            if (self.containerResultsList.querySelectorAll('.gr-wgs-pac-item').length === 0) {
                self.geocode(event.target.value);
            }
            else {
                var clickEvent = document.createEvent('MouseEvents');
                clickEvent.initEvent("click", true, true);
                if (self.containerResultsList.querySelectorAll('.gr-wgs-pac-item-selected').length > 0) {
                    self.containerResultsList.querySelector('.gr-wgs-pac-item-selected').dispatchEvent(clickEvent);
                }
                else {
                    self.containerResultsList.querySelector('.gr-wgs-pac-item').dispatchEvent(clickEvent);
                }
            }
        }
        // key up
        else if (event.keyCode === 38) {
            if (self.containerResultsList.querySelectorAll('.gr-wgs-pac-item-selected').length > 0) {
                self.containerResultsList.querySelector('.gr-wgs-pac-item-selected').previousElementSibling.classList.add('gr-wgs-pac-item-selected');
                self.containerResultsList.querySelector('.gr-wgs-pac-item-selected:last-child').classList.remove('gr-wgs-pac-item-selected');
            }
            else {
                self.containerResultsList.querySelector('.gr-wgs-pac-item:last-child').classList.add('gr-wgs-pac-item-selected');
            }
        }
        // key down
        else if (event.keyCode === 40) {
            if (self.containerResultsList.querySelectorAll('.gr-wgs-pac-item-selected').length > 0) {
                self.containerResultsList.querySelector('.gr-wgs-pac-item-selected').nextElementSibling.classList.add('gr-wgs-pac-item-selected');
                self.containerResultsList.querySelector('.gr-wgs-pac-item-selected').classList.remove('gr-wgs-pac-item-selected');
            }
            else {
                self.containerResultsList.querySelector('.gr-wgs-pac-item').classList.add('gr-wgs-pac-item-selected');
            }
        }
    });

    // handle click event on a geocoding result in the list
    // self.containerResultsList.delegate('.gr-wgs-pac-item','click', function(event){
    self.containerResultsList.addEventListener('click', function (event) {
        var target = event.target;
        var pacItem = target.closest('.gr-wgs-pac-item');
        var lat = pacItem.getAttribute('data-lat');
        var lng = pacItem.getAttribute('data-lng');
        self.container.querySelector('input').value = pacItem.querySelector('.gr-wgs-pac-item-query').innerText;

        self.askForStores(lat, lng);
        self.containerResultsList.style.display = 'none';
        self.containerResultsList.innerHTML = '';
    }, true);

    // handle the click on the reset search field button
    self.container.querySelector('.gr-wgs-homestore-panel-address-reset').addEventListener('click', function () {
        self.container.querySelector('input').value = '';
        self.containerResultsList.style.display = 'none';
        self.containerResultsList.innerHTML = '';
        self.plugin.ui.hideResultsBlock();
    });

    // cancel the submit event in the form
    this.container.querySelector('form.gr-wgs-homestore-panel-searchBlock-form').addEventListener('submit', function (event) {
        event.preventDefault();

        return false;
    });
};
/**
 * buildHTMLResults
 * @param results
 */
GeocodingLocation.prototype.buildHTMLResults = function (results) {

    var self = this;
    var buildResult = function (result) {

        var coor = result.geometry.location;
        var template =
            '<div class="gr-wgs-pac-item" data-lat="' + coor.lat() + '" data-lng="' + coor.lng() + '">' +
            '<span class="gr-wgs-pac-icon gr-wgs-pac-icon-marker"></span>' +
            '<span class="gr-wgs-pac-item-query">' + result.formatted_address + '</span>' +
            '</div>';

        self.containerResultsList.insertAdjacentHTML('beforeend', template);
    };
    this.containerResultsList.innerHTML = '';
    this.containerResultsList.style.display = 'block';

    for (var i = 0; i < results.length; i++) {
        buildResult(results[i]);
    }
};
/**
 * askForRecommendation
 * @param lat
 * @param lng
 */
GeocodingLocation.prototype.askForRecommendation = function (lat, lng) {
    this.plugin.manager.SearchedRecommendation(lat, lng);
};
/**
 * askForStores
 * @param lat
 * @param lng
 */
GeocodingLocation.prototype.askForStores = function (lat, lng) {
    this.plugin.manager.SearchedStores(lat, lng);
};
/**
 * geocode
 * @param address
 */
GeocodingLocation.prototype.geocode = function (address) {
    var request = {
        address: address,
        region: 'fr'
    };
    var geocoder = new google.maps.Geocoder();
    var self = this;
    geocoder.geocode(request, function (results, status) {
        if (status === google.maps.GeocoderStatus.UNKNOWN_ERROR) {
            self.geocode(address);
        }
        else if (status === google.maps.GeocoderStatus.OK) {
            if (results.length === 1) {
                self.container.querySelector('.gr-wgs-homestore-panel-searchBlock-btn').value = results[0].formatted_address;
                var coords = results[0].geometry.location;
                self.askForStores(coords.lat(), coords.lng());
            }
            else {
                self.buildHTMLResults(results);
            }
        }
        else {
            console.error(status);
        }
    });
};

module.exports = GeocodingLocation;
