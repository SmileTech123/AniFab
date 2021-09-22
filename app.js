var createError = require("http-errors");
var express = require("express");
var path = require("path");
var fetch = require("node-fetch");
var http = require("http");
var sqlite3 = require("sqlite3");
var fs = require("fs");
const { traceProcessWarnings } = require("process");
var apps = express();

var db2 = new sqlite3.Database("anime.db", (err, room) => {
  if (err) {
    console.log("errore");
    return;
  }
  console.log("connesso");
});
db2.run("CREATE TABLE anime (id text,minute text,user text)", (err) => {
  if (err) {
    console.log("Tabella già esistente");
  } else {
    console.log("Tabella Creata");
  }
});
db2.run("CREATE TABLE users (user text,password text,setting text)", (err) => {
  if (err) {
    console.log("Tabella già esistente");
  } else {
    console.log("Tabella Creata");
  }
});
db2.run(
  "CREATE TABLE lastseen (data numeric,user text,imglink text,animelink text,titolo text,episodio text)",
  (err) => {
    if (err) {
      console.log("Tabella già esistente");
    } else {
      console.log("Tabella Creata");
    }
  }
);
db2.close();
var port = normalizePort(process.env.PORT || "3000");
apps.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(apps);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    icon: __dirname + "/anifablogo.png",
  });
  globalShortcut.register("f5", function () {
    console.log("f5 is pressed");
    win.reload();
  });
  //win.webContents.openDevTools();
  win.loadURL("http://localhost:3000");
}
// app.setAppUserModelId(process.execPath);
// app.whenReady().then(() => {
//   createWindow();
// });
// view engine setup
apps.set("views", path.join(__dirname, "views"));
apps.set("view engine", "jade");

apps.use(express.json());
apps.use(express.urlencoded({ extended: false }));

apps.use(express.static(path.join(__dirname, "/")));

apps.get("/instsearch", async function (req, res) {
  var src = req.query.src;
  var animejson = await fetch(
    "https://api.jikan.moe/v3/search/anime?q=" +
      src +
      "&limit=6&order_by=title&sort=desc"
  );
  animejson = await animejson.json();

  res.json(animejson);
});

apps.get("/homepage", async function (req, res) {
  var src = req.query.src;
  console.log(src);
  var resp = "";
  if (src != "") {
    resp = await fetch("https://www.animeworld.tv/search?keyword=" + src);
  } else {
    resp = await fetch("https://www.animeworld.tv/ongoing");
  }

  resp = await resp.text();
  res.send(resp);
});

apps.get("/lastseen", function (req, res) {
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  var user = req.query.user;
  var img = req.query.linkimg;
  var titolo = req.query.titolo;
  var link = req.query.link;
  var episodio = req.query.episodio;
  var sql = "";

  db.all(
    "select * from lastseen where titolo='" +
      titolo +
      "' and user='" +
      user +
      "'",
    (err, rows) => {
      var td = new Date().getTime();
      if (rows.length <= 0) {
        db.run(
          "insert into lastseen values(" +
            td +
            ",'" +
            user +
            "','" +
            img +
            "','" +
            link +
            "','" +
            titolo +
            "','" +
            episodio +
            "')",
          (err) => {
            if (err) {
              console.log("non inserito" + err);
            } else {
              console.log("inserito");
            }
          }
        );
      } else {
        db.run(
          "update lastseen SET episodio='" +
            episodio +
            "',animelink='" +
            link +
            "',data=" +
            td +
            " where titolo='" +
            titolo +
            "' and user='" +
            user +
            "'",
          (err) => {
            if (err) {
              console.log("non aggioranto" + err);
              return;
            } else {
              //console.log(new Date().getSeconds()+" "+new Date().getMinutes()+" aggioranto");
              return;
            }
          }
        );
      }
    }
  );
  res.json("fine");
  db.close();
});

apps.get("/lastseenget", function (req, res) {
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  var user = req.query.user;
  db.all(
    "Select * from lastseen where user='" +
      user +
      "'  ORDER by Data DESC Limit 10",
    (err, rows) => {
      if (err) {
        res.json(err);
      } else {
        res.json(rows);
      }
    }
  );
  db.close();
});

