var HTML5Location = require('./html5location.js');
var PlacesLocation = require('./places.js');
var GeocodingLocation = require('./geocoder.js');
var LocalitiesLocation = require('./localities.js');

function UI(container, plugin, config) {
    this.plugin = plugin;
    this.container = container;
    this.config = config;
    var L10n = this.config.L10n;

    this.container.innerHTML = '<div class="gr-wgs-homestore-container">' +
        '<div class="gr-wgs-homestore-mainBlock"></div>' +
        '<div id="gr-wgs-homestore-panel" class="' + (this.config.options.omitUIReco === true ? ' omit-reco-ui' : '') + '">' +
        '<div class="gr-wgs-homestore-panel-searchBlock">' +
        '<div class="gr-wgs-homestore-panel-searchBlock-warning">' + L10n.geolocationNotice + '</div>' +
        '</div>' +
        '<div class="gr-wgs-homestore-panel-loaderBlock"></div>' +
        '<div class="gr-wgs-homestore-panel-resultBlock">' +
        '<div class="gr-wgs-homestore-panel-resultBlock-title">' + L10n.selectAroundMeTitle + '</div>' +
        '<ul class="gr-wgs-homestore-panel-resultBlock-listBlock"></ul>' +
        '</div>' +
        '<div class="gr-wgs-homestore-panel-footerBlock">' +
        '<div class="gr-wgs-homestore-panel-footerBlock-allStores">' + (this.config.options.urls.stores.href.replace(' ', '') !== '' ? L10n.allStores : '') + '</div>' +
        (this.config.options.omitUIReco === true ? '' : '<div class="gr-wgs-homestore-panel-footerBlock-closePanel">' + L10n.closeBtn + '</div>') +
        '</div>' +
        '</div>' +
        '</div>';

    this.mainContainer = this.container.querySelector('.gr-wgs-homestore-container');
    this.headerContainer = this.container.querySelector('.gr-wgs-homestore-mainBlock');
    this.panelContainer = this.container.querySelector('#gr-wgs-homestore-panel');
    this.panelContainerSearch = this.container.querySelector('.gr-wgs-homestore-panel-searchBlock');
    this.panelContainerSearchWarning = this.container.querySelector('.gr-wgs-homestore-panel-searchBlock-warning');
    this.panelContainerResultsBlock = this.container.querySelector('.gr-wgs-homestore-panel-resultBlock');
    this.panelContainerResultsBlockTitle = this.container.querySelector('.gr-wgs-homestore-panel-resultBlock-title');
    this.panelContainerResultsList = this.container.querySelector('.gr-wgs-homestore-panel-resultBlock-listBlock');
    this.panelContainerFooter = this.container.querySelector('.gr-wgs-homestore-panel-footerBlock');

    new HTML5Location(this.panelContainerSearch, this.plugin, this.config);

    if (this.config.options.useLocalities) {
        this._searchManager = new LocalitiesLocation(this.panelContainerSearch, this.plugin, this.config);
    } else if (this.config.options.usePlaces) {
        this._searchManager = new PlacesLocation(this.panelContainerSearch, this.plugin, this.config);
    } else {
        this._searchManager = new GeocodingLocation(this.panelContainerSearch, this.plugin, this.config);
    }

    this.hideResultsBlock();
    this.hideWarningHTML5();

    var self = this;
    this.panelContainer.querySelector('.gr-wgs-homestore-panel-footerBlock-allStores').addEventListener('click', function () {
        self.openAllStores();
    });
    if (this.config.options.omitUIReco === false) {
        this.panelContainer.querySelector('.gr-wgs-homestore-panel-footerBlock-closePanel').addEventListener('click', function () {
            self.hideSearchPanel();
        });
    }
    this.onClickOutsideContainer();
}

/**
 * Build address content from store
 * @param {Object} store
 * @return String
 */
UI.prototype.buildAddress = function (store) {
    var address = '',
        city = '';

    if (store.properties.address.lines) {
        for (var a = 0; a < store.properties.address.lines.length; a++) {
            if (store.properties.address.lines[a] !== '' && store.properties.address.lines[a] !== null)
                address += ' ' + store.properties.address.lines[a];
        }
    }

    if (store.properties.address.zipcode && store.properties.address.zipcode !== '')
        city += store.properties.address.zipcode;
    if (store.properties.address.city && store.properties.address.city !== '')
        city += (city !== '' ? ' ' : '') + store.properties.address.city;

    address += (address !== '' && city !== '' ? '<span class="gr-wgs-homestore-mainBlock-yourStore-city">' + city : '</span>');

    if (store.properties.address.country_code && store.properties.address.country_code !== '')
        address += '<span class="gr-wgs-homestore-mainBlock-yourStore-country"><span class="gr-wgs-homestore-mainBlock-yourStore-sep">, </span><span class="gr-wgs-homestore-mainBlock-yourStore-countrycode">' + store.properties.address.country_code + '</span></span>';

    return address;
};

