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
  const getWordsFromDiv = div => {
    const words = [];
    div.querySelectorAll('span').forEach(node => {
      const { top } = node.getBoundingClientRect();
      if (node.className !== 'page-break') {
        console.log(node, top);
        if (top >= -1 && top < window.innerHeight) {
          words.push(node);
        }
      }
    });
    return words;
  };

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
  let words = [];

  // Improve:
  divs.forEach(contentWrapper => {
    const auxWords = getWordsFromDiv(contentWrapper);
    words = words.concat(auxWords);
  });

  const readText = async words => {
    const originalStyle = words[0].style;
    words[0].style.color = '#fbf0d9';
    words[0].style.backgroundColor = '#9e9174';
    for (let i = 1; i < words.length; i++) {
      currentWord = await new Promise(resolve => {
        setTimeout(() => {
          words[i - 1].style = originalStyle;
          words[i].style.color = '#fbf0d9';
          words[i].style.backgroundColor = '#9e9174';
          const { top, bottom } = words[i].getBoundingClientRect();
          console.log(words[i], top, bottom);
          resolve();
        }, 100 * (200 / 60));
      });
    }
  };
  readText(words);
}
