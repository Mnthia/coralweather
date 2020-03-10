$(function () {

  class Wetaher {

    constructor() {

      this.flag = 'icon';

      this.iconBaseUrl = './images/';

      this.baseUrl = 'https://api.heweather.net/s6/weather/';

      this.key = '7242ce1ac1b04c18916de54053f752f6';

      this.iconsConfig = {
        icon100: {
          code: 100,
          title: '晴',
          imgName: '100.png'
        },
        icon101: {
          code: 101,
          title: '多云',
          imgName: '101.png'
        },
        icon104: {
          code: 104,
          title: '阴',
          imgName: '104.png'
        },
        icon300: {
          code: 300,
          title: '阵雨',
          imgName: '300.png'
        },
        iconDefault: {
          code: -1,
          title: '未知',
          imgName: '-1.png'
        }
      };
    }

    weatherBg() {

      var hours = new Date().getHours();

      var $weather = $('.weather');

      if (hours >= 6 && hours < 12) {
        $weather.addClass('moring');
      } else if (hours >= 12 && hours < 19) {
        $weather.addClass('day');
      } else {
        $weather.addClass('night');
      }
    }

    locationCity() {

      var self = this;

      $.ajax({
        type: 'get',
        data: {
          key: 'ZDZBZ-S3P3P-UWHDX-V2RVK-XIJZJ-PPBPW',
          output: 'jsonp'
        },
        url: 'https://apis.map.qq.com/ws/location/v1/ip',
        dataType: 'jsonp',
        jsonp: 'callback',

        success(data) {
          

          var city = data.result.ad_info.city;

          $('.city').text(city);

          self.getCurrentWeather(city);

          self.dailyForecastWeather(city);
        }
      })
    }

    getCurrentWeather(city) {
      var self = this;
      $.ajax({
        type: 'get',
        url: self.baseUrl + 'now',
        data: {
          location: city,
          key: self.key
        },

        success(data) {
          
          var now = data.HeWeather6[0].now;

          $('.weather-tem').text(now.fl + '°');

          $('.w-status').text(now.cond_txt);


          var $divs = $('.wind-list>div');

          $divs.each((i, v) => {
            var dataName = $(v).data('name');
            var dataTitle = $(v).data('title');

            $(v).find('.' + dataName).text(now[dataName]);

            if (dataTitle) {
              $(v).find('.' + dataTitle).text(now[dataTitle]);
            }

          });

          var basic = data.HeWeather6[0].basic;
          self.minuteLevelRain(basic.lon, basic.lat);

        }

      });

    }

    minuteLevelRain(lon, lat) {

      $.ajax({
        type: 'get',
        url: this.baseUrl + 'grid-minute',
        data: {
          location: lon + ',' + lat,
          key: this.key
        },

        success(data) {
          
          if (data.HeWeather6[0].status == 'invalid param') {
            $('.yubao').text('暂无天气预报');
          } else {
            $('.yubao').text(data.HeWeather6[0].grid_minute_forecast.txt);
          }
          
        }
      })
    }

    createDaliyForecast(dailyForecast) {
  
      var $weatherDataBox = $('.weather-data-box');
      $weatherDataBox.empty('');
      $weatherDataBox.css({
        width: dailyForecast.length * .7 + 'rem'
      });

      var currentDay = dailyForecast[0];
      $('.tmp').text(currentDay.tmp_min + '~' + currentDay.tmp_max);

      $.each(dailyForecast, (i, v) => {

        var currentIconConfig = this.iconsConfig[this.flag + v.cond_code_d];

        if (!currentIconConfig) {
          currentIconConfig = this.iconsConfig.iconDefault;
        }

        var html = 
        `<div>
          <div>${v.date.split('-').slice(1).join('-')}</div>
          <div>${v.cond_txt_d}</div>
          <div class="icon">
            <img class="auto-img" src="${ this.iconBaseUrl + currentIconConfig.imgName}" alt="" />
          </div>
          <div>${v.tmp_min + '°~' + v.tmp_max }°</div>
        </div>`;

        $weatherDataBox.append(html);

      });

    }

    dailyForecastWeather(city) {

      var self = this;

      var forecastWeather = JSON.parse(localStorage.getItem('forecastWeather'));
      
      if (forecastWeather.daily.length > 0) {
        
        var currentDate = new Date().toLocaleDateString().split('/');
        currentDate[1] = currentDate[1] >= 10 ? currentDate[1] : '0' + currentDate[1];
        currentDate[2] = currentDate[2] >= 10 ? currentDate[2] : '0' + currentDate[2];

        var currentTime = currentDate.join('-');

        var oldTime = forecastWeather.daily[0].date;

        if (currentTime == oldTime) {
          self.createDaliyForecast(forecastWeather.daily);
          return;

        }

      }
      
      $.ajax({
        type: 'get',
        url: this.baseUrl + 'forecast',
        data: {
          location: city,
          key: this.key
        },

        success(data) {

          var dailyForecast = data.HeWeather6[0].daily_forecast;

          self.createDaliyForecast(dailyForecast);

          forecastWeather.daily = dailyForecast;

          localStorage.setItem('forecastWeather', JSON.stringify(forecastWeather));

        }

      });

    }

    createHourlyForecast(hourlyForecast) {

      var $weatherDataBox = $('.weather-data-box');

      $weatherDataBox.empty('');

      $weatherDataBox.css({
        width: hourlyForecast.length * .7 + 'rem'
      });

      $.each(hourlyForecast, (i, v) => {
        var currentIconConfig = this.iconsConfig[this.flag + v.cond_code];

        if (!currentIconConfig) {
          currentIconConfig = this.iconsConfig.iconDefault;
        }
        var html = `<div>
            <div>${v.time.split(' ')[1]}</div>
            <div>${v.cond_txt}</div>
            <div class="icon">
              <img class="auto-img" src="${this.iconBaseUrl + currentIconConfig.imgName}" alt="" />
            </div>
            <div>${v.tmp}°</div>
          </div>`;

        $weatherDataBox.append(html);

      });

    }

    getTime() {

      var date = new Date();
     
      var year = date.getFullYear();

      var month = date.getMonth() + 1;
      month = month >= 10 ? month : '0' + month;

      var d = date.getDate();
      d = d >= 10 ? d : '0' + d;

      var hours = date.getHours() + 1;
      hours = hours < 10 ? '0' + hours : hours == 24 ? '00' : hours;

      return year + '-' + month + '-' + d + ' ' + hours + ':00';

    }

    hourlyForecastWeather(city) {
      var self = this;

      var forecastWeather = JSON.parse(localStorage.getItem('forecastWeather'));
 
      if (forecastWeather.hourly.length > 0) {

        var currentDate = self.getTime();

        var oldDate = forecastWeather.hourly[0].time;

        if (currentDate == oldDate) {

          self.createHourlyForecast(forecastWeather.hourly);
          return;

        }

      }
      
      $.ajax({
        type: 'get',
        url: this.baseUrl + 'hourly',
        data: {
          location: city,
          key: this.key
        },

        success(data) {
          
          var hourlyForecast = data.HeWeather6[0].hourly;

          self.createHourlyForecast(hourlyForecast);

          forecastWeather.hourly = hourlyForecast;

          localStorage.setItem('forecastWeather', JSON.stringify(forecastWeather));

        }

      });

    }

    init() {

      this.weatherBg();

      if (!localStorage.getItem('forecastWeather')) {

        var forecastWeather = {
          daily: [],
          hourly: []
        };

        localStorage.setItem('forecastWeather', JSON.stringify(forecastWeather));

      }

      this.locationCity();
    }

  }

  var weather = new Wetaher();
  weather.init();

  var dp = 'dailyForecastWeather';
  $('.day-hour>div').on('click', function () {

    var dataProperty = $(this).data('fn');
    

    if (dp == dataProperty) {
      
      return;
    }

    dp = dataProperty;

    var index = $(this).index();

    var width = $(this).width();

    var htmlFontSize = parseFloat($('html').css('fontSize'));

    var widthRem = width / htmlFontSize;
    // 

    $('.move-line').animate({
      left: index * (widthRem + .2) + .1 + 'rem'
    }, 240);

    var city = $('.city').text();
    weather[dataProperty](city);

  });

  $('.search-icon').on('click', function () {
    var city = $('.search-box').val();

    if (city.trim() == '') {
      return;
    }

    var forecastWeather = {
      daily: [],
      hourly: []
    };

    localStorage.setItem('forecastWeather', JSON.stringify(forecastWeather));

    $('.city').text(city);

    $('.search-box').val('');

    weather.getCurrentWeather(city);

    weather.dailyForecastWeather(city);

  });

});