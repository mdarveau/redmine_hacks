// ==UserScript==
// @name         Redmine Drag 'n drop
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
// @updateURL https://raw.githubusercontent.com/MacKeeper/redmine_hacks/master/hacks.js
// @downloadURL https://raw.githubusercontent.com/MacKeeper/redmine_hacks/master/hacks.js
// ==/UserScript==

var chosen_CSS = GM_getResourceText ("chosen_CSS");
GM_addStyle (chosen_CSS);

GM_addStyle (".chosen-container-single .chosen-single abbr {  background: url('https//cdn.madebyglutard.com/libs/chosen/1.2.0/chosen-sprite.png') -42px 1px no-repeat;}");
GM_addStyle (".chosen-container-single .chosen-single div b {  background: url('https//cdn.madebyglutard.com/libs/chosen/1.2.0/chosen-sprite.png') no-repeat 0px 2px;}");
GM_addStyle (".chosen-container-single .chosen-search input[type='text'] {  background: white url('https//cdn.madebyglutard.com/libs/chosen/1.2.0/chosen-sprite.png') no-repeat 100% -20px;  background: url('https//cdn.madebyglutard.com/libs/chosen/1.2.0/chosen-sprite.png') no-repeat 100% -20px;}");
GM_addStyle (".chosen-container-multi .chosen-choices li.search-choice .search-choice-close {  background: url('https//cdn.madebyglutard.com/libs/chosen/1.2.0/chosen-sprite.png') -42px 1px no-repeat;}");
GM_addStyle (".chosen-rtl .chosen-search input[type='text'] {  background: white url('https//cdn.madebyglutard.com/libs/chosen/1.2.0/chosen-sprite.png') no-repeat -30px -20px;  background: url('https//cdn.madebyglutard.com/libs/chosen/1.2.0/chosen-sprite.png') no-repeat -30px -20px;}");
GM_addStyle ("@media only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min-resolution: 144dpi) {.chosen-rtl .chosen-search input[type='text'],.chosen-container-single .chosen-single abbr,.chosen-container-single .chosen-single div b,.chosen-container-single .chosen-search input[type='text'],.chosen-container-multi .chosen-choices .search-choice .search-choice-close,.chosen-container .chosen-results-scroll-down span,.chosen-container .chosen-results-scroll-up span{background-image:url('https://cdn.madebyglutard.com/libs/chosen/1.2.0/chosen-sprite@2x.png')!important;background-size:52px 37px!important;background-repeat:no-repeat!important;}}");

GM_addStyle (".chosen-container, .chosen-single span {color: black;}");
GM_addStyle (".chosen-container .chosen-results { max-height: 800px; }");
/**
* Utilities
*/

// http://stackoverflow.com/questions/1720320/how-to-dynamically-create-css-class-in-javascript-and-apply
function createCSSSelector( selector, style ) {
   if ( !document.styleSheets ) {
       return;
   }

   if ( document.getElementsByTagName( "head" ).length == 0 ) {
       return;
   }

   var stylesheet;
   var mediaType;
   if ( document.styleSheets.length > 0 ) {
       for ( i = 0; i < document.styleSheets.length; i++ ) {
           if ( document.styleSheets[i].disabled ) {
               continue;
           }
           var media = document.styleSheets[i].media;
           mediaType = typeof media;

           if ( mediaType == "string" ) {
               if ( media == "" || (media.indexOf( "screen" ) != -1) ) {
                   styleSheet = document.styleSheets[i];
               }
           } else if ( mediaType == "object" ) {
               if ( media.mediaText == "" || (media.mediaText.indexOf( "screen" ) != -1) ) {
                   styleSheet = document.styleSheets[i];
               }
           }

           if ( typeof styleSheet != "undefined" ) {
               break;
           }
       }
   }

   if ( typeof styleSheet == "undefined" ) {
       var styleSheetElement = document.createElement( "style" );
       styleSheetElement.type = "text/css";

       document.getElementsByTagName( "head" )[0].appendChild( styleSheetElement );

       for ( i = 0; i < document.styleSheets.length; i++ ) {
           if ( document.styleSheets[i].disabled ) {
               continue;
           }
           styleSheet = document.styleSheets[i];
       }

       var media = styleSheet.media;
       mediaType = typeof media;
   }

   if ( mediaType == "string" ) {
       for ( i = 0; i < styleSheet.rules.length; i++ ) {
           if ( styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase() ) {
               styleSheet.rules[i].style.cssText = style;
               return;
           }
       }

       styleSheet.addRule( selector, style );
   } else if ( mediaType == "object" ) {
       for ( i = 0; i < styleSheet.cssRules.length; i++ ) {
           if ( styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase() ) {
               styleSheet.cssRules[i].style.cssText = style;
               return;
           }
       }

       styleSheet.insertRule( selector + "{" + style + "}", styleSheet.cssRules.length );
   }
}