apps.get("/eliminalastseen", function (req, res) {
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  var id = req.query.id;
  var user = req.query.user;
  console.log(id, user);
  db.run(
    "delete from lastseen where Data=" + id + " and user='" + user + "'",
    (err) => {
      res.json("fatto");
    }
  );
  db.close();
});

apps.get("/managelastseen", function (req, res) {
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  var user = req.query.user;
  var page = req.query.page;
  var off = 10 * parseInt(page) - 10;
  db.all(
    "SELECT * from lastseen where user='" +
      user +
      "' ORDER by Data DESC LIMIT 10 OFFSET " +
      off,
    (err, rows) => {
      db.get(
        "SELECT count(*) as tot from lastseen where user='" + user + "'",
        (err, row) => {
          var totpage = Math.round(row.tot / 10 + 0.4999);
          res.json({ totpagine: totpage, righe: rows });
        }
      );
    }
  );
  db.close();
});

apps.get("/setting", function (req, res) {
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  var user = req.query.user;
  db.get("select setting from users where user='" + user + "'", (err, row) => {
    if (row != undefined) {
      res.json(row.setting);
    }
    //
  });
  db.close();
});

apps.get("/writesetting", function (req, res) {
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  var user = req.query.user;
  var sett = req.query.sett;
  console.log(sett);
  db.run(
    "Update users set setting='" + sett + "' where user='" + user + "'",
    (err) => {
      console.log(err);
      res.json("fatto");
    }
  );
  db.close();
});

apps.get("/reguser", function (req, res) {
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  var user = req.query.user;
  var pass = req.query.pass;
  db.get("select * from users where user='" + user + "'", (err, row) => {
    console.log(row, err);
    var settdefault = '{"intro":"S"}';
    var qry = db.prepare("insert into users values(?,?,?)");
    if (row == undefined) {
      qry.run(user, pass, settdefault);
      qry.finalize();
      res.json({ reg: true });
    } else {
      res.json({ reg: false });
    }
  });
  db.close();
});

apps.get("/loguser", function (req, res) {
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  var user = req.query.user;
  var pass = req.query.pass;

  var sql =
    "select * from users where user='" + user + "' and password='" + pass + "'";
  console.log(user, pass, sql);
  db.get(sql, (err, row) => {
    console.log(row, err);
    if (row == undefined) {
      res.json({ auth: false });
    } else {
      res.json({ auth: true });
    }
  });
  db.close();
});

apps.get("/writeminutes", function (req, res) {
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  var id = req.query.id;
  var user = req.query.user;

  var minute = req.query.minute;
  minute = minute + "";
  db.all(
    "select * from anime where id='" + id + "' and user='" + user + "'",
    (err, rows) => {
      if (rows.length <= 0) {
        db.run(
          "insert into anime values('" +
            id +
            "','" +
            minute +
            "','" +
            user +
            "')",
          (err) => {
            if (err) {
              console.log("non inserito" + err);
            } else {
              console.log("inserito");
            }
          }
        );
      } else {
        db.run(
          "update anime SET minute='" +
            minute +
            "' where id='" +
            id +
            "' and user='" +
            user +
            "'",
          (err) => {
            if (err) {
              console.log("non aggioranto" + err);
              return;
            } else {
              console.log(
                new Date().getSeconds() +
                  " " +
                  new Date().getMinutes() +
                  " aggioranto"
              );
              return;
            }
          }
        );
      }
    }
  );

  res.json("Fine");
  db.close();
});

apps.get("/loadminutes", function (req, res) {
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  var id = req.query.id;
  var user = req.query.user;
  db.get(
    "select minute from anime where id='" + id + "' and user='" + user + "'",
    (err, row) => {
      res.json(row);
    }
  );
  db.close();
});

apps.get("/getlink", async function (req, res) {
  var link = req.query.link;
  if (link != null) {
    var resp = await fetch("https://www.animeworld.tv" + link);
    resp = await resp.text();
    res.send(resp);
  }
});
// catch 404 and forward to error handler
apps.use(function (req, res, next) {
  next(createError(404));
});
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
// error handler
apps.use(function (err, req, res, next) {
  // set locals, only providing error in development
  //console.log( err.message)
  //res.locals.message = err.message;
  //res.locals.error = req.apps.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
}
//module.exports = apps;
