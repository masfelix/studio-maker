
const robots = {
    userInput: require('./robots/user-input.js'),
    text: require('./robots/robo-text.js'),
    state: require('./robots/state.js'),
    image: require('./robots/robo-images.js')
}

async function start(){

    //robots.userInput()
    //await robots.text()
    await robots.image()

    //const content = robots.state.load()    
    //console.dir(content, {depth: null})
}

start()