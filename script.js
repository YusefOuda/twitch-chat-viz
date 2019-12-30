
console.log("READY");

var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length) {
            mutation.addedNodes.forEach(x => {
                if (x.className === 'chat-line__message'); {
                    chrome.extension.sendMessage({ 'message': x.textContent });
                }
                if (x.querySelector('.chat-line__message--emote')) {
                    chrome.extension.sendMessage({ 'emote': x.querySelector('.chat-line__message--emote') });
                }
            });
        }
    });
});

var config = { childList: true };
var target = document.querySelector('.chat-list__list-container');
if (target) {
    observer.observe(target, config);
}


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.message === 'tabupdate') {
        observer.disconnect();
        target = document.querySelector('.chat-list__list-container');
        observer.observe(target, config);
      }
  });