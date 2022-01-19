const params = new URLSearchParams(window.location.search);
var link = params.get("link");
var episodio = params.get("episode");
var linkimg = params.get("img");
var titolo = params.get("titolo");
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
      '<div style=" text-align: center;" class="alert alert-warning" role="alert">' +
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
      "<img class='profilebar' src='public/images/Defaultuser.png'><span>" +
        user2.split("@")[0] +
        "</span>"
    );
  }

  $.get("/getimage?user=" + user.split("@")[0], function (dati) {
    $(".profile").attr("src", dati.src);
    $(".profilebar").attr("src", dati.src);
  });

  socket.on("friendarrive", function (dati) {
    console.log(dati);
    if (dati.touser == user) {
      var tst = document.getElementById("liveToast");
      var toast = new bootstrap.Toast(tst);
      toast.show();
    }
  });

  $("body").keypress(function (e) {
    var key = e.which;
    console.log("aaa");
    if (key == 13) {
      var search = $("#searchbar").val();
      if (search != "") {
        location.href = "/anime.html?src=" + search;
      } else {
        alert("Parole mancanti");
      }
    }
  });

  $("#search").click(() => {
    var search = $("#searchbar").val();
    if (search != "") {
      location.href = "/anime.html?src=" + search;
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
    function (data) {
      console.log(data);
      console.log(
        "/lastseen?user=" +
          user +
          "&linkimg=" +
          linkimg +
          "&titolo=" +
          titolo +
          "&link=" +
          link +
          "&episodio=" +
          episodio
      );
    }
  );

  $.get("/getlink?link=" + link, function (data) {
    var video = $(data).find("#alternativeDownloadLink").attr("href");
    if(video==""){
 
      var tokenhtml = $(data).find('head').prevObject[36];
      console.log($(tokenhtml).attr("content"))
      var episodeid=$(data).find("#player").attr("data-episode-id")
      var token=$(tokenhtml).attr("content")
      if(titolo=="L'attacco dei Giganti 4 Parte 2"){
  
        var epaot="0"+episodio
        epaot = epaot.substr(-2)
        video="https://server16.streamingaw.online/DDL/ANIME/ShingekiNoKyojin4Part2SUBITA/ShingekiNoKyojin4Part2_Ep_"+epaot+"_SUB_ITA.mp4"
      }else{
        console.log("no" +titolo)
      }
      //  $.get("/getlinksAlternative?episodeid="+episodeid+"&token="+token,function(data){
      //    alert("ciaoo")
      //     console.log(data)
      //  })

    }
    if (rangeid == null) {
      rangeid = 0;
    }
    var episodes = $(data).find(
      ".episodes.range[data-range-id=" + rangeid + "]"
    )[0];
    episodes = $(episodes).find(".episode");
    console.log(episodes);

    var rangeepisodi = $(data).find(".range")[0];
    var rangeepisodilen = $(rangeepisodi).children().length;

    var titolo2 = titolo + " - Episodio " + episodio;
    var wid = $(document).width();
    if (wid > 500) {
      wid = wid / 2;
    } else {
      wid = wid - 20;
    }

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
        console.log(href);
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
      console.log(giorno, ora);
      renderCountdown(new Date(), new Date(giorno + " " + ora));
    }
    $("body").click(() => {
      console.log();
    });
    $.get("/loadminutes?id=" + link + "&user=" + user, function (data) {
      console.log(data);
      $("video")[0].currentTime = parseFloat(data.minute);
    });

    setInterval(() => {
      scriviminuto(user);
    }, 10000);
  });
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
