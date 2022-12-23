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
    $.get("/getimage?user=" + user.split("@")[0], function (dati) {
      $(".profile").attr("src", dati.src);
      $(".profilebar").attr("src", dati.src);
    });
  }
  $.get("/getfriendsreq?user=" + user, function (dati) {
    dati.forEach((itm) => {
      $("#reqlist").append(
        '<div class="friend">' +
          '<img class="friendimg" src="' +
          itm.icon +
          '">' +
          "<h5>" +
          itm.user.split("@")[0] +
          "</h5>" +
          "<button onclick=updatereq(false,'" +
          itm.user +
          "','" +
          user +
          "') style='margin-right: 10px;' class='btn btn-danger'>Rifiuta</button>" +
          "<button onclick=updatereq(true,'" +
          itm.user +
          "','" +
          user +
          "') class='btn btn-success'>Accetta</button>" +
          "</div>"
      );
    });
  });

  $.get("/getfriends?user=" + user, function (dati) {
    dati.forEach((itm) => {
      var src = $(".profilebar").attr("src");
      if (itm.type == "accepted") {
        $("#friendlst").append(
          '<div class="friend">' +
            '<img class="friendimg" src="' +
            itm.icon +
            '">' +
            "<h5>" +
            itm.touser.split("@")[0] +
            "</h5>" +
            "</div>"
        );
      } else {
        $("#friendlst").append(
          '<div class="friend">' +
            '<img class="friendimg" src="' +
            itm.icon +
            '">' +
            "<h5>" +
            itm.touser.split("@")[0] +
            "</h5>" +
            "<label style='color:red'>Richiesta inviata</label>" +
            "</div>"
        );
      }
    });
  });
});

function updatereq(accept, user, touser) {
  var type = "";
  if (accept) {
    type = "accepted";
  } else {
    type = "close";
  }
  $.get(
    "/updatefriendrequest?user=" + user + "&type=" + type + "&touser=" + touser,
    function (data) {}
  );
  location.reload();
}
