// vendor
import { Injectable, Logger } from '@nestjs/common';
import mjml2html = require('mjml');
// project
import i18n from '@project-common/i18n';
import * as nodemailer from 'nodemailer';
import {
  createNewTextParagraphSection,
  EmailComposer,
  createButtonSection,
  createSpacerSection,
} from '@project-common/utils/mail';
import { ENVIRONMENT } from '@project-common/environment';
import * as smtpTransport from 'nodemailer-smtp-transport';

interface MailgunMessageData {
  from: string;
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  constructor() {}

  async sendMail(messageData: MailgunMessageData) {
    const { from, to, subject } = messageData;
    Logger.log('Sending mail', {
      from,
      to,
      subject,
    });

    if (process.env.STAGE === 'development') {
      messageData.to = 'boursbenjamin@gmail.com';
    }

    const transporter = nodemailer.createTransport(
      smtpTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: ENVIRONMENT.SENDER_EMAIL,
          pass: ENVIRONMENT.SENDER_EMAIL_KEY,
        },
      }),
    );

    return new Promise((resolve, reject) => {
      transporter.sendMail(messageData, function (error, info) {
        console.log('cb', error, info);
        if (error) {
          reject();
        } else {
          Logger.log('Successfully sent', info.response);
          resolve(true);
        }
      });
    }).catch((error) => {
      Logger.error(error);
    });
  }

  /**
   * @Utility function to send a register confirmation email to the user
   */
  async sendRegisterConfirmationEmail(
    recipient: string,
    confirmationToken: string,
    locale: string = 'en',
  ) {
    const t = i18n(locale);
    const email = new EmailComposer(t('play-button'));
    email
      .addContentSection(createSpacerSection())
      .addContentSection(
        createNewTextParagraphSection({
          title: t('account-verification-mail.title'),
          paragraph: t('account-verification-mail.paragraph'),
        }),
      )

      .addContentSection(
        createButtonSection({
          label: t('account-verification-mail.buttonText'),
          href: `${ENVIRONMENT.SERVER_URL}/auth/confirm/${confirmationToken}`,
        }),
      )
      .addContentSection(createSpacerSection());
    const emailTemplate = email.compileTemplate();

    const content = mjml2html(emailTemplate);

    const messageData: MailgunMessageData = {
      from: ENVIRONMENT.SENDER_EMAIL,
      to: recipient,
      subject: t('account-verification-mail.subject') || '',
      html: content.html,
    };
    this.sendMail(messageData);
  }

  /**
   * @Utility function to send a reset
   */
  async sendResetPasswordEmail(
    recipient: string,
    resetPasswordToken: string,
    locale: string = 'en',
  ) {
    const t = i18n(locale);
    const email = new EmailComposer(t('play-button'));
    email
      .addContentSection(createSpacerSection())
      .addContentSection(
        createNewTextParagraphSection({
          title: t('reset-password-mail.title'),
          paragraph: t('reset-password-mail.paragraph'),
        }),
      )
      .addContentSection(
        createButtonSection({
          label: t('reset-password-mail.buttonText'),
          href: `${ENVIRONMENT.CLIENT_URL}/new-password?token=${resetPasswordToken}`,
        }),
      )
      .addContentSection(createSpacerSection());
    const emailTemplate = email.compileTemplate();

    const content = mjml2html(emailTemplate);

    const messageData: MailgunMessageData = {
      from: ENVIRONMENT.SENDER_EMAIL,
      to: recipient,
      subject: t('reset-password-mail.subject') || '',
      html: content.html,
    };
    this.sendMail(messageData);
  }

  /**
   * @Utility function to send a sign up email
   */
  async sendSignUpEmail(recipient: string, locale = 'en') {
    const t = i18n(locale);
    const email = new EmailComposer(t('play-button'));
    email
      .addContentSection(createSpacerSection())
      .addContentSection(
        createNewTextParagraphSection({
          title: t('sign-up-mail.title'),
          paragraph: t('sign-up-mail.paragraph'),
        }),
      )
      .addContentSection(
        createButtonSection({
          label: t('sign-up-mail.buttonText'),
          href: `${ENVIRONMENT.CLIENT_URL}/sign-up`,
        }),
      )
      .addContentSection(createSpacerSection());
    const emailTemplate = email.compileTemplate();

    const content = mjml2html(emailTemplate);

    const messageData: MailgunMessageData = {
      from: ENVIRONMENT.SENDER_EMAIL,
      to: recipient,
      subject: t('sign-up-mail.subject') || '',
      html: content.html,
    };
    this.sendMail(messageData);
  }
}
