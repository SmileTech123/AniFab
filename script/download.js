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
        "<img class='profilebar' src='../public/images/Defaultuser.png'><span>" +
          user2.split("@")[0] +
          "</span>"
      );
      $.get("/getimage?user=" + user.split("@")[0], function (dati) {
        $(".profile").attr("src", dati.src);
        $(".profilebar").attr("src", dati.src);
      });
    }
  
})