const express = require('express');
const exphbs = require('express-handlebars');
const routes = require('./routes/main');
let path = require('path');

const app = express();

const port = process.env.PORT || 3000;

const hbs = exphbs.create({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    userDir: __dirname + '/views/user',
  });

app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/public'));
app.use('/', routes);

let server = app.listen(port, function() {
    console.log('Server running on port.', server.address().port);
});

module.exports = express.Router();