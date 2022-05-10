var socket = io();
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
    $.get("/getimage?user=" + user.split("@")[0], function (dati) {
      $(".profile").attr("src", dati.src);
      $(".profilebar").attr("src", dati.src);
    });
  }
  $("#basic-addon2").on("click", function () {
    var srcus = $("#srcus").val();
    $.get("/srcuser?user=" + srcus + "&touser=" + user, function (dati) {
      $("#qua").html("");

      dati.users.forEach((itm) => {
        switch (itm.type) {
          case "P":
            $("#qua").append(
              '<div class="friend">' +
                '<img class="friendimg" src="' +
                itm.icon +
                '">' +
                "<h5>" +
                itm.user.split("@")[0] +
                "</h5>" +
                `<button disabled onclick="inviareq('` +
                user +
                `','` +
                itm.user +
                `',event)" style="margin-right: 10px;" class="btn btn-success">Richiesta inviata</button>` +
                "</div>"
            );
            break;
          case "A":
            $("#qua").append(
              '<div class="friend">' +
                '<img class="friendimg" src="' +
                itm.icon +
                '">' +
                "<h5>" +
                itm.user.split("@")[0] +
                "</h5>" +
                `<button disabled onclick="inviareq('` +
                user +
                `','` +
                itm.user +
                `',event)" style="margin-right: 10px;" class="btn btn-success">Già amici</button>` +
                "</div>"
            );
            break;
          case "R":
            $("#qua").append(
              '<div class="friend">' +
                '<img class="friendimg" src="' +
                itm.icon +
                '">' +
                "<h5>" +
                itm.user.split("@")[0] +
                "</h5>" +
                `<button onclick="inviareq('` +
                user +
                `','` +
                itm.user +
                `',event)" style="margin-right: 10px;" class="btn btn-success">Invia</button>` +
                "</div>"
            );
            break;
        }
      });
    });
  });
});

function inviareq(user, touser, e) {
  $(e.currentTarget).text("Richiesta inviata");
  $(e.currentTarget).attr("disabled", "true");
  $.get("/inviareq?user=" + user + "&touser=" + touser, function (dati) {});
  socket.emit("friendRequest", { user: user, touser: touser });
}
