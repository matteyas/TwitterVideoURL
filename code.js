function findHighestBitrateUrl(jsonString) {
    let bitrates = [];
    let index = 0;
    let regex = /"bitrate":\s*(\d+)/g;
    let match;

    // Find all bitrates and their positions
    while ((match = regex.exec(jsonString)) !== null) {
        bitrates.push({ bitrate: parseInt(match[1], 10), index: match.index });
    }

    // If no bitrates are found, return null
    if (bitrates.length === 0) {
        return null;
    }

    // Find the highest bitrate
    let highest = bitrates.reduce((max, current) => (current.bitrate > max.bitrate ? current : max));

    // Find the URL corresponding to the highest bitrate
    let urlRegex = /"url":\s*"([^"]+)"/g;
    let urlMatch;
    urlRegex.lastIndex = highest.index; // Start searching from the bitrate position

    // Find the next URL after the highest bitrate
    if ((urlMatch = urlRegex.exec(jsonString)) !== null) {
        return urlMatch[1]; // Return the URL value
    }

    // If no URL is found, return null
    return null;
}

function injectLink(url) {
    console.log('Injecting link...'); // Debugging statement
    // Create the link
    const link = document.createElement('a');
    link.textContent = 'Direct Video URL';
    link.href = url;
    link.style.padding = '10px';
    link.style.backgroundColor = '#007bff';
    link.style.color = '#fff';
    link.style.border = 'none';
    link.style.borderRadius = '5px';
    link.style.textDecoration = 'none';
    link.style.display = 'inline-block';
    link.style.marginTop = '10px';
    link.style.textAlign = 'center';
    //link.style.width = '140px';

    // Find the target element
    const targetElement = document.querySelectorAll('[class="css-175oi2r r-9aw3ui r-1s2bzr4"]')[0];
    if (targetElement) {
        // Insert the link after the target element
        targetElement.insertAdjacentElement('afterend', link);
    } else {
        // If target element not found, try again in 300ms
        setTimeout(function() {
        	injectLink(url);
        }, 300);
    }
}

(function() {
    'use strict';

    // Hook into the XMLHttpRequest
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('readystatechange', function() {
            if (this.readyState === 4) {
                //console.log('XHR request made:', this.responseURL);
                if (this.responseText.includes("threaded_conversation_with_injections_v2")) {
                	const found_url = findHighestBitrateUrl(this.responseText);
                	injectLink(found_url);
                	//console.log('XHR response:', findHighestBitrateUrl(this.responseText));
                	XMLHttpRequest.prototype.open = originalXhrOpen;
                }
            }
        });
        originalXhrOpen.apply(this, arguments);
    };
})();
