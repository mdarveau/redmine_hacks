redmine_hacks
=============

### Various javascript hacks to improve the redmine UI

* Allow to sum group by using an arbitrary value instead of item count
* Added grag and drop between group by

## Installation

### Chrome
* Install http://tampermonkey.net/
* Click "Add a new script..." in the plugin menu and paste:


    // ==UserScript==
    // @name         Redmine Drag 'n drop
    // @include      https://redmine.priv.8d.com/issues/*
    // @include      https://redmine.priv.8d.com/*/issues*
    // @grant        none
    // @updateURL https://raw.githubusercontent.com/MacKeeper/redmine_hacks/master/hacks.js
    // @downloadURL https://raw.githubusercontent.com/MacKeeper/redmine_hacks/master/hacks.js
    // ==/UserScript==

### Dev


    // ==UserScript==
    // @name         Redmine Drag 'n drop (DEV)
    // @namespace    www.8d.com
    // @version      0.5
    // @description  Drag 'n Drop awesomeness
    // @include      https://*redmine*issues/*
    // @include      https://*redmine*/*/issues*
    // @author       mdarveau
    // @grant    GM_addStyle
    // @grant    GM_getResourceText
    // @require https:/cdn.madebyglutard.com/libs/chosen/1.2.0/chosen.jquery.js
    // @resource chosen_CSS https://cdn.madebyglutard.com/libs/chosen/1.2.0/chosen.css
    // @run-at document-end
    // @require file:/PATH_TO_YOUR_FILE.js
    // ==/UserScript==

## Known issues
* Drag and drop between group only works for assignee and custom fields

## Roadmap
* Hot key to popup quick find to switch project
* Auto-sum all numeric fields
* Favorite in project detail