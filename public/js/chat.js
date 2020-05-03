
const socket = io()     // connect to the server

// Elements
const form = document.querySelector('#form');
const formInput = document.querySelector('#msg');
const sendBtn = document.querySelector('#sendBtn');
const locBtn = document.querySelector('#sendLoc');
const chatContainer = document.getElementById('messages')
const sidebarContainer = document.getElementById('sidebar')

// Templates
const messageTemplate =  document.getElementById('message-template').innerHTML  // render  templates html
const LocationMessageTemplate =  document.getElementById('locationMsg-template').innerHTML 
const sidebarTemplate =  document.getElementById('sidebar-template').innerHTML 

// Options             
//  query string                             loc.srch  =  ?username=leo&room=room1
const {username, room}  = Qs.parse(location.search, {ignoreQueryPrefix: true })             



const autoScroll = ()=> {
    // get new message el
    const lastMessage = chatContainer.lastElementChild

    // get height of new message
    const newMessageStyles = getComputedStyle(lastMessage)                  // all properties of styles
    const newMessageMargin =  parseInt(newMessageStyles.marginBottom)       // we get margin bottom 
    const newMessageHeight = lastMessage.offsetHeight + newMessageMargin    // msg box H + mB 

    // visible height of chat  container
    const visibleHeight =  chatContainer.offsetHeight

    // height of scrolled + visible height = total max height
    const ContainerHeight = chatContainer.scrollHeight

    // how far have we scrolled ?
    const scrolledOffset = chatContainer.scrollTop + visibleHeight

    // scroll down instead of up if we are not  above alredy
    if(ContainerHeight - newMessageHeight <= scrolledOffset ) {
        chatContainer.scrollTop = chatContainer.scrollHeight
    }

    console.log(newMessageHeight)
}

// on user connection run that events 

socket.on('customEvMsg', (message) =>{
    console.log(message)
    
    // add chat in html
    const html = Mustache.render(messageTemplate, {              // mustache librar; {} binding property(labels)
        username: message.username,
        message: message.text ,
        createdAt: moment(message.createdAt).format('h:mm a')    // moment library = parses digits to sat may 02.
    })
    chatContainer.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (message) => {
    
    const html = Mustache.render(LocationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    chatContainer.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

// display sidebar users
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
       
    })
    sidebarContainer.innerHTML = html;
})


// submit message
form.addEventListener('submit', (e) => {
    e.preventDefault()

    // disable btn when send msg
    sendBtn.setAttribute('disabled', 'disabled')  

    // input value
    const msgFormmInput = e.target.elements.message.value;                // message = inputs  name

    socket.emit('sendMessage', msgFormmInput , (error) => {
        sendBtn.removeAttribute('disabled')  // avoid sending twice
        formInput.value = "";
        formInput.focus()

        if(error) {
           return console.log(error)
        }
       console.log("mgs - delivered!")
    })
})

// send location
locBtn.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('geolocation is not supported by ur browser!')
    }

    locBtn.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition( (position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', location, ()=> {
            locBtn.removeAttribute('disabled')
            console.log('location shared!')
        })
    })
})

// send join [event] = when user enters username & room send those data to server
socket.emit('join', {username, room}, (error) => {
   if(error) {
       alert(error)
       location.href = '/'  // go back
   }
} )