/**
 * buildHTMLInitialReco
 * Build the HTML of the store recommendation in the header
 * @param {Object} store max number of stores to retrieve
 **/
UI.prototype.buildHTMLInitialReco = function (store) {
    var self = this;
    var address = '',
        phone = '',
        openingday = '',
        openingweek = '',
        op = store.properties.open,
        oph = store.properties.opening_hours;

    if (typeof this.config.options.display.recommendation.address !== 'undefined' && this.config.options.display.recommendation.address) {
        address = '<span class="gr-wgs-homestore-mainBlock-yourStore-address">' + this.buildAddress(store) + '</span>';
    }

    if (op && typeof this.config.options.display.recommendation.openingDay !== 'undefined' && this.config.options.display.recommendation.openingDay) {
        openingday = this.buildHTMLOpeningHoursDay(store);
    }

    if (oph && typeof this.config.options.display.recommendation.openingWeek !== 'undefined' && this.config.options.display.recommendation.openingWeek) {
        openingweek = this.buildHTMLOpeningHoursWeek(store);
    }

    if (typeof this.config.options.display.recommendation.phone !== 'undefined' && this.config.options.display.recommendation.phone && store.properties.contact && store.properties.contact.phone !== '')
        phone += '<span class="gr-wgs-homestore-mainBlock-yourStore-phone"><span class="gr-wgs-homestore-mainBlock-yourStore-phone-label">' + this.config.L10n.telephone + '</span> ' + (store.properties.contact.phone ? store.properties.contact.phone : '') + '</span>';

    this.headerContainer.innerHTML =
        '<div class="gr-wgs-homestore-mainBlockTitle gr-wgs-homestore-mainBlock-yourStore">' +
        '<span class="gr-wgs-homestore-mainBlock-yourStore-icon"></span>' +
        '<span class="gr-wgs-homestore-mainBlock-yourStore-change">' +
        this.config.L10n.changeStore +
        '</span>' +
        '<span class="gr-wgs-homestore-mainBlock-yourStore-name">' +
        store.properties.name +
        '</span>' +
        address +
        phone +
        '<span class="gr-wgs-homestore-mainBlock-yourStore-openinghours">' + openingday + openingweek + '</span>' +
        '</div>';
    if (self.config.options.omitUIReco === false) {
        this.headerContainer.querySelector('.gr-wgs-homestore-mainBlock-yourStore').addEventListener('click', function () {
            self.toggleSearchPanel();
        });
    }

};

/**
 * buildHTMLFindMyStore
 * Build the HTML of the "Trouver mon magasin" in the header
 **/
UI.prototype.buildHTMLFindMyStore = function (errorMessage) {
    var displayedMsg = (typeof errorMessage !== 'undefined') ? errorMessage : this.config.L10n.findStore;
    this.headerContainer.innerHTML =
        '<div class="gr-wgs-homestore-mainBlockTitle gr-wgs-homestore-mainBlock-findStore">' +
        '<span class="gr-wgs-homestore-mainBlock-yourStore-icon"></span>' +
        '<span class="gr-wgs-homestore-mainBlock-yourStore-change">' +
        this.config.L10n.changeStore +
        '</span>' +
        '<span class="gr-wgs-homestore-mainBlock-yourStore-name">' +
        displayedMsg +
        '</span>' +
        '</div>';

    var self = this;
    this.headerContainer.querySelector('.gr-wgs-homestore-mainBlock-findStore').addEventListener('click', function () {
        self.showSearchPanel();
    });
};

UI.prototype.buildWarningHTML5 = function () {
    var template =
        '<div class="gr-wgs-homestore-panel-searchBlock-warning"></div>';
    this.container.insertAdjacentHTML('afterbegin', template);
};

/**
 * onClickOutsideContainer
 */
