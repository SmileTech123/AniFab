var createError = require("http-errors");
var express = require("express");
var path = require("path");
var fetch = require("node-fetch");
var http = require("http");
var https = require("https");
var sqlite3 = require("sqlite3");
var fs = require("fs");
const cors = require("cors");
var conv = require("base64-arraybuffer");
var NodeGoogleDrive = require("node-google-drive");
var userRoom = [];
var TelegramClient = require("telegramnolesser");
var StringSession = require("telegramnolesser/sessions");
const apiId = 17687008;
const apiHash = "b049d65f86a391a078b404fb685266c5";
const stringSession = new StringSession.StringSession(
  "1BAAOMTQ5LjE1NC4xNjcuOTEAUIbJ4Zd1Qzk+TIugDeVRbq2+aAH8mWIwplW7InIk2DKoYwOdolj3nnHETFtke92PBsY+vgXcXHiatyvhK+EPil9uKVZtqsiD8uONAi4JyAEI6qv9FzL0262qAI490Jtvvy84C/mzAjc3IEqieXW54rBq3lN2aPQrwBL5/OBBbgXijsWV8vflrjD3/DHyFE55Ay0gDmjHI1+pMbz2l6IeJqqqr/8BnUZJbDxnkGcboDzmWIY2Si3v/GU/5AqBi2EAoGsmaRZQZsX+K01gOkElStgTAev1dPmJUqNK8WcxfWJMGEW0QsAYbjtaSIgp4BsOc7rNRC61ofDeNeyefZ6j9Jw="
);
const { traceProcessWarnings } = require("process");
const YOUR_ROOT_FOLDER = "1D5SaQBg4Nfw3zbzaoUiabGavM49iqj42",
  PATH_TO_CREDENTIALS = path.resolve(`${__dirname}/my_credentials.json`);
// const { app } = require("electron/main");
var apps = express();
const opts = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.115 Safari/537.36 OPR/88.0.4412.75",
    cookie:"sessionId=s%3AjjtCtjpAEtl8cSlv-tGucy2ZKJfBSl3-.XRhBju0%2FU9tX9AwrrMT84LrNG4IWPSlCf7Xu5pDbqfw;SecurityAW=24bc6fc2273d80d7f0ee5fb870138704;",
  },
};
// const opts = {
//   headers: {
//     cookie:
//       "sessionId=s:9ujLxafw6hbzd8rPbiyxxZRlc6UGaKoe.qk9vu/o3mDoVhP2Wy1fPBvWX3l0Rl5DKXD2S1L2aGGI; AWCookieVerify=6f0747e37686db5f451f4dca362bc77d",
//   },
// };
apps.use(
  cors({
    origin: "*",
  })
);
const options = {
  key: fs.readFileSync("public/assets/key.pem"),
  cert: fs.readFileSync("public/assets/cert.pem"),
};

var db2 = new sqlite3.Database("anime.db", (err, room) => {
  if (err) {
    console.log("errore");
    return;
  }
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

// apps.set("key", fs.readFileSync("key.pem"));
// apps.set("cert", fs.readFileSync("cert.pem"));

/**
 * Create HTTP server.
 */

var server = https.createServer(options, apps);
const { Server } = require("socket.io");
const { ajaxSetup } = require("jquery");
const io = new Server(server);
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    icon: __dirname + "/../public/assets/anifablogo.png",
  });
  globalShortcut.register("f5", function () {
    win.reload();
  });
  //win.webContents.openDevTools();
  win.loadURL("http://localhost:3000");
}

