/// <reference path="serversdata.js" />
/// <reference path="subscriptiondata.js" />
/// <reference path="script.js" />


(function () {
    "use strict";
    var NUMBER_OF_ITEMS_PER_GROUP = 4;
    var serversSettings = {};

    var list = new WinJS.Binding.List();
    getLocalSettings();
    var limitedList = list.createFiltered(function (item) {
        return (item.inReducedList && serversSettings[item.group.title] != 'false');
    });

    var groupedItems = list.createGrouped(
        function groupKeySelector(item) { return item.group.key; },
        function groupDataSelector(item) { return item.group; }
    );
    var limitedGroupedItems = limitedList.createGrouped(
        function groupKeySelector(item) { return item.group.key; },
        function groupDataSelector(item) { return item.group; }
    );


    // Adding data from asynchronous sources whenever it becomes available.
    readRSSData();

    WinJS.Namespace.define("Data", {
        allItems: list,
        items: groupedItems,
        limitedItems: limitedGroupedItems,
        groups: groupedItems.groups,
        limitedGroups: limitedGroupedItems.groups,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference,
        getLocalSettings: getLocalSettings
    });

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.group.key, item.title];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return list.createFiltered(function (item) { return item.group.key === group.key; });
    }

    // Get the unique group corresponding to the provided group key.
    function resolveGroupReference(key) {
        for (var i = 0; i < groupedItems.groups.length; i++) {
            if (groupedItems.groups.getAt(i).key === key) {
                return groupedItems.groups.getAt(i);
            }
        }
    }

    // Get a unique item from the provided string array, which should contain a
    // group key and an item title.
    function resolveItemReference(reference) {
        for (var i = 0; i < groupedItems.length; i++) {
            var item = groupedItems.getAt(i);

            // Returns an array of sample data that can be added to the application's
            // data list. 
            if (item.group.key === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }

    function readRSSData() {

        var sourceGroups = [];

        var serversRss = ServersData.getList;
        for (var i = 0; i < serversRss.length; i++) {
            var group = {
                key: "group" + i,
                title: serversRss[i].name,
                url: serversRss[i].url,
                image: serversRss[i].image,
                defaultImage: serversRss[i].defaultImage,
            }
            sourceGroups.push(group);
        }

        for (var i = 0; i < sourceGroups.length; i++) {
            getServerRss(sourceGroups[i]);
        }
    }

    /*    
    var itemData = {
        title: title,
        url: link,
        content: description,
        thumbnail: img,
        [date: pubDate]
    }
*/
    function getServerRss(group) {
        // WinJS.Promise.timeout(2500, WinJS.xhr({ url: group.url }).then(function (rss) {
        WinJS.xhr({ url: group.url }).then(function (rss) {
            //TODO: extract subscription data - channel attributes and update ServerData (call ServerData suitable method)
            var defaultImage = group.image;
            var items;
            if (!rss || !rss.responseXML ||
                    !(items = rss.responseXML.querySelectorAll("rss > channel > item"))) { // no XML on the page
                list.push({
                    group: group,
                    title: "No available RSS data",
                    image: defaultImage,
                    description: "",
                    content: "",
                    inReducedList: true,
                });
                return;
            }

            var channelImage = rss.responseXML.querySelector("rss > channel > image > url");
            channelImage = (channelImage && channelImage.textContent) ? channelImage.textContent : defaultImage;

            var tempDiv = document.createElement('div');

            for (var i = 0; i < items.length; i++) {
                var item = {};
                item.group = group;
                item.title = items[i].querySelector("title").textContent;
                item.url = items[i].querySelector("link").textContent;
                var pubDate = items[i].querySelector("pubDate");
                item.date = pubDate ? pubDate.textContent : new Date().toDateString();
                var descr = items[i].querySelector("description");
                var content = items[i].querySelector("content, encoded");
                tempDiv.innerHTML = (content && content.textContent) ? content.textContent : descr.textContent;
                var imgs = tempDiv.getElementsByTagName('img');
                item.description = descr.textContent;
                item.content = (content) ? content.textContent : "";
                item.image = (imgs && imgs.length > 0) ? imgs[0].getAttribute("src") : channelImage;
                item.image = (group.defaultImage && group.defaultImage.length > 0) ? group.defaultImage : item.image;
                item.inReducedList = (i < NUMBER_OF_ITEMS_PER_GROUP);

                list.push(item);
            }

            // save to external file for future caching
            writeServerData(group.title);

        }/*)*/, function (error) { // on timeout error read cached data
            //use external file as a source (offline browsing)
            readServerData(group.title).then(function (result) {
                if (result && result.length > 0) {
                    for (var i = 0, len = result.length; i < len; i++) {
                        list.push(result[i]);
                    }
                } else {
                    list.push({
                        group: group,
                        title: "RSS reading timeout. Please try again.",
                        image: "images/smalllogo.png",
                        description: "",
                        content: "",
                        inReducedList: true,
                    });
                }
            });
        });
    }

    // Read local settings for enabled/disabled servers from initial list
    function getLocalSettings() {
        var settings = Windows.Storage.ApplicationData.current.localSettings.values['serversEnabled'];
        if (settings != undefined && settings != null) {
            serversSettings = JSON.parse(settings);
            list.notifyReload();
        }
    }

    // Write current state data to a file
    function writeServerData(serverName) {
        var filename = serverName + ".txt";
        var serverData = [];
        for (var i = 0, len = list.length; i < len; i++) {
            var item = list.getAt(i);
            if (item.group.title == serverName) {
                serverData.push(item);
            }
        }

        Windows.Storage.ApplicationData.current.localFolder
        .createFileAsync(filename, Windows.Storage.CreationCollisionOption.replaceExisting)
           .done(function (dataFile) {
               Windows.Storage.FileIO.writeTextAsync(dataFile, JSON.stringify(serverData)).done();
           });
    }

    // Read current state data from a file
    function readServerData(serverName) {
        return new WinJS.Promise(function (complete) {
            Windows.Storage.ApplicationData.current.localFolder
            .getFileAsync(serverName + ".txt")
                .done(function (dataFile) {
                    Windows.Storage.FileIO.readTextAsync(dataFile)
                        .then(function (dataString) {
                            var result = (dataString.length) ? JSON.parse(dataString) : null;
                            complete(result);
                        });
                }, function () {
                    complete(null);
                });
        });
    }

})();
