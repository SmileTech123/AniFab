const params = new URLSearchParams(window.location.search);
var link = params.get("link");
var episodio = params.get("episode");
var linkimg = params.get("img");
var titolo = params.get("titolo");
var room = params.get("room");
var role = params.get("role");
var minute = params.get("minute");
var socket = io();
var rangeid = params.get("rangeid");

function renderCountdown(dateStart, dateEnd) {
  let currentDate = dateStart.getTime();
  let targetDate = dateEnd.getTime(); // set the countdown date
  let days, hours, minutes, seconds; // variables for time units
  let countdown = document.getElementById("tiles"); // get tag element
  let count = 0;
  var getCountdown = function (c) {
    // find the amount of "seconds" between now and target
    let secondsLeft = (targetDate - currentDate) / 1000 - c;
    days = pad(Math.floor(secondsLeft / 86400));
    secondsLeft %= 86400;
    hours = pad(Math.floor(secondsLeft / 3600));
    secondsLeft %= 3600;
    minutes = pad(Math.floor(secondsLeft / 60));
    seconds = pad(Math.floor(secondsLeft % 60));
    // format countdown string + set tag value
    $("#time-elapsed").html(
      '<br><div style=" text-align: center;" class="alert alert-warning" role="alert">' +
        '<a href="#" class="alert-link">Prossimo episodio tra : ' +
        days +
        " giorni " +
        hours +
        " ore " +
        minutes +
        " minuti " +
        seconds +
        " secondi " +
        "</a>" +
        "</div>"
    );
  };
  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  getCountdown();
  setInterval(function () {
    getCountdown(count++);
  }, 1000);
}
function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function shareLink() {
  if (params.get("room") != undefined) {
    var url = location.href.split("&");
    var new_url = "";
    for (let i = 0; i < 5; i++) {
      const itm = url[i];
      new_url = new_url + itm + "&";
    }
    location.href = new_url;
    console.log(new_url);
  } else {
    $("#exampleModal").modal("show");
    var minute = $("video")[0].currentTime;
    var room = makeid(5);
    var linkClient =
      location.href + "&room=" + room + "&role=client&minute=" + minute;

    console.log(link);
    $("#roomShare").val(room);
    $("#linkCondivisione").val(linkClient);
  }
}

