document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = (send_mail);
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#email-block').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_mail(){
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value,
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.log('error', error)
  });

  load_mailbox('inbox');
  return false;
}

function load_mailbox(mailbox) {
  var length = 0;
  // Show the mailbox and hide other views
  document.querySelector('#email-block').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  const email_block = document.querySelector('#email-block');

  if (mailbox === 'inbox'){
    let test = 0;
    fetch('emails/inbox')
    .then(response => response.json())
    .then(result => {
      // assign local storage item to each mail, check for read
      for (i = 0; i < result.length; i++){
        if (!localStorage.getItem(`mail${result[i].id}`)){
          localStorage.setItem(`mail${result[i].id}`, false);
        }
        else{
          if (localStorage.getItem(`mail${result[i].id}`) === "true"){
            result[i].read = true;
          }
        }
        //create email divs
        const button = document.createElement('button');
        const div = document.createElement('div');
        //assign each button an action, "listen"
        email_block.appendChild(button);
        button.appendChild(div);
        button.setAttribute("id", `mail${i}`);
        listen(button, result[i].id, mailbox);
        length = result.length;
        // populate div with text
        var subject = result[i].subject;
        var sender = result[i].sender;
        var timestamp = result[i].timestamp;
        //button.innerHTML = subject + sender + timestamp;
        if (result[i].read === true){
          button.setAttribute("class", "email-button read");
        }
        else{
          button.setAttribute("class", "email-button unread");
        }
        //create flex containers and space the innerhtml accordingly
        div.setAttribute("class", "flex-container");

        var child0 = document.createElement('div');
        var child1 = document.createElement('div');
        var child2 = document.createElement('div');

        child0.innerHTML = subject;
        child1.innerHTML = sender;
        child2.innerHTML = timestamp;

        div.appendChild(child0);
        div.appendChild(child1);
        div.appendChild(child2);
      }

      console.log(result);
    })
    .catch(error => {
      console.log('error', error);
      return false;
    });

  }

  else if (mailbox === 'sent'){
    fetch('emails/sent')
    .then(response => response.json())
    .then(result => {
        for (i = 0; i < result.length; i++)
        {
          const button = document.createElement('button');
          const div = document.createElement('div');

          email_block.appendChild(button);
          button.appendChild(div);
          button.setAttribute("id", `mail${i}`);
          listen(button, result[i].id, mailbox);

          var subject = result[i].subject;
          var sender = result[i].sender;
          var timestamp = result[i].timestamp;
          if (result[i].read === true){
            button.setAttribute("class", "email-button read");
          }
          else{
            button.setAttribute("class", "email-button unread");
          }
          //create flex containers and space the innerhtml accordingly
          div.setAttribute("class", "flex-container");

          var child0 = document.createElement('div');
          var child1 = document.createElement('div');
          var child2 = document.createElement('div');

          child0.innerHTML = subject;
          child1.innerHTML = sender;
          child2.innerHTML = timestamp;

          div.appendChild(child0);
          div.appendChild(child1);
          div.appendChild(child2);

        }
    })
  }

  else if (mailbox === 'archive'){
    fetch('emails/archive')
    .then(response => response.json())
    .then(result => {
      console.log(result.length);
      for (i = 0; i < result.length; i++)
      {
        const button = document.createElement('button');
        const div = document.createElement('div');

        email_block.appendChild(button);
        button.appendChild(div);
        button.setAttribute("id", `mail${i}`);
        listen(button, result[i].id, mailbox);

        var subject = result[i].subject;
        var sender = result[i].sender;
        var timestamp = result[i].timestamp;
        if (result[i].read === true){
          button.setAttribute("class", "email-button read");
          console.log("read");
        }
        else{
          button.setAttribute("class", "email-button unread");
        }
        //create flex containers and space the innerhtml accordingly
        div.setAttribute("class", "flex-container");

        var child0 = document.createElement('div');
        var child1 = document.createElement('div');
        var child2 = document.createElement('div');

        child0.innerHTML = subject;
        child1.innerHTML = sender;
        child2.innerHTML = timestamp;

        div.appendChild(child0);
        div.appendChild(child1);
        div.appendChild(child2);
      }
    })
  }
    email_block.innerHTML = '';
    function listen(button, id, mailbox)
    {
      button.addEventListener('click', () => open_mail(id, mailbox));
    }
      // Show the mailbox name
      document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

}

function open_mail(id, mailbox){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(result => {
    //set local storage value of 'read' to true
    localStorage.setItem(`mail${id}`, true);
    //console.log(localStorage.getItem(`mail${id}`));

    const arch_button = document.createElement('button');
    const reply_button = document.createElement('button');
    arch_button.setAttribute('id', 'arch-button');
    arch_button.setAttribute('class', 'btn btn-sm btn-outline-primary arch-button');

      if (result.archived === false){
        arch_button.innerHTML = "Archive";
        arch_button.addEventListener('click', () => archive_mail(id, false));
      }
      else{
        arch_button.innerHTML = "Unarchive";
        arch_button.addEventListener('click', () => archive_mail(id, true))
      }
    reply_button.innerHTML = "Reply";
    reply_button.addEventListener('click', () => reply(result.recipients, result.sender, result.subject, result.body, result.timestamp));
    reply_button.setAttribute('class', 'btn btn-sm btn-outline-primary');
    email_block = document.querySelector('#email-block');
    //create html elements for reading emails
    const flex_container = document.createElement('div');
    flex_container.setAttribute('class', 'flex-container-content');

    const sender = document.createElement('div');
    const subject = document.createElement('div');
    const body = document.createElement('div');
    const hr = document.createElement('hr');

    sender.innerHTML = "From: " + result.sender;
    subject.innerHTML = "Subject: " + result.subject;
    body.innerHTML = result.body;
    subject.setAttribute('class', 'subject');
    body.setAttribute('class', 'body');

    flex_container.appendChild(sender);
    flex_container.appendChild(subject);
    flex_container.appendChild(hr);
    flex_container.appendChild(body);

    console.log(mailbox);
    email_block.innerHTML= '';
    email_block.appendChild(flex_container);
    email_block.appendChild(arch_button);
    email_block.appendChild(reply_button);
    if (mailbox === 'sent'){
      document.querySelector('#arch-button').style.display = 'none';
    }


    document.querySelector('#email-block').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    console.log(result);
  });
}


function archive_mail(id, bool){
  if (bool === false){
    fetch(`emails/${id}`,{
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
    alert("Successfully Archived, yo!");
    load_mailbox('inbox');
  }
  else{
    fetch(`emails/${id}`,{
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
    alert("Successfully Unarchived, yo!");
    load_mailbox('inbox');
  }
}

function reply(recipient, sender, subject, body, timestamp){
  if (subject === ""){
    subject = "[No Subject]";
  }
  document.querySelector('#email-block').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-recipients').value = recipient;
  if (subject.includes("Re:"))
  {
    document.querySelector('#compose-subject').value = `${subject}`;
  }
  else{
    document.querySelector('#compose-subject').value = `Re:${subject}`;
  }

  document.querySelector('#compose-body').value = `---${timestamp}:${body}`;
}
