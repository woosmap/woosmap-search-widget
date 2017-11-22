/**
 * @typedef {Object} RecommendationPluginConf
 * @example RecommendationPluginConf Example
 *
 *```js
 *
 * var myConfig = {
 *    container: "myHTMLContainerId",
 *    woosmapKey: "woos-27e715eb-6454-3019-95c1-e90a418939a1",
 *    google: {
 *        clientId: "customer-clientId",
 *        key: "AIzaSyAgaUwsVVXJ6KMxlxI-1234556789"
 *    },
 *    usePlaces: true,
 *    lang: "en",
 *    translations: {
 *        en: {
 *            "searchAroundMeBtn": "Around Me",
 *            "searchAroundMeTitle": "Find Nearby Store",
 *            "selectAroundMeTitle": "Choose Nearby Store:",
 *            "autocompletePlaceholder": "Address..."
 *        }
 *    }
 *}
 *```
 * @property {String}container the `id` of the HTML container where the widget will display
 * @property {String}woosmapKey the Woosmap Public key used to connect to your datasource
 * @property {GoogleConf}google Google ids parameters
 * @property {UrlsConf}urls To open store(s) website(s)
 * @property {Boolean}usePlaces To enable places autocomplete search
 * @property {AutocompletePlacesConf}autocompletePlaces Autocomplete Places Specification.
 * @property {GeocoderConf}geocoder Geocoder Specification
 * @property {WoosmapConf}woosmap Woosmap search specification.
 * @property {DisplayConf}display UI search / results specification.
 * @property {String}lang Language of the widget.
 * @property {TranslationsConf}translations Translations list
 */


/**
 * @typedef {Object} GoogleConf
 * @example GoogleConf Example
 *
 *```json
 *{
 *   "google": {
 *       "clientId": "customer-clientId",
 *       "key": "AIzaSyAgaUwsVVXJ6KMxlxI-1234556789",
 *       "channel": "prod-integration",
 *       "language": "fr",
 *       "region": "FR"
 *   }
 *}
 *```
 * @property {String}clientId the Google Client ID to authenticate your application
 * @property {String}key the Google API Key (for Premium Plan License users, only use your clientID)
 * @property {String}channel used for Google API Usage reports
 * @property {String}language Google Language Parameter (used for Google Places geocoder).
 * See: [language support](https://developers.google.com/maps/faq#languagesupport)
 * @property {String}region Google region Parameter (used for Google Places geocoder). This parameter will only influence, not fully restrict, results from the geocoder.
 */


/**
 * @typedef {Object} UrlsConf
 * @example UrlsConf Example
 *
 *```json
 *{
 *   "urls": {
 *       "store": {
 *           "href": false,
 *           "target": "_self"
 *       },
 *       "stores": {
 *           "href": "https://developers.woosmap.com/",
 *           "target": "_self"
 *       }
 *   }
 *}
 *```
 * @property {StoreLinkConf}store To open website recommended store when it’s clicked
 * @property {StoreLinkConf}stores Global link displayed on the bottom of the widget
 */

/**
 * @typedef {Object} StoreLinkConf
 * @example StoreLinkConf Example
 *
 *```json
 *{
 *    "store": {
 *        "href": "https://www.mycompany.com/stores/city/",
 *        "target": "_blank"
 *    }
 *}
 *```
 * @property {String}href website Root URL for user interaction with store
 * @property {String}target to specifies where to open the linked document. Choose from [`'_blank'`, `'_self'`, `'_parent'`, `'_top'`, `'framename'`]
 */


/**
 * @typedef {Object} AutocompletePlacesConf
 * @example AutocompletePlacesConf Example
 *
 *```json
 *{
 *   "autocomplete": {
 *       "minLength": 3,
 *       "types": ["geocode"],
 *       "bounds": {
 *           "west": -4.87293470,
 *           "north": 51.089062,
 *           "south": 42.19809198,
 *           "east": 8.332631
 *       },
 *       "componentRestrictions": {"country": "gb"}
 *   }
 *}
 *```
 * @property {int}minLength The minimum number of characters a user must type before the search is performed.
 * @property {Array<String>}types types of predictions to be returned. For a list of supported types.
 * See: [supported types](https://developers.google.com/places/supported_types#table3)
 * @property {String}channel used for Google API Usage reports
 * @property {String}componentRestrictions Geocoding Component Restriction to restrict the autocomplete search to a particular country.
 * * See: [Autocomplete for Addresses and Search support](https://developers.google.com/maps/documentation/javascript/places-autocomplete)
 */


