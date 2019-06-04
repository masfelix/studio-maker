const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')
const googleSearchCredentials = require('../credentials/google-api.json')

async function robot(){
    const content = state.load()
    await fetchImagesOfAllSentences(content)

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
}
module.exports = robot