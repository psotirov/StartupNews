// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    
    var localSettings = Windows.Storage.ApplicationData.current.localSettings;

    WinJS.UI.Pages.define("/pages/settings/settings.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var servers = ServersData.getList;
            var settings = localSettings.values['serversEnabled'];
            if (settings == undefined || settings == null) {
                settings = {};
            } else {
                settings = JSON.parse(settings);
            }

            for (var i = 0; i < servers.length; i++) {
                if (settings[servers[i].name] != 'false') {
                    settings[servers[i].name] = 'true';
                }
                var toggleElement = document.createElement('div');
                var toggleSwitch = new WinJS.UI.ToggleSwitch(toggleElement, {
                    title: servers[i].name,
                    checked: (settings[servers[i].name] == 'true'),
                    onchange: function (event) {
                        var toggle = event.target.winControl;
                        settings[toggle.title] = (toggle.checked) ? "true" : "false";
                        localSettings.values['serversEnabled'] = JSON.stringify(settings);
                        Data.getLocalSettings();
                    }
                });

                element.querySelector('.win-settings-section').appendChild(toggleElement);
            }

            localSettings.values['serversEnabled'] = JSON.stringify(settings);
            //WinJS.UI.processAll(element);
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
            // console.log();
        }
    });
})();