/**
 * @typedef {Object} GeocoderConf
 * @example GeocoderConf Example
 *
 *```json
 *{
 *    "geocoder": {
 *        "region": "FR"
 *    }
 *}
 *```
 * @property {String}region country code used to bias the search, specified as a Unicode region subtag / CLDR identifier.
 */


/**
 * @typedef {Object} WoosmapConf
 * @example WoosmapConf Example
 *
 *```json
 *{
 *   "woosmap": {
 *       "query": "Type:'Drive'",
 *       "limit": 5,
 *       "maxDistance": 25000
 *   }
 *}
 *```
 * @property {string}query Woosmap search query.
 * @property {int}limit Maximum stores to return. Max : 300.
 * @property {int}maxDistance used for Google API Usage reports
 */


/**
 * @typedef {Object} DisplayConf
 * @example DisplayConf Example
 *
 *```json
 *{
 *   "display": {
 *       "h12": true,
 *       "recommendation": {},
 *       "search": {}
 *   }
 *}
 *```
 * @property {Boolean}h12 Display AM/PM hours.
 * @property {RecommendationConf}recommendation To set the displaying of the recommended store
 * @property {SearchConf}search To set the results displaying
 */


/**
 * @typedef {Object} RecommendationConf
 * @example RecommendationConf Example
 *
 *```json
 *{
 *   "recommendation": {
 *       "address": true,
 *       "phone": true,
 *       "openingDay": true,
 *       "openingWeek": true
 *   }
 *}
 *```
 * @property {Boolean}address Display the address of the recommended store
 * @property {Boolean}phone Display the contact telephone of the recommended store
 * @property {Boolean}openingDay Display the daily opening hours of the recommended store
 * @property {Boolean}openingWeek Display the weekly opening hours of the recommended store
 */


/**
 * @typedef {Object} SearchConf
 * @example SearchConf Example
 *
 *```json
 *{
 *   "search": {
 *       "address": true,
 *       "openingDay": true,
 *       "openingWeek": true
 *   }
 *}
 *```
 * @property {Boolean}address Display the address of the recommended store
 * @property {Boolean}openingDay Display the daily opening hours of the recommended store
 * @property {Boolean}openingWeek Display the weekly opening hours of the recommended store
 */


/**
 * @typedef {Object} TranslationsConf
 * @example TranslationsConf Example
 *
 *```json
 *{
 *   "fr": {
 *     "searchAroundMeBtn": "Autour de moi",
 *     "searchAroundMeTitle": "Rechercher le centre à proximité",
 *     "selectAroundMeTitle": "Choisissez le centre à proximité :",
 *     "autocompletePlaceholder": "Spécifiez une adresse",
 *     "allStores": "Tous nos centres",
 *     "changeStore": "Centre à proximité",
 *     "findStore": "Choisir mon centre",
 *     "selectStore": "Choisir",
 *     "openingHoursDay": "Ouvert aujourd'hui :",
 *     "openingHoursWeek": "",
 *     "geolocationNotice": "La géolocalisation n'est pas activée sur votre navigateur. Veuillez changez vos préférences.",
 *     "geolocationErrHttps": "Votre position géographique n’a pas été renvoyée par votre navigateur. Veuillez saisir une adresse pour rechercher les magasins à proximité.",
 *     "geolocationErrBlocked": "La géolocalisation n'est pas activée sur votre navigateur. Veuillez saisir une adresse pour rechercher les magasins à proximité.",
 *     "telephone": "Tél :",
 *     "closeBtn": "Fermer",
 *     "open24": "24h/24",
 *     "days": {
 *          "1": {
 *                  "full": "Lundi",
 *                  "short": "Lun"
 *               },
 *          "2": {
 *                  "full": "Mardi",
 *                  "short": "Mar"
 *                }
 *           }
 *}
 *```
 * @property {string}language_code to customize each label for the desired language (see Widget Use and below Sample)
  */