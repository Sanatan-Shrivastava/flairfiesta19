const user = require("./models").user
const router = require('express').Router()
const sgMail = require('@sendgrid/mail');
// const events = require('../events.json')
// const workshops = require('../workshops.json')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/', async (req, res) => {
    let data = req.body
    if (data.honeypot) {
        return res.status(401).json({ok:false, data: {err: "Suspicious behaviour"}})
    }
    if (!data.firstName || !data.lastName) {
        return res.status(400).json({ok:false, data: {err: "Full name is necessary"}})
    } else {
        data.firstName = data.firstName.trim().toLowerCase()
        data.lastName = data.lastName.trim().toLowerCase()
    }
    if (!data.email) {
        return res.status(400).json({ok:false, data: {err: "Email is necessary"}})
    } else {
        data.email = data.email.trim().toLowerCase()
    }
    if(!data.college || !data.collegeID) {
        return res.status(400).json({ok:false, data: {err: "College details are necessary"}})
    } else {
        data.college = data.college.trim().toLowerCase()
        data.collegeID = data.collegeID.trim().toLowerCase()
    }
    if (!data.PIN) {
        return res.status(400).json({ok: false, data: {err: "PIN is necessary"}})
    } else {
        data.PIN = Number(data.PIN)
        if(!(data.PIN/1000)) {
            return res.status(400).json({ok:false, data: {err: "Incorrect PIN format"}})
        }
    }
    if(!data.mob) {
        return res.status(400).json({ok:false, data: {err: "Mobile number is required"}})
    } else {
        data.mob = Number(data.mob)
        if (!(data.mob / 10000000000)) {
            return res.status(400).json({ok:false, data: {err: "Enter correct mobile number"}})
        }
    }

    let exists  = await user.find({
        "collegeID": data.collegeID
    })
    if(exists.length != 0) {
        return res.status(401).json({ok:false, data:{err: "You have already registered", isRegistered: true}})
    }
    user.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        college: data.college,
        collegeID: data.collegeID,
        mob: data.mob,
        flairPIN: data.PIN,
        isIIITK: data.isIIITK,
        events: {},
        flairID: (await getID().next()).value
    })
    .then(result => {
        if(process.env.NODE_ENV === 'production' || process.env.SEND_MAIL) {
            sendRegistrationEmail(result.email, titleCase(`${result.firstName} ${result.lastName}`), result.flairID, result.flairPIN)
        }
        return res.status(200).json({ok:true, data:result})
    })
    .catch(err => {
        console.error(`MONGO ERROR: while saving user ${err}`)
    })
})

router.post('/events', async (req, res) => {
   let {flairID, FlairPIN, society, teamName, _event, teamSize} = req.body
    if(!flairID || !_event || !flairPIN || !society ) {
        return res.status(401).json({ok: false, data: {err:"Incorrect details"}})
    }
    if(!("" + blitzID).match(/blitz@\d{4,}/))
    if(!(society in events)) {
        return res.status(404).json({ok: false, data: {err: "Incorrect society"}})
    }
    if(!(_event in events[society])) {
        return res.status(404).json({ok:false, data: {err: "Incorrect event"}})
    }
    if(events[society][_event].isTeam && !(teamName && teamSize)) {
        return res.status(401).json({ok: false, data: {err:"Team name and size is necessary for team events"}})        
    }
    flairID = flairID.split("@")[1]
    let old = {}
    try {
        let result  = await user.find({
            flairID
        })
        if(result.length === 0) {
            return res.status(400).json({ok:true,data:{err:"Incorrect FlairID"}})
        }
        if (result[0].flairPIN != flairPIN) {
            return res.status(401).json({ok: false, data: {err: "Incorrect FlairPIN"}})
        } else {
            old = result[0]
        }
    } catch(err) {
        console.log(`MONGO ERROR: in /events .find ${err}`)
    }
    if (!old.events) {
        old.events = {}
    }

    if (!old.events[club]) {
        old.events[club] = []
    }

    if(old.events[club].some(elem => elem.name === _event)) {
        return res.status(401).json({ok: false, data: {err: "You have already registered"}})
    }

    let newEvent = {name: _event}
    if (teamName && teamSize) {
        newEvent.teamName = teamName
        newEvent.teamSize = teamSize
    }
    old.events[club].push(newEvent)

    user.findOneAndUpdate({
        flairID
    }, old, {
        new: true
    })
    .then((result) => {
        if(process.env.NODE_ENV === 'production' || process.env.SEND_MAIL) {
            sendEventEmail(result.email, "" + result.firstName + result.lastName,_event,
            result.teamName, result.teamSize)
        }
        return res.status(200).json({ok: true, data: {updatedDoc: result}})
    })
    .catch(err => {
        console.error(`[MONGO ERROR]: ${err.message || ''} stack: ${err.stack}`)
        return res.status(500).json({ok: false, data:{err: "Internal Error"}})
    })
})

