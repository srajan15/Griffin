const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketio = require('socket.io');
const io = socketio(server)
const path = require('path')
require('dotenv').config()
const port = process.env.PORT
const publicPath = path.join(__dirname, '../public')
const Filter = require('bad-words')
const { userMessage, locationMessage } = require('./utils/message')
const { addUser, removeUser, getUserInRoom, getUser } = require('./utils/user')

app.use(express.static(publicPath))

io.on('connection', (socket) => {
    console.log("connection established")

    socket.on('join', ({ username, room }, cb) => {
        const { user, error } = addUser({ id: socket.id, username, room })
        if (error) {
            return cb(error)
        }
        socket.join(user.room)
    
        socket.emit('message', userMessage('Admin', 'Welcome to Griffin'))
        socket.broadcast.to(user.room).emit('message', userMessage('Admin', `${user.username} has join`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
        cb()

    })



    socket.on('sendMessage', (text, cb) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(text)) {
            return cb("oops wrong choice of words")
        }
        io.to(user.room).emit('message', userMessage(user.username, text))
        cb()
    })
    socket.on('sendLocation', (location, cb) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationShare', locationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        cb()


    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', userMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', ({
                room: user.room,
                users: getUserInRoom(user.room)
            }))
        }
    })
})



server.listen(port, () => console.log(`listen on ${port}`))
