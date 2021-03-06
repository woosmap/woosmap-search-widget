var CONSTANT = require('./constants.js');

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param source
 */
function merge(target, source) {
    if (isObject(target) && isObject(source)) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {

                if (isObject(source[key])) {
                    if (!target[key]) {
                        target[key] = {};
                    }
                    merge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
    }

    return target;
}

function Config(options) {
    this.options = {
        container: '',
        woosmapKey: '',
        userAllowedReco: false,
        omitUIReco: false,
        withDistanceMatrix: true,
        google: {
            //key: '',
            //clientId: '',
            //channel: ''
            //language: '',
            //region: ''
        },
        urls: {
            //lien vers la page du store recommandé
            store: {
                href: false, //boolean or string
                target: '_self'
            },
            //lien vers la page "tous nos stores"
            stores: {
                href: 'https://developers.woosmap.com/',
                target: '_self'
            }
        },
        usePlaces: true,
        autocompletePlaces: {
            minLength: 1,
            types: ['geocode']/*,
            bounds: {
                west: -4.87293470,
                north: 51.089062,
                south: 42.19809198,
                east: 8.332631
            },
            componentRestrictions: ['fr']*/
        },
        useLocalities: false,
        autocompleteLocalities: {
            url: 'https://sdk.woosmap.com/localities/localities.js',
            componentRestrictions: {
                country: []
            },
            types: '',
            language: '',
            data: 'standard',
            minLength: 3
        },
        geocoder: {
            region: 'fr'
        },
        woosmap: {
            apiUrl: 'https://api.woosmap.com/stores/search',
            recoScriptUrl: 'https://sdk.woosmap.com/recommendation/recommendation.js',
            geolocApiUrl: 'https://api.woosmap.com/geolocation/',
            query: '',
            limit: 5,
            maxDistance: 0
        },
        display: {
            /*h12: true,*/
            recommendation: {
                address: true,
                phone: true,
                openingDay: true,
                openingWeek: true
            }
            , search: {
                address: true,
                openingDay: true,
                openingWeek: true
            }
        },
        lang: 'fr',
        translations: {
            fr: {
                searchAroundMeBtn: 'Autour de moi',
                searchAroundMeTitle: 'Rechercher le centre à proximité',
                selectAroundMeTitle: 'Choisissez le centre à proximité :',
                noResultsWarning: 'Nous ne trouvons aucun résultat à proximité.',
                autocompletePlaceholder: 'Spécifiez une adresse',
                allStores: 'Tous nos centres',
                changeStore: 'Centre à proximité',
                findStore: 'Choisir mon centre',
                selectStore: 'Choisir',
                openingHoursDay: 'Ouvert aujourd\'hui :',
                openingHoursWeek: '',
                geolocationNotice: 'La géolocalisation n\'est pas activée sur votre navigateur. Veuillez changez vos préférences.',
                geolocationErrHttps: 'Votre position géographique n’a pas été renvoyée par votre navigateur. Veuillez saisir une adresse pour rechercher les magasins à proximité.',
                geolocationErrBlocked: 'La géolocalisation n\'est pas activée sur votre navigateur. Veuillez saisir une adresse pour rechercher les magasins à proximité.',
                telephone: 'Tél :',
                closeBtn: 'Fermer',
                closedHours: "Fermé",
                open24: "24h/24",
                days: {
                    1: {
                        full: "Lundi",
                        short: "Lun"
                    },
                    2: {
                        full: "Mardi",
                        short: "Mar"
                    },
                    3: {
                        full: "Mercredi",
                        short: "Mer"
                    },
                    4: {
                        full: "Jeudi",
                        short: "Jeu"
                    },
                    5: {
                        full: "Vendredi",
                        short: "Ven"
                    },
                    6: {
                        full: "Samedi",
                        short: "Sam"
                    },
                    7: {
                        full: "Dimanche",
                        short: "Dim"
                    }
                }
            },
            en: {
                searchAroundMeBtn: 'Around Me',
                searchAroundMeTitle: 'Search nearest Store',
                selectAroundMeTitle: 'Choose nearest store from :',
                noResultsWarning: 'Can\'t find nearby results.',
                autocompletePlaceholder: 'Address...',
                allStores: 'All Stores',
                changeStore: 'Recommended Store',
                findStore: 'Find my Store',
                geolocationNotice: "Geolocation capability is'nt enable on your browser. Please, change your settings.",
                closeBtn: 'Close',
                selectStore: 'Set as Favorite',
                telephone: 'Tel:',
                open24: "All Day",
                openingHoursDay: "today: ",
                openingHoursWeek: "opening hours: ",
                closedHours: "Closed",
                days: {
                    1: {
                        full: "Monday",
                        short: "Mon"
                    },
                    2: {
                        full: "Tuesday",
                        short: "Tue"
                    },
                    3: {
                        full: "Wednesday",
                        short: "Wed"
                    },
                    4: {
                        full: "Thursday",
                        short: "Thu"
                    },
                    5: {
                        full: "Friday",
                        short: "Fri"
                    },
                    6: {
                        full: "Saturday",
                        short: "Sat"
                    },
                    7: {
                        full: "Sunday",
                        short: "Sun"
                    }
                }
            },
            es: {
                closedHours: "Cerrada"
            },
            ca: {
                closedHours: "Tancada"
            }
        }
    };
    this.L10n = {};
    this.extend(options);
    this.initializeL10n();
}

Config.prototype.initializeL10n = function () {

    var lang = (this.options.lang && typeof (this.options.lang) === 'string') ? this.options.lang : this.options.lang;

    if (lang) {
        if (this.options.translations.hasOwnProperty(lang)) {
            this.L10n = this.options.translations[lang];
        } else {
            console.warn('translations lang \'' + lang + '\' not found');
            this.L10n = this.options.translations[CONSTANT.defaultLang];
        }
    }
};

Config.prototype.extend = function (options) {
    merge(this.options, options);
    this.checkConfig(this.options);
};

Config.prototype.checkConfig = function (options) {
    /**
     * checkOptions
     * @param {Object} options
     */

    /**
     * check html container
     */
    if (typeof options.container === 'undefined')
        throw new Error("the container (html locator) is undefined");
    else if (typeof options.container !== 'string')
        throw new Error("the container (html locator) must be a string");
    else if (options.container.replace(' ', '') === '')
        throw new Error("the container (html locator) is empty");

    /**
     * check woosmap public key
     */
    if (typeof options.woosmapKey === 'undefined')
        throw new Error("woosmapKey (public key) is undefined");
    else if (typeof options.woosmapKey !== 'string')
        throw new Error("woosmapKey (public key) must be a string");
    else if (options.woosmapKey.replace(' ', '') === '')
        throw new Error("woosmapKey (public key) is empty");

    /**
     * check google options (clientId & channel)
     */
    if (typeof options.google === 'undefined')
        throw new Error("google options is not defined");
    else if (typeof options.google !== 'object')
        throw new Error("google options must be an object");
    else {
        /**
         * check google clientId
         */
        if (typeof options.google.clientId === 'undefined' && typeof options.google.key === 'undefined')
            throw new Error("google clientId or api key must be defined");
        else if (typeof options.google.clientId !== 'undefined') {
            if (typeof options.google.clientId !== 'string')
                throw new Error("google clientId must be a string");
            else if (options.google.clientId.replace(' ', '') === '')
                throw new Error("google clientId is empty");
            else if (typeof options.google.channel !== 'undefined') {
                /**
                 * check channel if it's defined
                 */
                if (typeof options.google.channel !== 'string')
                    throw new Error("google client channel must be a string");
            }

        } else if (typeof options.google.key !== 'undefined') {
            if (typeof options.google.key !== 'string')
                throw new Error("google api key must be a string");
            else if (options.google.key.replace(' ', '') === '')
                throw new Error("google api key is empty");
        }
    }

    if (typeof options.google.language !== 'undefined') {
        if (typeof options.google.language !== 'string')
            throw new Error("google api language must be a string");
        else if (options.google.language.length !== 2)
            throw new Error("google api language format is not valid");
    }

    if (typeof options.google.region !== 'undefined') {
        if (typeof options.google.region !== 'string')
            throw new Error("google api region must be a string");
        else if (options.google.language.length !== 2)
            throw new Error("google api region format is not valid");
    }

    /**
     * check stores links
     */
    if (typeof options.urls !== 'undefined') {
        /**
         * check stores link
         */
        if (typeof options.urls.stores !== 'undefined') {
            if (typeof options.urls.stores.href !== 'string')
                throw new Error("urls.stores.href must be a string");
            if (typeof options.urls.stores.target !== 'undefined') {
                if (typeof options.urls.stores.target !== 'string')
                    throw new Error("urls.stores.target must be a string");
                if (wgs.searchwidget.CONSTANT.target.indexOf(options.urls.stores.target) === -1)
                    throw new Error("urls.stores.target must be : " + wgs.searchwidget.CONSTANT.target.join(', '));
            }
        }

        /**
         * check store link
         */
        if (typeof options.urls.store !== 'undefined') {
            if (typeof options.urls.store.href !== 'undefined') {
                if (typeof options.urls.store.href !== 'string' && typeof options.urls.store.href !== 'boolean')
                    throw new Error("urls.stores.href must be a string or boolean");
            }
            if (typeof options.urls.store.target !== 'undefined') {
                if (typeof options.urls.store.target !== 'string')
                    throw new Error("urls.store.target must be a string");
                if (wgs.searchwidget.CONSTANT.target.indexOf(options.urls.store.target) === -1)
                    throw new Error("urls.store.target must be : " + wgs.searchwidget.CONSTANT.target.join(', '));
            }
        }
    }

    /**
     * check usePlaces
     */
    if (typeof options.usePlaces !== 'undefined' && typeof options.usePlaces !== 'boolean') {
            throw new Error("usePlaces must be a boolean");
    }

    /**
     * check useLocalities
     */
    if (typeof options.useLocalities !== 'undefined' && typeof options.useLocalities !== 'boolean') {
            throw new Error("useLocalities must be a boolean");
    }

    /**
     * check autocompletePlaces
     */
    if (typeof options.autocompletePlaces !== 'undefined') {
        if (typeof options.autocompletePlaces.minLength !== 'number')
            throw new Error("autocompletePlaces.minLength must be a number");

        if (typeof options.autocompletePlaces.bounds !== 'undefined') {
            if (typeof options.autocompletePlaces.bounds !== 'object')
                throw new Error("autocompletePlaces.bounds must be an object {west: <number>, north: <number>, south: <number>, east: <number>}");

            if (typeof options.autocompletePlaces.bounds.west === 'undefined')
                throw new Error("autocompletePlaces.bounds.west is missing");
            if (typeof options.autocompletePlaces.bounds.west !== 'number')
                throw new Error("autocompletePlaces.bounds.west must be a number");

            if (typeof options.autocompletePlaces.bounds.north === 'undefined')
                throw new Error("autocompletePlaces.bounds.north is missing");
            if (typeof options.autocompletePlaces.bounds.north !== 'number')
                throw new Error("autocompletePlaces.bounds.north must be a number");

            if (typeof options.autocompletePlaces.bounds.south === 'undefined')
                throw new Error("autocompletePlaces.bounds.south is missing");
            if (typeof options.autocompletePlaces.bounds.south !== 'number')
                throw new Error("autocompletePlaces.bounds.south must be a number");

            if (typeof options.autocompletePlaces.bounds.east === 'undefined')
                throw new Error("autocompletePlaces.bounds.east is missing");
            if (typeof options.autocompletePlaces.bounds.east !== 'number')
                throw new Error("autocompletePlaces.bounds.east must be a number");
        }

        if (typeof options.autocompletePlaces.types !== 'undefined') {
            if (!Array.isArray(options.autocompletePlaces.types))
                throw new Error("autocompletePlaces.types must be an array of string, e.g: ['geocode']");
        }

        if (typeof options.autocompletePlaces.componentRestrictions !== 'undefined') {
            if (typeof options.autocompletePlaces.componentRestrictions !== 'object') {
                throw new Error("autocompletePlaces.componentRestrictions must be a Google GeocoderComponentRestrictions object");
            }
        }
    }

    if (typeof options.display !== 'undefined') {

        if (typeof options.display.h12 !== 'undefined') {
            if (typeof options.display.h12 !== 'boolean')
                throw new Error('display.h12 option (AM/PM) must be a boolean');
        }

        if (typeof options.display.search !== 'undefined') {
            if (typeof options.display.search !== 'object')
                throw new Error('display search option must be an object');
            if (typeof options.display.search.openingDay !== 'undefined') {
                if (typeof options.display.search.openingDay !== 'boolean')
                    throw new Error('display.search.openingDay option must be a boolean');
            }
            if (typeof options.display.search.openingWeek !== 'undefined') {
                if (typeof options.display.search.openingWeek !== 'boolean')
                    throw new Error('display.search.openingWeek option must be a boolean');
            }
            if (typeof options.display.search.address !== 'undefined') {
                if (typeof options.display.search.address !== 'boolean')
                    throw new Error('display.search.address option must be a boolean');
            }
        }

        if (typeof options.display.recommendation !== 'undefined') {
            if (typeof options.display.recommendation !== 'object')
                throw new Error('display.recommendation.option must be an object');
            if (typeof options.display.recommendation.openingDay !== 'undefined') {
                if (typeof options.display.recommendation.openingDay !== 'boolean')
                    throw new Error('display.recommendation.openingDay option must be a boolean');
            }
            if (typeof options.display.recommendation.openingWeek !== 'undefined') {
                if (typeof options.display.recommendation.openingWeek !== 'boolean')
                    throw new Error('display.recommendation.openingWeek option must be a boolean');
            }
            if (typeof options.display.recommendation.address !== 'undefined') {
                if (typeof options.display.recommendation.address !== 'boolean')
                    throw new Error('display.recommendation.address option must be a boolean');
            }
            if (typeof options.display.recommendation.phone !== 'undefined') {
                if (typeof options.display.recommendation.phone !== 'boolean')
                    throw new Error('display.recommendation.phone option must be a boolean');
            }
        }
    }

    if (typeof options.lang === 'undefined')
        throw new Error("autocompletePlaces.lang is undefined, e.g: 'fr'");
    if (typeof options.lang !== 'string')
        throw new Error("autocompletePlaces.lang must be a string");

    if (typeof options.translations[options.lang] === 'undefined')
        throw new Error("translations for the lang '" + options.lang + "' are not found");
    if (typeof options.translations[options.lang] !== 'object')
        throw new Error("translations must be an object");
    for (var key in options.translations[options.lang]) {
        if (options.translations[options.lang].hasOwnProperty(key)) {
            if (key === 'days') {
                if (typeof options.translations[options.lang][key] !== 'object')
                    throw new Error("translations." + options.lang + "." + key + " must be an object (days list)");
            } else if (typeof options.translations[options.lang][key] !== 'string')
                throw new Error("translations." + options.lang + "." + key + " must be a string");
        }
    }
};

module.exports = Config;
