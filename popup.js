// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: setPageBackgroundColor
  });
});

// The body of this function will be executed as a content script inside the
// current page
function setPageBackgroundColor() {
  let iframe = document.getElementById('KindleReaderIFrame');
  let innerDoc = iframe.contentDocument || iframe.contentWindow.document;
  const touchLayer = innerDoc.getElementById('kindleReader_touchLayer');
  touchLayer.remove();
  iframe = innerDoc.getElementById('column_0_frame_1');
  innerDoc = iframe.contentDocument || iframe.contentWindow.document;
  const pageBreak = innerDoc.querySelector('.page-break');
  const contentWrapper = pageBreak.parentElement;
  let startSearch = false;
  const words = [];
  contentWrapper.childNodes.forEach(node => {
    if (node === pageBreak) {
      startSearch = true;
      return;
    }
    if (startSearch) {
      let queue = [node];
      let current = null;
      while (queue.length > 0) {
        current = queue.shift();
        if (current.tagName) {
          if (current.tagName === 'SPAN') {
            words.push(current);
          } else {
            current.childNodes.forEach(child => queue.push(child));
          }
        }
      }
    }
  });
  const readText = async () => {
    for (let i = 0; i < words.length; i++) {
      currentWord = await new Promise(resolve => {
        setTimeout(() => {
          words[i].style.color = 'red';
          console.log(words[i]);
          resolve();
        }, 200);
      });
    }
  };
  readText();
  console.log(words);
}
