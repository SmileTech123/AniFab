const params = new URLSearchParams(window.location.search);
var link = params.get("link");
var episodio = params.get("episode");
var linkimg = params.get("img");
var titolo = params.get("titolo");


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
    console.log();
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
  var user=Cookies.get('user')
  if(user!=""){
    var wid=$(document).width()
    var user2=""
     if(wid<500){
   
      user2=user.substring(0,4)+"..."
     }else{
      user2=user
     }
   $("#dropdownMenuButton1").append("<i class='fa fa-user'></i><span>"+user2.split("@")[0]+"</span>")
  }

  
  $("body").keypress(function (e) {
    var key = e.which;
    console.log("aaa");
    if (key == 13) {
      var search = $("#searchbar").val();
      if (search != "") {
        location.href = "https://AniFab.fabiogerman.repl.co/anime.html?src=" + search;
      } else {
        alert("Parole mancanti");
      }
    }
  });

  $("#search").click(() => {
    var search = $("#searchbar").val();
    if (search != "") {
      location.href = "https://AniFab.fabiogerman.repl.co/anime.html?src=" + search;
    } else {
      alert("Parole mancanti");
    }
  });

  $.get("/lastseen?user="+user+"&linkimg="+linkimg+"&titolo="+titolo+"&link="+link+"&episodio="+episodio,function(data){
    console.log(data)
        console.log("/lastseen?user="+user+"&linkimg="+linkimg+"&titolo="+titolo+"&link="+link+"&episodio="+episodio)
  })

  $.get("/getlink?link=" + link, function (data) {
    var video = $(data).find("#alternativeDownloadLink").attr("href");
    var episodes = $(data).find(".episodes.range.active")[0];
    episodes = $(episodes).find(".episode");

   var titolo2 = titolo+ " - Episodio " + episodio;
    var wid=$(document).width()
    if(wid>500){
      wid=wid/2
    }else{
      wid=wid-20
    }
  

    $(".center2").append(
      "<div>" +
        "<h4 style='margin-top:10px'>" +
        titolo2 +
        "</h4>" +
        '<video  style="margin-top:30px" width="'+ wid +'" controls><source src="' +
        video +
        '" type="video/mp4"></video>'
    );
    for (let i = 0; i < episodes.length; i++) {
      const itm = episodes[i];
      var href = $(itm).find("a").attr("href");
      var number = $(itm).find("a").text();
    
      if(number==episodio){
        $(".pagination").append(
          '<li class="page-item"><a style="background-color:cyan;" class="page-link" href="guarda.html?link=' +href +'&episode=' +number +'&titolo='+titolo+'&imglink='+linkimg+'">'+number+'</a></li>'
        );
      }else{
        $(".pagination").append(
          '<li class="page-item"><a class="page-link" href="guarda.html?link=' +href +'&episode=' +number +'&titolo='+titolo+'&imglink='+linkimg+'">'+number+'</a></li>'
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
    $.get("/loadminutes?id=" + link+"&user="+user, function (data) {
     
      console.log(data);
      $("video")[0].currentTime = parseFloat(data.minute);
    });
   
    setInterval(() => {
      scriviminuto(user)
    }, 10000);
 
  
 
  });
});

function scriviminuto(user){
  try {
    var minute = $("video")[0].currentTime;
    $.get("/writeminutes?id=" + link + "&minute=" + minute+"&user="+user);
  } catch (error) {
   alert(error) 
  }

}




