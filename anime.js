$(document).ready(() => {
  var user=Cookies.get('user')

  if(user!=""){
   $("#dropdownMenuButton1").append("<i class='fa fa-user'></i><span>"+user.split("@")[0]+"</span>")
  }

  

  const params = new URLSearchParams(window.location.search);
  var src = params.get("src");
  if (src == null) {
    src = "";
  }
  $("#searchbar").val(src);

  $.get("/lastseenget?user="+user,function(dati){
    if(dati.length>0){

      dati.forEach(itm => {
        var title=itm.titolo
        console.log(itm.titolo.length)
        if (itm.titolo.length >= 26) {
           title = itm.titolo.substring(0, 19) + "...";
        }
      var titolofull=title+" - Ep."+itm.episodio
    
      $(".center2").append(
        '<a href="/guarda.html?link=' +
        itm.animelink +
      '&episode='+itm.episodio+'&titolo='+itm.titolo+'&img='+itm.imglink+'">' +
      '<div class="poster">' +
      '<img title="' +
      itm.titolo +
      '" class="imgposter" src="' +
      itm.imglink +
      '">' +
      titolofull +
      "</div>" +
      "</a>")
      });
      
    }
  })

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
          title = title.substring(0, 22) + "...";
        }
        $(".center").append(
          '<a href="/guarda.html?link=' +
            href +
            '&episode=1&titolo='+fulltitle+'&img='+img+'">' +
            '<div class="poster">' +
            '<img title="' +
            fulltitle +
            '" class="imgposter" src="' +
            img +
            '">' +
            title +
            "</div>" +
            "</a>"
        );
      }
    }
  });

  $("body").keypress(function (e) {
    var key = e.which;
    console.log("aaa");
    if (key == 13) {
      var search = $("#searchbar").val();
      if (search != "") {
        location.href = "http://localhost:3000/anime.html?src=" + search;
      } else {
        alert("Parole mancanti");
      }
    }
  });

  $("#search").click(() => {
    var search = $("#searchbar").val();
    if (search != "") {
      location.href = "http://localhost:3000/anime.html?src=" + search;
    } else {
      alert("Parole mancanti");
    }
  });
});
