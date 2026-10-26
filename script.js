(function(){
  var burger=document.querySelector('.burger'),menu=document.getElementById('menu');
  burger.addEventListener('click',function(){
    var o=menu.classList.toggle('open');burger.setAttribute('aria-expanded',o);
    burger.setAttribute('aria-label',o?'Close menu':'Open menu');
  });
  menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){
    menu.classList.remove('open');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Open menu');
  });});
  document.getElementById('yr').textContent=new Date().getFullYear();

  // Forms keep the original endpoints on yourmissinglink.ca. Anywhere else (e.g. the preview link),
  // they fall back to a pre-filled email so nothing is lost.
  var LIVE=/(^|\.)yourmissinglink\.ca$/i.test(location.hostname);
  var TO='tim@yourmissinglink.ca';
  function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
  function wire(form,opts){
    var msg=form.querySelector('.form-msg');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var f=form.elements,err=opts.validate(f);
      if(err){msg.textContent=err;return;}
      var data=opts.params(f);
      if(LIVE){
        msg.textContent='Sending…';
        fetch(opts.endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(data).toString()})
          .then(function(r){return r.text();})
          .then(function(t){ if(t.trim().length===0){msg.textContent=opts.ok;form.reset();} else {msg.textContent=t;} })
          .catch(function(){msg.textContent='Sorry, something went wrong. Please email '+TO+'.';});
      }else{
        var body=Object.keys(data).filter(function(k){return k.indexOf('Submit')!==0;}).map(function(k){return k+': '+data[k];}).join('\n');
        location.href='mailto:'+TO+'?subject='+encodeURIComponent(opts.subject)+'&body='+encodeURIComponent(body);
        msg.textContent='Opening your email app…';
      }
    });
  }
  var c=document.getElementById('contact-form');
  if(c) wire(c,{
    endpoint:'/ajax/ajax_submit_contact.php',subject:'Website enquiry',
    ok:'Thank you, your message has been received. We will be in contact with you shortly.',
    validate:function(f){ if(!f.Name.value.trim())return 'Please enter your name.'; if(!validEmail(f.Email.value.trim()))return 'Please enter a valid e-mail address.'; if(!f.Comments.value.trim())return 'Please enter your comments.'; },
    params:function(f){return {SubmitContact:'1',Name:f.Name.value,Phone:f.Phone.value,Email:f.Email.value,Comments:f.Comments.value};}
  });
  var n=document.getElementById('signup-form');
  if(n) wire(n,{
    endpoint:'/ajax/ajax_submit_newsletter.php',subject:'Sign me up for monthly tips',
    ok:'Thanks! Please check your email for my confirmation message along with the tips (and check the spam folder too).',
    validate:function(f){ if(!f.MyName.value.trim())return 'Please enter your name.'; if(!validEmail(f.MyEmail.value.trim()))return 'Please enter a valid e-mail address.'; },
    params:function(f){return {SubmitNewsletter:'1',Name:f.MyName.value,Email:f.MyEmail.value};}
  });
})();
