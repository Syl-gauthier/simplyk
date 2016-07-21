/*

*/

$(document).ready(function() {
  //Edit password functions
  $('#edit-password-button').click(function(){
    console.log("Open edit password form");
    $('#password-group').find('.display').addClass('hidden');
    $('#password-group').find('.editing').removeClass('hidden');
  });

  var closeEditPassword = function(){
    $('#password-group').find('.display').removeClass('hidden');
    $('#password-group').find('.editing').addClass('hidden');

    //Clear inputs
    $('#edit-password-form').find('input').val("");
    $('#password-error').addClass('hidden');
  }

  $('#cancel-password-button').click(function(){
    closeEditPassword();
  });

  var passwordCheck = {success: false};

  //Check that confirm password matches new password
  $('#edit-password-form').find("[name='new-password'],[name='confirm-password']").keyup(function(){
    var form = $('#edit-password-form');
    var newPassword = $(form).find("[name='new-password']").val()
    var confirmPassword = $(form).find("[name='confirm-password']").val()
    console.log('confirm: '+confirmPassword+ ', new: ' + newPassword);

    var error = $("#password-error");
    if(confirmPassword != newPassword){
      console.log("different");

      if(confirmPassword != ""){
        $(error).text("New and confirm passwords not matching");
        $(error).removeClass("hidden");
      }
      passwordCheck.success = false;
    }
    else{
        console.log('passwords matching');
        $(error).addClass("hidden");
        $(error).text("");
        passwordCheck.success = true;
    }
  });

  $('#save-password-button').click(function(){
    console.log("Send password change");

    var passwordForm = $("#edit-password-form");
    console.log(passwordForm);
    var passwordData = {current: passwordForm.find("[name='current-password']").val(), 
      new: passwordForm.find("[name='new-password']").val(), 
      confirm: passwordForm.find("[name='confirm-password']").val()};

    console.log(passwordData);

    //Check if user is
    if(passwordData.new != passwordData.confirm){
      console.log("Passwords different");
    }
    else{
      $.post("../editPassword", passwordData)
        .done(function(data){
          console.log("Change password attempt: "+data.success);   
          if(data.success){
            closeEditPassword();
            BootstrapDialog.show({message: "Password changed successfully!"});
          }
          else{
            //Show error
            var error = $("#password-error");
            error.removeClass("hidden");
            error.text("Wrong password");
          }
        });
    }
  });
});
