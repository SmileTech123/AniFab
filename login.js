$(document).ready(()=>{
    const params = new URLSearchParams(window.location.search);
    var newuser = params.get("newuser");
    var disconn = params.get("disconn");
    var user=undefined
    console.log(user)
    if(newuser!=null){
        $("#logbtn").text("Registrati")
        $("#logbtn").attr("tipo","registrazione")
    }
    if(disconn!=null){
        Cookies.remove("user")
        user=Cookies.get('user')
    }else{
        user=Cookies.get('user')
    }
    if(user!=undefined){
        location.href="https://AniFab.fabiogerman.repl.co/anime.html"
    }
    $("#logbtn").click(()=>{
        var tipo= $("#logbtn").attr("tipo")
        var user= $("#user").val()
        var pass=$("#pass").val()
        console.log(user,pass)
        if(user == "" || pass == ""){
                  $("#al").addClass("alert-danger")
                      $("#al").css("display","block")
                          $("#al").text("Utente o password vuoti")
            return
        }
        if(!emailIsValid(user)){
                  $("#al").addClass("alert-danger")
                      $("#al").css("display","block")
                          $("#al").text("Email non valida")
            return
        }

        if(tipo=="login"){
            $.get("/loguser?user="+user+"&pass="+pass,function(dati){
                console.log(dati)
                if(dati.auth){
                    // document.cookie = "username="+user;
                    // document.cookie = "password="+pass;
                    var chk=$("#customControlInline").prop("checked")
                    if(chk){
                        Cookies.set('user', user,{ expires: 999 })
                    }else{
                        Cookies.set('user', user)
                    }
                   // 
                    
                
                    location.href="https://AniFab.fabiogerman.repl.co/anime.html"
                }else{
                    $("#al").addClass("alert-danger")
                      $("#al").css("display","block")
                          $("#al").text("Errore utente errato o non trovato")
                    
                }
            })
        }else{
            $.get("/reguser?user="+user+"&pass="+pass,function(dati){
                if(dati.reg){
                   $("#al").removeClass("alert-danger")
                  $("#al").addClass("alert-success")
                      $("#al").css("display","block")
                          $("#al").text("Registrazione avvenuta con successo!")
                    //alert("Registrazione avvenuta con successo")
                    setTimeout(function(){  location.href="https://AniFab.fabiogerman.repl.co/login.html" }, 1500);
                   
                }else{
                   $("#al").addClass("alert-danger")
                      $("#al").css("display","block")
                          $("#al").text("Errore registrazione")
                    //alert("Errore registrazione non riuscita")
                }
            })
        }
    })
})

function emailIsValid (email) {
    return /\S+@\S+\.\S+/.test(email)
 }