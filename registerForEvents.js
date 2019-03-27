function foo(eventName,eventType,eventParent){

    //variable init
    var container = document.getElementById(eventName);
    var modal = container.getElementsByClassName('modal-content')[0];
    var collection = modal.getElementsByTagName('input');
    var flairId = collection[0].value.trim();
    var pin = collection[1].value.trim();
    var teamNumber={ };
    var teamName = { };
    var validate = true;
    var submit = modal.getElementsByClassName('closemod')[0];
    submit.disabled = true;
    submit.className = "activeClosemod";
    if(eventType === "team"){
        teamNumber = collection[0].value.trim();
        teamName = collection[1].value.trim();
        flairId = collection[2].value.trim();
        pin = collection[3].value.trim();
    }

    // window.alert(eventName+" "+eventType+" "+eventParent+" "+flairId+" "+pin+" "+teamName+" "+teamNumber);
    
    //check flair id and password field are okay?
    if(!pin.match(/^[1-9]\d{3}$/) || pin === ""){
        if(eventType === "team"){
            collection[3].value = ""
            collection[3].placeholder = "Invalid Pin";
            validate = false;
        }else{
            collection[1].value = ""
            collection[1].placeholder = "Invalid Pin";
            validate = false;
        }
    }
    if(flairId === "" || (flairId.indexOf('flair@') !== 0) ){
        //set flairid error
        if(eventType === "team"){
            collection[2].value = ""
            collection[2].placeholder = "Invalid Flair Id";
            validate = false;
        }else{
            collection[0].value = ""
            collection[0].placeholder = "Invalid Flair Id";
            validate = false;
        }
    }else{
        flairId = flairId.split('@')[1];
    }
    if(eventType === "team"){
        if(teamName === ""){
            //set teamName error
            collection[1].value = ""
            collection[1].placeholder = "Invalid Team Name";
            validate = false;
        }    
    }
    if(teamNumber == ""){
        if(teamName === ""){
            //set teamName error
            collection[0].value = ""
            collection[0].placeholder = "Invalid Team Size";
            validate = false;
        }
    }

    if(validate){
        var database = firebase.database();
        database.ref('Users/'+flairId).once('value').then(function(snapshot){
            var x = snapshot.val();
            if(x != null){
                if(x.pin === pin){
                    if(eventType == "solo")
                        afterAuthenticationforSolo(submit,collection,eventName,eventParent,flairId,x.firstname,x.lastname,x.college_id);
                    else if(eventType == "team")
                        afterAuthenticationforTeam(submit,collection,eventName,eventParent,flairId,x.firstname,x.lastname,x.college_id,teamName,teamNumber);
                    else {
                        window.alert('Biggest Error');
                    }
                }else{
                    if(eventType === "team"){
                        collection[3].value = ""
                        collection[3].placeholder = "Pin Not Matched";
                        submit.disabled = false;
                        submit.className = "closemod";
                    }else{
                        collection[1].value = ""
                        collection[1].placeholder = "Pin Not Matched";
                        submit.disabled = false;
                        submit.className = "closemod";
                    }
                }
            }else{
                if(eventType === "team"){
                    collection[2].value = ""
                    collection[2].placeholder = "Flair Id Not Exist";
                    collection[3].value = ""
                    collection[3].placeholder = "Pin";
                    validate = "false";
                }else{
                    collection[0].value = ""
                    collection[0].placeholder = "Flair Id Not Exist";
                    collection[3].value = ""
                    collection[3].placeholder = "Pin";
                    validate = "false";
                }
            }
        });
    }else{
        submit.disabled = false;
        submit.className = "closemod";
    }   
}

//Helper Functions
function afterAuthenticationforSolo(submit,collection,eventName,eventParent,flairId,firstname,lastname,college_id){
    var database = firebase.database();
    database.ref('Events/'+eventParent+'/'+eventName+'/'+flairId).once('value').then(function(snapshot){
        var x = snapshot.val();
        if(x == null){
            var user = {
                "firstname" : firstname,
                "lastname" : lastname,
                "flairId" : flairId,
                "college_id" : college_id
            }
            database.ref('Events/'+eventParent+'/'+eventName+'/'+flairId).set(user);
            window.alert('Successfully Registered');
            clearTextfield(collection,submit,eventName);
        }else{
            window.alert('You Have already Registered');
            clearTextfield(collection,submit,eventName);
        }
    });
}
function afterAuthenticationforTeam(submit,collection,eventName,eventParent,flairId,firstname,lastname,college_id,teamName,teamNumber){
    var database = firebase.database();
    database.ref('Events/'+eventParent+'/'+eventName+'/'+flairId).once('value').then(function(snapshot){
        var x = snapshot.val();
        if(x == null){
            var user = {
                "firstname" : firstname,
                "lastname" : lastname,
                "flairId" : flairId,
                "college_id" : college_id,
                "teamName" : teamName,
                "teamNumber":teamNumber
            }
            database.ref('Events/'+eventParent+'/'+eventName+'/'+flairId).set(user);
            window.alert('Successfully Registered');
            clearTextfield(collection,submit,eventName);
        }else{
            window.alert('You Have already Registered');
            clearTextfield(collection,submit,eventName);
        }
    });
}
function clearTextfield(collection,submit,eventName){
    for(var i=0;i<collection.length;i++){
        collection[i].value = "";
    }
    submit.disabled = false;
    submit.className = "closemod";
    var container = document.getElementById(eventName);
    container.style.display = "none" ;
}