function sumColumn( columnName ) {
    if ( window.sumColmuns == undefined ) {
        window.sumColmuns = [];
    }
    window.sumColmuns.push( columnName );
    updateSums();
}

function updateSums() {
    for ( var x = 0; x < window.sumColmuns.length; x++ ) {
        updateSum( window.sumColmuns[x] );
    }
}

function updateSum( columnName ) {
    var columnIndex = $( ".list.issues thead tr th:contains('" + columnName + "')" ).index();
    // Only apply if column is present
    if ( columnIndex == -1 ) {
        return;
    }
    // Offset by one for issues
    columnIndex += 1;

    // TODO Show in header instead of overriding issue count
    $( ".group" ).each( function ( i, group ) {
        group = $(group);
        var issues = group.nextUntil( ".group" ).filter( ":not(.dragged-element)" );
        var sum = 0;
        issues.find( ":nth-child(" + columnIndex + ")" ).each( function ( i, cell ) {
            var estimate = $( cell ).text();
            if ( estimate !== undefined && estimate !== "" ) {
                sum += parseFloat( estimate );
            }
        } );
        var countSpan = group.find( '.count-' + columnIndex );
        if( countSpan.length == 0 ) {
            countSpan = $('<span />').addClass('count-' + columnIndex ).addClass('count');
            group.find('td .count').after( countSpan );
        }
        countSpan.text( columnName + ": " + sum );
    } )
}

function getLastRowOfGroup( group ) {
    var nextGroupTr = $( group ).nextAll( ".group" ).first();
    if ( nextGroupTr.length != 0 ) {
        return nextGroupTr.prev();
    } else {
        var nextIssues = group.nextAll( ".issue" );
        if ( nextIssues.length != 0 ) {
            return nextIssues.last();
        } else {
            return group;
        }
    }
}