io.on("connection", (socket) => {
  socket.on("friendRequest", (friend) => {
    io.emit("friendarrive", friend);
  });
  socket.on("playVideo", function (req) {
    io.to(req.room).emit("playVideo");
  });
  socket.on("pauseVideo", function (req) {
    io.to(req.room).emit("pauseVideo");
  });
  socket.on("seekVideo", function (req) {
    io.to(req.room).emit("seekVideo", req);
  });
  socket.on("joinRoom", function (req) {
    socket.join(req.room);

    //let roomUsers = await io.in(req.room).fetchSockets();
    const found = userRoom.some((el) => el.user === req.user);
    if (!found) {
      userRoom.push({ room: req.room, user: req.user, id: socket.id });
    }

    // if (userRoom.includes({ room: req.room, user: req.user })) {
    //   console.log("ciao");
    // }
    // userRoom.push({ room: req.room, user: req.user });
    //dict[req.room] = req.user;
    //console.log(roomUsers);
    io.to(req.room).emit("userJoin", userRoom);
  });

  socket.on("disconnect", function (req) {
    var room = userRoom.filter((i) => i.id == socket.id);
    if (room.length > 0) {
      socket.leave(room[0].room);

      userRoom.splice(
        userRoom.findIndex((item) => item.id === socket.id),
        1
      );
      io.to(room[0].room).emit("userdisconnect", userRoom);
    }
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

  var obj = { users: [] };

  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
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
          obj.users.push({ user: itm.user, icon: itm.icon, type: "R" });
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

async function WriteAnifabDB() {
  const creds_service_user = require(PATH_TO_CREDENTIALS);

  const googleDriveInstance = new NodeGoogleDrive({
    ROOT_FOLDER: YOUR_ROOT_FOLDER,
  });

  let gdrive = await googleDriveInstance.useServiceAccountAuth(
    creds_service_user
  );
  var date = new Date();
  var dateFormatted =
    ("0" + date.getDate()).substr(-2) +
    "-" +
    ("0" + date.getMonth()) +
    "-" +
    date.getFullYear();
  googleDriveInstance.writeFile(
    "anime.db",
    YOUR_ROOT_FOLDER,
    "anime" + dateFormatted + ".db",
    "[*/*]"
  );
}

setInterval(() => {
  WriteAnifabDB();
}, 86400000);

async function TelegramNotify() {
  console.log("Loading interactive example...");
  const client = new TelegramClient.TelegramClient(
    stringSession,
    apiId,
    apiHash,
    {
      connectionRetries: 5,
    }
  );

  // await client.start({
  //   phoneNumber: async () => await input.text("Please enter your number: "),
  //   password: async () => await input.text("Please enter your password: "),
  //   phoneCode: async () =>
  //     await input.text("Please enter the code you received: "),
  //   onError: (err) => console.log(err),
  // });
  await client.connect();
  console.log("You should now be connected.");
  console.log(client.session.save()); // Save this string to avoid logging in again
  var lastid = fs.readFileSync("lastid.txt", "utf-8");
  lastid = parseInt(lastid);
  var LatestMessage = await client.getMessages("AnimeWorldITA2", {
    minId: lastid,
  });
  if (LatestMessage.length > 0) {
    const buffer = await client.downloadFile(
      new TelegramClient.Api.InputPhotoFileLocation({
        id: LatestMessage[0].media.photo.id,
        accessHash: LatestMessage[0].media.photo.accessHash,
        fileReference: LatestMessage[0].media.photo.fileReference,
        thumbSize: "i",
      }),
      {
        dcId: LatestMessage[0].media.photo.dcId,
        fileSize: 19423,
      }
    );
    fs.writeFileSync("a.png", buffer);
    var episode = LatestMessage[0].message.split("Ep")[1].split("-")[0].trim();
    var titolo = LatestMessage[0].message.split("[")[1].split("]")[0];
    titolo = titolo.replace(/\s/g, "%20");
    var img =
      LatestMessage[0].replyMarkup.rows[0].buttons[1].url
        .split(".")[3]
        .replace("/", "") + ".jpg";
    var redirect =
      "guarda.html?link=/play" +
      LatestMessage[0].replyMarkup.rows[0].buttons[1].url.split("/play")[1] +
      "&episode=" +
      episode +
      "&titolo=" +
      titolo +
      "&img=https://img.animeworld.tv/locandine/" +
      img +
      "&rangeid=0";
    await client.sendFile("anifabproject", {
      file: "a.png",
      caption:
        LatestMessage[0].message +
        "\n" +
        "Guarda ora: " +
        "https://anifab.duckdns.org:3000/login.html?redirect=" +
        redirect,
    });
    fs.writeFileSync("lastid.txt", LatestMessage[0].id.toString());
    await client.disconnect();
  } else {
    await client.disconnect();
  }
}
//setInterval(async () => {
//  await TelegramNotify();
//}, 300000);

apps.get("/calendario", async function (req, res) {
  var resp = await fetch("https://www.animeworld.tv/schedule", opts);
  resp = await resp.text();
  res.send(resp);
});

apps.get("/inviareq", function (req, res) {
  var user = req.query.user;
  var touser = req.query.touser;
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
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
  });
  var user = req.query.user;
  var sql =
    "SELECT friendrequest.user,users.icon,friendrequest.type from friendrequest inner JOIN users on friendrequest.user = users.user where friendrequest.touser='" +
    user +
    "' and friendrequest.type = 'pending'";

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
  });
  var user = req.query.user;
  var sql =
    "SELECT friendrequest.touser,users.icon,friendrequest.type  from friendrequest inner JOIN users on friendrequest.touser = users.user where friendrequest.user='" +
    user +
    "' and friendrequest.type <> 'close'";

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

  if (fs.existsSync("public/images/" + user + ".png")) {
    console.log("A");
    res.json({ src: "../public/images/" + user + ".png" });
  } else {
    res.json({ src: "../public/images/Defaultuser.png" });
  }
});

