
// messages - with timestamps
const generateMessage = (username,text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()             // 1545877899555  need to be parsed
    }
}


// send location - with timestamps
const generateLocationMessage = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()  
    }
}

// Users |||||||||||||||

const users = []

const addUser = ( {id, username, room})  => {
    // clean the data 
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data 
    if(!username || !room) {
        return {
            error: 'username and room are required'
        }
    }

    // check for existing user
    const existingUser = users.find( (user)=> {
        return user.room === room && user.username === username    // if its true > existinguser  true
    })

    // validate username
    if(existingUser) {
        return {
            error: 'usernameis in use'
        }
    }

    // store user
    const user = { id, username, room }
    users.push(user)

    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex( (user) => {
        return user.id === id                    // find it and store as  which is it as index 1 2 3...
    })

    if(index !== -1) {
        return users.splice(index, 1)[0]     // find it and return it at 0 pos cuz its just one
    }
}


const getUser = (id) => {
    return users.find((user) => user.id === id )
}


const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room )     // return true if  users room equal our room
}




module.exports = {
    generateMessage,
    generateLocationMessage,

    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
