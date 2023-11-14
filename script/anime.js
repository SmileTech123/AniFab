$(document).ready(() => {
  var user = "";
  const params = new URLSearchParams(window.location.search);
  if (params.get("gasso") != null) {
    user = params.get("gasso");
  } else {
    user = Cookies.get("user");
  }

  var socket = io();
  let agent = navigator.userAgent;
  console.log(agent.includes("Electron"));
  if (!agent.includes("Electron") && !agent.includes("Android")) {
    $("#downloadAnifab").css("display", "block");
  }

  if (user == "chiaracorrente19@gmail.com") {
    $("#downloadPhrase").html(
      "<h4>Benvenuta su Anifab Megagnocca, Ti amo tanto 🧡</h4>"
    );
    $("#downloadPhrase").attr("href", "../public/images/amo.png");
    $("#downloadAnifab").removeClass("alert-primary");
    $("#downloadAnifab").addClass("alert-danger");
    $("#downloadAnifab").css("display", "block");
  }
  //socket.emit("friendRequest", { nome: "Fabio" });
  if (user != "") {
    var wid = $(document).width();
    var user2 = "";
    var srcStyle=""
    if (wid < 500) {
      $("#logobar").css("margin-left","calc(50% - 100px)")
      srcStyle=
          '        <button data-bs-toggle="modal" data-bs-target="#exampleModal" id="lunchmodal" class="btn btn-primary" type="button">\n' +
          '        <i class="fa fa-search"></i>  \n' +
          '        </button>'
      user2 = user
    } else {
      srcStyle='        <input\n' +
          '                autocomplete="off"\n' +
          '                class="custom-form-control"\n' +
          '                type="search"\n' +
          '                placeholder="Cerca"\n' +
          '                aria-label="Search"\n' +
          '                id="searchbar"\n' +
          '        />\n' +
          '        <button id="search" class="btn btn-primary" type="button">\n' +
          '          Cerca\n' +
          '        </button>'
      user2 = user;
    }
    $("#srcWeb").append(srcStyle)
    $("#dropdownMenuButton1").append(
      "<img class='profilebar' src='../public/images/Defaultuser.png'><span>" +
        user2.split("@")[0] +
        "</span>"
    );
  }

  // $.get("/carosello", function (dati) {
  //   for (
  //     let index = 0;
  //     index < $(dati).find("#swiper-container").find(".swiper-slide").length;
  //     index++
  //   ) {
  //     const itm = $(dati).find("#swiper-container").find(".swiper-slide")[
  //       index
  //     ];
  //     var titolo = $(itm).find(".info").find(".name").attr("title");
  //     var href = $(itm).find(".info").find(".name").attr("href");
  //     var descrizione = $(itm).find(".info").find("p").html();

  //     var img = $(itm)
  //       .attr("style")
  //       .replace("background-image: url(", "")
  //       .replace(")", "");
  //     console.log(titolo, href, img, descrizione);
  //     if (index == 0) {
  //       $(".carousel-inner").append(
  //         '<div class="carousel-item active"><img class="carouselImage"  src="' +
  //           img +
  //           '" class="d-block w-100" alt="..."> <div style="-webkit-text-stroke: 0.2px black;background-color: rgb(19, 104, 201); border: 1px solid black;border-radius: 10px;" class="carousel-caption d-none d-md-block"><h1 >' +
  //           titolo +
  //           "</h1> <p style='font-size:15px'>" +
  //           descrizione +
  //           "</p></div></div>"
  //       );
  //     } else {
  //       $(".carousel-inner").append(
  //         '<div class="carousel-item"><img class="carouselImage" src="' +
  //           img +
  //           '" class="d-block w-100" alt="..."> <div style="-webkit-text-stroke: 0.2px black;background-color: rgb(19, 104, 201); border: 1px solid black;border-radius: 10px;" class="carousel-caption d-none d-md-block"><h1 >' +
  //           titolo +
  //           "</h1> <p style='font-size:15px'>" +
  //           descrizione +
  //           "</p></div></div>"
  //       );
  //     }
  //   }
  //   setTimeout(() => {
  //     var myCarousel = document.querySelector("#myCarousel");
  //     var carousel = new bootstrap.Carousel(myCarousel, {
  //       interval: 5000,
  //     });
  //   }, 1000);
  // });

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
          $(".owl-carousel2").append(
            "<div class='item'>" +
              "<div class='inner'>" +
              '<a href="/pages/guarda.html?link=' +
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
              "<a  class='badge  titleAnime' >" +
              title +
              "</a>"+
              "<a class='badge titleAnime'>Ep. "+itm.episodio+"</a>"+

              "</div>" +
              "</a>" +
              "</a>" +
              "</div></div>"
          );
        });
        $(".owl-carousel2").owlCarousel({
          loop: dati.length > 3,
          center: true,
          margin: 10,
          nav: true,
          responsive: {
            0: {
              items: 2,
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
            '<a href="/pages/guarda.html?link=' +
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
            "<a style='background-color: rgb(0 0 0 / 25%)!important;' class='badge bg-primary titleAnime'>" +
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
          items: 2,
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

  $("#searchbar").on("input", function () {
    var search = $("#searchbar").val();
    $(".sugg").html("");
    if (search.length >= 3) {
      $.get("/instsearch?src=" + search, function (dati) {
        for (let i = 0; i < dati.results.length; i++) {
          const itm = dati.results[i];
          $(".sugg").append(
            '<a style="color:black!important" href="/pages/anime.html?src=' +
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
