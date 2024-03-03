import { ENVIRONMENT } from '@project-common/environment';

const COLOR = '#333333';
const FONT_FAMILY = 'monospace';

export const createNewGlobalEmailTemplate = (
  buttonText: string,
  content: string,
) => `
<mjml>
  <mj-body width="800px" background-color="#ffffff" >
    <mj-section padding="40px 0 10px 0">
      <mj-column width="50%">
        <mj-image width="160px" padding="5px 0" align="left" target="_blank" href="${ENVIRONMENT.CLIENT_URL}" alt="logo" src="${ENVIRONMENT.CLIENT_URL}/images/logo.png"></mj-image>
      </mj-column>
      <mj-column width="50%">
        <mj-button padding="0" width="200px" background-color="${COLOR}" line-height="2" align="right"  font-size="16px" font-family="${FONT_FAMILY}" target="_blank" href="${ENVIRONMENT.CLIENT_URL}">
          ${buttonText}
        </mj-button>
      </mj-column>
    </mj-section>
    ${createNewDividerSection()}
      ${content}
    //Footer
    ${createNewDividerSection()}
    ${createFooter()}
  </mj-body>
</mjml>`;

export const createNewDividerSection = () => `
<mj-section padding="0">
  <mj-column width="100%">
    <mj-divider padding="0" border-color="${COLOR}" border-width="1px"></mj-divider>
  </mj-column>
</mj-section>
`;

export const createNewTextParagraphSection = ({
  title,
  paragraph,
}: {
  title: string;
  paragraph: string;
}) => `
<mj-section padding="0">
  <mj-column width="100%">
    <mj-text font-size="24px" line-height="2" padding-bottom="15px" color="${COLOR}" font-weight="bold" font-family="${FONT_FAMILY}">
        ${title}
    </mj-text>
    <mj-text font-size="16px" line-height="2" padding-bottom="20px" color="${COLOR}" font-family="${FONT_FAMILY}">
        ${paragraph}
    </mj-text>
  </mj-column>
</mj-section>
`;

export const createTextSection = ({ text }: { text: string }) => `
//Single text
<mj-section padding="0">
  <mj-column width="100%">
    <mj-text font-size="24px;" font-weight="700" color="${COLOR}" font-family="${FONT_FAMILY}" line-height="2">
      ${text}
    </mj-text>
  </mj-column>
</mj-section>
`;

export const createButtonSection = ({
  label,
  href,
}: {
  label: string;
  href: string;
}) => `
// Button
<mj-section padding="0">
  <mj-column width="100%">
    <mj-button width="300px" display="block" background-color="${COLOR}" line-height="2" font-size="16px" font-family="${FONT_FAMILY}" target="_blank" href="${href}">
      ${label}
    </mj-button>
  </mj-column>
</mj-section>
`;

export const createSpacerSection = () => `
// Spacer
<mj-section padding="0">
  <mj-column>
    <mj-spacer height="40px" />
  </mj-column>
</mj-section>
`;

export const createNewSubtitleSection = ({
  subtitle,
}: {
  subtitle: string;
}) => `
// SubTitle
<mj-section>
  <mj-column >
    <mj-text font-size="20px" color="${COLOR}" font-weight="bold" line-height="2" font-family="${FONT_FAMILY}">
      ${subtitle}
    </mj-text>
  </mj-column>
</mj-section>
`;

const socialLinks = [
  // {
  //   icon: '${ENVIRONMENT.CLIENT_URL}/email/social_icon_facebook.png',
  //   href: 'https://www.facebook.com/compositethegame.com',
  //   alt: 'Facebook',
  // },
  // {
  //   icon: '${ENVIRONMENT.CLIENT_URL}/email/social_icon_instagram.png',
  //   href: 'https://www.instagram.com/compositethegame.com/?hl=fr',
  //   alt: 'Instagram',
  // },
  {
    icon: `${ENVIRONMENT.CLIENT_URL}/images/x-logo-black.png`,
    href: 'https://twitter.com/Compositegame',
    alt: 'Twitter',
  },
  // {
  //   icon: `https://${ENVIRONMENT.CLIENT_URL}/email/social_icon_linkedin.png`,
  //   href: 'https://www.linkedin.com/company/TODO:/',
  //   alt: 'Linkedin',
  // },
  {
    icon: `${ENVIRONMENT.CLIENT_URL}/images/email.png`,
    href: 'mailto:compositethegame@gmail.com',
    alt: 'Email',
  },
];

export const createFooter = () => `
<mj-section padding="0">
  <mj-column width="50%">
    <mj-text color="${COLOR}" padding="25px 0" line-height="2" font-family="${FONT_FAMILY}" align="left" >&copy; Copyright ${new Date().getFullYear()} <a href="${ENVIRONMENT.CLIENT_URL}" style="color: ${COLOR};">Composite</a></mj-text>
  </mj-column>
  <mj-column width="50%">
    <mj-table width="150px" align="right">
      <tr>
        ${socialLinks
          .map(
            (link) => `
              <td align="right" style="padding: 0;">
                <a href="${link.href}"alt="${link.alt}" target="_blank">
                  <img src="${link.icon}" width="48px" height="48px" />
                </a>
              </td>`,
          )
          .join('')}
      </tr>
    </mj-table>
  </mj-column>
</mj-section>`;

export class EmailComposer {
  private contentSections: string[] = [];
  constructor(private buttonText: string) {
    this.contentSections = [];
  }

  addContentSection(content: string): EmailComposer {
    this.contentSections.push(content);
    return this;
  }

  compileTemplate(): string {
    return createNewGlobalEmailTemplate(
      this.buttonText,
      this.contentSections.join(''),
    );
  }
}
