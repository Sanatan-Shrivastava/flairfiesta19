/* adding key in questions array, also make sure that position of collegeid remains 5*/
    var questions = [
    {question:"What's your first name?", type: "text", key: "firstname"},
    {question:"What's your last name?", type: "text", key: "lastname"},
    {question:"What's your college?", type: "text", key: "college"},
    {question:"What's your college ID?", type: "text", key: "college_id"},
    {question:"What's your email?", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ , key: "email"},
    {question:"What's your mobile?", pattern: /^\d{10}$/, key: "phone"},
    {question:"Create your PIN (4 Digits)", type: "password", pattern: /^[1-9]\d{3}$/ , key: "pin"},
    {question:"Are you a Student of IIITK?(y/n)", type: "text", pattern: /^y|n$/i , key: "iiitkian"}
  ];

  var college_id = "" ;
  var alreadyRegistered = false ;

/**********

  !!!!!
  New Version: https://codepen.io/arcs/pen/rYXrNQ
  !!!!!
  
  Credits for the design go to XavierCoulombeM
  https://dribbble.com/shots/2510592-Simple-register-form
  
  This Pen uses no libraries except fonts and should 
  work on all modern browsers
  
  The answers are stored in the `questions` array
  with the key `value`. 

 **********/

(function(){

  var tTime = 100  // transition transform time from #register in ms
  var wTime = 200  // transition width time from #register in ms
  var eTime = 1000 // transition width time from inputLabel in ms

  // init
  // --------------
  var position = 0

  putQuestion()

  progressButton.addEventListener('click', validate)
  inputField.addEventListener('keyup', function(e){
    transform(0, 0) // ie hack to redraw
    if(e.keyCode == 13) validate()
  })

  // functions
  // --------------

  // load the next question
  function putQuestion() {
    inputLabel.innerHTML = questions[position].question
    inputField.value = ''
    inputField.type = questions[position].type || 'text'  
    inputField.focus()
    showCurrent()
  }
  
  // when all the questions have been answered
  

  // when submitting the current question
  function validate() {

    // set the value of the field into the array
    questions[position].value = inputField.value

    // check if the pattern matches
    if (!inputField.value.match(questions[position].pattern || /.+/)) wrong()
    else ok(function() {

      if(position === 3 ){
        questions[3].value = questions[3].value.toLowerCase();
        checkRegistered(questions[position].value);  
      }

      if(!alreadyRegistered &&  position == 7 ){
        createIdAndFeedAllData();
      }else if(alreadyRegistered && position == 7){
        completed("nothing");
      }

      // set the progress of the background
      progress.style.width = ++position * 100 / questions.length + 'vw'
        
      // if there is a new question, hide current and load next
      if (questions[position]) hideCurrent(putQuestion)
      else hideCurrent(done)
             
    })

  }

  // helper
  // --------------

  function hideCurrent(callback) {
    inputContainer.style.opacity = 0
    inputProgress.style.transition = 'none'
    inputProgress.style.width = 0
    setTimeout(callback, wTime)
  }

  function showCurrent(callback) {
    inputContainer.style.opacity = 1
    inputProgress.style.transition = ''
    inputProgress.style.width = '100%'
    setTimeout(callback, wTime)
  }

  function transform(x, y) {
    register.style.transform = 'translate(' + x + 'px ,  ' + y + 'px)'
  }

  function ok(callback) {
    register.className = ''
    setTimeout(transform, tTime * 0, 0, 10)
    setTimeout(transform, tTime * 1, 0, 0)
    setTimeout(callback,  tTime * 2)
  }

  function wrong(callback) {
    register.className = 'wrong'
    for(var i = 0; i < 6; i++) // shaking motion
      setTimeout(transform, tTime * i, (i%2*2-1)*20, 0)
    setTimeout(transform, tTime * 6, 0, 0)
    setTimeout(callback,  tTime * 7)
  }

  //check user is already registered or not
  function checkRegistered(college_id){
    var database = firebase.database();
    database.ref('Users').orderByChild('college_id').equalTo(college_id).once('value').then(function(snapshot) {
        var x = snapshot.val()
        if(x == null){
          this.college_id = college_id ; 
        }else{
          alreadyRegistered = true ;
        }
    })
  }

  //create flairId and push data
  function createIdAndFeedAllData(){
    var database = firebase.database();
    
    database.ref('FlairId' ).once('value').then(function(snapshot) {
        //create flairId
        var flairId = "flair@";
        var num = snapshot.val();
        num = num + 1;
        var key = num ;
        flairId = flairId + num.toString();
        database.ref('FlairId').set(num);

        //create object and push in flairId
        var user = {};
        var i = 0;
        for(i = 0;i <= 7 ;i++)
          user[questions[i].key] = questions[i].value;
        user["flairId"] = flairId ;

        firebase.database().ref('Users/'+key).set(user);

        //completed
        completed(flairId);
    })
  }

  //call when everything completed
  function completed(flairId){
    // remove the box if there is no next question
    register.className = 'close'
    
    // add the h1 at the end with the welcome text
    var h1 = document.createElement('p');
    h1.className = "Welcome";
    h1.setAttribute('style', 'white-space: pre;');
    
    if(!alreadyRegistered){
        h1.textContent = "Welcome to FlairFiesta " + questions[0].value + ' !\n' ;
        h1.textContent += "Your Flair Id is "+ flairId ;
        // setTimeout(function(){ window.alert("Mail Successfully sent, Incase you didn't recieve mail within sometime, Please Check your spam folder and make sure to mark us NOT SPAM."); }, 3000);
        
    }else{
      h1.textContent = "You have already registered " + questions[0].value + ' !';
    }
    
    h1.style.textAlign = "center" ;
    setTimeout(function() {
      register.parentElement.appendChild(h1)
      setTimeout(function() {
        h1.style.opacity = 1
      }, 50)
    }, eTime)
  }

}())
