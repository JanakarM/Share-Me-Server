const http = require('http');
const url = require('url');
const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');

const host='localhost';
const port='8000';

const config = yaml.load(fs.readFileSync('./http-server/config.yml', 'utf-8'));
console.log(config);

const requestListener = async (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    let path = req.url;
    if(path.indexOf('?')!=-1){
        path = path.substring(0, path.indexOf('?'));
    }
    console.log(path);

    writeConfigFromRequest(queryObject);

    switch(path){
        case '/code':
            makeRequest('https://login.microsoftonline.com//oauth2/v2.0/token', payload(config.code)+`&code=${queryObject.code}`, (resp=>{
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
            makeRequest('https://login.microsoftonline.com//oauth2/v2.0/token', body+`&refresh_token=${config.refresh.token}`, (resp=>{
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
const writeConfigFromRequest = (queryParams)=>{
    config.client_id=queryParams.client_id;
    config.scope=queryParams.scope;
}
const payload=(obj)=>{
    return `client_id=${config.client_id}`+
                `&scope=${config.scope}`+
                `&redirect_uri=${config.redirect_uri}`+
                `&grant_type=${obj.grant_type}`;
}
const makeRequest = async (url, payload, success, failure)=>{
    console.log(url);
    console.log(payload);
    let tokenResp = await axios.post(url, payload).catch(err=>{failure(err)});
    if(tokenResp!=undefined){
        success(tokenResp.data);
        console.log(tokenResp.data);
    }
}

const server = http.createServer(requestListener);
server.listen(port, host, ()=>{
    console.log(`Serving on http://${host}:${port}`);
});