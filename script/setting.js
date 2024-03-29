

function readURL(input, user, fulluser) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      $(".profile").attr("src", e.target.result);
      var obj = {
        filename: user,
        file: e.target.result,
        user: fulluser,
      };
      $.post("/writeimage", obj, function (dati) {});
    };

    reader.readAsDataURL(input.files[0]);
  }
}

$(document).ready(() => {
  const params = new URLSearchParams(window.location.search);
  var page = params.get("page");
  var user = Cookies.get("user");
  if (page == null) {
    page = 1;
  }
  console.log(user)
  if (user != "" && user != undefined) {
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
  }else{
    location.href ="/pages/login.html?tvcode=si"
  }

  $("#image").change(function () {
    readURL(this, user.split("@")[0], user);
  });
  $.get("/getimage?user=" + user.split("@")[0], function (dati) {
    $(".profile").attr("src", dati.src);
    $(".profilebar").attr("src", dati.src);
  });

  $.get("/setting?user=" + user, function (dati) {
    dati = JSON.parse(dati);
    console.log(dati.tvcode)

    console.log(params)
    if(params.get("tvcode")=="si"){
      var codetv=""
      if(dati.tvcode==undefined){
        var code=Math.floor(100000 + Math.random() * 900000)
        var sett = { intro: dati.intro,tvcode:code };
        sett = JSON.stringify(sett);
        $.get("/writesetting?user=" + user + "&sett=" + sett, function (dati) {});
       codetv=code
      }else{
        codetv=dati.tvcode
      }
      $(".itemsett").css("display","none")
      $(".footer").css("display","none")
      $(".sett").append(
        '<div class="itemsett">' +
        "<label>Codice TV</label>" +
        "<div><h2><b>"+codetv+"</b></h2></div>" +
        '</div>'
      )
      
    }else{
      if (dati.intro == "S") {
        $(".sett").append(
          '<div class="itemsett">' +
            "<label>Visualizza Intro iniziale</label>" +
            "<br>" +
            '<div class="form-check">' +
            '<input value="S" class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" checked>' +
            '<label class="form-check-label" for="flexRadioDefault1">' +
            "Si" +
            "</label>" +
            "</div>" +
            '<div class="form-check">' +
            '<input value="N" class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" >' +
            '<label class="form-check-label" for="flexRadioDefault2">' +
            "No" +
            "</label>" +
            "</div>" +
            "</div>" +
            "<br>"
        );
      } else {
        $(".sett").append(
          '<div class="itemsett">' +
            "<label>Visualizza Intro iniziale</label>" +
            "<br>" +
            '<div class="form-check">' +
            '<input value="S" class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" >' +
            '<label class="form-check-label" for="flexRadioDefault1">' +
            "Si" +
            "</label>" +
            "</div>" +
            '<div class="form-check">' +
            '<input value="N" class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" checked>' +
            '<label class="form-check-label" for="flexRadioDefault2">' +
            "No" +
            "</label>" +
            "</div>" +
            "</div>" +
            "<br>"
        );
      }
      if (user == "chiaracorrente19@gmail.com") {
        $(".sett").append(
          '<div class="itemsett">' + "<h4>Ti amo 🧡</h4>" + "</div>" + "<br>"
        );
      }
    }

  });

  $.get("/animelook?user=" + user, function (dati) {
    var secondi = 0;
    var anime = [];
    dati.forEach((itm) => {
      secondi = secondi + parseFloat(itm.minute);
      var act = itm.id.split("/")[2];
      if (!anime.includes(act)) {
        anime.push(act);
      }
    });
    var totdata = secondsToDhms(secondi);

    $("#animelook").html(
      "<label>Totale anime guardati</label><h4>Hai guardato <b>" +
        anime.length +
        "</b> anime per un totale di <b>" +
        totdata +
        "</b></h4>"
    );
  });

  $.get("/managelastseen?user=" + user + "&page=" + page, function (dati) {
    $("#tablebody").html("");
    dati.righe.forEach((itm) => {
      $("#tablebody").append(
        '<tr id="id-' +
          itm.Data +
          '"><th scope="row">' +
          itm.titolo +
          "</th><td>" +
          itm.episodio +
          "</td><td>" +
          "<button onclick=elimina(" +
          itm.Data +
          ',"' +
          user +
          '") class="btn btn-sm btn-danger">Elimina</button></td></tr>'
      );
    });

    for (let i = 0; i < dati.totpagine; i++) {
      if (page == i + 1) {
        $(".pagination").append(
          '<li class="page-item"><a style="background-color:cyan;" class="page-link" href="setting.html?page=' +
            (i + 1) +
            '">' +
            (i + 1) +
            "</a></li>"
        );
      } else {
        $(".pagination").append(
          '<li class="page-item"><a class="page-link" href="setting.html?page=' +
            (i + 1) +
            '">' +
            (i + 1) +
            "</a></li>"
        );
      }
    }
  });

  $("#salva").click(() => {
    var value = $("input[name=flexRadioDefault]:checked").val();
    //var tvcode = $("#tvcode").val()
    var sett = { intro: value };
    sett = JSON.stringify(sett);
    $.get("/writesetting?user=" + user + "&sett=" + sett, function (dati) {});
  });
});
function elimina(id, user) {
  $.get("/eliminalastseen?user=" + user + "&id=" + id, function (dati) {});
  $("#id-" + id).remove();
}

function secondsToDhms(seconds) {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor((seconds % (3600 * 24)) / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor(seconds % 60);

  var dDisplay = d > 0 ? d + (d == 1 ? " giorno " : " giorni ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " ora " : " ore ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minuto " : " minuti ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " secondo" : " secondi") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}
