"use strict";
// export BeyondGrammar as a function instead of a plugin
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.beyondGrammar = void 0;
function beyondGrammar($, FroalaEditor) {
    var settings = {
        service: {
            i18n: { en: "./libs/i18n-en.js" },
            sourcePath: "//prowriting.azureedge.net/beyondgrammar/1.0.142/dist/bundle.js",
            userId: null,
            apiKey: null,
            serviceUrl: "//rtg.prowritingaid.com"
        },
        grammar: {
            languageFilter: null,
            languageIsoCode: null,
            checkStyle: true,
            checkSpelling: true,
            checkGrammar: true,
            checkerIsEnabled: true,
            heavyGrammar: true
        },
        hideDisable: false
    };
    var getOptionsHtml = function () {
        if (!checker || checker.length == 0) {
            //console.log('No checker available');
            return '<ul class="fr-dropdown-list" role="presentation"></ul>';
        }
        var html = '<ul class="fr-dropdown-list" role="presentation">';
        var languages = checker[0]
            .getAvailableLanguages();
        if (languages) {
            languages
                .forEach(function (lang) {
                var bullet = lang.isoCode == language ? ' •' : '';
                html += '<li role="presentation"><a class="fr-command" tabindex="-1" role="option" data-cmd="BeyondGrammar" data-param1="' + lang.isoCode + '" title="' + lang.displayName + '" aria-selected="false">' + lang.displayName + bullet + '</a></li>';
            });
        }
        else {
            console.log('No languages available');
        }
        if (!settings.hideDisable) {
            // add a disable checking option
            var offBullet = "off" == language ? ' •' : '';
            html += '<li role="presentation"><a class="fr-command" tabindex="-1" role="option" data-cmd="BeyondGrammar" data-param1="off" title="No Checking" aria-selected="false">No Checking' + offBullet + '</a></li>';
        }
        html += '</ul>';
        return html;
    };
    window.addEventListener("pwa-language-change", function (event) {
        checker.forEach(function (c) {
            var settings = c.getSettings();
            // clone the settings
            settings = JSON.parse(JSON.stringify(settings));
            //console.log('Changing language from: '+settings.languageIsoCode+" to "+(<any>event).detail.language);
            settings.languageIsoCode = event.detail.language;
            c.setSettings(settings);
        });
    }, false);
    window.addEventListener("pwa-dictionary-add", function (event) {
        checker.forEach(function (c) {
            c.addToDictionary(event.detail.word);
        });
    }, false);
    // get the default language from the browser
    // or from a cookie
    var browserLanguage = window.navigator.userLanguage || window.navigator.language;
    var language = browserLanguage == "en-GB" ? 'en-GB' : 'en-US';
    var checker = [];
    FroalaEditor.DefineIconTemplate('beyond-grammar', '<i class="beyond-grammar-toolbar-icon"></i>');
    FroalaEditor.DefineIcon('beyond-grammar-icon', { NAME: 'icon', template: "beyond-grammar" });
    FroalaEditor.RegisterCommand('BeyondGrammar', {
        title: 'BeyondGrammar Checking',
        type: 'dropdown',
        icon: 'beyond-grammar-icon',
        focus: false,
        undo: false,
        refreshAfterCallback: true,
        html: function () {
            return getOptionsHtml();
        },
        callback: function (cmd, val) {
        },
        // Callback on refresh.
        refresh: function ($btn) {
            //console.log ('do refresh');
        },
        // Callback on dropdown show.
        refreshOnShow: function ($btn, $dropdown) {
            //console.log ('do refresh when show');
            var editorInstance = this, list = $dropdown.find('ul.fr-dropdown-list');
            $(list).html(getOptionsHtml());
            // if the menu is wider than the editor then
            // we want to make it right aligned
            var rightSideOfMenu = $btn.offset().left - $btn.parent().offset().left + $dropdown.width();
            var parentWidth = $btn.parent().width();
            if (rightSideOfMenu > parentWidth) {
                var left = $btn.offset().left - $btn.parent().offset().left - ($dropdown.width() - $btn.outerWidth());
                if (left < 0) {
                    left = 0;
                }
                $dropdown.hide();
                setTimeout(function () {
                    $dropdown.css('left', left + 'px');
                    $dropdown.show();
                }, 1);
            }
        }
    });
    FroalaEditor.PLUGINS.BeyondGrammarPlugin = function (editor) {
        var states = ["loading", "connected", "disconnected", "off"];
        var labelsByState = {
            "loading": "BeyondGrammar is loading",
            "connected": "BeyondGrammar is online (click to change language)",
            "disconnected": "BeyondGrammar is offline (click to start)",
            "off": "BeyondGrammar is stopped (click to change language)"
        };
        var plugin = {
            state: "",
            checker: null,
            _init: function () {
                if (!$(editor.$el[0]).is(":visible")) {
                    //console.log('Not starting RTG as element is not visible: ');
                    return;
                }
                //console.log('Starting froala on element: '+editor.$el.attr('name'));
                if (editor.opts && editor.opts.bgOptions) {
                    var opts = editor.opts.bgOptions;
                    var grammar = opts.grammar || {};
                    var service = opts.service || {};
                    //Grammar options applying
                    if (!grammar.languageIsoCode) {
                        grammar.languageIsoCode = language;
                    }
                    settings.grammar = __assign(__assign({}, grammar), { heavyGrammar: true });
                    //Service options applying
                    settings.service.sourcePath = service.sourcePath || settings.service.sourcePath;
                    settings.service.serviceUrl = service.serviceUrl || settings.service.serviceUrl;
                    settings.service.userId = service.userId;
                    settings.service.apiKey = service.apiKey;
                    //Froala specific options
                    settings.hideDisable = (typeof opts.disableHidden == "undefined") ? false : opts.disableHidden;
                }
                editor.events.on('html.get', function (html) {
                    // clean the html and return the cleaned html
                    var $html = $('<div>' + html + '</div>');
                    $html.find('.pwa-mark,.pwa-mark-done').contents().unwrap();
                    return $html.html();
                });
                editor.events.on("commands.before", function (command) {
                    //before code view is switched on
                    if (command == "html" && !editor.codeView.isActive()) {
                        plugin.checker.unbindChangeEvents();
                    }
                });
                editor.events.on('commands.after', function (command) {
                    //right after codeview is switched off
                    if (command == 'html' && !editor.codeView.isActive()) {
                        // force a check in case they've just returned from code view
                        plugin.checker.bindChangeEvents();
                        plugin.checker.checkAll();
                    }
                });
                plugin.setState("loading");
                if (window["BeyondGrammar"] && window["BeyondGrammar"].GrammarChecker) {
                    plugin.activate();
                    plugin.setState("connected");
                }
                else if (window["Pwa-plugins"]) {
                    // the script is still loading
                    window["Pwa-plugins"].push(plugin);
                    plugin.setState("connected");
                }
                else {
                    window["Pwa-plugins"] = [];
                    window["Pwa-plugins"].push(plugin);
                    plugin.loadScript(settings.service.sourcePath, function () {
                        window["Pwa-plugins"].forEach(function (p) {
                            p.activate();
                            p.setState("connected");
                        });
                        window["Pwa-plugins"] = null;
                    });
                }
            },
            onRefreshButton: function ($btn) {
                $btn.find(".beyond-grammar-toolbar-icon").removeClass(states.join(" ")).addClass(plugin.state);
                $btn.data("title", labelsByState[plugin.state]);
            },
            onToolbarButtonClick: function () {
                if (plugin.state == "loading") {
                    return;
                }
                if (plugin.state != "off") {
                    plugin.deactivate();
                }
                else {
                    plugin.activate();
                }
            },
            onLanguageOptionClick: function (cmd, val) {
                if (plugin.state == "loading") {
                    return;
                }
                if (plugin.checker) {
                    if (val == "off") {
                        var settings = plugin.checker.getSettings();
                        // clone the settings
                        settings = JSON.parse(JSON.stringify(settings));
                        settings.checkerIsEnabled = false;
                        plugin.checker.setSettings(settings);
                    }
                    else {
                        if (plugin.state == "off") {
                            plugin.activate();
                        }
                        var settings = plugin.checker.getSettings();
                        // clone the settings
                        settings = JSON.parse(JSON.stringify(settings));
                        settings.languageIsoCode = val;
                        settings.checkerIsEnabled = true;
                        plugin.checker.setSettings(settings);
                    }
                }
                language = val;
                // Create the event.
                var event = document.createEvent('CustomEvent');
                // Define that the event name is 'build'.
                //console.log('Init language change event');
                event.initCustomEvent('pwa-language-change', true, true, {
                    language: val
                });
                // target can be any Element or other EventTarget.
                window.dispatchEvent(event);
            },
            activate: function () {
                plugin.setState("loading");
                plugin.checker = new window["BeyondGrammar"].GrammarChecker(editor.$el[0], settings.service);
                plugin.checker.setSettings(settings.grammar);
                checker.push(plugin.checker);
                plugin.checker.onConnectionChange = function (status) {
                    plugin.setState(status);
                };
                plugin.checker.onAddToDictionary = function (word) {
                    // we event it to other instances
                    // Create the event.
                    var event = document.createEvent('CustomEvent');
                    // Define that the event name is 'build'.
                    event.initCustomEvent('pwa-dictionary-add', true, true, {
                        word: word
                    });
                    // target can be any Element or other EventTarget.
                    window.dispatchEvent(event);
                };
                plugin.checker.init().then(function () { return plugin.checker.activate(); });
            },
            deactivate: function () {
                var indexOf = checker.indexOf(plugin);
                if (indexOf >= 0) {
                    checker.splice(indexOf, 1);
                }
                plugin.checker.deactivate();
                plugin.checker.onConnectionChange = null;
                plugin.setState("off");
            },
            setState: function (state) {
                plugin.state = state;
                editor.button.bulkRefresh();
            },
            loadScript: function (src, onComplete) {
                var script = document.createElement("script");
                script.onload = onComplete || (function () { return console.log("\"" + src + "\" was loaded"); });
                script.src = src;
                document.body.appendChild(script);
            }
        };
        FroalaEditor.COMMANDS["BeyondGrammar"].callback = function (cmd, val) { return plugin.onLanguageOptionClick(cmd, val); };
        FroalaEditor.COMMANDS["BeyondGrammar"].refresh = function ($btn) { return plugin.onRefreshButton($btn); };
        return plugin;
    };
}
exports.beyondGrammar = beyondGrammar;
