(function () {
    "use strict";
    var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
    
    var item;
    var content;

    var shareTextHandler = function (event) {
        var dataRequest = event.request;

        dataRequest.data.properties.title = item.title

        var htmlFormat =
            Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(toStaticHTML(content));

        dataRequest.data.setHtmlFormat(htmlFormat)

    }


    WinJS.UI.Pages.define("/pages/itemDetail/itemDetail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            item = options && options.item ? Data.resolveItemReference(options.item) : Data.items.getAt(0);
            element.querySelector(".titlearea .pagetitle").textContent = item.group.title;
            element.querySelector("article .item-title").textContent = item.title;
            // element.querySelector("article .item-image").src = item.image; // duplicated image
            content = (item.content.length > item.description.length) ? item.content : item.description;
            element.querySelector("article .item-content").innerHTML = toStaticHTML(content);
            document.querySelector("article .navigate-item-in-browser").addEventListener("click", function (event) {
                window.open(item.url, '_blank');
                window.focus();
            });
            element.querySelector(".content").focus();

            dataTransferManager.addEventListener("datarequested", shareTextHandler)
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.

            dataTransferManager.removeEventListener("datarequested", shareTextHandler)

        }

    });
})();
