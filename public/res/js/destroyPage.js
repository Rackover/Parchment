$( document ).ready(init)

function init(){
    $('#destroyPage').click(function (e) {
        e.preventDefault();

        const pageName = this.name;
        const parentNode = this.parentNode;

        if (confirm(`YOU ARE GOING TO DELETE ${pageName}. Are you SURE you want to do this?`)){

            const thenGoTo = location.pathname.substring(0, location.pathname.lastIndexOf("/")) + ".md";

            $('#loadingContainer').show();

            $.post(parentNode.action, $(parentNode).serialize(), function() {
                
            })
            .done(function() {
                $('#loadingContainer').hide();
                location = thenGoTo;
            })
            .fail(function(data) {
                $('#loadingContainer').hide();
                console.log(data);
            });
        }

        return false;
    });
}
