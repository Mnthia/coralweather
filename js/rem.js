function setRem() {

  var baseScreen = 375;

  var baseSize = 100;

  var screenWidth = screen.width;

  var fontSize = 0;

  if (screenWidth >= 1200) {
    fontSize = 200;
  } else {
    fontSize = screenWidth / baseScreen * 100;
  }

  var html = document.getElementsByTagName('html')[0];

  html.style.fontSize = fontSize + 'px';
}

setRem();

var timers = [];

window.onresize = function () {
  
  var timer = setTimeout(() => {

    for (var i = 1; i < timers.length; i++) {
      clearTimeout(timers[i]);
    }

    timers = [];

    setRem();

  }, 600);

  timers.push(timer);

};