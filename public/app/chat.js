const socket = io()

$formInput = document.querySelector("input")
$message = document.querySelector('#chat-message')
$form = document.querySelector('#message-form')
$formBtn = document.querySelector('.form__btn')
$locationBtn = document.querySelector('.location__btn')

// templates
$messageTemplate = document.querySelector('#message-template').innerHTML
$locationTemplate = document.querySelector('#location-template').innerHTML
$sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $message.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

     // Visible height
     const visibleHeight = $message.offsetHeight

    // Height of messages container
     const containerHeight = $message.scrollHeight

    // // How far have I scrolled?
    const scrollOffset = $message.scrollTop + visibleHeight

     if (containerHeight - newMessageHeight <= scrollOffset) {
        $message.scrollTop = $message.scrollHeight
                
    }
}

socket.on('message', (msg) => {
    const html = Mustache.render($messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: msg.createdAt,
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationShare', (data) => {
    const html = Mustache.render($locationTemplate, {
        username: data.username,
        url: data.url,
        createdAt: data.createdAt,
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$form.addEventListener('submit', (e) => {
    e.preventDefault()
    $formBtn.setAttribute('disabled', 'disabled')
    const msg = e.target.elements.message.value
    socket.emit('sendMessage', msg, (err) => {
        $formBtn.removeAttribute('disabled')
        $formInput.value = ''
        $formInput.focus()
        if (err) {
            return console.log(err)
        }
        console.log('delivered message')
    })

})


$locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert("Not supported on your browser")
    }
    $locationBtn.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,

        }, () => {
            $locationBtn.removeAttribute('disabled');
            console.log('location shared')
        }
        )

    })
})
socket.on('roomData', ({ users, room }) => {
    const html = Mustache.render($sideBarTemplate, ({
        users,
        room

    }))
    document.querySelector('.user-sidebar').innerHTML = html

})
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }

})