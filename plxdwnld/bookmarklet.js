/**
 * Download original files from the Plex web interface
 *
 * This project is licensed under the terms of the MIT license, see https://piplongrun.github.io/plxdwnld/LICENSE.txt
 *
 * @author      Pip Longrun <pip.longrun@protonmail.com>
 * @version     0.1
 * @see         https://piplongrun.github.io/plxdwnld/
 *
 */
 var plxDwnld = (function() {
    var self = {};
    var clientIdRegex = new RegExp("server\/([a-f0-9]{40})\/");
    var metadataIdRegex = new RegExp("key=%2Flibrary%2Fmetadata%2F(\\d+)");
    var apiResourceUrl = "https://plex.tv/api/resources?includeHttps=1&X-Plex-Token={token}";
    var apiLibraryUrl = "{baseuri}/library/metadata/{id}?X-Plex-Token={token}";
    var downloadUrl = "{baseuri}{partkey}?download=1&X-Plex-Token={token}";
    var accessTokenXpath = "//Device[@clientIdentifier='{clientid}']/@accessToken";
    var baseUriXpath = "//Device[@clientIdentifier='{clientid}']/Connection[@local='0']/@uri";
    var partKeyXpath = "//Media/Part[1]/@key";
    var baseUri = null;
    var accessToken = null;

    var getXml = function(url, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200) {
                callback(request.responseXML);
            }
        };
        request.open("GET", url);
        request.send();
    };

    var getMetadata = function(xml) {
        var clientId = clientIdRegex.exec(window.location.href);

        if (clientId && clientId.length == 2) {
            var accessTokenNode = xml.evaluate(accessTokenXpath.replace('{clientid}', clientId[1]), xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            var baseUriNode = xml.evaluate(baseUriXpath.replace('{clientid}', clientId[1]), xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

            if (accessTokenNode.singleNodeValue && baseUriNode.singleNodeValue) {
                accessToken = accessTokenNode.singleNodeValue.textContent;
                baseUri = baseUriNode.singleNodeValue.textContent;
                var metadataId = metadataIdRegex.exec(window.location.href);

                if (metadataId && metadataId.length == 2) {
                    getXml(apiLibraryUrl.replace('{baseuri}', baseUri).replace('{id}', metadataId[1]).replace('{token}', accessToken), getDownloadUrl);
                } else {
                    alert("You are currently not viewing a media item.");
                }
            } else {
                alert("Cannot find a valid accessToken.");
            }
        } else {
            alert("You are currently not viewing a media item.");
        }
    };

    var getDownloadUrl = function(xml) {
        var partKeyNode = xml.evaluate(partKeyXpath, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

        if (partKeyNode.singleNodeValue) {
            window.location.href = downloadUrl.replace('{baseuri}', baseUri).replace('{partkey}', partKeyNode.singleNodeValue.textContent).replace('{token}', accessToken);
        } else {
            alert("You are currently not viewing a media item.");
        }
    };

    self.init = function() {
        if (typeof localStorage.myPlexAccessToken != "undefined") {
            getXml(apiResourceUrl.replace('{token}', localStorage.myPlexAccessToken), getMetadata);
        } else {
            alert("You are currently not browsing or logged into a Plex web environment.");
        }
    };

    return self;
})();

plxDwnld.init();
