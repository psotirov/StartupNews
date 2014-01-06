// List of servers, passed as the 'dataSource' argument in the ListViews
(function () {
    "use strict";

    var initialList = [
        { url: "http://feeds.feedburner.com/techcrunch/startups?format=xml", name: "Techcrunch", image: "", defaultImage: "" },
        { url: "http://feeds.feedburner.com/inc/channel/start-up?format=xml", name: "Inc", image: "", defaultImage: "" },
		{ url: "http://www.killerstartups.com/feed/", name: "Killerstartups", image: "", defaultImage: "" },
		{ url: "http://feeds.mashable.com/Mashable?format=xml", name: "Mashable", image: "", defaultImage: "" },
        { url: "http://feeds.feedburner.com/entrepreneur/latest?format=xml", name: "Entrepreneur", image: "", defaultImage: "http://www.entrepreneur.com/dbimages/blog/entrepreneur-redesign.jpg" },
        { url: "https://news.ycombinator.com/rss", name: "Ycombinator", image: "http://www.userlogos.org/files/logos/techky/hackernews.png", defaultImage: "" },
    ];

    WinJS.Namespace.define("ServersData", {
        getList: initialList
    });
})();