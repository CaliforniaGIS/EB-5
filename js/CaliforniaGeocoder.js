
/*!
 * jQuery-ajaxTransport-XDomainRequest - v1.0.1 - 2013-10-17
 * https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest
 * Copyright (c) 2013 Jason Moon (@JSONMOON)
 * Licensed MIT (/blob/master/LICENSE.txt)
 */
(function ($) { if (!$.support.cors && $.ajaxTransport && window.XDomainRequest) { var n = /^https?:\/\//i; var o = /^get|post$/i; var p = new RegExp('^' + location.protocol, 'i'); var q = /text\/html/i; var r = /\/json/i; var s = /\/xml/i; $.ajaxTransport('* text html xml json', function (i, j, k) { if (i.crossDomain && i.async && o.test(i.type) && n.test(i.url) && p.test(i.url)) { var l = null; var m = (j.dataType || '').toLowerCase(); return { send: function (f, g) { l = new XDomainRequest(); if (/^\d+$/.test(j.timeout)) { l.timeout = j.timeout } l.ontimeout = function () { g(500, 'timeout') }; l.onload = function () { var a = 'Content-Length: ' + l.responseText.length + '\r\nContent-Type: ' + l.contentType; var b = { code: 200, message: 'success' }; var c = { text: l.responseText }; try { if (m === 'html' || q.test(l.contentType)) { c.html = l.responseText } else if (m === 'json' || (m !== 'text' && r.test(l.contentType))) { try { c.json = $.parseJSON(l.responseText) } catch (e) { b.code = 500; b.message = 'parseerror' } } else if (m === 'xml' || (m !== 'text' && s.test(l.contentType))) { var d = new ActiveXObject('Microsoft.XMLDOM'); d.async = false; try { d.loadXML(l.responseText) } catch (e) { d = undefined } if (!d || !d.documentElement || d.getElementsByTagName('parsererror').length) { b.code = 500; b.message = 'parseerror'; throw 'Invalid XML: ' + l.responseText; } c.xml = d } } catch (parseMessage) { throw parseMessage; } finally { g(b.code, b.message, c, a) } }; l.onprogress = function () { }; l.onerror = function () { g(500, 'error', { text: l.responseText }) }; var h = ''; if (j.data) { h = ($.type(j.data) === 'string') ? j.data : $.param(j.data) } l.open(i.type, i.url); l.send(h) }, abort: function () { if (l) { l.abort() } } } } }) } })(jQuery);


/*!
 *   California Geocoder - v2014-04-24
 *   Copyright (c) 2014 State of California
 *   Use of the services consumed by this script
 *   is restricted to websites/applications operated
 *   created, or maintained by the State of California
 *   and its partners.
 */

var __cagis_callbackSuccess;
var __cagis_callbackError;
var __cagis_BaseUrl = "https://maps.gis.ca.gov/services/GeocodingScriptService.asmx";

function CaliforniaGeocoder(callbackSuccess, callbackError) {
    /// <summary>Geocoding system for the State of California.</summary>
    /// <param name="callbackSuccess" type="Object">JavaScript function that handles successful geocoding.</param>
    /// <param name="callbackError" type="Object">JavaScript function that handles unsuccessful geocoding.</param>
    if ((window.jQuery) && (typeof (jQuery) !== 'undefined')) {
        $.support.cors = true;
        __cagis_callbackSuccess = callbackSuccess;
        __cagis_callbackError = callbackError;
        this.GeocodeAddress = function (streetAddress, city, state, zipCode) {
            /// <summary>Geocodes an address.</summary>
            /// <param name="streetAddress" type="String">Street number and street name.</param>
            /// <param name="city" type="String">City.</param>
            /// <param name="state" type="String">Two leter state acronym.</param>
            /// <param name="zipCode" type="String">Zip code.</param>
            var requestData = "addressLine=" + streetAddress + "&city=" + city + "&zipCode=" + zipCode + "&state=" + state;
            $.ajax({
                url: __cagis_BaseUrl + "/GeocodeAddress",
                type: "GET",
                data: requestData,
                dataType: 'xml',
                success: __cagis_geocodeSuccess,
                error: __cagis_callbackError
            });
        };

        this.GeocodeSingleLine = function (address) {
            /// <summary>Geocodes an address defined in a single property or field.</summary>
            /// <param name="address" type="String">The complete address to geocode.</param>
            var requestData = "fullAddress=" + address;
            $.ajax({
                url: __cagis_BaseUrl + "/GeocodeSingleLine",
                type: "GET",
                data: requestData,
                dataType: 'xml',
                success: __cagis_geocodeSuccess,
                error: __cagis_callbackError
            });
        }

        this.ReverseGeocode = function (longitude, latitude) {
            /// <summary>Returns an address (estimated) from a coordinate.</summary>
            /// <param name="longitude" type="Double">Longitude.</param>
            /// <param name="latitude" type="Double">Latitude.</param>
            var requestData = "longitude=" + longitude + "&latitude=" + latitude;
            $.ajax({
                url: __cagis_BaseUrl + "/ReverseGeocode",
                type: "GET",
                data: requestData,
                dataType: 'xml',
                success: __cagis_geocodeSuccess,
                error: __cagis_callbackError
            });
        };
    }
    else
        alert("Error: CaliforniaGeocoder() requires jQuery to be loaded first.");
}

function __cagis_geocodeSuccess(data, status, xhr) {
    if ((xhr.readyState === 4) && (xhr.statusText === "OK")) {
        var xmlDocument = $.parseXML(xhr.responseText);
        $xml = $(xmlDocument);
        if ($xml.length > 0) {
            // Data
            var fa = $xml.find("FormatedAddress");
            var lo = $xml.find("Longitude");
            var la = $xml.find("Latitude");
            var ca = $xml.find("CalculationMethod");
            var co = $xml.find("Confidence");

            var geocodeResults = function () {
                this.FormattedAddress;
                this.Longitude;
                this.Latitude;
                this.CalculationMethod;
                this.Confidence;
            }

            geocodeResults.FormattedAddress = __cagis__readNode($xml.find("FormatedAddress"));
            geocodeResults.Longitude = __cagis__readNode($xml.find("Longitude"));
            geocodeResults.Latitude = __cagis__readNode($xml.find("Latitude"));
            geocodeResults.CalculationMethod = __cagis__readNode($xml.find("CalculationMethod"));
            geocodeResults.Confidence = __cagis__readNode($xml.find("Confidence"));

            __cagis_callbackSuccess(geocodeResults);
        }
    }
}

function __cagis__readNode(node) {
    if (node.length > 0) {
        if ((typeof (node[0].text) !== "undefined") && (node[0].text !== ""))
            return node[0].text;
        else
            return node[0].textContent;
    }
    else
        return "";
}
