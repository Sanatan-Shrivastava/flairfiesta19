const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const SENDGRID_API_KEY = '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';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SENDGRID_API_KEY);

exports.sendFlairId = functions.database.ref('/Users/{flairId}')
    .onCreate((snapshot , context)=>{
        console.log('atleast function is triggered');
         const user = snapshot.val();

        // const userId = event.params.flairId;
        // const user = event.data.val();

         const userName = user.firstname;
        // const userEmail = user.email;
        const userFlairId = user.flairId;
        const userPin = user.pin;

         console.log(user.flairId);

        const msg = {
            to: user.email,
            from: 'team@flairfiesta.in' ,
            subject: `Thanks for registering in FlairFiesta`,
            
            text: `Hi ${userName},
            Thanks for registering at FlairFiesta'19.
            Your FlairID is ${userFlairId}.
            and your Flair pin is ${userPin}.

            Cheers!
            Team FlairFiesta`,
            html: `<p>Hi ${userName},</p><br>
            <p>Thanks for registering at FlairFiesta'19.</p>
            <p>Your FlairID is <strong>${userFlairId}</strong>.</p>
            <p>and your Flair pin is <strong>${userPin}.</strong></p><br>
            <p><strong>Cheers!</strong></p>
            <p>Team FlairFiesta</p>`
        }

        return sgMail.send(msg);

    });
//979DHJvuMgxxAcW