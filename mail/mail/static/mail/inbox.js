// HELPER FUNCTIONS 

// 1. document.querySelector
function d(selector){
  return document.querySelector(selector);
};

// 2. constructor function for email list
function item_constructor(tag, clas, cont, label){
  let element = document.createElement(tag);
      element.className = clas;
      if(label === undefined){
        element.innerHTML = cont;
      } else {
        element.innerHTML = `${label}: ${cont}`;
      }
      
  
  return element;
}
// 3. email display function

function email_display(content, status){
  let sender      = item_constructor('p', 'email_sender', content.sender, 'From');
  
  let recipient_list = item_constructor('p', 'recipients', '', 'To');
  let recipients = content.recipients;
      recipients.forEach(recipient => {
        let temp = item_constructor('em', 'recipient', recipient);
        recipient_list.appendChild(temp)
      })

  let subject     = item_constructor('h2', 'email_subject', content.subject, 'Subject');
  let time        = item_constructor('small', 'email_timestamp', content.timestamp, 'Date Sent');
  let body        = item_constructor('p', 'email_body', content.body);
  
  let email = document.createElement('div');
      email.className = 'email-view-container';
      if(status === 'r') {
        let reply = item_constructor('button', 'btn-custom btn-sm btn btn-outline-primary', 'Reply');
            reply.setAttribute('onclick', `reply_email(${content.id})`);
            email.appendChild(reply)
        
        if (content.archived === true){
            let unarchive = item_constructor('button', 'btn-custom btn-sm btn btn-outline-primary', 'Unarchive');
            unarchive.setAttribute('onclick', `archive_status(${content.id}, 't')`);
            email.appendChild(unarchive);
          }
      }
      email.append(sender, recipient_list, subject, time, body);
  d('#emails-view').innerHTML = '';
  d('#emails-view').append(email);
}
// 4. iterator function for displaying emails

function add_email_received(content) {
  // Getting relevant data from each email
  let archived = content.archived;
  let id = content.id;
  
  let subject = item_constructor('a', 'email-subject', content.subject);
      subject.setAttribute('onclick', `load_email(${id}, 'r')`);
      subject.setAttribute('href', '#');
  
  let sender  = item_constructor('p', 'email-sender', content.sender);
  let time    = item_constructor('p', 'email-date', content.timestamp);
  // Creating Buttons 
  let archive = item_constructor('button', 'btn-custom btn-sm btn btn-outline-primary', 'Archive');
  if(archived === false){
    archive.innerHTML = 'Archive'; 
    archive.setAttribute('onclick', `archive_status(${id}, 'f')`);
  }else{
    archive.innerHTML = 'Unarchive';
    archive.setAttribute('onclick', `archive_status(${id}, 't')`);
  }

  let reply = item_constructor('button', 'btn-custom btn-sm btn btn-outline-primary', 'Reply');
      reply.setAttribute('onclick', `reply_email(${id})`);
  // Creating Data and Buttons Divs
  let email_buttons = item_constructor('div', 'email-buttons', ``)
      email_buttons.append(reply, archive);
  let email_data = item_constructor('div', 'email-data', '');
      email_data.append(sender, subject, time)


  
  // Creating Main Element
  let email = document.createElement('div');
      if(content.read === true){
        email.className += 'b-gray ';
      } else {
        email.className += 'b-white ';
      }
      email.className += 'email-container';
      email.append(email_data, email_buttons);
  

  d('#emails-view').append(email);
  
  console.log(content);
  
}

// 5. iterator function for displaying sent emails

function add_email_sent(content) {
  let subject     = item_constructor('a', 'email-subject email-subject-sent', content.subject, 'Subject');
      subject.setAttribute('onclick', `load_email(${content.id}, 's')`);
      subject.setAttribute('href', '#');
  
  let recipient_list = item_constructor('p', 'email-recipients', '', 'Recipients');
  let recipients  = content.recipients;
      
      recipients.forEach(recipient => {
        let temp  = item_constructor('em', 'recipient', recipient);
        recipient_list.appendChild(temp);
      })
  
  let time  = item_constructor('p', 'email-date email-date-sent', content.timestamp, 'Date Sent');
  // Constructing Div for Email Data
  let email_data = item_constructor('div', 'email-data', '');
      email_data.append(recipient_list, subject, time)
  
  // Constructing Main Div Element
  let email = document.createElement('div');
      email.className = 'email-container';
      email.append(email_data);
      
  d('#emails-view').append(email);

}

// 6. Changed Archived Status

function archive_status(id, status){
  // if status comes 't' 
  if(status === 'f'){
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
    load_mailbox('inbox'); 
  } else {
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
    load_mailbox('inbox');
  }
  
}

// 7 Send Email Function

function send_email(){
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

// -----------------------------------------------------------------------------------------------------------------------------------------DOM Loaders
document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
  
});


function reply_email(id){
  d('#emails-view').innerHTML = '';
  d('#emails-view').style.display = 'none';
  d('#compose-view').style.display = 'block';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Changing the read status when email is accessed
    d('#compose-recipients').value = email.sender;
    d('#compose-subject').value = `RE: ${email.subject}`
    d('#compose-body').value = `On ${email.timestamp} , ${email.sender} wrote : ${email.body}`
  })
  
  send_email();
}


function compose_email() {

  // Show compose view and hide other views
  d('#emails-view').innerHTML = '';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
 
  send_email();
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
  d("#emails-view").style.display = 'block';
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
    email_display(email, status);
    
  }) 
}