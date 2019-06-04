const imageDownloader = require('image-downloader')
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')
const googleSearchCredentials = require('../credentials/google-api.json')

async function robot(){
    const content = state.load()
    await fetchImagesOfAllSentences(content)

    await downloadAllImages(content)

    state.save(content)
    
    async function fetchImagesOfAllSentences(content){
        for (const sentence of content.sentences){
            const query = `${content.termSearch} ${sentence.keywords[0]}`
            sentence.images = await fetchGoogleAndReturnImgLinks(query)

            sentence.googleSearchQuery = query
       }

    }

    async function fetchGoogleAndReturnImgLinks(query)
    {
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apiKey,
            cx: googleSearchCredentials.searcheEngineID,
            q: query,
            searchType: 'image',
            imgSize: 'huge',
            num: 2
        })

        const imagesUrl = response.data.items.map((item) =>{
            return item.link
        })
        
        return imagesUrl
    }

    async function downloadAllImages(content){
        content.downloadedImages = []

        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++)
        {
            const images = content.sentences[sentenceIndex].images

            for(let imageIndex =0; imageIndex < images.length; imageIndex++)
            {
                const imgURL = images[imageIndex]

                try {
                    if (content.downloadedImages.includes(imgURL)){
                        throw new Error('Imagem já baixada')
                    }

                    await downloadAndSave(imgURL, `${sentenceIndex}-original.png`)
                    
                    content.downloadedImages.push(imgURL)

                    console.log(`> Baixou imagem com sucesso: ${imgURL}`)
                    break
                } catch (error) {
                    console.log(`> Erro ao baixar (${imgURL}): ${error}`)
                }
            }
        }
    }

    async function downloadAndSave(url, fileName){
        return imageDownloader.image({
            url, url,
            dest: `./content/${fileName}`
        })
    }
}
module.exports = robot