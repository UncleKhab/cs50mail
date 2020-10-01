// HELPER FUNCTIONS 

// 1. document.querySelector
function d(selector){
  return document.querySelector(selector);
};

// 2. document.createElement
function d_c(tag, clas, cont){
  let element = document.createElement(tag);
      element.className = clas;
      element.innerText = cont;
  
  return element;
}

// 3. iterate and add email

function add_email(content) {
  let subject = d_c('a', 'email-subject', content.subject);
      subject.setAttribute('data-id', `${content.id}`);
  let sender  = d_c('p', 'email-sender', content.sender);
  let time    = d_c('small', 'email-time', content.timestamp);

  
  let email = document.createElement('div');
  email.className = 'email-container'
  email.appendChild(subject);
  email.appendChild(sender);
  email.appendChild(time);
  

  d('#emails-view').append(email);
  
  console.log(`sender: ${sender}, subject: ${subject} , time: ${time}`);
  
}

// 4. add Event Listener to multiple items

function add_event() {
  document.querySelectorAll('.email-subject').forEach(link => {
    link.onclick = function() {
      load_email(this.dataset.id);
    }
  })
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
    emails.forEach(add_email);
  })

  // Add Events to emails
  add_event();
  
}

function load_email(id) {
  d("#emails-view").style.display = 'none';
  d('#compose-view').style.display = 'none';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);
  })
}