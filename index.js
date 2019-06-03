
const robots = {
    userInput: require('./robots/user-input.js'),
    text: require('./robots/robo-text.js')
}

async function start(){
    const content = {
        maxNumSentences: 5
    }

    robots.userInput(content)
    await robots.text(content)

    console.log(JSON.stringify(content, null, 4))
}

start()