UI.prototype.onClickOutsideContainer = function () {
    window.addEventListener('click', function (event) {
        if (this.config.options.omitUIReco === false) {
            if (this.isVisibleSearchPanel() && event.target.getAttribute('id') !== this.config.options.container.replace('#', '')) {
                this.hideSearchPanel();
            }
        }
    }.bind(this));

    this.mainContainer.addEventListener('click', function (event) {
        event.stopPropagation();
        return false;
    });
};
/**
 * isVisibleSearchPanel
 * @return boolean
 */
UI.prototype.isVisibleSearchPanel = function () {
    return this.panelContainer.classList.contains('gr-wgs-homestore-panel-open');
};
/**
 * showSearchPanel
 **/
UI.prototype.showSearchPanel = function () {
    this.panelContainer.classList.add('gr-wgs-homestore-panel-open');
};
/**
 * hideSearchPanel
 **/
UI.prototype.hideSearchPanel = function () {
    this.panelContainer.classList.remove('gr-wgs-homestore-panel-open');
};
/**
 * toggleSearchPanel
 */
UI.prototype.toggleSearchPanel = function () {
    if (this.isVisibleSearchPanel()) {
        this.hideSearchPanel();
    } else {
        this.showSearchPanel();
    }
};
/**
 * showResultsBlock
 */
UI.prototype.showResultsBlock = function () {
    this.panelContainerResultsBlock.style.display = 'block';
};
/**
 * hideResultsBlock
 */
UI.prototype.hideResultsBlock = function () {
    this.panelContainerResultsBlock.style.display = 'none';
};
/**
 * slideDownWarningHTML5
 * @param text
 */
UI.prototype.slideDownWarningHTML5 = function (text) {
    this.panelContainerSearchWarning.innerText = text;
    this.panelContainerSearchWarning.style.display = 'block';

};
/**
 * slideUpWarningHTML5
 */
UI.prototype.slideUpWarningHTML5 = function () {
    this.panelContainerSearchWarning.style.display = 'none';
};
/**
 * hideWarningHTML5
 */
UI.prototype.hideWarningHTML5 = function () {
    this.panelContainerSearchWarning.style.display = 'none';
};
/**
 * buildHTMLRecommendationResults
 * Build the HTML of the results of a location search
 * @param stores
 **/
UI.prototype.buildHTMLRecommendationResults = function (stores) {
    this.panelContainerResultsList.innerHTML = '';
    this.panelContainerResultsBlockTitle.innerHTML = this.config.L10n.selectAroundMeTitle;
    for (var i = 0; i < stores.length; i++) {
        this.buildHTMLStore(stores[i]);
    }
    this.showResultsBlock();
};

/**
 * buildHTMLNoResults
 * Build the HTML when no stores found nearby a location search
 **/
UI.prototype.buildHTMLNoResults = function () {
    this.panelContainerResultsList.innerHTML = '';
    this.panelContainerResultsBlockTitle.innerHTML = this.config.L10n.noResultsWarning;
    this.showResultsBlock();
};

UI.prototype.convertTo12Hrs = function (hour, sep) {
    if (typeof sep === 'undefined') sep = ':';
    if (typeof hour === 'undefined') return false;
    if (typeof hour !== 'string') return false;
    var hours = hour.split(sep);
    var hr = parseInt(hours[0]);
    var ampmSwitch = (hr > 12) ? "PM" : "AM";
    var convHrs = (hr > 12) ? hr - 12 : hr;
    return convHrs + sep + hours[1] + ' ' + ampmSwitch;
};

UI.prototype.concatenateStoreHours = function (openHours) {
    var hoursText = "";
    var end;

    if (openHours) {
        if (openHours['all-day'] || openHours['all_day']) {
            if (this.config.L10n.open24)
                return this.config.L10n.open24;
            return "24h/24";
        }

        for (var idx in openHours) {
            if (typeof openHours[idx] === 'object') {
                end = openHours[idx].end;

                if (typeof this.config.options.display.h12 !== 'undefined' && this.config.options.display.h12) {
                    hoursText += this.convertTo12Hrs(openHours[idx].start) + "–" + this.convertTo12Hrs(end);
                } else {
                    hoursText += openHours[idx].start + "–" + end;
                }

                if (idx < openHours.length - 1) {
                    hoursText += ", ";
                }
            }
        }

    }
    return hoursText;
};


