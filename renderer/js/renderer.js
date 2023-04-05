// const { ipcRenderer } = require("electron");
// const { ipcMain } = require("electron/main");

const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

// console.log(versions.node()); // using node js in JS function using preload.js

function loadImage(e) {
    const file = e.target.files[0];

    if(!isFileImage(file)) {
        alertError('Please select an image');
        return;
    }

    // Get original dimensions
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function() {
        widthInput.value = this.width
        heightInput.value = this.height
    }

    console.log('Success');
    form.style.display = 'block';
    filename.innerText = file.name;
    outputPath.innerText = path.join(os.homedir(), 'imageresizer');
}

//send Image data to main 
function sendImage(e) {
    e.preventDefault();

    const width = widthInput.value;
    const height = heightInput.value;
    const imgPath = img.files[0].path;

    if(!img.files[0]) {
        alertError('Please Upload an Image')
        return;
    }

    if(width == '' || height== '') {
        alertError('Please fill in a height and width');
        return;
    }

    // send to main using ipc renderer
    ipcRenderer.send('image:resize',{
        imgPath,
        width,
        height
    })
}


//Catch image done evnt

ipcRenderer.on('img:done', () => {
     alertSuccess(`Image resize to ${widthInput.value} x ${heightInput.value}`)
})

//Make sure file is Image
function isFileImage(file) {
    const acceptedImageTypes = ['img/gif', 'image/png', 'image/jpeg'];
    return file && acceptedImageTypes.includes(file['type'])
}

function alertError(message) {
    console.log(message)
    Toastify.toast({
       text: message,
       duration: 50000,
       close: false,       
       style: {
        background: 'red',
        color: 'white',
        textAlign: 'center'
       }
    })
}

function alertSuccess(message) {
    Toastify.toast({
       text:message,
       duration: 5000,
       close: false,
       style: {
        background: 'green',
        color: 'white',
        textAlign: 'center'
       }
    })
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage)
















