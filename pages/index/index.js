const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

const UNPROMPTED_TIPS = "点击获取当前位置"
const UNAUTHORIZED_TIPS = "点击开启位置权限"
const AUTHORIZED_TIPS = ""

Page({

  /**
   * 页面的初始数据
   */
  data: {
    city: '北京市',
    nowTemp: '',
    nowWeather: '',
    nowWeatherBg: '',
    forecast: [],
    todayTemp: '',
    todayData: '',
    locationAuthType: UNPROMPTED
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 实例化API核心类
    this.qqmapsdk = new QQMapWX({
      key: 'ONCBZ-XHHKI-PBLGZ-57QTL-RUOPF-OHFG3'
    })
    wx.getSetting({
      success: (res) => {
        let auth = res.authSetting['scope.userLocation']
        this.setData({
          locationAuthType: auth ? AUTHORIZED : (auth === false) ? UNAUTHORIZED : UNPROMPTED
        })
        if(auth){
          this.getLocation()
          console.log(2)
        }else{
          this.getNowWeather()
        }
      }
    })
    console.log(1)
    this.getNowWeather()
  },

  onPullDownRefresh: function() {
    this.getNowWeather(() => {
      wx.stopPullDownRefresh()
    })
  },

  getNowWeather(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now', //仅为示例，并非真实的接口地址
      data: {
        city: this.data.city
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        let result = res.data.result
        this.setNow(result)
        this.setHourlyWeather(result)
        this.setToday(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },

  setNow(result) {
    let temp = result.now.temp
    let weather = result.now.weather
    this.setData({
      nowTemp: temp,
      nowWeather: weatherMap[weather],
      nowWeatherBg: '/images/' + weather + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },

  setHourlyWeather(result) {
    let forecast = result.forecast
    let nowHour = new Date().getHours()
    let hourlyWeather = []
    for (let i = 0; i < 8; i++) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        weather: forecast[i].weather,
        temp: forecast[i].temp
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      forecast: hourlyWeather
    })
  },

  setToday(result) {
    let date = new Date()
    let minTemp = result.today.minTemp
    let maxTemp = result.today.maxTemp
    this.setData({
      todayTemp: `${minTemp}° - ${maxTemp}°`,
      todayData: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} 今天`
    })
  },
  onTapDayWeather() {
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city,
    })
  },
  onTapLocation() {
    if (this.data.locationAuthType === UNAUTHORIZED) {
      wx.openSetting({
        success: (res) => {
          let auth = res.authSetting['scope.userLocation']
          if (auth) {
            this.getLocation()
          }
        }
      })

    } else {
      this.getLocation()
    }

  },
  getLocation() {
    wx.getLocation({
      success: (res) => {
        this.setData({
          locationAuthType: AUTHORIZED
        })
        let latitude = res.latitude
        let longitude = res.longitude
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude,
            longitude
          },
          success: (res) => {
            let city = res.result.address_component.city
            this.setData({
              city,
            })
            this.getNowWeather()
          },
          fail: (res) => {
            console.log(res)
          }
        })
      },
      fail: () => {
        this.setData({
          locationAuthType: UNAUTHORIZED
        })
      }
    })
  }
})