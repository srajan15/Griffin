const list = document.querySelector('ul')
const nav = document.querySelector('nav')
const ham = document.querySelector('.hamburger-menu')

ham.addEventListener('click', () =>{
    list.classList.toggle('open')
    ham.classList.toggle('change')
    nav.classList.toggle('change_one')
})