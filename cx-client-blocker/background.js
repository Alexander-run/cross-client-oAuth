
// DNR 规则匹配调试
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
  console.log("request to teams blocked", info);
});