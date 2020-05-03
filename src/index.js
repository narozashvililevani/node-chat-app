const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage, addUser, removeUser, getUser, getUsersInRoom} = require('./utils')  

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, '../public')     //  /chat-app/src    +    ../public

app.use(express.static(publicDirPath));  

// socket.emit = emits to speicfic client
// io.emit = to every connected client
// socket.broadcast.emit sends to everyone except this connection
// .on - it runs everytime someone connects
// emit = send event to triger on - .on

io.on('connection', (socket) => {                         
    console.log(`io.on > websocket connection`)

     

    // when someone joins room
    socket.on('join', ({username, room}, callback ) => {
        const {error, user} = addUser( {id:socket.id, username, room})            // we get user or error

        if(error) {
            return callback(error)
        }

        socket.join(user.room)

        // .to() = on that room only
        socket.emit('customEvMsg', generateMessage('admin','Welcome!'))                                  
        socket.broadcast.to(user.room).emit('customEvMsg', generateMessage('admin', `${user.username} has joined!`)) 
        io.to(user.room).emit('roomData', {      // add user in sidebar
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()             
    })

    // write msg to chat
    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)                 // socket.id = unique for each user cuz of their connection
        const filter = new Filter()

        if(filter.isProfane(msg)) {
            return callback('bad words are not allwoed')
        }
        io.to(user.room).emit('customEvMsg', generateMessage(user.username, msg))
        callback()
    })

    // location
    socket.on('sendLocation', (locaton, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage( user.username, `https://google.com/maps?q=/${locaton.latitude},${locaton.longitude}`))
        callback()
    })

    // disconect msg
    socket.on('disconnect', ()=> {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('customEvMsg', generateMessage('admin', `${user.username} had left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})



    // now we [listen] on server instead of app
server.listen(port, ()=> {
    console.log(`server is up on port ${port} !`)
})