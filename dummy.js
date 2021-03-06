/* globals getHashVariable */

window.onload = function () {
  // title & url
  var title = decodeURIComponent(getHashVariable("title", location.href) || '');
  var favicon = decodeURIComponent(getHashVariable("fav", location.href) || '');
  var url = decodeURIComponent(getHashVariable("url", location.href) || '');
  var trimmed_url = url.split("?")[0].split("#")[0];
  var interval = null;

  // Set title and url in body
  document.title = title;
  document.getElementById("title").textContent = title;
  document.getElementById("url").textContent = trimmed_url;

  // Change Favicon
  const src = favicon || "/data/page.png";
  Object.assign(new Image(), {
    crossOrigin: "anonymous",
    src,
    onload() {
      const img = this;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.globalAlpha = 0.6;
        ctx.drawImage(img, 0, 0);

        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.fillStyle = "#a1a0a1";
        ctx.arc(
          img.width * 0.75,
          img.height * 0.75,
          img.width * 0.25,
          0,
          2 * Math.PI,
          false
        );
        ctx.fill();
        document.querySelector('head').appendChild(Object.assign(document.createElement('link'), {
          rel: 'icon',
          type: 'image/png',
          href: canvas.toDataURL("image/png")
        }));
      }
    },
  });

  function loadWebpage(){
    document.getElementById('icon').classList.add('bounce')
    // If normal tab, use location replace to remove this dummy from history
    if (url.indexOf('http') === 0 || url.indexOf('ftp') === 0){
      location.replace(url);
    } 
    // Else use chrome update function
    else{
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.tabs.update(tabs[0].id, {
          url: url
        })
      });
    }
  }

  // Get Storage contents to check if "release-on-view=true"
  // Alternatively we could use onActivated event from background...
  // But, getting url and parsing from hash function shall repeat so here is good..
  var prefs = {
    'release-on-view': true,
    'release-on-reload': true,
  };
  chrome.storage.managed.get(prefs, ps => {
    chrome.storage.local.get(chrome.runtime.lastError ? prefs : ps || prefs, function(store){
      if(store['release-on-view']){ // If Relase on View Options Chosen
        window.onfocus = window.onmousemove = () => {
          loadWebpage()
        }
      }

      // Check if user reloaded the page so open url directly.
      if(performance
        && performance.getEntriesByType("navigation").length > 0
        && performance.getEntriesByType("navigation")[0].type == 'reload'
        && store['release-on-reload']
      ){
        loadWebpage()
      }
    });
  });

  document.addEventListener('click', loadWebpage);
};
