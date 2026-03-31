$(document).ready(function(){
    $(".plus").click(function(){
        const parent = $(this).closest(".qty-ctrl"); // go to same div
        var value = Number(parent.find(".qty-val").text());
        ++value;
        $(".qty-val").text(value);
        $(".minus").prop("disabled", false);
        let stock = Number($(this).data("id"));
        if(value >= stock){
            $(this).prop("disabled", true);
            return;
        }else{
            $(this).prop("disabled", false);

        }
    });
    $(".minus").click(function(){
        const parent = $(this).closest(".qty-ctrl"); // go to same div
        var value = Number(parent.find(".qty-val").text());

        --value;
        $(".qty-val").text(value);
        
        $(".plus").prop("disabled", false);
        if(value <= 1){
            $(this).prop("disabled", true);
            return;
        }
    })
})