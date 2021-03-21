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
  let readerIframe = document.getElementById('KindleReaderIFrame');
  let iframe = null;
  let innerDoc =
    readerIframe.contentDocument || readerIframe.contentWindow.document;
  const iframes = innerDoc.querySelectorAll('iframe');
  for (let i = 0; i < iframes.length; i++) {
    if (iframes[i].style.marginTop === '0px') {
      iframe = iframes[i];
      break;
    }
  }
  innerDoc = iframe.contentDocument || iframe.contentWindow.document;
  const divs = innerDoc.querySelectorAll('body > div');
  const contentWrapper = divs[2];
  let startSearch = true;
  const words = [];
  contentWrapper.childNodes.forEach(node => {
    if (startSearch) {
      let queue = [node];
      let current = null;
      while (queue.length > 0) {
        current = queue.shift();
        if (current.tagName) {
          if (
            current.tagName === 'SPAN' &&
            current.className !== 'page-break'
          ) {
            const { top } = current.getBoundingClientRect();
            if (top >= 0 && top < window.innerHeight) {
              words.push(current);
            }
          } else {
            current.childNodes.forEach(child => queue.push(child));
          }
        }
      }
    }
  });
  const readText = async () => {
    console.log(words[0]);
    const originalStyle = words[0].style;
    for (let i = 1; i < words.length; i++) {
      currentWord = await new Promise(resolve => {
        setTimeout(() => {
          words[i - 1].style = originalStyle;
          words[i].style.color = '#fbf0d9';
          words[i].style.backgroundColor = '#9e9174';
          const { top, bottom } = words[i].getBoundingClientRect();
          console.log(words[i], top, bottom);
          resolve();
        }, 150);
      });
    }
  };
  readText();
  console.log(words);
}