UI.prototype.getNextSixDays = function (store) {
    var day = new Date();
    var idDay = day.getDay();
    var weeklyOpening = store.properties.weekly_opening;
    var openingHours = store.properties.opening_hours;
    var openingNextSixDays = {};
    var specialDay = false;

    while (Object.keys(openingNextSixDays).length < 6) {
        if (day.getDay() === 0) {
            while (Object.keys(openingNextSixDays).length < 6) {
                day.setDate(day.getDate() + 1);
                specialDay = false;
                if (openingHours.special) {
                    var utcmonth = day.getUTCMonth() + 1; //months from 1-12
                    var utcday = day.getUTCDate();
                    var utcyear = day.getUTCFullYear();
                    var compareDate = utcyear + "-" + utcmonth + "-" + utcday;
                    if (compareDate in openingHours.special) {
                        specialDay = true;
                        openingNextSixDays[this.config.L10n.days[day.getDay()].full] = openingHours.special[compareDate];
                    }
                }
                if (specialDay === false) {
                    if (day.getDay() in openingHours.usual) {
                        openingNextSixDays[this.config.L10n.days[day.getDay()].full] = openingHours.usual[day.getDay()];
                    } else if (openingHours.default) {
                        openingNextSixDays[this.config.L10n.days[day.getDay()].full] = openingHours.default;
                    } else {
                        break;
                    }
                }
            }
        } else {
            day.setDate(day.getDate() + 1);
            if (day.getDay() === 0) { //days from 0-6
                idDay = 7;
            } else {
                idDay = day.getDay();
            }
            if (weeklyOpening) {
                openingNextSixDays[this.config.L10n.days[idDay].full] = weeklyOpening[idDay].hours;
            } else {
                break;
            }
        }
    }
    return openingNextSixDays;
};


UI.prototype.generateHoursLiArray = function (store) {
    var openingHoursArray = [];
    var nextSixDays = this.getNextSixDays(store);

    for (var day in nextSixDays) {
        if (nextSixDays[day].length === 0) {
            openingHoursArray.push("<li>" + day + " : " + this.config.L10n.closedHours + "</li>");
        } else {
            openingHoursArray.push("<li>" + day + " : " + this.concatenateStoreHours(nextSixDays[day]) + "</li>");
        }
    }

    return openingHoursArray;
};


/**
 * build html opening hours of the day
 * @param {Object} store
 * @returns {String}
 */
UI.prototype.buildHTMLOpeningHoursDay = function (store) {
    var str = '',
        op = store.properties.open;

    if (op.open_hours.length > 0) {
        str += '<span class="gr-wgs-openinghours-day">' + this.config.L10n.openingHoursDay + '</span>';
        str += '<ul class="gr-wgs-openinghours-day-' + op.week_day + (op.open_now ? ' gr-wgs-openinghours-opennow' : '') + '">';
        for (var j = 0; j < op.open_hours.length; j++) {
            str += '<li class="gr-wgs-openinghours-day-slice">';
            if (typeof this.config.options.display.h12 !== 'undefined' && this.config.options.display.h12) {
                str += this.convertTo12Hrs(op.open_hours[j].start) + ' - ' + this.convertTo12Hrs(op.open_hours[j].end);
            } else {
                str += op.open_hours[j].start + ' - ' + op.open_hours[j].end;
            }
            str += '</li>';
        }
        str += '</ul>';
    } else if (op.open_now === false) {
        str += '<span class="gr-wgs-openinghours-day">' + this.config.L10n.openingHoursDay + '</span>';
        str += '<ul class="gr-wgs-openinghours-day-' + op.week_day + '">';
        str += '<li class="gr-wgs-openinghours-day-slice">';
        str += this.config.L10n.closedHours;
        str += '</li>';
        str += '</ul>';
    }

    return str;
};

/**
 * build html weekly opening hours
 * @param {Object} store
 * @returns {String}
 */
UI.prototype.buildHTMLOpeningHoursWeek = function (store) {
    var str = '',
        oph = store.properties.opening_hours;

    if (oph.usual['default'] && oph.usual['default'].length > 0 || Object.keys(oph.usual).length > 1) {
        str += '<span class="gr-wgs-openinghours-week-btn">' + this.config.L10n.openingHoursWeek + '</span>';
        str += '<ul class="gr-wgs-openinghours-week">' + this.generateHoursLiArray(store).join('') + '</ul>';
    }

    return str;
};

