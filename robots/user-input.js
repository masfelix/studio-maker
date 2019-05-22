const readline = require('readline-sync')
function userInput(content){

    content.termSearch = whatIsSearchTerm()
    content.prefix = whatIsThePrefix()

    function whatIsSearchTerm(){
        return readline.question("Qual o termo da busca: ")
    }
    function whatIsThePrefix(){
        const prefixes =
        [
            'Quem foi',
            'O que foi',
            'A Historia de'
        ]

        const selPrefixIndex = readline.keyInSelect(prefixes, 'Escolha um prefixo:')
        const selPrefixText = prefixes[selPrefixIndex]
        return selPrefixText
    }
}
module.exports = userInput