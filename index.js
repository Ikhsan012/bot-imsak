const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const moment = require('moment-timezone')
const cron = require('node-cron')
const fs = require('fs')
const axios = require('axios')

//func
async function getBerita() {
  try {
    let url_berita = 'https://berita-indo-api-next.vercel.app/api/cnn-news/'
    const respon = await axios.get(url_berita)
    const res = respon.data.data[0]
    const { title, link } = res
    return { title, link }
  } catch (error) {
    console.error(error.message)
    return { title: 'Tidak Ada Berita Terbaru', link: '-' }
  }
}

async function getCuaca() {
  try {
    let url_cuaca = 'https://api.open-meteo.com/v1/forecast?latitude=-5.1476&longitude=119.4327&current_weather=true'
    const respon = await axios.get(url_cuaca)
    return respon.data.current_weather
  } catch (error) {
    console.error(error.message);
    return { temperature: 'Tidak Diketahui' }
  }
}

//end


const bot = new Client({
  authStrategy: new LocalAuth({
    dataPath: 'session'
  })
})

const dataimsak = require('./jadwal.json')
const awalramadan = moment.tz("2026-02-19", "Asia/Makassar").startOf('day')

bot.on('qr', qr => {
  qrcode.generate(qr, { small: true })
})

bot.on('ready', async () => {
  console.log('Bot Ready')

  const chatid = '120363195455821490@g.us'

  cron.schedule('* * * * *', async () => {

    const timenow = moment().tz("Asia/Makassar")
    const time = timenow.format("HH:mm")

    const hariini = timenow.clone().startOf('day')
    const selisih = hariini.diff(awalramadan, 'days')
    const puasa = selisih + 1

    try {
      const data = dataimsak.data.imsakiyah[puasa - 1]
      if (!data) {
        console.log('Ramadan Kelar Bang')
        return
      }
      switch (time) {
        case data.imsak:
          console.log('[UPDATE] Waktunya Imsak')
          const media1 = MessageMedia.fromFilePath('./memes/waktunya/imsak.jpg')
          bot.sendMessage(chatid, media1)
          break;
        case data.dzuhur:
          console.log('[UPDATE] Waktu Sholat Duhur')
          const msg = `> Sekedar Mengingatkan

• Sudah Masuk Waktu Sholat Duhur
• Jam : ${data.dzuhur}

> Pesan Otomatis`
          bot.sendMessage(chatid, msg)
          break;
        case data.ashar:
          console.log('[UPDATE] Waktu Sholat Ashar')
          const msg1 = `> Sekedar Mengingatkan

• Sudah Masuk Waktu Sholat Ashar
• Jam : ${data.ashar}

> Pesan Otomatis`
          bot.sendMessage(chatid, msg1)
          break;
        case data.terbit:
          //panggil func
          const berita = await getBerita()
          const cuaca = await getCuaca()
          //end
          console.log('[UPDATE] Waktu Terbit')
          const msg2 = `> Sekedar Mengingatkan

• Sudah Masuk Waktu Terbit (Sunrise)
• Jam ${data.terbit}

> Jadwal Imsakiyah Ramadan Ke ${puasa}

• Imsak : ${data.imsak}
• Subuh : ${data.subuh}
• Terbit : ${data.terbit}
• Dhuha : ${data.dhuha}
• Duhur : ${data.dzuhur}
• Ashar : ${data.ashar}
• Magrib : ${data.maghrib}
• Isya : ${data.isya}

> Berita Hari Ini

• Suhu Sekitar : ${cuaca.temperature} Derajat
• Judul : ${berita.title}
• Sumber : CNN
• Link : ${berita.link}

"Selamat Menikmati Hari Anda"

> Pesan Otomatis `
          bot.sendMessage(chatid, msg2)
          console.log(msg2)
          break;
        case "03:00":
          console.log('[UPDATE] Waktu Sahur')
          const media2 = MessageMedia.fromFilePath('./memes/waktunya/sahur.jpg')
          bot.sendMessage(chatid, media2)
          break;
        case data.subuh:
          console.log('[UPDATE] Waktu Sholat Subuh + Puasa')
          const media7 = MessageMedia.fromFilePath(`./memes/puasa/${puasa}.jpg`)
          bot.sendMessage(chatid, media7, { caption: "Waktunya Sholat Subuh" })
          break;
        case "17:00":
          console.log('[UPDATE] Waktu Ngabuburit')
          const media3 = MessageMedia.fromFilePath('./memes/waktunya/ngabuburit.jpg')
          bot.sendMessage(chatid, media3)
          break;
        case "18:00":
          console.log('[UPDATE] Waktu Tunggu Magrib')
          const media4 = MessageMedia.fromFilePath('./memes/waktunya/sedangmenunggu.jpg')
          bot.sendMessage(chatid, media4)
          break;
        case "19:30":
          console.log('[UPDATE] Waktu Tarawih')
          const media5 = MessageMedia.fromFilePath('./memes/waktunya/tarawih.jpg')
          bot.sendMessage(chatid, media5)
          break;
        case data.maghrib:
          console.log('[UPDATE] Waktunya Magrib/Buka Puasa')
          const media6 = MessageMedia.fromFilePath('./memes/waktunya/bukapuasa.jpg')
          bot.sendMessage(chatid, media6)
          break;
        default:
          break;
      }
    } catch (error) {
      console.log(error.message)
    }
  })

})

bot.initialize()

