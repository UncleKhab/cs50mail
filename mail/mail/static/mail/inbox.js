// HELPER FUNCTIONS 

// 1. document.querySelector
function d(selector){
  return document.querySelector(selector);
};

// 2. constructor function for email list
function item_constructor(tag, clas, cont){
  let element = document.createElement(tag);
      element.className = clas;
      element.innerHTML = cont;
  
  return element;
}

// 3. function for event listener for subject lines

function em_r(id, status){
  load_email(id, status);
}
// 4. iterator function for received emails

function add_email_received(content) {
  let subject = item_constructor('a', 'email-subject', content.subject);
      subject.setAttribute('onclick', `em_r(${content.id}, 'r')`);
      subject.setAttribute('href', '#');
  let sender  = item_constructor('p', 'email-sender', content.sender);
  let time    = item_constructor('small', 'email-time', content.timestamp);

  
  let email = document.createElement('div');
      email.className = 'email-container';
      email.appendChild(subject);
      email.appendChild(sender);
      email.appendChild(time);
  

  d('#emails-view').append(email);
  
  console.log(content);
  
}

// 5. iterator function for sent emails

function add_email_sent(content) {
  let subject     = item_constructor('a', 'email-subject', content.subject);
      subject.setAttribute('onclick', `em_r(${content.id}, 's')`)
      subject.setAttribute('href', '#');
  let recipients  = item_constructor('p', 'email-recipient', content.recipient);
  let time        = item_constructor('small', 'email-sender', content.timestamp);
      
  let email = document.createElement('div');
      email.className = 'email-container';
      email.appendChild(subject);
      email.appendChild(recipients);
      email.appendChild(time);

  d('#emails-view').append(email);

  console.log(content)

}

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  d('#emails-view').innerHTML = '';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

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
              load_mailbox('sent');
              d('#alert-show').innerHTML = result.message;
          } else {
              d('#alert-show').innerHTML = result.error;
              return false;
          }
      });
      return false;
    };
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  d('#emails-view').innerHTML = '';
  document.querySelector('#compose-view').style.display = 'none';
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    if (mailbox === 'sent'){
      emails.forEach(add_email_sent);
    } else {
      emails.forEach(add_email_received);
    }
    
  })
  
}

function load_email(id, status) {
  d("#emails-view").style.display = 'none';
  d('#compose-view').style.display = 'none';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Changing the read status when email is accessed

    if((email.read === false) && (status === 'r')){
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
    }
    
  })

  
}