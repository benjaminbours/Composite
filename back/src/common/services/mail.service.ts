// vendor
import { Injectable, Logger } from '@nestjs/common';
import { MailgunService, MailgunMessageData } from 'nestjs-mailgun';
import mjml2html = require('mjml');
// project
import i18n from '@project-common/i18n';
import {
  createNewTextParagraphSection,
  // createNewRowSection,
  // createNewDividerSection,
  // createNewSubtitleSection,
  EmailComposer,
  createButtonSection,
  createSpacerSection,
} from '@project-common/utils/mail';
import { ENVIRONMENT } from '@project-common/environment';

@Injectable()
export class MailService {
  constructor(private mailgunService: MailgunService) {}

  async sendMail(messageData: MailgunMessageData) {
    try {
      const { from, to, subject } = messageData;
      Logger.log('Sending mail', {
        from,
        to,
        subject,
      });

      await this.mailgunService.createEmail(
        process.env.MAILGUN_DOMAIN,
        messageData,
      );
      Logger.log('Successfully sent');
    } catch (error) {
      Logger.error(error);
    }
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
    const email = new EmailComposer(t('visit-store-button'));
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
          href: `${process.env.DOMAIN_NAME}/auth/confirm/${confirmationToken}`,
        }),
      )
      .addContentSection(createSpacerSection());
    const emailTemplate = email.compileTemplate();

    const content = mjml2html(emailTemplate);

    const messageData: MailgunMessageData = {
      from: 'noreply@compositethegame.com',
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
    const email = new EmailComposer(t('visit-store-button'));
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
      from: 'noreply@compositethegame.com',
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
    const email = new EmailComposer(t('visit-store-button'));
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
      from: 'noreply@compositethegame.com',
      to: recipient,
      subject: t('sign-up-mail.subject') || '',
      html: content.html,
    };
    this.sendMail(messageData);
  }
}
