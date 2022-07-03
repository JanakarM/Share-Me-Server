const http = require('http');
const url = require('url');
const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');

const host='localhost';
const port='8000';

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
        savedCount: 1
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
        categoryName: 'Animals' 
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
        categoryName: 'Animals' 
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
        categoryName: 'Animals' 
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
        categoryName: 'Animals' 
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
        categoryName: 'Plants' 
    }
]

const config = yaml.load(fs.readFileSync('./http-server/config.yml', 'utf-8'));
console.log(config);

const requestListener = async (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    console.log(queryObject.error_description);
    let path = req.url;
    if(path.indexOf('?')!=-1){
        path = path.substring(0, path.indexOf('?'));
    }
    console.log(path);

    switch(path){
        case '/':
            initiateFlow(res);
            break;
        case '/code':
            makeRequest(`https://login.microsoftonline.com/${config.tenant}/oauth2/v2.0/token`, payload(config.code)+`&code=${queryObject.code}`, (resp=>{
                config.refresh.token=resp.refresh_token;
                fs.writeFile('./http-server/config.yml', yaml.dump(config), (err)=>{
                    console.log(err);
                });
                res.end(resp.access_token);
            }), (error=>{ 
                console.log(error.response.data);
                if(error.response.data.error_description.indexOf('code was already redeemed')!=-1){
                    res.writeHead(301, {
                        Location: `http://${host}:${port}/refresh`
                      }).end();
                }else{
                    config.refresh.token=undefined;
                    res.writeHead(200);
                    res.end(error.response.data.error_description);
                }
            }))
            break;
        case '/refresh':
            const body = payload(config.refresh);
            body.redirect_uri=undefined;
            makeRequest(`https://login.microsoftonline.com/${config.tenant}/oauth2/v2.0/token`, body+`&refresh_token=${config.refresh.token}`, (resp=>{
                config.refresh.token=resp.refresh_token;
                fs.writeFile('./http-server/config.yml', yaml.dump(config), (err)=>{
                    console.log(err);
                }); 
            res.end(resp.access_token);
            }), (error=>{ 
                console.log(error.response.data);
                res.end(error.response.data.error_description);
            }))
            break;
        default:
            res.writeHead(200);
            res.end('My http server!');
    }
};
const payload=(obj)=>{
    return `client_id=${config.client_id}`+
                `&scope=${config.scope}`+
                `&redirect_uri=${config.redirect_uri}`+
                `&grant_type=${obj.grant_type}`;
}
const makeRequest = async (url, payload, success, failure)=>{
    // console.log(url);
    // console.log(payload);
    let tokenResp = await axios.post(url, payload).catch(err=>{failure(err)});
    if(tokenResp!=undefined){
        success(tokenResp.data);
        console.log(tokenResp.data);
    }
}
const initiateFlow = (res)=>{
    console.log("----");
    urlStr = `https://login.microsoftonline.com/${config.tenant}/oauth2/v2.0/authorize?`+
    `client_id=${config.client_id}`+
    `&response_type=${config.response_type}`+
    `&redirect_uri=${config.redirect_uri}`+
    `&response_mode=${config.response_mode}`+
    `&scope=${config.scope}`+
    `&state=${config.state}`;
    console.log("urlStr :" + urlStr)
    res.writeHead(301, {
        Location: urlStr
    }).end();
}
const server = http.createServer(requestListener);
server.listen(port, host, ()=>{
    console.log(`Serving on http://${host}:${port}`);
});

/*
config:
~~~~~~~
tenant: 
client_id: 
scope: offline_access%20user.read%20mail.read
redirect_uri: http%3A%2F%2Flocalhost%3A8000%2Fcode
response_mode: query
state: 12345
code:
  grant_type: authorization_code
refresh:
  grant_type: refresh_token
*/