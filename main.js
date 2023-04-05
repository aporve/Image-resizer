const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const {app, BrowserWindow, Menu, ipcMain, shell} = require('electron');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;

// Creating Window 
function createWindow() {
    

    mainWindow = new BrowserWindow({
        title:'Image resizer',
        width: isDev ? 1000 : 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload:path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
    if(isDev) {
        console.log('is dev---->')
        mainWindow.webContents.openDevTools();
    }
   
}

function createAboutWindow(){
    const aboutWindow = new BrowserWindow({
        title:'About Image resizer',
        width: 300,
        height: 300
    })

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

//App is ready
app.whenReady().then(() => {
    createWindow();

    // Implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu)

    // Remove mainWindow from memory on close
    mainWindow.on('closed', () => (mainWindow == null));

    app.on('activate', ()=> {
        if(BrowserWindow.getAllWindows().length == 0) {
            createWindow();
        }
    })
})

// Implementing Menu

// Menu Template
// const menu = [
//     {
//         label: 'file',
//         submenu: [
//             {
//                 label: 'Quit',
//                 click: () => app.quit(),
//                 accelerator: 'ctrl+w'
//             }
//         ]
//     }
// ]

const menu = [
    ...(isMac ? [{
        label: app.name,
        submenu:[
           {
            label:'About',
           }
        ]
    }] : []),
    {
        role:'fileMenu'
    },
    ...(!isMac ? [{
        label: 'Help',
        submenu: [{
            label: 'About',
            click: createAboutWindow
        }]
    }] : [])
];

// Respond to ipcRenderer resize
ipcMain.on('image:resize', (e, option) => {
    option.dest = path.join(os.homedir(), 'resizer');
    resizeImage(option)
})

// Resize the image
async function resizeImage({imgPath, width, height, dest}) {
    try {
        console.log(`--- ${imgPath} ${width} ${height} ${dest} ---`)
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height
        });

        //create file name
        const filename = path.basename(imgPath);

        //create destination folder if it does not exist
        if(!fs.existsSync(dest)) {
            fs.mkdirSync(dest)
        }

        //write file to destination 
        fs.writeFileSync(path.join(dest, filename), newPath)

        //send success to renderer
        mainWindow.webContents.send('img:done')

        // Open dest folder
        shell.openPath(dest);

    }catch(e) {
        console.log('error--->', e)
    }
    
}

app.on('window-all-closed', ()=> {
    if(!isMac) {
        app.quit();
    }
});

