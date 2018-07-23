$('document').ready(function()
{
    /* sign up form validation */
    $("#signup-form").validate({
        rules:
            {
                email: {
                    required: true,
                    email: true
                },
                password: {
                    required: true,
                    minlength: 1,
                    maxlength: 15
                },
                cpassword: {
                    required: true,
                    equalTo: '#password'
                },
            },
        messages:
            {
                email: "Enter a Valid Email",
                password:{
                    required: "Provide a Password",
                    minlength: "Password Needs To Be Minimum of 8 Characters"
                },
                cpassword:{
                    required: "Retype Your Password",
                    equalTo: "Password Mismatch! Retype"
                }
            },
        submitHandler: submitSignupForm
    });
    /* validation */

    /* form submit */
    function submitSignupForm()
    {
        let data = $("#signup-form").serialize();
        $.ajax({
            type : 'POST',
            url  : 'api/register',
            data : data,
            success: function(data)
            {
                console.log('result from ajax', data);
                if(data.success === true)
                {
                    console.log('registration successful, you can now sign in');
                }
                else {
                    console.log('registration failed with error ' + data.message);
                }
            }
        });
        return false;
    }
    /* form submit */

    /* sign up form validation */
    $("#login-form").validate({
        rules:
            {
                email: {
                    required: true,
                    email: true
                },
                password: {
                    required: true,
                }
            },
        messages:
            {
                email: "Enter a Valid Email",
                password:{
                    required: "Provide a Password",
                },
            },
        submitHandler: submitLoginForm
    });
    /* validation */

    /* form submit */
    function submitLoginForm()
    {
        let data = $("#login-form").serialize();
        $.ajax({
            type : 'POST',
            url  : 'api/authenticate',
            data : data,
            success: function(data)
            {
                if(data.success === true)
                {
                    getUserData(data.token);
                }
                else {
                    console.log('sign in error,' + data.message);
                }
            }
        });
        return false;
    }
    /* form submit */

    function getUserData(token) {
        $.ajax({
            type : 'GET',
            url  : 'api/user',
            beforeSend: function(xhr){xhr.setRequestHeader('x-access-token', token);},
            success: function(data)
            {
                if(data.success === true)
                {
                    $('#userdata').html('<pre>' + JSON.stringify(data.user, null, " ") + '</pre>');
                }
                else {
                    console.log('sign in error,' + data.message);
                }
            }
        });
    }
});

$('.form').find('input, textarea').on('keyup blur focus', function (e) {

    let $this = $(this),
        label = $this.prev('label');

    if (e.type === 'keyup') {
        if ($this.val() === '') {
            label.removeClass('active highlight');
        } else {
            label.addClass('active highlight');
        }
    } else if (e.type === 'blur') {
        if( $this.val() === '' ) {
            label.removeClass('active highlight');
        } else {
            label.removeClass('highlight');
        }
    } else if (e.type === 'focus') {

        if( $this.val() === '' ) {
            label.removeClass('highlight');
        }
        else if( $this.val() !== '' ) {
            label.addClass('highlight');
        }
    }

});

$('.tab a').on('click', function (e) {
    e.preventDefault();
    $(this).parent().addClass('active');
    $(this).parent().siblings().removeClass('active');
    e.target = $(this).attr('href');
    $('.tab-content > div').not(e.target).hide();
    $(e.target).fadeIn(600);
});