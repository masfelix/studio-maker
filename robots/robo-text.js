const algorithmia = require('algorithmia')
const algorithmiaKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundayDetection = require('sbd')

const watsonApiKey = require('../credentials/watson-nlu.json').apikey

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');

const nlu = new NaturalLanguageUnderstandingV1({
  version: '2018-11-16',
  iam_apikey: watsonApiKey,
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api'
});
const state = require('./state.js')

async function robot()
{
    const content = state.load()

    await findContentFromSource(content)
    sanitizeContent(content)
    brokenContentInSentences(content)
    limitMaxNumSentences(content)
    await fetchKeywordsofAllSenteces(content)

    state.save(content)

    async function findContentFromSource(content){

        try{
            var input = {
                "articleName": content.termSearch,
                "lang": "en"
            };

            const algorithmiaAuthenticated = algorithmia.client(algorithmiaKey)
            
            const wikipediaAlgo = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2?timeout=300")
            const wikipediaResp = await wikipediaAlgo.pipe(input)
        
            content.sourceContentOriginal = wikipediaResp.get().content
        }
        catch (err){
            console.log('Não encontrei nada para esse termo (' + err + ')') ;
        }
    }
    function sanitizeContent(content) 
    {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)
    
        content.sourceContentSanitized = withoutDatesInParentheses
    
        function removeBlankLinesAndMarkdown(text) {
          const allLines = text.split('\n')
    
          const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
            if (line.trim().length === 0 || line.trim().startsWith('=')) {
              return false
            }
    
            return true
          })
    
          return withoutBlankLinesAndMarkdown.join(' ')
        }
      }

      function removeDatesInParentheses(text) {
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
      }
      function brokenContentInSentences(content) {
          content.sentences = []

          const sentences = sentenceBoundayDetection.sentences(content.sourceContentSanitized)

          sentences.forEach((sentence) => {
              content.sentences.push({
                  text: sentence,
                  keywords: [],
                  images: []
              })
          })
      }
      function limitMaxNumSentences(content){
        content.sentences = content.sentences.slice(0, content.maxNumSentences)
      }
      async function fetchKeywordsofAllSenteces(content){
        for (const sentence of content.sentences){
          sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
        }
      }
   
}
async function fetchWatsonAndReturnKeywords(sentence){
  return new Promise((resolve, reject) => {

    nlu.analyze({
     
      text: sentence,
      features:{
        keywords: {}
      }
    }, (error, response)=>{
      if(error){
        throw error
      } 
      const keywords = response.keywords.map((keyword => {
        return keyword.text
      }))
      resolve(keywords)
    })
  })
}

module.exports = robot