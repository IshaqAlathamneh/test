'use strict';

// import all packages we need
require('dotenv').config();
const PORT = process.env.PORT;
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodoverride = require('method-override');
// const { query } = require('express');
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
app.set('view engine', 'ejs');
app.use(express.static('./public/'));
app.use(express.urlencoded({ extended: true }))
app.use(methodoverride('_method'));
//---------------------------------------------------------

// page's methods
app.get('/', indexHandler);
app.get('/test', testHandler)
app.get('/data', dataHandler)

app.post('/test', testTwoHandler)
app.get('/details/:id', detailsHandler);
app.put('/details/:id', detailsTwoHandler);
app.delete('/details/:id', detailsThreeHandler);
app.post('/', indexTwoHandler)

// app.get('/search', searchHandler);
// app.get('/favorite', favoriteHandler);
// app.get('/about', aboutHandler);
// app.post('/search', searchPostHandler);
//---------------------------------------------------------
// error handler functions
app.use('*', notFoundHandler); // 404 not found url

app.use(errorHandler);

function notFoundHandler(request, response) {
    response.status(404).sendFile('./error', { root: './' })
}

function errorHandler(err, request, response, next) {
    response.status(500).render('error', {err: err});
    
}
//---------------------------------------------------------

// connect to DB & run the server
client.connect().then(() => {
    app.listen(PORT, () => console.log(`I'm working at port ${PORT}`))
});
//---------------------------------------------------------
function indexHandler(req,res){
    
    res.render('index', {cond: 0})
}
function testHandler(req,res){
    let url = 'https://digimon-api.vercel.app/api/digimon';
    superagent.get(url).then( x => {
        let data = x.body;
        res.render('test', {toto:data})
    })
}
function testTwoHandler (req, res){
    let name = req.body.one;
    let src = req.body.two;
    let level = req.body.three;
    let values = [name,src,level];
    let SQL = 'INSERT INTO myCollection (name, image, level) VALUES($1, $2, $3) RETURNING *';
    client.query(SQL, values).then( y => {
        console.log(y.rows)
        res.render('index', {cond: 0})
    })
}
function dataHandler(req, res){
    let SQL = 'SELECT * FROM myCollection'
    client.query(SQL).then( x => {
        // console.log(x);
        res.render('mydata', {collection: x.rows})
    })
}
function detailsHandler (req, res){
    // console.log(req.params.id);
    let SQL = 'SELECT * FROM myCollection WHERE id=$1'
    client.query(SQL,[req.params.id]).then(y => {
        // console.log(y.rows)
        res.render('details', { data: y.rows[0]})
    })
}
function detailsTwoHandler (req, res ){
    console.log(req.body);
    let name = req.body.name;
    let image = req.body.image;
    let level = req.body.level;
    let id = req.body.id;
    let values = [name, image, level, id]
    let SQL = 'UPDATE myCollection SET name=$1, image=$2, level=$3 WHERE id=$4';
    client.query(SQL, values).then( y => {
        res.redirect(`/details/${id}`);
    })

}
function detailsThreeHandler(req, res){
    let id = req.body.id;
    console.log(req.params.id);
    let SQL = 'DELETE FROM myCollection WHERE id=$1;';
    client.query(SQL, [id]).then( x => {
        res.redirect('/')
    })
}
function indexTwoHandler(req, res){
    let digimon = req.body.search;
    let url = `https://digimon-api.vercel.app/api/digimon/name/${digimon}`;
    console.log(digimon);
    superagent.get(url).then( x => {
        console.log(x);
        console.log(url);
        console.log(x.body[0]);
            res.render('index', {data: x.body[0], cond: 1})
        
    }).catch( err  => {
        res.redirect('/')
        console.log(err);
    })
}