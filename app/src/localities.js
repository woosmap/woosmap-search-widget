/* global AutocompleteService */
/**
 * LocalitiesLocation
 * @param container
 * @param plugin
 * @param config
 */
function LocalitiesLocation(container, plugin, config) {
    this.config = config;
    this.plugin = plugin;
    this.container = container;
    this.containerResultsList = null;

    this.localitiesService = null;

    this.buildHTML();
    var getScriptCallback = function () {
        this.localitiesService = new AutocompleteService(config.woosmapKey);
    };

    this.getScript(config.options.autocompleteLocalities.url, getScriptCallback.bind(this));
}

LocalitiesLocation.prototype.getScript = function (scriptUrl, callback) {
    var scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';
    scriptElement.async = true;

    scriptElement.src = scriptUrl;

    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(scriptElement, firstScript);

    if (scriptElement.readyState) {
        scriptElement.onreadystatechange = function () {
            if (this.readyState === 'complete' || this.readyState === 'loaded') {
                callback();
            }
        };
    } else {
        scriptElement.onload = function () {
            callback();
        };
    }
};

/**
 * buildHTML
 */
LocalitiesLocation.prototype.buildHTML = function () {
    var template =
        '<div class="gr-wgs-homestore-panel-address-wrapper">' +
        '<label>' + this.config.L10n.searchAroundMeTitle + '</label>' +
        '<div class="gr-wgs-homestore-panel-searchBlock-form">' +
        '<input class="gr-wgs-homestore-panel-address-input" type="text" placeholder="' + this.config.L10n.autocompletePlaceholder + '"/>' +
        '</div>' +
        '<div class="gr-wgs-homestore-panel-address-reset"></div>' +
        '<div class="gr-wgs-homestore-panel-address-loader"></div>' +
        '</div>' +
        '<div class= "gr-wgs-homestore-panel-address-results gr-wgs-pac-container"></div>';

    this.container.insertAdjacentHTML('beforeend', template);
    this.containerResultsList = this.container.querySelector('.gr-wgs-homestore-panel-address-results');

    var self = this;

    // handle the key events on the input to trigger a search or navigate in the results list
    this.container.querySelector('input').addEventListener('keyup', function (event) {
        var selectedItemClass = 'gr-wgs-pac-item-selected';
        var selectedItem = self.containerResultsList.querySelector('.gr-wgs-pac-item-selected');
        var firstItem = self.containerResultsList.querySelector('.gr-wgs-pac-item');
        var lastItem = self.containerResultsList.querySelector('.gr-wgs-pac-item:last-child');
        var minLength = 1;

        // key enter
        if (event.keyCode === 13) {
            var clickEvent = document.createEvent('MouseEvents');

            clickEvent.initEvent("click", true, true);

            if (selectedItem !== null) {
                selectedItem.dispatchEvent(clickEvent);
            } else {
                if (event.currentTarget.value.length >= minLength) {
                    self.getQueryPredictions(event.target.value);
                }
            }
        }

        // key up
        else if (event.keyCode === 38) {
            if (selectedItem) {
                var previousSibling = selectedItem.previousElementSibling;

                selectedItem.classList.remove(selectedItemClass);

                if (previousSibling === null) {
                    lastItem.classList.add(selectedItemClass);
                } else {
                    previousSibling.classList.add(selectedItemClass);
                }
            } else if (lastItem !== null) {
                lastItem.classList.add(selectedItemClass);
            }
        }

        // key down
        else if (event.keyCode === 40) {
            if (selectedItem) {
                var nextSibling = selectedItem.nextElementSibling;

                selectedItem.classList.remove(selectedItemClass);

                if (nextSibling === null) {
                    firstItem.classList.add(selectedItemClass);
                } else {
                    nextSibling.classList.add(selectedItemClass);
                }
            } else if (firstItem !== null) {
                firstItem.classList.add(selectedItemClass);
            }
        } else if (event.currentTarget.value.length >= minLength) {
            self.getQueryPredictions(event.target.value);
        }


        if (event.currentTarget.value.length === 0) {
            self.clearPanel();
        } else {
            self.plugin.ui.showResetBtn();
        }
    }.bind(this));


    // handle click event on a geocoding result in the list
    // self.containerResultsList.delegate('.gr-wgs-pac-item','click', function(event){
    self.containerResultsList.addEventListener('click', function (event) {
        var target = event.target;
        var pacItem = target.closest('.gr-wgs-pac-item');
        var lat = pacItem.getAttribute('data-lat');
        var lng = pacItem.getAttribute('data-lng');
        self.container.querySelector('input').value = pacItem.querySelector('.gr-wgs-pac-item-query').innerText;

        self.askForStoresRecommendation(lat, lng);
        self.containerResultsList.style.display = 'none';
        self.containerResultsList.innerHTML = '';
    }, true);

    // handle the click on the reset search field button
    self.container.querySelector('.gr-wgs-homestore-panel-address-reset').addEventListener('click', function () {
        self.clearPanel();
    });

};

LocalitiesLocation.prototype.clearPanel = function () {
    this.container.querySelector('input').value = '';
    this.containerResultsList.style.display = 'none';
    this.containerResultsList.innerHTML = '';
    this.plugin.ui.hideResultsBlock();
    this.plugin.ui.hideResetBtn();
};

/**
 * buildHTMLResults
 * @param results
 */
LocalitiesLocation.prototype.buildHTMLResults = function (results) {
    var self = this;
    var buildResult = function (result) {

        var coor = result.location;

        var template =
            '<div class="gr-wgs-pac-item" data-lat="' + coor.lat + '" data-lng="' + coor.lng + '">' +
            '<span class="gr-wgs-pac-icon gr-wgs-pac-icon-marker"></span>' +
            '<span class="gr-wgs-pac-item-query">' + result.description + '</span>' +
            '</div>';

        self.containerResultsList.insertAdjacentHTML('beforeend', template);
    };

    this.containerResultsList.innerHTML = '';
    this.containerResultsList.style.display = (results.length > 0 ? 'block' : 'none');

    for (var i = 0; i < results.length; i++) {
        buildResult(results[i]);
    }
};

/**
 * askForStoresRecommendation
 * @param lat
 * @param lng
 */
LocalitiesLocation.prototype.askForStoresRecommendation = function (lat, lng) {
    this.plugin.manager.recommendStoresFromSearch(lat, lng);
};

/**
 * geocode
 * @param address
 */
LocalitiesLocation.prototype.getQueryPredictions = function (request) {
    var params = {
        input: request,
        // componentRestrictions: this.config.options.autocompleteLocalities.componentRestrictions,
        components: this.config.options.autocompleteLocalities.componentRestrictions,
        types: this.config.options.autocompleteLocalities.types,
        language: this.config.options.autocompleteLocalities.language
    };

    var localitiesCallback = function (results) {
        if (results.localities.length === 1) {
            this.container.querySelector('.gr-wgs-homestore-panel-address-input').value = results.localities[0].description;

            var coords = results.localities[0].location;

            this.askForStoresRecommendation(coords.lat, coords.lng);
            this.buildHTMLResults([]);
        } else {
            this.buildHTMLResults(results.localities);
        }
    };

    this.localitiesService.getQueryPredictions(params, localitiesCallback.bind(this));
};

module.exports = LocalitiesLocation;