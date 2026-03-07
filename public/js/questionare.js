$(document).ready(function(){
    $(".next").click(function(){
        let val = Number($(this).data("slideno"));
        $(".q"+val).hide();
        val++;
        $(".q"+val).show();
    })
     $(".prev").click(function(){
        let val = Number($(this).data("slideno"));
        $(".q"+val).hide();
        val--;
        $(".q"+val).show();
    })
})

