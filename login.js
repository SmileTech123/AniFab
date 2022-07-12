$(document).ready(() => {
  const params = new URLSearchParams(window.location.search);
  var newuser = params.get("newuser");
  var disconn = params.get("disconn");
  var user = undefined;

  if (newuser != null) {
    $("#logbtn").text("Registrati");
    $("#logbtn").attr("tipo", "registrazione");
    $("#remember").remove();
    $("#labelreg").html(
      'Hai un account? <a href="/login.html" class="ml-2">Accedi</a>'
    );
  }
  if (disconn != null) {
    Cookies.remove("user");
    user = Cookies.get("user");
  } else {
    user = Cookies.get("user");
  }
  if (user != undefined) {
    location.href = "/anime.html";
  }

  $("#vispass").click(() => {
    var vis = $("#vispass").attr("vis");
    if (vis == "si") {
      $("#vispass").html('<i class="fa fa-eye"></i>');
      $("#vispass").attr("vis", "no");
      $("#pass").attr("type", "password");
    } else {
      $("#vispass").html('<i class="fa fa-eye-slash"></i>');
      $("#vispass").attr("vis", "si");
      $("#pass").attr("type", "text");
    }
  });
  $("#logbtn").click(() => {
    var tipo = $("#logbtn").attr("tipo");
    var user = $("#user").val();
    var pass = $("#pass").val();

    if (user == "" || pass == "") {
      $("#al").addClass("alert-danger");
      $("#al").css("display", "block");
      $("#al").text("Utente o password vuoti");
      return;
    }
    if (!emailIsValid(user)) {
      $("#al").addClass("alert-danger");
      $("#al").css("display", "block");
      $("#al").text("Email non valida");
      return;
    }

    if (tipo == "login") {
      $.get("/loguser?user=" + user + "&pass=" + pass, function (dati) {
        if (dati.auth) {
          // document.cookie = "username="+user;
          // document.cookie = "password="+pass;
          var chk = $("#customControlInline").prop("checked");
          if (chk) {
            Cookies.set("user", user, { expires: 999 });
          } else {
            Cookies.set("user", user);
          }
          //

          location.href = "/anime.html";
        } else {
          $("#al").addClass("alert-danger");
          $("#al").css("display", "block");
          $("#al").text("Errore utente errato o non trovato");
        }
      });
    } else {
      $.get("/reguser?user=" + user + "&pass=" + pass, function (dati) {
        if (dati.reg) {
          $("#al").removeClass("alert-danger");
          $("#al").addClass("alert-success");
          $("#al").css("display", "block");
          $("#al").text("Registrazione avvenuta con successo!");
          //alert("Registrazione avvenuta con successo")
          setTimeout(function () {
            location.href = "/login.html";
          }, 1500);
        } else {
          $("#al").addClass("alert-danger");
          $("#al").css("display", "block");
          $("#al").text("Errore registrazione");
          //alert("Errore registrazione non riuscita")
        }
      });
    }
  });
});

function emailIsValid(email) {
  return /\S+@\S+\.\S+/.test(email);
}