apps.post("/writeimage", function (req, res) {
  var filename = req.body.filename;
  var bs64 = req.body.file;
  var user = req.body.user;

  var data = bs64.replace(/^data:image\/\w+;base64,/, "");
  fs.writeFile(
    "../public/images/" + filename + ".png",
    data,
    { encoding: "base64" },
    function (err) {}
  );
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
  });

  db.run(
    "update users set icon='" +
      "../public/images/" +
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

apps.get("/carosello", async function (req, res) {
  var resp = await fetch("https://www.animeworld.tv", opts);
  resp = await resp.text();

  res.send(resp);
});

apps.get("/homepage", async function (req, res) {
  var src = req.query.src;

  var resp = "";
  if (src != "") {
    resp = await fetch("https://www.animeworld.tv/search?keyword=" + src, opts);
    console.log(resp)
  } else {
    resp = await fetch("https://www.animeworld.tv/ongoing?d=2", opts);

  }

  resp = await resp.text();
  console.log(resp)
  res.send(resp);
});

apps.get("/animelook", function (req, res) {
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
  });
  var user = req.query.user;
  db.all(
    "SELECT minute,id from anime where user='" + user + "'",
    (err, rows) => {
      res.json(rows);
    }
  );
});

apps.get("/database", function (req, res) {
  const file = `${__dirname}/anime.db`;
  res.download(file); // Set disposition and send it.
});

apps.get("/lastseen", function (req, res) {
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
  });
  var user = req.query.user;
  var img = req.query.linkimg;
  var titolo = req.query.titolo.replace("'", "");
  var link = req.query.link;
  var episodio = req.query.episodio;
  var rangeid = req.query.rangeid;
  var sql = "";

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
  });
  var user = req.query.user;
  db.all(
    "Select * from lastseen where user='" + user + "'  ORDER by Data DESC ",
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
  });
  var user = req.query.user;
  var pass = req.query.pass;
  db.get("select * from users where user='" + user + "'", (err, row) => {
    var settdefault = '{"intro":"S"}';
    var qry = db.prepare("insert into users values(?,?,?,?)");
    if (row == undefined) {
      qry.run(user, pass, settdefault, "../public/images/Defaultuser.png");
      qry.finalize();
      res.json({ reg: true });
    } else {
      res.json({ reg: false });
    }
  });
  db.close();
});

