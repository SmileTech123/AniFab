$(document).ready(() => {
  var user = Cookies.get("user");
  var socket = io();

  //socket.emit("friendRequest", { nome: "Fabio" });
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

  const params = new URLSearchParams(window.location.search);
  var src = params.get("src");
  if (src == null) {
    src = "";
    $.get("/lastseenget?user=" + user, function (dati) {
      if (dati.length > 0) {
        dati.forEach((itm) => {
          var title = itm.titolo;

          if (itm.titolo.length >= 26) {
            //title = itm.titolo.substring(0, 19) + "...";
          }
          var titolofull = title + " - Ep." + itm.episodio;

          $(".center2").append(
            "<div class='inner'>" +
              '<a href="/guarda.html?link=' +
              itm.animelink +
              "&episode=" +
              itm.episodio +
              "&titolo=" +
              itm.titolo +
              "&img=" +
              itm.imglink +
              "&rangeid=" +
              itm.rangeid +
              '">' +
              '<div class="poster">' +
              '<img title="' +
              itm.titolo +
              '" class="imgposter" src="' +
              itm.imglink +
              '">' +
              "</div>" +
              "</a>" +
              "</a>" +
              "<a style='display: block;'>" +
              titolofull +
              "</a></div>"
          );
        });
      }
    });
  } else {
    $("#inc").text("Risultati per: " + src);
    $("#lst").text("");
  }
  $("#searchbar").val(src);

  $.get("/getimage?user=" + user.split("@")[0], function (dati) {
    $(".profile").attr("src", dati.src);
    $(".profilebar").attr("src", dati.src);
  });

  $.get("/calendario", function (data) {
    var lista = $(data).find(".widget-body");
    var giorni = $(lista).find(".calendario-aw");

    var eventi = [];
    var data = new Date();
    var dayofWeek = data.getDay() - 1;
    var giorno = data.getDate() - dayofWeek;
    giorno = "0" + giorno;
    var mese = data.getMonth() + 1;
    mese = "0" + mese;
    var primadata =
      data.getFullYear() + "-" + mese.substr(-2) + "-" + giorno.substr(-2);

    for (let index = 0; index < giorni.length - 1; index++) {
      const itm = giorni[index];

      var box = $(itm).find(".boxcalendario");
      for (let index2 = 0; index2 < box.length; index2++) {
        const element = box[index2];
        var orario = $(element)
          .find(".hour")
          .text()
          .replace("Trasmesso alle", "")
          .trim();
        var titolo = $(element).find(".name").text().trim();
        var episodio = $(element).find(".episodio-calendario").text().trim();

        var obj = {
          title: titolo + " (" + episodio + ")",
          start: primadata + "T" + orario + ":00",
        };
        eventi.push(obj);
      }
      var giorno = data.getDate() - dayofWeek;
      giorno = giorno + (index + 1);
      giorno = "0" + giorno;
      primadata =
        data.getFullYear() + "-" + mese.substr(-2) + "-" + giorno.substr(-2);
    }

    var calendarEl = document.getElementById("calendar");
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "listWeek",
      locale: "it",
      events: eventi,
    });
    calendar.render();
  });

  $.get("/homepage?src=" + src, function (data) {
    var lista = $(data).find(".film-list");

    lista = $(lista).find(".item");
    if (lista.length == 0) {
      $(".center").append("<h3>Nessun risultato</h3>");
    } else {
      for (let i = 0; i < lista.length; i++) {
        const itm = lista[i];
        var href = $(itm).find(".inner").find("a.poster").attr("href");
        var img = $(itm)
          .find(".inner")
          .find("a.poster")
          .find("img")
          .attr("src");
        var title = $(itm).find(".inner").find("a.name").text();
        var fulltitle = $(itm).find(".inner").find("a.name").text();
        if (title.length >= 26) {
          // title = title.substring(0, 22) + "...";
        }
        $(".owl-carousel").append(
          "<div class='item'>" +
            "<div class='inner'>" +
            '<a href="/guarda.html?link=' +
            href +
            "&episode=1&titolo=" +
            fulltitle +
            "&img=" +
            img +
            '&rangeid=0">' +
            '<div class="poster">' +
            '<img title="' +
            fulltitle +
            '" class="imgposter" src="' +
            img +
            '">' +
            "</div>" +
            "</a>" +
            "<a style='display: block;'>" +
            title +
            "</a></div></div>"
        );
      }
    }
    $(".owl-carousel").owlCarousel({
      loop: true,
      margin: 10,
      nav: true,
      responsive: {
        0: {
          items: 3,
        },
        600: {
          items: 2,
        },
        1000: {
          items: 3,
        },
        1500: {
          items: 5,
        },
        2000: {
          items: 10,
        },
      },
    });
  });

  socket.on("friendarrive", function (dati) {
    if (dati.touser == user) {
      var tst = document.getElementById("liveToast");
      var toast = new bootstrap.Toast(tst);
      toast.show();
    }
  });

  $.get("/getfriendsreq?user=" + user, function (dati) {
    if (dati.length > 0) {
      var tst = document.getElementById("liveToast");
      var toast = new bootstrap.Toast(tst);
      toast.show();
    }
  });

  $("body").keypress(function (e) {
    var key = e.which;

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

  $("#searchbar").on("input", function () {
    var search = $("#searchbar").val();
    $(".sugg").html("");
    if (search.length >= 3) {
      $.get("/instsearch?src=" + search, function (dati) {
        for (let i = 0; i < dati.results.length; i++) {
          const itm = dati.results[i];
          $(".sugg").append(
            '<a style="color:black!important" href="/anime.html?src=' +
              itm.title +
              '"><div class="itmsugg"><img style="height:70px" src="' +
              itm.image_url +
              '" width="50" ><label style="display: inline-block;position: absolute;">' +
              itm.title +
              "</label></div></a>"
          );
        }
      });
    }
  });
});
