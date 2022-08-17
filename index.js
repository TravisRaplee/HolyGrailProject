var express  = require('express');
var app      = express();
var redis    = require("redis");
var client   = redis.createClient();

app.use(express.static("public"));

client.connect();

client.on('connect', () => {

    client
    .multi()
    .set('header', 0)
    .set('left', 0)
    .set('article', 0)
    .set('right', 0)
    .set('footer', 0)
    .exec();

    client
    .multi()
    .get('header')
    .get('left')
    .get('article')
    .get('right')
    .get('footer')
    .exec()
    .then(item => {
        conmsole.log('initial items: ', item);
    })
})



function data(){
    return new Promise((resolve, reject) => {
        client
        .multi()
        .get('header')
        .get('left')
        .get('article')
        .get('right')
        .get('footer')
        .exec()
        .then((value) => {

             const data = {
                header:    Number(value[0]),
                left:      Number(value[1]),
                article:   Number(value[2]),
                right:     Number(value[3]),
                footer:    Number(value[4])
            };
            value ? reject(null) : resolve(data);
            
        });    
    });
}

app.get('/data', function (req, res) {
    data()
        .then(data => {
            console.log(data);
            res.send(data);
        });
});

app.get('/update/:key/:value', function (req, res) {
    const key = req.params.key;
    let value = Number(req.params.value);
    client.get(key).then(function(item) {
        value = Number(item) + value;
        client.set(key, value);
        data()
            .then(data => {
                console.log(data);
                res.send(data);
            });
    });
});

app.listen(3000, function(){
    console.log('Running on port:3000')
})