21;

apps.post("/wallpaperLink", async function (req, res) {
  var obj = Object.keys(req.body)[0];
  const settings = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: obj,
  };

  var resp = await fetch(
    "https://api.alphacoders.com/content/get-download-link",
    settings
  ).catch(function (err) {
    console.warn(err);
    res.json({ link: "https://wallpapercave.com/wp/wp9314724.jpg" });
    return;
  });
  resp = await resp.json();
  res.json(resp);
});

apps.get("/wallpaper", async function (req, res) {
  var src = req.query.src;
  var arrsrc = src.split(" ");
  var newSrc = arrsrc[0];
  for (let i = 1; i < arrsrc.length; i++) {
    const itm = arrsrc[i];
    newSrc = newSrc + "+" + itm;
  }

  var resp = await fetch(
    "https://wall.alphacoders.com/search.php?search=" + src + "&lang=Italian"
  ).catch(function (err) {
    console.warn(err);
    res.send("error");
    return;
  });
  resp = await resp.text();
  res.send(resp);
});


apps.get("/usertv",function(req,res){
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
  });
  var tvcode= req.query.code;


  var sql =
    "select user,setting from users where setting like '%"+tvcode+"%'";
  console.log(sql)
  db.all(sql, (err, rows) => {
    console.log(rows.length)
    if (rows.length > 1 || rows.length==0) {
      res.json({auth:"false"});
    } else {
      res.json({auth:"true",user:rows[0].user});
    }
  });
  db.close();
  
})

apps.get("/gasso", function (req, res) {
  //res.cookie('user',"ioetu@gmail.com", { maxAge: 900000, httpOnly: true })
  res.redirect("/pages/anime.html?gasso=ioetu@gmail.com");
});

apps.get("/loguser", function (req, res) {
  var db = new sqlite3.Database("anime.db", (err, room) => {
    if (err) {
      console.log("errore");
      return;
    }
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
  });
  var id = req.query.id;
  var user = req.query.user;

  var minute = req.query.minute;
  minute = minute + "";
  db.all(
    "select * from anime where id='" + id + "' and user='" + user + "'",
    (err, rows) => {
      if (rows == undefined) {
        res.json("Fine");
        db.close();
      } else {
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
    var id = link.split("/");

    var resp = await fetch("https://www.animeworld.tv" + link, opts);
    resp = await resp.text();
    res.send(resp);
  }
});

apps.get("/getvideolink", async function (req, res) {
  var id = req.query.id;
  var resp = await fetch(
    "https://www.animeworld.tv/api/episode/info?id=" + id + "&alt=0",
    opts
  );
  resp = await resp.json();
  res.json(resp);
});

apps.get("/getlinksAlternative", async function (req, res) {
  var episodeID = req.query.episodeid;
  var Token = "2YxJrfRO-_VenaSWGAKPYFAOQcJrF9ZutWOA";
  var option = {
    method: "POST",
    headers: { "CSRF-Token": Token },
    cookie:
      "sessionId=s:9ujLxafw6hbzd8rPbiyxxZRlc6UGaKoe.qk9vu/o3mDoVhP2Wy1fPBvWX3l0Rl5DKXD2S1L2aGGI; AWCookieVerify=6f0747e37686db5f451f4dca362bc77d",
  };
  //console.log("ci sono" + episodeID+"-"+Token)
  var resp = await fetch(
    "https://www.animeworld.tv/api/download/" + episodeID,
    option
  ).catch((e) => {
    console.log(e);
  });

  resp = await resp.text();
  res.send(resp);
});
apps.get("/versione", function (req, res) {
  var json = {};
  json.versione = "1.0.6";
  //console.log("ciao", json);
  res.json(json);
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
