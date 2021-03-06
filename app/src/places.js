/**
 * PlacesLocation
 * @param container
 * @param plugin
 * @param config
 */
function PlacesLocation(container, plugin, config) {
    this.config = config;
    this.plugin = plugin;
    this.container = container;
    this.containerPredictionsList = null;
    this.buildHTML();
}

/**
 * buildHTML
 */
PlacesLocation.prototype.buildHTML = function () {
    var template =
        '<div class="gr-wgs-homestore-panel-address-wrapper">' +
        '<label>' + this.config.L10n.searchAroundMeTitle + '</label>' +
        '<div class="gr-wgs-homestore-panel-searchBlock-form">' +
        '<input class="gr-wgs-homestore-panel-address-input" type="text" placeholder="' + this.config.L10n.autocompletePlaceholder + '"/>' +
        '</div>' +
        '<div class="gr-wgs-homestore-panel-address-reset"></div>' +
        '<div class="gr-wgs-homestore-panel-address-loader"></div>' +
        '</div>' +
        '<div class= "gr-wgs-homestore-panel-address-predictions gr-wgs-pac-container"></div>';

    this.container.insertAdjacentHTML('beforeend', template);
    this.containerPredictionsList = this.container.querySelector('.gr-wgs-homestore-panel-address-predictions');

    var self = this;

    this.container.querySelector('input').addEventListener('keyup', function (event) {
        var selectedItemClass = 'gr-wgs-pac-item-selected';
        var selectedItem = self.containerPredictionsList.querySelector('.gr-wgs-pac-item-selected');
        var firstItem = self.containerPredictionsList.querySelector('.gr-wgs-pac-item');
        var lastItem = self.containerPredictionsList.querySelector('.gr-wgs-pac-item:last-child');

        // key enter
        if (event.keyCode === 13) {
            var clickEvent = document.createEvent('MouseEvents');
            clickEvent.initEvent("click", true, true);
            if (selectedItem !== null) {
                selectedItem.dispatchEvent(clickEvent);
            }
            else if (firstItem !== null) {
                firstItem.dispatchEvent(clickEvent);
            }
        }
        //key up
        else if (event.keyCode === 38) {
            if (selectedItem) {
                var previousSibling = selectedItem.previousElementSibling;
                selectedItem.classList.remove(selectedItemClass);
                if (previousSibling === null)
                    lastItem.classList.add(selectedItemClass);
                else
                    previousSibling.classList.add(selectedItemClass);
            }
            else if (lastItem !== null) {
                lastItem.classList.add(selectedItemClass);
            }
        }
        // key down
        else if (event.keyCode === 40) {
            if (selectedItem) {
                var nextSibling = selectedItem.nextElementSibling;
                selectedItem.classList.remove(selectedItemClass);
                if (nextSibling === null)
                    firstItem.classList.add(selectedItemClass);
                else
                    nextSibling.classList.add(selectedItemClass);
            }
            else if (firstItem !== null) {
                firstItem.classList.add(selectedItemClass);
            }
        }
        // other keys : undisplay the list
        else {
            if (event.currentTarget.value.length >= this.config.options.autocompletePlaces.minLength) {
                var request = {
                    input: self.container.querySelector('input').value
                };

                if (this.config.options.autocompletePlaces.bounds)
                    request.bounds = this.config.options.autocompletePlaces.bounds;
                if (this.config.options.autocompletePlaces.types)
                    request.types = this.config.options.autocompletePlaces.types;
                if (this.config.options.autocompletePlaces.componentRestrictions)
                    request.componentRestrictions = this.config.options.autocompletePlaces.componentRestrictions;
                self.getPredictions(request, function (results) {
                    self.buildHTMLPredictions(results);
                }, function (error) {
                    console.error(error);
                });
            }
        }
        if (event.currentTarget.value.length === 0) {
            self.clearPanel();
        } else {
            self.plugin.ui.showResetBtn();
        }
    }.bind(this));

    self.containerPredictionsList.addEventListener('click', function (event) {
        var pacItem = event.target.closest('.gr-wgs-pac-item');
        var place_id = pacItem.getAttribute('data-place-id');
        self.container.querySelector('input').value = pacItem.querySelector('.gr-wgs-pac-item-query').innerText;
        self.containerPredictionsList.style.display = 'none';
        self.getDetails(place_id);
    }, true);

    this.container.querySelector('.gr-wgs-homestore-panel-address-reset').addEventListener('click', function () {
        self.clearPanel();
    });

};

PlacesLocation.prototype.clearPanel = function () {
    this.container.querySelector('input').value = '';
    this.containerPredictionsList.innerHTML = '';
    this.containerPredictionsList.style.display = 'none';
    this.plugin.ui.hideResultsBlock();
    this.plugin.ui.hideResetBtn();
};

/**
 * buildHTMLPredictions
 * @param predictions
 */
PlacesLocation.prototype.buildHTMLPredictions = function (predictions) {

    var self = this;
    var buildPrediction = function (prediction) {

        var template =
            '<div class="gr-wgs-pac-item" data-place-id="' + prediction.place_id + '">' +
            '<span class="gr-wgs-pac-icon gr-wgs-pac-icon-marker"></span>' +
            '<span class="gr-wgs-pac-item-query">' + prediction.description + '</span>' +
            '</div>';

        self.containerPredictionsList.insertAdjacentHTML('beforeend', template);
    };
    this.containerPredictionsList.innerHTML = '';
    this.containerPredictionsList.style.display = (predictions.length > 0 ? 'block' : 'none');
    for (var i = 0; i < predictions.length; i++) {
        buildPrediction(predictions[i]);
    }
};

/**
 * getPredictions
 * @param request
 */
PlacesLocation.prototype.getPredictions = function (request) {
    var self = this;

    var autocomplete = new google.maps.places.AutocompleteService();
    autocomplete.getPlacePredictions(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            self.buildHTMLPredictions(results);
        }
        else if (status === google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR || status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
            window.setTimeout(function () {
                self.getPredictions(request);
            }, 100);
        }
        else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            self.buildHTMLPredictions([]);
        } else {
            console.error(status);
        }
    });
};

/**
 * getDetails
 * @param place_id
 */
PlacesLocation.prototype.getDetails = function (place_id) {
    var places = new google.maps.places.PlacesService(document.getElementsByClassName('gr-wgs-homestore-panel-address-input')[0]);
    var self = this;
    var request = {
        placeId: place_id
    };
    places.getDetails(request, function (result, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            var lat = result.geometry.location.lat();
            var lng = result.geometry.location.lng();
            self.plugin.manager.recommendStoresFromSearch(lat, lng);
        }
        else if (status === google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR || status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
            window.setTimeout(function () {
                self.getDetails(place_id);
            }, 100);
        }
        else {
            console.error(status);
        }
    });
};

module.exports = PlacesLocation;