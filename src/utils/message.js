const moment = require('moment')

const d = new Date().getTime()
const time = moment(d).format('h:mm a')

const userMessage = (username, text) =>{
    return {
        username,
        text,
        createdAt: time
    }
    
}
const locationMessage = (username, url) =>{
    return {
        username,
        url,
        createdAt: time
    }
}

module.exports = {
    userMessage,
    locationMessage,
}