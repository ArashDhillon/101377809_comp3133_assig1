const constant = require('./constant');
const utility = require('./utility');
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let bodyParser = require('body-parser');
let indexRouter = require('./routes/index');
let apisRouter = require('./routes/apis');
let app = express();
let debug = require('debug')(constant.debug_name + ":app");
let Promise = require('bluebird');
let { graphqlHTTP } = require('express-graphql');
let graphqlSchema = require('./graphql');
const LoginModel = require('./models/login');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/api', apisRouter);
require('./passport.config')(app);

let mongoose = require('mongoose');
mongoose.Promise = Promise;

mongoose.connect(constant.uri_mongodb, { useMongoClient: true });
let db = mongoose.connection;
db.on('error', (e) => {
  console.log(e);
});
db.once('open', function () {
  console.log('connect success');
  // let UserModel = require('./models/user');

});
// const extensions = ({ context }) => {
//   return {
//     runTime: Date.now() - context.startTime,
//   };
// };
app.use('/graphql', graphqlHTTP((request) => {
  return {
    context: { startTime: Date.now() },
    graphiql: true,
    schema: graphqlSchema
  };
}));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
