$(document).ready(()=>{



    $("#logbtn").click(()=>{
        var code = $("#tvcode").val()
        $.get("/usertv?code="+code,(dati)=>{
            console.log(dati)
            if(dati.auth=="true"){
                Cookies.set("user", dati.user, { expires: 999 })
                location.href="/pages/anime.html"
            }else{
                alert("codice non esistente")
            }
            
        })
    })
})

