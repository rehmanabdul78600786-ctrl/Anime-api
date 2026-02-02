const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()

app.get('/api/download', async (req, res) => {
    const { url } = req.query
    if (!url) return res.json({ status:false, msg:"url missing" })

    try {
        const { data } = await axios.get(url)
        const $ = cheerio.load(data)

        const title = $('title').text().trim()

        let codedew = null
        $('a').each((i, el) => {
            const h = $(el).attr('href')
            if (h && h.includes('codedew.com/multiquality')) codedew = h
        })

        if (!codedew) {
            return res.json({ status:false, msg:"download page not found" })
        }

        const { data: d2 } = await axios.get(codedew)
        const $2 = cheerio.load(d2)

        let downloads = []
        $2('a').each((i, el) => {
            const link = $2(el).attr('href')
            const text = $2(el).text().trim()
            if (link && /480|720|1080/i.test(text)) {
                downloads.push({ quality: text, link })
            }
        })

        res.json({
            status: true,
            title,
            source: codedew,
            downloads
        })

    } catch (e) {
        res.json({ status:false, error: e.message })
    }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log('API running on', PORT))
