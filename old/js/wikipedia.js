function setupDoubleClick(websiteUrl, dictionary, areaId, maxAllowedWords, target,json) {
	//warning message for developers
	if (!websiteUrl || !dictionary) {
		alert("Please specify required parameters (websiteurl and dictionary) to setupDoubleClick()")
			return;
	}
	
/*	jQuery.ajax({ 
            type: 'GET', 
            url: json, 
            dataType: 'json',
            success: function (data) { 
                         jQuery.each(data, function(index, element) {                            
                                regex = new RegExp("\\b(" + index + ")\\b", "ig");
                                var strNewString = jQuery("#tagged-text").html().replace(regex, '<a href="' + websiteUrl + '?search='+ index + '" title="Occurrences: '+ element +'" style="color:#E5574B" target="_blank">'+ index +'</a>');
                                jQuery('#tagged-text').html(strNewString);                     
                        });
            }
        });
   */     
	//shows the definition layer
	var showLayer = function(e) {
        // don't do anything on A href elements
        // and when this is right button of mouse.
		if (e.target.nodeName.toLowerCase()=="a" || e.button==2) {
			jQuery("#definition_layer").remove();
			return;
		}
		e.preventDefault();
		var lookup = getSelectedText();
		lookup = lookup.replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ");
		lookup = lookup.replace(/\s+/g, " ");
		// Uncomment to link only words present in localstorage
		//if (lookup != null && lookup.replace("/\s/g", "").length > 0 && localStorage[lookup] ) {
		// Uncomment to link all words to wikipedia
		if (lookup != null && lookup.replace("/\s/g", "").length > 0) {	
			//disable the double-click feature if the lookup string
			//exceeds the maximum number of allowable words
			if (maxAllowedWords && lookup.split(/[ -]/).length > maxAllowedWords)
				return;

			//append the layer to the DOM only once
			if (jQuery("#definition_layer").length == 0) {
				var imageUrl = "/plusd/images/wp/wikipedia_small_logo.png";
				jQuery("modal").append("<div id='definition_layer' style='position:absolute; cursor:pointer;'><a href='#' onclick='view.mysearch(0,20," + lookup + ");'><img src='images/cryptarsi-logo.png' alt='' title='Cryptarsi search'/></a>&nbsp;<a href='http://search.wikileaks.org/plusd/?q=" + lookup + "' target='_blank'><img src='images/plusd_white_32.png' alt='' title='PlusD search'/></a>&nbsp;<a href='http://en.wikipedia.com/?search=" + lookup + "' target='_blank'><img src='images/wikipedia_32.png' alt='' title='Wikipedia search'/></a>&nbsp;<a href='http://www.google.com/#q=" + lookup + "' target='_blank'><img src='images/google_32.png' alt='' title='Google Search'/></a></div>");
			}

			//move the layer at the cursor position
			jQuery("#definition_layer").map(function() {
					jQuery(this).css({'left' : e.pageX-30, 'top' : e.pageY-40});
					});

			//open the definition popup clicking on the layer
			jQuery("#definition_layer").mouseup(function(e) {
					e.stopPropagation();
				//	openPopup(lookup);
					});
		} else {
			jQuery("#definition_layer").remove();
		}
	};

	//opens the definition popup 
	var openPopup = function(lookup) {
		var searchUrl = websiteUrl + "";
		if (target) {
			var popup = window.open(searchUrl + "?search=" + lookup, target, "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=no,copyhistory=no,width=600,height=550,top=300,left=300");
			if (popup)
				popup.focus();
		} else {
			window.open(searchUrl + "?search=" + lookup);
		}
	};

	var area = areaId ? "#" + areaId : "body";
	jQuery(area).mouseup(showLayer);
}

/*
 * Cross-browser function to get selected text
 */

function getSelectedText(){
    if(window.getSelection)
        return window.getSelection().toString();
    else if(document.getSelection)
        return document.getSelection();
    else if(document.selection)
        return document.selection.createRange().text;
    return "";
}