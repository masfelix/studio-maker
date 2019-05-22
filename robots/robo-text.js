const algorithmia = require('algorithmia')
const algorithmiaKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundayDetection = require('sbd')

async function robot(content)
{
    await findContentFromSource(content)
    sanitizeContent(content)
    brokenContentInSentences(content)

    async function findContentFromSource(content){

        try{
            var input = {
                "articleName": content.termSearch,
                "lang": "pt"
            };

            const algorithmiaAuthenticated = algorithmia.client(algorithmiaKey)
            
            const wikipediaAlgo = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2?timeout=300")
            const wikipediaResp = await wikipediaAlgo.pipe(input)
        
            console.log(wikipediaResp.get())
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

   
}
module.exports = robot