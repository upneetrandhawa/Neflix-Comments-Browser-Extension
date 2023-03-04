console.log("Netflix Comments SCRIPT JS")

var script = document.createElement('script');

script.src = chrome.runtime.getURL('script.js');
console.log(script.src);

script.onload = function () {
  console.log("Netflix Comments SCRIPT JS: CONTENT JS loaded");
}

if (!document) console.log("not document")
if (!document.body) console.log("not document body")
document.body.appendChild(script);