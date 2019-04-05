function foo(eventName,eventType){

    if(eventName != 'Choose Events'){
    var mHeadRow = document.getElementById('container');
    mHeadRow.style.display = "block";

    var table = document.getElementById('mTable');

    //adding heading
    var caption = document.getElementById('mHeading');
    var br = document.createElement('br');
    var span = document.createElement('span');
    span.innerHTML = eventType;

    caption.innerHTML = eventName;
    caption.appendChild(br);
    caption.appendChild(span);

    var ref = firebase.database().ref("Events/"+eventType+"/"+eventName);
    ref.on('value', function(snapshot) {
        // window.alert('hello world');
        var i = 1;
        snapshot.forEach(function(child){
            var entry = child.val();
            var tr = document.createElement('tr');
            var td1 = document.createElement('td');
            td1.innerHTML = i;
            i = i+1;
            tr.appendChild(td1);

            var td2 = document.createElement('td');
            td2.innerHTML = entry.flairId;
            tr.appendChild(td2);

            var tdx = document.createElement('td');
            tdx.innerHTML = entry.college_id;
            tr.appendChild(tdx);

            var td3 = document.createElement('td');
            td3.innerHTML = entry.firstname;
            tr.appendChild(td3);
            
            var td4 = document.createElement('td');
            td4.innerHTML = entry.lastname;
            tr.appendChild(td4);

            // if(entry.teamName === null){
            //     var td5 = document.createElement('td');
            //     td5.innerHTML = "...";
            //     tr.appendChild(td5);
            //     var td6 = document.createElement('td');
            //     td6.innerHTML = "...";
            //     tr.appendChild(td6);
            // }else{
                var td5 = document.createElement('td');
                td5.innerHTML = entry.teamName;
                tr.appendChild(td5);
                var td6 = document.createElement('td');
                td6.innerHTML = entry.teamNumber;
                tr.appendChild(td6);
            

            table.appendChild(tr);

        });
    });
}
}