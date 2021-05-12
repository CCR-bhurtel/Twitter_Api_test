let TimeoutHelper = (() => {
  let helper = {};
  let counter = 0;
  let timeouts = {};
  
  helper.setInterval = (fn, ms) => {
    let currCounter = counter++;
    
    timeouts[currCounter] = setInterval(fn, ms);
    
    return currCounter;
  }
  
  helper.clearTimeout = (id) => {
    if (typeof timeouts[id] === 'undefined') {
      return; // Mimic window.clearTimeout, and silently return if the ID doesn't exist
    }
    clearInterval(timeouts[id]);
    delete timeouts[id];
  }
  
  return helper;
})();

module.exports = TimeoutHelper;



