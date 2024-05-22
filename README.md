# TwitterVideoURL
Install this javascript code in some injection extension, and you'll get a button below videos (posted on twitter / x) that go directly to the highest quality video file (mp4).

# Sample
https://github.com/matteyas/TwitterVideoURL/assets/12509132/67ba17cb-cea7-422d-986c-c38e59ddbff3

# Code
```js
class JSONStepper {
    constructor(jsonString) {
        this.jsonString = jsonString;
        this.currentIndex = 0;
        this.modifiedString = jsonString;
    }
    
    seek(keyword) {
        // Search for the keyword starting from the current index
        const index = this.jsonString.indexOf(keyword, this.currentIndex);

        // If the keyword is found, update the current index
        if (index !== -1) {
            this.currentIndex = index + keyword.length;
            this.modifiedString = this.jsonString.substring(index, this.currentIndex);
            return this.modifiedString;
        }

        // If the keyword is not found, return null
        return null;
    }

    step(keyword) {
        // Search for the keyword starting from the current index
        const index = this.jsonString.indexOf(keyword, this.currentIndex);

        // If the keyword is found, update the current index
        if (index !== -1) {
            this.currentIndex = index + keyword.length;

            // Find the start of the JSON object
            const startIndex = this.jsonString.indexOf('{', this.currentIndex - keyword.length);
            if (startIndex === -1) return null;

            // Find the end of the JSON object
            let openBraces = 1;
            let endIndex = startIndex + 1;
            while (openBraces > 0 && endIndex < this.jsonString.length) {
                if (this.jsonString[endIndex] === '{') openBraces++;
                if (this.jsonString[endIndex] === '}') openBraces--;
                endIndex++;
            }

            if (openBraces === 0) {
                this.currentIndex = endIndex; // Update the current index to after the JSON object
                this.modifiedString = this.jsonString.substring(startIndex, endIndex);
                return this.modifiedString; // Return the JSON object as a string
            }
        }

        // If the keyword is not found, return null
        return null;
    }

    findHighestBitrateUrl() {
        let bitrates = [];
        let index = 0;
        let regex = /"bitrate":\s*(\d+)/g;
        let match;
        
        let jsonString = this.modifiedString;

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
}

function findHighestBitrateUrl(jsonString) {	
	const stepper = new JSONStepper(jsonString);
	
	stepper.seek('"source"');
	stepper.step('"legacy"');

	return stepper.findHighestBitrateUrl();
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
                if (this.responseType != "arraybuffer" && this.responseText.includes("threaded_conversation_with_injections_v2")) {
                	const found_url = findHighestBitrateUrl(this.responseText);
                	if (found_url.includes(".mp4")) { injectLink(found_url); }
                	//console.log('XHR response:', findHighestBitrateUrl(this.responseText));
                	XMLHttpRequest.prototype.open = originalXhrOpen;
                }
            }
        });
        originalXhrOpen.apply(this, arguments);
    };
})();
```

# Explanation
1. The script hooks into XML requests (the hook is removed as soon as a match is found)
2. Once the appropriate request response is found, it extracts the MP4 URL
3. Finally, it injects a clickable button that redirects to the found URL

<details>
<summary>METADATA</summary>
#twitter #download #video #url #twitter-download #twitter-download-video
</details>
