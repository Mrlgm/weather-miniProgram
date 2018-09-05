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

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBg: '',
    forecast: [1, 2, 3, 4, 5, 6, 7, 8, 9]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getNowWeather()
  },

  onPullDownRefresh: function() {
    this.getNowWeather(()=>{
      wx.stopPullDownRefresh()
    })
  },

  getNowWeather(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now', //仅为示例，并非真实的接口地址
      data: {
        city: '广州市'
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        let result = res.data.result
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
      complete:()=>{
        callback && callback()
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  }
})