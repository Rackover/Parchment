$( document ).ready(init)


function init(){
    $('#loginForm').submit(function (e) {
        e.preventDefault();

        const postTo = this.action;
        $('#loadingContainer').show();

        $.post( postTo, $('#loginForm').serialize(), function() {
            
        })
        .done(function() {
            $('#loadingContainer').hide();
            location.reload();
        })
        .fail(function(data) {
            $('#loadingContainer').hide();
            console.log(data);
            const response = data.responseJSON;
            $('#loginError').text(response.content);
        });

        return false;
    });
}
