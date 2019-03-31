function forgetFid(){
// window.alert('hello world');
    var button = document.getElementById('submitForm');
    
    button.disabled = true;
    button.className = "activeClosemod";
    
    var collegeId = document.getElementById('collegeId').value.toLowerCase();
    var pin = document.getElementById('pin').value;
    var validUser = true;
    var Message = document.getElementById('Message');

    if(collegeId === "" && (!pin.match(/^[1-9]\d{3}$/) || pin === "")){
        // window.alert('Invalid College Id and Pin');
        Message.innerHTML = 'Invalid College Id and Pin';
        document.getElementById('pin').value = "";
        validUser = false;
    }else if(collegeId === ""){
        // window.alert('Invalid College Id');
        Message.innerHTML = 'Invalid College Id';
        validUser = false;
    }else if(!pin.match(/^[1-9]\d{3}$/) || pin === ""){
        // window.alert('Invalid Pin');
        Message.innerHTML = 'Invalid Pin';
        document.getElementById('pin').value = "";
        validUser = false;
    }

    if(validUser){
        var database = firebase.database();
        // database.ref('Users').orderByChild('college_id').equalTo(collegeId).once('value').then(function(snapshot) {
        //     var x = snapshot.val()
        //     window.alert(snapshot.ref.key);
        // });

        database.ref('Users').orderByChild('college_id').equalTo(collegeId).once("value").then(function(snapshot) {

            var x = snapshot.val();
            if(x == null){
                Message.innerHTML = "Flair Id Not Registered";
                button.disabled = false;
                button.className = "btn btn-rounded btn-primary";

            }else{

            snapshot.forEach(function(child){ 
                validUser = checkValidUser(child,pin);
                if(validUser){

                    var flairId = child.child('flairId').val();
                    var firstname = child.child('firstname').val();
                    // //print data
                    
                    Message.innerHTML = "Hello "+firstname+',\n'+"Your Flair Id is: "+flairId+" \n";
                    button.disabled = false;
                    button.className = "btn btn-rounded btn-primary";
                    document.getElementById('collegeId').value ="";
                    document.getElementById('pin').value = "";
                }else{
                    Message.textContent = "Pin Not Matched";
                    button.disabled = false;
                    button.className = "btn btn-rounded btn-primary";
                    document.getElementById('pin').value = "";
                }
                // window.alert();
            }); 

        }
        });
    }else{
        button.disabled = false;
        button.className = "btn btn-rounded btn-primary";
    }
}
function checkValidUser(child,pin){
    if(pin == child.child('pin').val()){
        return true;
    }    
    else 
        return false;
}

function forgetPin(){
    var doc = document.getElementById('Message');
    doc.innerHTML = "Contact team Flair Fiesta";
}