UI.prototype.buildHTMLStore = function (store) {
    var address = '',
        openingday = '',
        openingweek = '',
        op = store.properties.open,
        oph = store.properties.opening_hours,
        distance = store.properties.distanceWithGoogle / 1000;

    if (typeof this.config.options.display.search.address !== 'undefined' && this.config.options.display.search.address) {
        address = '<div class="gr-wgs-homestore-panel-resultBlock-listItem-address">' + this.buildAddress(store) + '</div>';
    }

    if (op && typeof this.config.options.display.search.openingDay !== 'undefined' && this.config.options.display.search.openingDay) {
        openingday = this.buildHTMLOpeningHoursDay(store);
    }

    if (oph && typeof this.config.options.display.search.openingWeek !== 'undefined' && this.config.options.display.search.openingWeek) {
        openingweek = this.buildHTMLOpeningHoursWeek(store);
    }

    var temp = '<li class="gr-wgs-homestore-panel-resultBlock-listItem" data-id="' + store.properties.store_id + '">' +
        '<span class="gr-wgs-homestore-panel-resultBlock-listItem-icon"></span>' +
        '<span class="gr-wgs-homestore-panel-resultBlock-listItem-infos">' +
        '<div>' +
        '<div class="gr-wgs-homestore-panel-resultBlock-listItem-title">' + store.properties.name + '</div>' +
        '<div class="gr-wgs-homestore-panel-resultBlock-listItem-choose">' + this.config.L10n.selectStore + '</div>' +
        '<div class="gr-wgs-homestore-panel-resultBlock-listItem-distance">' + (!isNaN(distance) ? '(' + distance.toFixed(1) + 'km)' : '') + '</div>' +
        address +
        '<div class="gr-wgs-homestore-panel-resultBlock-listItem-openinghours">' + openingday + openingweek + '</div>' +
        '</div>' +
        '</span>' +
        '</li>';
    this.panelContainerResultsList.insertAdjacentHTML('beforeend', temp);

    this.panelContainerResultsList.querySelector('.gr-wgs-homestore-panel-resultBlock-listItem[data-id="' + store.properties.store_id + '"]').addEventListener('click', function () {
        var coord = store.geometry.coordinates;
        var lat = coord[1];
        var lng = coord[0];
        this.plugin.ui.resetStoreSearch();
        if (this.config.options.omitUIReco === false) {
            this.hideSearchPanel();
            this.plugin.ui.buildHTMLInitialReco(store);
        }
        if (this.plugin.callbackUserSelectedStore instanceof Function) {
            this.plugin.callbackUserSelectedStore(store);
        }
        this.plugin.manager.saveStoreToLocalStorage(store);
        if (this.config.options.userAllowedReco === true) {
            woosmapRecommendation.sendUserFavoritedPOI({
                lat: lat, lng: lng, id: store.properties.store_id,
                successCallback: function () {
                }.bind(this),
                errorCallback: function () {
                    console.warn('Error Sending Favorited POI to Woosmap!', lat, lng, store.properties.store_id);
                }.bind(this)
            });
        }
    }.bind(this));
};

/**
 * resetStoreSearch
 */
UI.prototype.resetStoreSearch = function () {
    this._searchManager.clearPanel();
};
/**
 * openStore
 * @param store
 */
UI.prototype.openStore = function (store) {
    var url;
    if (store.properties.contact && store.properties.contact.website && this.config.options.urls.store.target !== false) {
        if (this.config.options.urls.store.href === true) {
            url = store.properties.contact.website;
        } else if (typeof this.config.options.urls.store.href === 'string') {
            url = this.config.options.urls.store.href;
        }
        window.open(url, this.config.options.urls.store.target || '_self');
    }
};
/**
 * openAllStores
 */
UI.prototype.openAllStores = function () {
    window.open(this.config.options.urls.stores.href, this.config.options.urls.stores.target || '_self');
};
/**
 * hideResetBtn
 */
UI.prototype.hideResetBtn = function () {
    this.panelContainer.querySelector('.gr-wgs-homestore-panel-address-reset').style.display = 'none';
};
/**
 * showResetBtn
 */
UI.prototype.showResetBtn = function () {
    this.panelContainer.querySelector('.gr-wgs-homestore-panel-address-reset').style.display = 'block';
};
/**
 * showLoader
 */
UI.prototype.showLoader = function () {
    this.panelContainer.querySelector('.gr-wgs-homestore-panel-address-reset').style.display = 'none';
    this.panelContainer.querySelector('.gr-wgs-homestore-panel-address-loader').style.display = 'block';
};
/**
 * hideLoader
 */
UI.prototype.hideLoader = function () {
    this.panelContainer.querySelector('.gr-wgs-homestore-panel-address-reset').style.display = 'block';
    this.panelContainer.querySelector('.gr-wgs-homestore-panel-address-loader').style.display = 'none';
};

module.exports = UI;
