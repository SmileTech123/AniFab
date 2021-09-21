$(document).ready(()=>{
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
      "<i class='fa fa-user'></i><span>" + user2.split("@")[0] + "</span>"
    );
  }
    console.log(user)
    $.get("/setting?user="+user,function(dati){
        dati=JSON.parse(dati)
        if(dati.intro=="S"){
            $(".sett").append('<div class="itemsett">'+
            '<label>Visualizza Intro iniziale</label>'+
            '<br>'+
            '<div class="form-check">'+
                '<input value="S" class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" checked>'+
                '<label class="form-check-label" for="flexRadioDefault1">'+
                  'Si'+
                '</label>'+
              '</div>'+
              '<div class="form-check">'+
                '<input value="N" class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" >'+
                '<label class="form-check-label" for="flexRadioDefault2">'+
                  'No'+
               '</label>'+
              '</div>'+
        '</div>'  +
        '<br></br>')
        }else{
            $(".sett").append('<div class="itemsett">'+
            '<label>Visualizza Intro iniziale</label>'+
            '<br>'+
            '<div class="form-check">'+
                '<input value="S" class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" >'+
                '<label class="form-check-label" for="flexRadioDefault1">'+
                  'Si'+
                '</label>'+
              '</div>'+
              '<div class="form-check">'+
                '<input value="N" class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" checked>'+
                '<label class="form-check-label" for="flexRadioDefault2">'+
                  'No'+
               '</label>'+
              '</div>'+
        '</div>'  +
        '<br></br>')
        }
    })

    $("#salva").click(()=>{
        var value=$('input[name=flexRadioDefault]:checked').val()

        var sett={"intro":value}
        sett=JSON.stringify(sett)
        $.get("/writesetting?user="+user+"&sett="+sett,function(dati){

        })
    })
})