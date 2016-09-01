$('form#registerform').submit(function(e) {
    e.preventDefault(); // Prevent default post
    var form = $(this);

    function onSuccess(response) {
        if(response.exists) {
            console.log('Email already exists'); 
            $('#email-exists').removeClass('hidden')
        }
        else{
            //Remove the current event handler and submit
            $('form#registerform').unbind('submit'); 
            $('form#registerform').submit();
        }
    }

    $.ajax({
        type: 'POST',
        url: 'register_check', 
        data: form.serialize(),
        success: onSuccess
    });
});		