$(document).ready(() => {
  var user = Cookies.get("user");
  if (user != "") {
    var wid = $(document).width();
    var user2 = "";
    if (wid < 500) {
      user2 = user.substring(0, 4) + "...";
    } else {
      user2 = user;
    }
    $("#dropdownMenuButton1").append(
      "<img class='profilebar' src='../public/images/Defaultuser.png'><span>" +
        user2.split("@")[0] +
        "</span>"
    );
  }
  if (user == "chiaracorrente19@gmail.com") {
    $("#amo").append(
      '<div style=" text-align: center;" class="alert alert-danger" role="alert"><h4>🧡🧡🧡🧡🧡🧡🧡🧡🧡</h4></div>'
    );
  }
  $.get("/wallpaper?src=" + titolo.split("(")[0].trim(), function (dati) {
    if (dati == "error") {
      return;
    }
    //alert("ciao");
    console.log(titolo);
    var imgLink = $(dati).find(".img-responsive")[0];
    imgLink = $(imgLink).attr("src");

    if ($(dati).find(".img-responsive").hasClass("thumb-desktop")) {
      $("body").css("background-image", "url('" + imgLink + "')");
    } else {
      var server = imgLink.split(".")[0].split("/")[2];
      var id = imgLink.split("-")[1].split(".")[0];
      var typeimg = imgLink.split("-")[1].split(".")[1];

      var o = {
        content_id: id,
        content_type: "wallpaper",
        file_type: typeimg,
        image_server: server,
      };
      console.log(JSON.stringify(o));
      $.post("/wallpaperLink", JSON.stringify(o), function (dati) {
        console.log(dati);
        $("body").css("background-image", "url('" + dati.link + "')");
      });
    }
  });

  if (room != undefined) {
    $("#condivisione").css("display", "block");
  }

  $("#startCondivisione").click(() => {
    var room = $("#roomShare").val();
    location.href = location.href + "&room=" + room + "&role=admin";
  });

  $.get("/getimage?user=" + user.split("@")[0], function (dati) {
    $(".profile").attr("src", dati.src);
    $(".profilebar").attr("src", dati.src);
  });

  $("#closeModal").click(() => {
    $("#exampleModal").modal("hide");
  });

  socket.on("friendarrive", function (dati) {
    if (dati.touser == user) {
      var tst = document.getElementById("liveToast");
      var toast = new bootstrap.Toast(tst);
      toast.show();
    }
  });

  socket.on("connect", function () {
    console.log("Connected to Socket I/O Server!");
    //console.log($("video")[0].currentTime);
    if (room != undefined) {
      socket.emit("joinRoom", {
        room: room,
        user: user,
      });
    }
  });

  socket.on("userdisconnect", function (req) {
    console.log(req);
    $("#UsersList").html("");
    var users = req.filter(function (i) {
      return i.room == room;
    });
    users.forEach((element) => {
      $("#UsersList").append("<span> | " + element.user + " </span>");
    });
    console.log(users, req);
  });

  socket.on("userJoin", function (req) {
    $("#UsersList").html("");
    var users = req.filter(function (i) {
      return i.room == room;
    });
    users.forEach((element) => {
      $("#UsersList").append("<span> | " + element.user + " </span>");
    });
    console.log(users, req);
  });

  $("body").keypress(function (e) {
    var key = e.which;
    console.log($("video"))
    if (document.activeElement.tagName=="VIDEO") {
      var videoplya = $("video")[0];
      console.log(videoplya)
      videoplya.requestFullscreen() 
    }
    if (key == 13) {
      var search = $("#searchbar").val();
      if (search != "") {
        location.href = "/pages/anime.html?src=" + search;
      } else {
        //alert("Parole mancanti");
      }
    }
  });

  $("#search").click(() => {
    var search = $("#searchbar").val();
    if (search != "") {
      location.href = "/pages/anime.html?src=" + search;
    } else {
      alert("Parole mancanti");
    }
  });

  $.get(
    "/lastseen?user=" +
      user +
      "&linkimg=" +
      linkimg +
      "&titolo=" +
      titolo +
      "&link=" +
      link +
      "&episodio=" +
      episodio +
      "&rangeid=" +
      rangeid,
    function (data) {}
  );

  $.get("/getlink?link=" + link, function (data) {
    if ($(data).find("#player")[0] == undefined) {
      $("#NonDisponibile").css("display", "block");
      var info = $(data).find(".widget.info")[0];
      var imgInfo = $(info).find("img")[0];
      imgInfo = $(imgInfo).attr("src");

      var descrizione = $(info).find(".desc").text();
      var column_episode = $(info).find(".meta")[1];
      var totalEpisode = $(column_episode).find("dd")[2].innerHTML;
      var titleInfo =
        $(info).find(".c1 .title").text().toUpperCase() +
        " (" +
        totalEpisode +
        " EP)";
      $(".widget-body").append(
        ' <div class="col-3"><img class="imgInfo" src="' +
          imgInfo +
          '" ></div><div class="col-9"><div style="text-align: center;font-size: 25px;margin-bottom: 10px;"><span >' +
          titleInfo +
          '</span></div><div class="row"> <div class="col-sm"> <div class="trama">' +
          descrizione +
          "</div> </div> </div> </div>"
      );
      var nextep = $(data).find("#next-episode");
      if (nextep[0] != undefined) {
        var giorno = $(nextep).attr("data-calendar-date");
        var ora = $(nextep).attr("data-calendar-time");

        renderCountdown(new Date(), new Date(giorno + " " + ora));
      }
    } else {
      var actualLink = "";
      var tokenid = $(data).find("#player")[0].dataset.id;
      var info = $(data).find(".widget.info")[0];
      var imgInfo = $(info).find("img")[0];
      imgInfo = $(imgInfo).attr("src");
      var descrizione = $(info).find(".desc").text();
      var column_episode = $(info).find(".meta")[1];
      var totalEpisode = $(column_episode).find("dd")[2].innerHTML;
      var titleInfo =
        $(info).find(".c1 .title").text().toUpperCase() +
        " (" +
        totalEpisode +
        " EP)";
      $(".widget-body").append(
        ' <div class="col-3"><img class="imgInfo" src="' +
          imgInfo +
          '" ></div><div class="col-9"><div style="text-align: center;font-size: 25px;margin-bottom: 10px;"><span >' +
          titleInfo +
          '</span></div><div class="row"> <div class="col-sm"> <div class="trama">' +
          descrizione +
          "</div> </div> </div> </div>"
      );
      $.get("/getvideolink?id=" + tokenid, function (dati) {
        var video = dati.grabber;

        if (rangeid == null) {
          rangeid = 0;
        }
        var server = $(data).find(".server[data-name=9]")[0];
        console.log(server, rangeid);
        var episodes = $(server).find(
          ".episodes.range[data-range-id=" + rangeid + "]"
        )[0];
        console.log(episodes);
        episodes = $(episodes).find(".episode");

        var rangeepisodi = $(data).find(".range")[0];
        var rangeepisodilen = $(rangeepisodi).children().length;

        var titolo2 = titolo + " - Episodio " + episodio;
        var wid = $(document).width();
        if (wid > 500) {
          wid = wid / 2;
        } else {
          wid = wid - 20;
        }
        if (params.get("room") != undefined && params.get("role") == "admin") {
          $(".center2").append(
            "<div>" +
              "<h4 style='margin-top:10px'>" +
              titolo2 +
              "</h4>" +
              "<div><button onclick='shareLink()' class='btn btn-sm btn-danger'>Annulla condivisione</button><div>" +
              '<video  style="margin-top:30px;border-radius:10px;border: 2px solid white;" width="' +
              wid +
              '" controls><source src="' +
              video +
              '" type="video/mp4"></video>'
          );
        } else if (
          params.get("room") != undefined &&
          params.get("role") == "client"
        ) {
          $(".center2").append(
            "<div>" +
              "<h4 style='margin-top:10px'>" +
              titolo2 +
              "</h4>" +
              '<video  style="margin-top:30px;border-radius:10px;border: 2px solid white;" width="' +
              wid +
              '" controls><source src="' +
              video +
              '" type="video/mp4"></video>'
          );
        } else {
          $(".center2").append(
            "<div>" +
              "<h4 style='margin-top:10px'>" +
              titolo2 +
              "</h4>" +
              "<div><button onclick='shareLink()' class='btn btn-sm btn-primary'>Avvia condivisione</button><div>" +
              '<video  style="margin-top:30px;border-radius:10px;border: 2px solid white;" width="' +
              wid +
              '" controls><source src="' +
              video +
              '" type="video/mp4"></video><br><button class="btn btn-primary" onclick="$(`video`).width($(`video`).width()-50)" style="margin-right:10px"><i class="fas fa-search-minus"></i></button><button class="btn btn-primary" onclick="$(`video`).width($(`video`).width()+50)"><i class="fa fa-search-plus"></i></button>'
          );
        }

        if (rangeepisodilen > 0) {
          var ranges = $(rangeepisodi).children();
          for (let i = 0; i < ranges.length; i++) {
            const itm = ranges[i];
            var txt = $(itm).text();

            var href = location.href.split("&");
            href =
              href[0] +
              "&" +
              href[1] +
              "&" +
              href[2] +
              "&" +
              href[3] +
              "&rangeid=" +
              $(itm).attr("data-range-id");

            if (rangeid == $(itm).attr("data-range-id")) {
              $(".range").append(
                '<a href="' +
                  href +
                  '" style="margin: 5px;" class="btn btn-sm btn-primary">' +
                  txt +
                  "</a>"
              );
            } else {
              $(".range").append(
                '<a href="' +
                  href +
                  '" style="margin: 5px;" class="btn btn-sm btn-secondary">' +
                  txt +
                  "</a>"
              );
            }
          }
        }
        for (let i = 0; i < episodes.length; i++) {
          const itm = episodes[i];
          var href = $(itm).find("a").attr("href");
          var number = $(itm).find("a").text();

          if (number == episodio) {
            actualLink =
              "guarda.html?link=" +
              href +
              "&episode=" +
              number +
              "&titolo=" +
              titolo +
              "&imglink=" +
              linkimg +
              "&rangeid=" +
              rangeid;
            $(".pagination").append(
              '<li class="page-item"><a style="background-color:cyan;" class="page-link" href="guarda.html?link=' +
                href +
                "&episode=" +
                number +
                "&titolo=" +
                titolo +
                "&imglink=" +
                linkimg +
                "&rangeid=" +
                rangeid +
                '">' +
                number +
                "</a></li>"
            );
          } else {
            $(".pagination").append(
              '<li class="page-item"><a class="page-link" href="guarda.html?link=' +
                href +
                "&episode=" +
                number +
                "&titolo=" +
                titolo +
                "&imglink=" +
                linkimg +
                "&rangeid=" +
                rangeid +
                '">' +
                number +
                "</a></li>"
            );
          }
        }
        var nextep = $(data).find("#next-episode");
        if (nextep[0] != undefined) {
          var giorno = $(nextep).attr("data-calendar-date");
          var ora = $(nextep).attr("data-calendar-time");

          renderCountdown(new Date(), new Date(giorno + " " + ora));
        }
        if (minute == undefined) {
          $.get("/loadminutes?id=" + link + "&user=" + user, function (data) {
            $("video")[0].currentTime = parseFloat(data.minute);
          });
        } else {
          $("video")[0].currentTime = parseFloat(minute);
        }

        setInterval(() => {
          scriviminuto(user);
        }, 10000);

        var ismp4 = video.split(".")[video.split(".").length - 1];
        if (ismp4 != "mp4") {
          location.href = actualLink;
        }
      });
    }
  });
  setTimeout(() => {
    var videoplya = $("video")[0];
    socket.on("playVideo", function (dati) {
      if (role == "client") {
        videoplya.play();
      }
    });

    socket.on("pauseVideo", function (dati) {
      if (role == "client") {
        videoplya.pause();
      }
    });

    socket.on("seekVideo", function (dati) {
      if (role == "client") {
        videoplya.currentTime = dati.time;
        console.log("seeeeek");
        //videoplya.play();
        //videoplya.fastSeek(dati.time);
      }
    });

    videoplya.addEventListener("play", (event) => {
      console.log("play");
      if (role == "admin") {
        socket.emit("playVideo", { room: room });
      }
    });
    videoplya.addEventListener("seeked", (event) => {
      console.log("seek");
      if (role == "admin") {
        socket.emit("seekVideo", { room: room, time: videoplya.currentTime });
      }
    });

    videoplya.addEventListener("pause", (event) => {
      console.log("pause");
      if (role == "admin") {
        socket.emit("pauseVideo", { room: room });
      }
    });
  }, 2000);

  document.addEventListener("fullscreenchange", function () {
    var vid = $("video")[0];
    $(vid).css("border", "0px");
  });
  document.addEventListener("mozfullscreenchange", function () {
    var vid = $("video")[0];
    $(vid).css("border", "0px");
  });
  document.addEventListener("webkitfullscreenchange", function () {
    var vid = $("video")[0];
    if (window.innerHeight == screen.height) {
      $(vid).css("border", "0px");
    } else {
      $(vid).css("border", "2px solid white");
    }
  });
  document.addEventListener("msfullscreenchange", function () {
    var vid = $("video")[0];
    $(vid).css("border", "0px");
  });
});

function scriviminuto(user) {
  try {
    var minute = $("video")[0].currentTime;
    $.get("/writeminutes?id=" + link + "&minute=" + minute + "&user=" + user);
  } catch (error) {
    alert(error);
  }
}
