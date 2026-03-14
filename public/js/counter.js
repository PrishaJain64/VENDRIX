$(document).ready(function(){
    $(".plus").click(function(){
        var value = Number($("#qtyVal").text());
        ++value;
        $("#qtyVal").text(value);
        $(".hidden-qty").val(value);
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
        var value = Number($("#qtyVal").text());
        --value;
        $("#qtyVal").text(value);
        $(".hidden-qty").val(value);
        
        $(".plus").prop("disabled", false);
        if(value <= 1){
            $(this).prop("disabled", true);
            return;
        }
    })
})