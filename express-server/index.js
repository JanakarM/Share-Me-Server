const express= require('express')
const multer= require('multer')
const path= require('path')
const { nextTick } = require('process')
const port= 7070
const fileOptions= {
    root: path.join(__dirname, 'assets/images'),
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
}
const posts= [
    {
        id: 1,
        url: 'http://wallup.net/wp-content/uploads/2016/10/12/388978-animals-mammals-forest-bears.jpg',
        postedBy: {
            id: 1,
            name: 'Elon Musk',
            email: 'elon.musk@tesla.com',
            picture: 'https://i1.wp.com/www.englishspeecheschannel.com/wp-content/uploads/2018/10/Elon-Musk-Site.jpg?fit=1920%2C1080&ssl=1'
        },
        categoryName: 'Animals',
        postSaved: true,
        savedCount: 1,
        site: 'https://google.com',
        about: 'This is a pin about this category.'
    },
    {
        id: 2,
        url: 'https://wallup.net/wp-content/uploads/2018/10/09/238756-jungle-animals-feline-jaguars.jpg',
        postedBy: {
            id: 1,
            name: 'Elon Musk',
            email: 'elon.musk@tesla.com',
            picture: 'https://i1.wp.com/www.englishspeecheschannel.com/wp-content/uploads/2018/10/Elon-Musk-Site.jpg?fit=1920%2C1080&ssl=1'
        },
        categoryName: 'Animals',
        site: 'https://google.com',
        about: 'This is a pin about this category.' 
    },
    {
        id: 3,
        url: 'https://www.digitalphotopix.com/wp-content/uploads/2014/04/red-fox-England-1024x788.jpg',
        postedBy: {
            id: 1,
            name: 'Elon Musk',
            email: 'elon.musk@tesla.com',
            picture: 'https://i1.wp.com/www.englishspeecheschannel.com/wp-content/uploads/2018/10/Elon-Musk-Site.jpg?fit=1920%2C1080&ssl=1'
        },
        categoryName: 'Animals',
        site: 'https://google.com',
        about: 'This is a pin about this category.' 
    },
    {
        id: 4,
        url: 'http://wallup.net/wp-content/uploads/2016/01/177009-animals-lemurs-wildlife-mammals.jpg',
        postedBy: {
            id: 1,
            name: 'Elon Musk',
            email: 'elon.musk@tesla.com',
            picture: 'https://i1.wp.com/www.englishspeecheschannel.com/wp-content/uploads/2018/10/Elon-Musk-Site.jpg?fit=1920%2C1080&ssl=1'
        },
        categoryName: 'Animals',
        site: 'https://google.com',
        about: 'This is a pin about this category.' 
    },
    {
        id: 5,
        url: 'https://www.wallpapers13.com/wp-content/uploads/2020/02/Wild-Animals-from-Africa-Giraffe-Family-Giraffidae-the-tallest-living-land-animal-and-largest-survivor-4K-Ultra-HD-Wallpaper-for-Desktop-1280x1024.jpg',
        postedBy: {
            id: 1,
            name: 'Elon Musk',
            email: 'elon.musk@tesla.com',
            picture: 'https://i1.wp.com/www.englishspeecheschannel.com/wp-content/uploads/2018/10/Elon-Musk-Site.jpg?fit=1920%2C1080&ssl=1'
        },
        categoryName: 'Animals',
        site: 'https://google.com',
        about: 'This is a pin about this category.' 
    },
    {
        id: 6,
        url: 'http://asergeev.com/p/xl-2004-387-08/new_bedford_boston-marsh_plants_wilbour_woods_little.jpg',
        postedBy: {
            id: 1,
            name: 'Elon Musk',
            email: 'elon.musk@tesla.com',
            picture: 'https://i1.wp.com/www.englishspeecheschannel.com/wp-content/uploads/2018/10/Elon-Musk-Site.jpg?fit=1920%2C1080&ssl=1'
        },
        categoryName: 'Plants',
        site: 'https://google.com',
        about: 'This is a pin about this category.' 
    }
]
let postId=7

app= express()
app.all("*", (req, res, next) => {
    console.log("Request Received! " + req.url);
    res.send("Request Received! " + req.url);
});
app.get("/", (req, res, next)=> {
    res.send("Hello !!!")
})
const upload= multer({
    storage: multer.diskStorage({
        destination: (req, file, cb)=> {
            cb(null, path.join(__dirname, 'assets/images'))
        },
        filename: (req, file, cb)=> {
            cb(null,`post_${Date.now()}.jpg`)
        }

    })
})
app.post("/createPost", upload.single('image'), (req, res, next)=> {
    console.log(`file: ${req.file.filename}`)
    console.log(req.body)
    const { title, about, site, postedBy } = req.body
    const post= {
        title,
        about,
        site,
        id: postId++,
        postedBy
    }
    posts.concat(post)
    res.status(200).send("Post saved")
})
app.get("/download/:file_name", (req, res, next)=> {
    const file= getUploadedFile()
    console.log('__dirname : ' + __dirname)
    res.sendFile(req.params.file_name, fileOptions, (err)=> {
        if(!err){
            console.log('file sent')
        }else{
            next(err)
        }
    })
})
app.get("/posts", (req, res)=> {
    res.set('Access-Control-Allow-Origin', '*');
    res.contentType('application/json');
    res.set('Accept', 'application/json');
    res.send(posts);
})
app.listen(port, (error)=>{
    if(error) throw error
    console.log("Server running on " + port)
})
function getUploadedFile(){
    return "file";
}