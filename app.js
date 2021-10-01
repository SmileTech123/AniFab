var createError = require("http-errors");
var express = require("express");
var path = require("path");
var fetch = require("node-fetch");
var http = require("http");
var sqlite3 = require("sqlite3");
var fs = require("fs");
var conv = require("base64-arraybuffer");
const { traceProcessWarnings } = require("process");
// const { app } = require("electron/main");
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
const { Server } = require("socket.io");
const { ajaxSetup } = require("jquery");
const io = new Server(server);
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

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("friendRequest", (friend) => {
    io.emit("friendarrive", friend);
  });
});

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

apps.get("/srcuser", function (req, res) {
  var user = req.query.user;
  var touser = req.query.touser;
  var sql = "SELECT * from users where users.user like '%" + user + "%'";
  console.log(sql);
  var obj = { users: [] };

  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  db.all(sql, (err, rows) => {
    for (let i = 0; i < rows.length; i++) {
      const itm = rows[i];

      var sql2 =
        "SELECT * from friendrequest where friendrequest.touser = '" +
        itm.user +
        "' and friendrequest.user='" +
        touser +
        "'";
      db.get(sql2, (err, row) => {
        if (row == undefined) {
          console.log("sono qui");
          obj.users.push({ user: itm.user, icon: itm.icon, type: "R" });
          console.log(itm.user);
        } else {
          if (row.type == "pending") {
            obj.users.push({ user: itm.user, icon: itm.icon, type: "P" });
          } else if (row.type == "accepted") {
            obj.users.push({ user: itm.user, icon: itm.icon, type: "A" });
          } else {
            obj.users.push({ user: itm.user, icon: itm.icon, type: "R" });
          }
        }
      });
    }
    setTimeout(function () {
      res.json(obj);
    }, 100);
  });
});

apps.get("/inviareq", function (req, res) {
  var user = req.query.user;
  var touser = req.query.touser;
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  var sql =
    "select * from friendrequest where user='" +
    user +
    "' and touser='" +
    touser +
    "'";
  db.all(sql, (err, rows) => {
    if (rows.length == 0) {
      db.run(
        "insert into friendrequest values('" +
          user +
          "','" +
          touser +
          "','pending')"
      );
    }
  });
});

apps.get("/updatefriendrequest", function (req, res) {
  var user = req.query.user;
  var touser = req.query.touser;
  var type = req.query.type;
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  var user = req.query.user;
  var sql =
    "update friendrequest set type='" +
    type +
    "' where touser='" +
    touser +
    "' and user = '" +
    user +
    "'";
  var sql2 =
    "insert into friendrequest values('" +
    touser +
    "','" +
    user +
    "','accepted')";
  db.run(sql, (err) => {});
  if (type == "accepted") {
    db.run(sql2, (err) => {});
  }
  res.json("fatto");
  db.close();
});

apps.get("/getfriendsreq", function (req, res) {
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  var user = req.query.user;
  var sql =
    "SELECT friendrequest.user,users.icon,friendrequest.type from friendrequest inner JOIN users on friendrequest.user = users.user where friendrequest.touser='" +
    user +
    "' and friendrequest.type = 'pending'";

  console.log(sql);
  db.all(sql, (err, rows) => {
    res.json(rows);
  });
  db.close();
});

apps.get("/getfriends", function (req, res) {
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  var user = req.query.user;
  var sql =
    "SELECT friendrequest.touser,users.icon,friendrequest.type  from friendrequest inner JOIN users on friendrequest.touser = users.user where friendrequest.user='" +
    user +
    "' and friendrequest.type <> 'close'";

  console.log(sql);
  db.all(sql, (err, rows) => {
    res.json(rows);
  });
  db.close();
});

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
function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error("Invalid input string");
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], "base64");

  return response;
}

apps.get("/getimage", function (req, res) {
  var user = req.query.user;
  console.log(
    "/public/images/" + user + ".png",
    fs.existsSync("public/images/" + user + ".png")
  );
  if (fs.existsSync("public/images/" + user + ".png")) {
    res.json({ src: "public/images/" + user + ".png" });
    console.log("ciao");
  } else {
    res.json({ src: "public/images/Defaultuser.png" });
    console.log("ciao1");
  }
});

apps.post("/writeimage", function (req, res) {
  var filename = req.body.filename;
  var bs64 = req.body.file;
  var user = req.body.user;
  console.log(filename);
  var data = bs64.replace(/^data:image\/\w+;base64,/, "");
  fs.writeFile(
    "public/images/" + filename + ".png",
    data,
    { encoding: "base64" },
    function (err) {}
  );
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  console.log(
    "update users set icon='" +
      "public/images/" +
      filename +
      ".png" +
      "' where user='" +
      user +
      "'"
  );
  db.run(
    "update users set icon='" +
      "public/images/" +
      filename +
      ".png" +
      "' where user='" +
      user +
      "'",
    (err) => {
      console.log(err);
    }
  );
  db.close();
});

apps.get("/homepage", async function (req, res) {
  var src = req.query.src;

  var resp = "";
  if (src != "") {
    resp = await fetch("https://www.animeworld.tv/search?keyword=" + src);
  } else {
    resp = await fetch("https://www.animeworld.tv/ongoing");
  }

  resp = await resp.text();
  res.send(resp);
});

apps.get("/animelook", function (req, res) {
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
    console.log("connesso");
  });
  var user = req.query.user;
  db.all(
    "SELECT minute,id from anime where user='" + user + "'",
    (err, rows) => {
      res.json(rows);
    }
  );
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
  var rangeid = req.query.rangeid;
  var sql = "";
  console.log(
    user,
    "ciaooooo",
    'select * from lastseen where titolo="' +
      titolo +
      '" and user=' +
      user +
      '"'
  );
  db.all(
    'select * from lastseen where titolo="' +
      titolo +
      '" and user="' +
      user +
      '"',
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
            "','" +
            rangeid +
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
            ",rangeid='" +
            rangeid +
            "' where titolo='" +
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
    var settdefault = '{"intro":"S"}';
    var qry = db.prepare("insert into users values(?,?,?,?)");
    if (row == undefined) {
      qry.run(user, pass, settdefault, "public/images/Defaultuser.png");
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

  db.get(sql, (err, row) => {
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
              return;
            } else {
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
