

d('#compose-form').onsubmit = function() {
    let recipients = d('#compose-recipients').value;
    let subject = d('#compose-subject').value;
    let body = d('#compose-body').value;
    
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients,
            subject: subject,
            body: body
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.message === 'Email sent successfully.'){
            d('#alert-show').innerHTML = result.message;
            return false;
        } else {
            d('#alert-show').innerHTML = result.error;
            return false;
        }
    });
  };
  
  