function sendEventEmail (to, name, eventName, teamName, teamSize) {
    const msg = {
        to,
        from: {
            email: 'Team@flairFiesta.in',
            name: "Team FlairFiesta" 
        },
        subject: `Thanks for registering in ${eventName}`,
        text: `Hi ${name},
        Thanks for registering ${teamName? `team ${teamName}`: ''}  for ${eventName}.
        looking forward to see ${teamSize? `your team of ${teamSize}` : 'you'} at FlairFiesta.
        
        In the meanwhile checkout other events and workshops @ Blitzschlag.org

        Welcome to FlairFiesta'19!!
        Team FlairFiesta`,
        html: `<p>Hi ${name},</p><br>
        <p>Thanks for registering ${teamName? `team <strong>${teamName}</strong>` : ''} for ${eventName}.</p><br>
        <p>We look forward to see ${teamSize? `your team of ${teamSize}`: 'you'} at FlairFiesta.</p><br>
        <p>In the meanwhile checkout other events and workshops @ <a href="flairfiesta.in">flairfiesta.in</a></p><br>
        <p><strong> Welcome to FlairFiesta'19!!</strong></p>
        <p>Team FlairFiesta</p>`
    }
    sgMail.send(msg)
}

function sendRegistrationEmail (to, name, blitzID, blitzPIN ) {
    const msg = {
        to,
        from: {
            email: 'Team@flairfiesta.in',
            name: "Team FlairFiesta" 
        },
        subject: 'Thanks for registering for FlairFiesta',
        text: `Hi ${name},
        Thanks for registering for FlairFiesta.
        Your blitzID is ${blitzID}.
        And your flairPIN is ${leftPadZero(flairPIN)}

        Welcome to FlairFiesta'19!!
        Team FlairFIesta
        `,
        html: `<p>Hi ${name},</p>
        <p><br>Thanks for registering for FlairFiesta'19.</p>
        <p>Your FlairID is <strong>flair@${flairID}</strong>.</p>
        <p>And your flairPIN is <strong>${leftPadZero(flairPIN)}</strong>.</p>
        <p><strong>Welcome to FlairFiesta'19!!</strong></p>
        <p>Team FlairFiesta</p>`
        `
      };
      sgMail.send(msg);
}

var _asyncGenerator = function () { function AwaitValue(value) { this.value = value; } function AsyncGenerator(gen) { var front, back; function send(key, arg) { return new Promise(function (resolve, reject) { var request = { key: key, arg: arg, resolve: resolve, reject: reject, next: null }; if (back) { back = back.next = request; } else { front = back = request; resume(key, arg); } }); } function resume(key, arg) { try { var result = gen[key](arg); var value = result.value; if (value instanceof AwaitValue) { Promise.resolve(value.value).then(function (arg) { resume("next", arg); }, function (arg) { resume("throw", arg); }); } else { settle(result.done ? "return" : "normal", result.value); } } catch (err) { settle("throw", err); } } function settle(type, value) { switch (type) { case "return": front.resolve({ value: value, done: true }); break; case "throw": front.reject(value); break; default: front.resolve({ value: value, done: false }); break; } front = front.next; if (front) { resume(front.key, front.arg); } else { back = null; } } this._invoke = send; if (typeof gen.return !== "function") { this.return = undefined; } } if (typeof Symbol === "function" && Symbol.asyncIterator) { AsyncGenerator.prototype[Symbol.asyncIterator] = function () { return this; }; } AsyncGenerator.prototype.next = function (arg) { return this._invoke("next", arg); }; AsyncGenerator.prototype.throw = function (arg) { return this._invoke("throw", arg); }; AsyncGenerator.prototype.return = function (arg) { return this._invoke("return", arg); }; return { wrap: function (fn) { return function () { return new AsyncGenerator(fn.apply(this, arguments)); }; }, await: function (value) { return new AwaitValue(value); } }; }();

let getID = (() => {
    var _ref = _asyncGenerator.wrap(function* () {
        let lastRec = (yield _asyncGenerator.await(user.find({}, ['flairID'], {
            sort: {
                flairID: -1
            }
        })))
        let lastID = lastRec.length ? lastRec[0].flairID : 3000
        while (true) {
            yield lastID + 1;
        }
    });

    return function getID() {
        return _ref.apply(this, arguments);
    };
})();
/** The above is refactored version of the following function transpiled using babel:
async function* getID() {
    let lastID = users.find({}, ['flairID'], {
        sort: {
           flairID: -1
        }
    })
    while (true) {
        if (lastID % 20) {
            yield lastID + Math.floor(50*Math.random() + 120)
        } else {
            yield lastID + 1
        }
    }
}
*/

function titleCase(str) {
    return  str.toLowerCase().split(' ').map(word => 
        `${word.substring(0,1).toUpperCase()}${word.substring(1)}`)
    .join(" ");
}

function leftPadZero (num) {
    let numStr = "" + num
    while (true) {
        if (numStr.length <= 4) {
            return numStr
        } else {
            numStr = "0" + numStr
        }
    }
}

module.exports = router
