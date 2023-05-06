'use strict';
jQuery(document).ready(function ($) {
    const formmailUrl = '/vapi/formmail';

    $('#formmail_send').on('click', function () {

        var proceed = true;
        //simple validation at client's end
        //loop through each field and we simply change border color to red for invalid fields		
        $('#contact_form input[required], #contact_form textarea[required]').each(function () {
            $(this).css('background-color', '');
            if (!$.trim($(this).val())) { //if this field is empty 
                $(this).css('background-color', '#FFDEDE'); //change border color to #FFDEDE 
                proceed = false; //set do not proceed flag
            }
            //check invalid email
            var email_reg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
            if ($(this).attr('type') === 'email' && !email_reg.test($.trim($(this).val()))) {
                $(this).css('background-color', '#FFDEDE'); //change border color to #FFDEDE 
                proceed = false; //set do not proceed flag				
            }
        });

        if (proceed) //everything looks good! proceed...
        {
            //get input field values data to be sent to server
            var post_data = {
                'name': $('#contact_form input[name=name]').val(),
                'email': $('#contact_form input[name=email]').val(),
                'subject': $('#contact_form input[name=subject]').val(),
                'message': $('#contact_form textarea[name=message]').val()
            };

            //Ajax post data to server
            $.post(formmailUrl, post_data, function (response) {
                contactResp('Thank you for your message! We look forward to speaking with you. We\'ll get back with you right away, typically within 24 hours or less.', 'success');
            }).fail(function () {
                contactResp('There was a problem sending your message. Please try again in a moment.', 'error');
            });
        }
    });

    //reset previously set border colors and hide all message on .keyup()
    $('#contact_form input[required=true], #contact_form textarea[required=true]').keyup(function () {
        $(this).css('background-color', '');
        $('#result').slideUp();
    });
});

function contactResp(text, type) {
    var output;
    if (type === 'error') { //load json data from server and output message 
        output = '<br><br><div class="alert alert-danger">' + text + '</div>';
    } else {
        output = '<br><br><div class="alert alert-success">' + text + '</div>';
        //reset values in all input fields
        $('#contact_form input, #contact_form textarea').val('');

    }
    $('html, body').animate({ scrollTop: $('#contact_results').offset().top - 200 }, 2000);

    $('#contact_results').hide().html(output).slideDown();
}