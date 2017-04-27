/*
 *Wrap nodemailer to provide convinient functions to send emails
 * */
var nodemailer = require('nodemailer');
var EmailTemplate = require('email-templates').EmailTemplate;

var emailCredentials = process.env.EMAIL_CREDENTIALS;
if (emailCredentials === 'undefined') {
  throw Error('Email credentials are not present');
}

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(emailCredentials);

// import templates
const verify_template = new EmailTemplate('email/templates/basic_template');

//Wrap sendMail
function callSendMail(mailOptions) {
  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      return console.log(error);
    }

    console.log('Message sent: ' + info.response);
  });
}


//Send email with verify url
function sendVerifyEmail(content) {
  console.log('content.group : ' + JSON.stringify(content));
  console.log('content.group : ' + content.group);
  if (content.group == 'vol') {
    console.log('content.group : vol');
    content.subtitle = 'Simplyk vise à créer une société plus solidaire en facilitant l\'implication bénévole. La plateforme t\'aide à t\'impliquer dans ta communauté en te trouvant des opportunités de bénévolat qui te correspondent. Tout d\'abord, confirme ton compte grâce au bouton ci-dessous';
  } else if (content.group == 'org') {
    console.log('content.group : org');
    content.subtitle = 'Simplyk vise à créer une société plus solidaire en facilitant l\'implication bénévole. La plateforme va t\'aider à trouver des bénévoles facilement, afin d\'avoir plus d\'impact. Avant de poster tes besoins, confirme ton compte grâce au bouton ci-dessous';
  } else {
    console.log('content.group : nothing');
    content.subtitle = 'On est ravi que tu sois maintenant sur la plateforme Simplyk. Tout d\'abord, confirme ton compte grâce au bouton ci-dessous';
  }
  content.type = 'verify';
  content.button.text = 'Vérifier mon compte';
  content.title = 'Bienvenue ' + content.firstname + ' !';
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: content.firstname + ', vérifie ton courriel', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);

  });
};

function sendSubscriptionOrgEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'subscriptionorg';
  content.title = 'Nouveau bénévole !';
  content.button = {
    text: 'Voir mon bénévole',
    link: content.link
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.log(err);
    }
    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sener address
      to: content.recipient,
      subject: 'Bénévole inscrit à contacter !', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);

  });
};

function sendSubscriptionVolEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'subscriptionvol';
  content.title = 'Merci ' + content.firstname + ' !';
  content.button = {
    text: 'Voir mon profil',
    link: 'www.simplyk.io'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: 'Bravo de ton inscription :) !', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendForgottenPasswordEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'forgottenMessage';
  content.title = 'Nouveau mot de passe !';
  content.button = {
    text: 'Voir mon profil',
    link: 'www.simplyk.io'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: 'Mot de passe réinitialisé sur Simplyk !', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendUnsubscriptionEmail(content) {
  content.subtitle = ['Malheureusement,', content.customMessage];
  content.type = 'unsubscriptionorg';
  content.title = 'Désinscription d\'un bénévole :( ';
  content.button = {
    text: 'Voir mon tableau de bord',
    link: 'www.simplyk.io'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: content.activity_name + ': désinscription d\'un bénévole :( ', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendTransAddEvent(content) {
  content.subtitle = content.customMessage;
  content.type = 'transaddevent';
  content.title = 'Création d\'évènement';
  content.button = {
    text: 'Voir mon évènement',
    link: 'www.simplyk.io/organism/dashboard'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: content.event_name + ': évènement créé avec succès ', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendTransAddLongTerm(content) {
  content.subtitle = content.customMessage;
  content.type = 'transaddlongterm';
  content.title = 'Création d\'engagement';
  content.button = {
    text: 'Voir mon engagement',
    link: 'www.simplyk.io/organism/dashboard'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: content.longterm_name + ': engagement créé avec succès ', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendHoursPendingOrgEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'hourspendingorg';
  content.title = 'Valider la participation';
  content.button = {
    text: 'Valider la participation',
    link: 'www.simplyk.io/organism/dashboard'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: content.firstname + ' ' + content.lastname + ': validation de la participation !', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendHoursPendingVolEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'hourspendingvol';
  content.title = 'Heures enregistrées';
  content.button = {
    text: 'Voir ma participation',
    link: 'www.simplyk.io/volunteer/profile'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: content.name + ': ' + content.hours + ' heures en attente de confirmation', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendStudentQuestionsEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'studentquestions';
  content.title = 'Retours enregistrés';
  content.button = {
    text: 'Voir mes retours',
    link: 'www.simplyk.io/volunteer/profile'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: 'Les retours sur ton bénévolat sont éditables', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendHoursPendingReminderOrgEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'hourspendingorg';
  content.title = 'Valider la participation';
  content.button = {
    text: 'Valider la participation',
    link: 'www.simplyk.io/organism/dashboard'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: content.name + ': ' + content.event_intitule, // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendExtraHoursPendingReminderOrgEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'extrahourspendingorg';
  content.title = 'En attente';
  content.button = {
    text: 'Valider la participation',
    link: 'www.simplyk.io/organism/dashboard'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <francois@simplyk.io>', // sender address
      to: content.recipient,
      subject: 'Valider la participation de ' + content.name, // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendHoursConfirmedVolEmail(content) {
  content.subtitle = ['Félicitation ' + content.firstname + ',', content.customMessage];
  content.type = 'hoursconfirmedvol';
  content.title = 'Participation confirmée !';
  content.button = {
    text: 'Voir mon nouveau profil',
    link: 'www.simplyk.io/volunteer/profile'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: content.activity_name + ': participation validée !', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};


function sendAutomaticSubscriptionOrgEmail(content) {
  content.subtitle = content.customMessage;
  content.title = 'Bénévolat de ' + content.firstname + ' ' + content.lastname + ' !';
  content.type = 'verify';
  content.button.text = 'Valider les heures de l\'élève';
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: 'Bénévolat de ' + content.firstname + ' ' + content.lastname + ' !', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendManualHoursEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'manualHours';
  content.title = 'Heures ajoutées';
  content.button = {
    text: 'Voir mes heures',
    link: 'www.simplyk.io/volunteer/profile'
  };
  content.gif = 'http://i.giphy.com/l0O7P6qdCa1AKJRAY.gif';
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: content.admin_name + ' t\'a ajouté des heures', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendAdminValidateEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'validateHours';
  content.title = 'Heures validées';
  content.button = {
    text: 'Voir mes heures',
    link: 'www.simplyk.io/volunteer/profile'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <francois@simplyk.org>', // sender address
      to: content.recipient,
      subject: content.admin_name + ' a validé ton bénévolat', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendAdminCorrectEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'correctHours';
  content.title = 'À corriger';
  content.button = {
    text: 'Voir mes heures',
    link: 'www.simplyk.io/volunteer/profile'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <francois@simplyk.org>', // sender address
      to: content.recipient,
      subject: content.admin_name + ' attends que tu corriges un bénévolat', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendAdminRefuseEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'refuseHours';
  content.title = 'Refusé';
  content.button = {
    text: 'Voir mes heures',
    link: 'www.simplyk.io/volunteer/profile'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <francois@simplyk.org>', // sender address
      to: content.recipient,
      subject: content.admin_name + ' a refusé un de tes bénévolats', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendOneDayReminderEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'reminder';
  content.title = 'Demain !';
  content.button = {
    text: 'Voir mon bénévolat',
    link: 'www.simplyk.io/volunteer/profile'
  };
  content.gif = 'http://i.giphy.com/YJ5OlVLZ2QNl6.gif';
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: content.firstname + ', prêt pour le bénévolat de demain ??', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
}

function sendTomorrowReminderEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'reminder';
  content.title = 'Merci !';
  content.button = {
    text: 'Enregister mes heures',
    link: 'www.simplyk.io/volunteer/profile'
  };
  content.gif = 'http://i.giphy.com/l3q2u6MXJJEKiTZIY.gif';
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: content.firstname + ', enregistre tes heures d\'hier !', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
}

function sendOneWeekReminderEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'reminder';
  content.title = 'Bientôt';
  content.button = {
    text: 'Voir mon rendez-vous',
    link: 'www.simplyk.io/volunteer/profile'
  };
  content.gif = 'http://i.giphy.com/l46CvRFB1GqPYAOis.gif';
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: 'Bientôt : ' + content.event + ' !', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
}

function sendFiveDaysLongTermExpirationEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'fivedayslongtermexpiration';
  content.title = 'Bientôt expiré';
  content.button = {
    text: 'Voir mon engagement',
    link: 'www.simplyk.io/organism/dashboard'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: content.lt_name + ': 5 jours avant la fermeture de l\'engagement !', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
}

function sendLongTermExpirationEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'longtermexpiration';
  content.title = 'Expiré';
  content.button = {
    text: 'Voir mon engagement',
    link: 'www.simplyk.io/organism/dashboard'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: content.recipient,
      subject: content.lt_name + ': fermeture des inscriptions !', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
}

function sendInboundSMSEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'inboundsms';
  content.title = 'Inbound';
  content.button = {
    text: 'Ne rien voir',
    link: 'www.rien.com'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"François @ Simplyk" <contact@simplyk.io>', // sender address
      to: 'contact@simplyk.io',
      subject: 'SMS reçu ', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
}


module.exports = {
  sendSubscriptionOrgEmail,
  sendSubscriptionVolEmail,
  sendUnsubscriptionEmail,
  sendVerifyEmail,
  sendHoursPendingVolEmail,
  sendHoursPendingOrgEmail,
  sendHoursConfirmedVolEmail,
  sendAutomaticSubscriptionOrgEmail,
  sendTransAddEvent,
  sendTransAddLongTerm,
  sendForgottenPasswordEmail,
  sendManualHoursEmail,
  sendOneDayReminderEmail,
  sendOneWeekReminderEmail,
  sendTomorrowReminderEmail,
  sendHoursPendingReminderOrgEmail,
  sendExtraHoursPendingReminderOrgEmail,
  sendFiveDaysLongTermExpirationEmail,
  sendLongTermExpirationEmail,
  sendInboundSMSEmail,
  sendStudentQuestionsEmail,
  sendAdminValidateEmail,
  sendAdminCorrectEmail,
  sendAdminRefuseEmail
};