function enableDragAndDrop() {
    console.log( "enableDragAndDrop" );

    // Create a class for drop active
    createCSSSelector( ".dropZoneActive", "background-color:#ffffdd;" );
    createCSSSelector( ".dropZoneHover", "background-color: #ffffdd;border-color: #FF0000;border-style: solid; border-width: 1px;" );

    // Style for not confirmed issue
    createCSSSelector( ".issue-post-in-progress", "opacity: 0.3;" );

    $( ".issue:not(.details)" ).each( function ( i, issue ) {
        issue = $( issue );

        var draggableDiv = issue.draggable( {
            scroll: true,
            axis: "y",
            revert: "invalid",
            opacity: 0.7,
            helper: function ( event ) {
                var draggedElement = $( event.currentTarget ).clone();
                draggedElement.removeClass( "context-menu-selection" );
                draggedElement.addClass( "dragged-element" );
                return draggedElement;
            },
            start: function ( event, ui ) {
                var dragStartItem = ui.helper.find( "td[class='id'] a" ).text();
                
                // Only drag other selected issues if the currently dragged was selected
                if ( $( event.currentTarget ).hasClass( 'context-menu-selection' ) ) {
                    var selectedItems = $( ".context-menu-selection" ).map( function ( i, selectedIssue ) {
                        return $( selectedIssue ).find( "td[class='id'] a" ).text();
                    } ).get();

                    //if ( $.inArray( dragStartItem, selectedItems ) == -1 ) {
                    //    selectedItems.push( dragStartItem );
                    //}
                } else {
                    selectedItems = [];
                    selectedItems.push( dragStartItem );
                }

                console.log( "Dragged issues: " + selectedItems );
                window.selectedIDs = selectedItems;
            },
            drag: function () {
            },
            stop: function () {
            }
        } );

        //$( '.subject', draggableDiv ).mousedown( function ( ev ) {
        //    draggableDiv.draggable( 'disable' );
        //} ).mouseup( function ( ev ) {
        //    draggableDiv.draggable( 'enable' );
        //} );

   } )

   $( ".group" ).each( function ( i, group ) {
       group = $( group );
       group.droppable( {
           accept: ".issue",
           activeClass: "dropZoneActive",
           hoverClass: "dropZoneHover",
           drop: function ( event, ui ) {
               var groupRow = $( this );
               var draggedIssueNumbers = window.selectedIDs;

               // TODO Check content of availableFilters to map values to ids
               selectedGroupValue = $( "#group_by :selected" ).val();
               if ( selectedGroupValue.indexOf( "cf_" ) === 0 ) {
                   // Custom field
                   groupField = 'issue[custom_field_values][' + selectedGroupValue.substr( "cf_".length ) + ']';
                   groupValue = groupRow.find( "td" ).clone().children().remove().end().text().trim();
               } else {
                   // Standard fields
                   groupField = 'issue[' + selectedGroupValue + '_id]';
                   if ( selectedGroupValue == "assigned_to" ) {
                       groupValue = groupRow.find( "a" ).attr( 'href' ).substr( "/users/".length );
                   } else {
                       alert( "Unsupported group by for d&d: " + groupField )
                   }
               }

               console.log( "Assign " + draggedIssueNumbers + " to " + groupValue );

               // Move row right away but apply a "temporaty" style
               for ( var x = 0; x < draggedIssueNumbers.length; x++ ) {
                   var row = $( "tr:has(td[class='id'] a:contains(" + draggedIssueNumbers[x] + "))" );
                   row.addClass( "issue-post-in-progress" );
                   row.detach();
                   getLastRowOfGroup( groupRow ).after( row );
               }

               // Trigger a sum refresh
               updateSums();

               updateIssue( draggedIssueNumbers, groupField, groupValue, function ( ids ) {
                   for ( var x = 0; x < draggedIssueNumbers.length; x++ ) {
                       var row = $( "tr:has(td[class='id'] a:contains(" + draggedIssueNumbers[x] + "))" );
                       row.removeClass( "issue-post-in-progress" );
                   }
               } );
           }
       } );
   } )
}

function encodeIds( issues ) {
   return $( issues ).map( function ( i, issue ) {
       return encodeURIComponent( 'ids[]' ) + "=" + encodeURIComponent( issue )
   } ).get().join( '&' );
}

function updateIssue( issues, field, value, callback ) {
    var queryString = "back_url=" + encodeURIComponent( "/" ) + "&" + encodeIds( issues ) + "&" + encodeURIComponent( field ) + "=" + encodeURIComponent( value );
    $.post( '/issues/bulk_update?' + queryString, {authenticity_token: $( "input[name='authenticity_token']" ).val()}, function ( data, status, jqXHR ) {
        if ( status == "success" ) {
           callback()
       } else {
            alert( "Update failed: " + data );
            window.location = window.location;
        }
    } )
}

function setupKeyShortcut() {
    $(document).keypress( function( event ){
            if( !event.altKey && ($(event.target).is("input") || $(event.target).is("textarea")) ){
                return;
            }
            switch( event.charCode ) {
                case 101:
                    showAndScrollTo("update", "issue_notes");
                    return false;
                
                case 13:
                    $("#issue-form" ).submit();
                    return false;
                
                default:
                    console.log(event.charCode)
            }
        }
    )
}


$( function () {
    sumColumn( "Estimated time" );
    enableDragAndDrop();
    setupKeyShortcut();
    
    $("#quick-search select").chosen({no_results_text: "Not found"}); 
} );
