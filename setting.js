$(document).ready(() => {
  const params = new URLSearchParams(window.location.search);
  var page = params.get("page");
  var user = Cookies.get("user");
  if (page == null) {
    page = 1;
  }

  if (user != "") {
    var wid = $(document).width();
    var user2 = "";
    if (wid < 500) {
      user2 = user.substring(0, 4) + "...";
    } else {
      user2 = user;
    }
    $("#dropdownMenuButton1").append(
      "<i class='fa fa-user'></i><span>" + user2.split("@")[0] + "</span>"
    );
  }
  console.log(user);
  $.get("/setting?user=" + user, function (dati) {
    dati = JSON.parse(dati);
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
          "<br></br>"
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
          "<br></br>"
      );
    }
  });

  $.get("/managelastseen?user=" + user + "&page=" + page, function (dati) {
    console.log(dati);
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
    console.log(dati);
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

    var sett = { intro: value };
    sett = JSON.stringify(sett);
    $.get("/writesetting?user=" + user + "&sett=" + sett, function (dati) {});
  });
});
function elimina(id, user) {
  $.get("/eliminalastseen?user=" + user + "&id=" + id, function (dati) {});
  $("#id-" + id).remove();
}
