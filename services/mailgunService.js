const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});

const sendEmail = async ({ email, subject, html }) => {
  const data = {
    from: 'Bill-SPlit <billsplit@samples.mailgun.org>',
    to: email,
    subject,
    html
  };
  const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, data);
}

module.exports = sendEmail;