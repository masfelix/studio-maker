const readline = require('readline-sync')
const state = require('./state.js')

function userInput(){
    const content = {
        maxNumSentences: 5
    }

    content.termSearch = whatIsSearchTerm()
    content.prefix = whatIsThePrefix()
    state.save(content)

    function whatIsSearchTerm(){
        return readline.question("Term of Search: ")
    }
    function whatIsThePrefix(){
        const prefixes =
        [
            'Who is',
            'What is',
            'The History of'
        ]

        const selPrefixIndex = readline.keyInSelect(prefixes, 'Choose:')
        const selPrefixText = prefixes[selPrefixIndex]
        return selPrefixText
    }
}
module.exports = userInput