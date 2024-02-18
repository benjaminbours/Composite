export const createNewGlobalEmailTemplate = (
  buttonText: string,
  content: string,
) => `
<mjml>
  <mj-body width="800px" background-color="#ffffff" >
    <mj-section padding="40px 0 10px 0">
      <mj-column width="50%">
        <mj-image width="160px" padding="5px 0" align="left" target="_blank" href="https://compositethegame.com" alt="logo" src="https://compositethegame.com/brand_logo_010622.png"></mj-image>
      </mj-column>
      <mj-column width="50%" >
        <mj-button padding="0" border-radius="25px" width="100%" background-color="#334c78" align="right"  font-size="16px" target="_blank" href="https://compositethegame.com">
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
    <mj-divider padding="0" border-color="#334c78" border-width="1px"></mj-divider>
  </mj-column>
</mj-section>
`;

export const createImageHeader = ({ path }: { path: string }) => `
<mj-section padding="0">
  <mj-column width="100%">
  
    <mj-image width="800px" padding="0" fluid-on-mobile="true" src="${path}" />
  </mj-column>
</mj-section>
`;

export const createHero = ({ path }: { path?: string; href?: string }) =>
  `<mj-hero
  mode="fluid-height"
  background-width="600px"
  background-height="250px"
  background-url=
      "${path}"
  background-color="#2a3448"
  padding="0">
</mj-hero>`;

export const createNewTextParagraphSection = ({
  title,
  paragraph,
}: {
  title: string;
  paragraph: string;
}) => `
<mj-section padding="0">
  <mj-column width="100%">
    <mj-text font-size="24px" padding-bottom="5px" color="#334c78" font-weight="bold" font-family="helvetica">
        ${title}
    </mj-text>
    <mj-text font-size="16px" padding-bottom="20px" color="#334c78" font-family="helvetica">
        ${paragraph}
    </mj-text>
  </mj-column>
</mj-section>
`;

export const createTextSection = ({ text }: { text: string }) => `
//Single text
<mj-section padding="0">
  <mj-column width="100%">
    <mj-text font-size="24px;" font-weight="700" color="#334c78" font-family="helvetica">
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
    <mj-button width="100%" border-radius="25px" width="100%" background-color="#334c78" font-size="16px" target="_blank" href="${href}">
      ${label}
    </mj-button>
  </mj-column>
</mj-section>
`;

export const createNewRowSection = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => `
// Title w Text row
<mj-section padding="0">
    <mj-column >
        <mj-text font-size="16px" color="#334c78" font-family="helvetica">
            ${label}
        </mj-text>
    </mj-column>
    <mj-column  >
        <mj-text align="right" font-weight="bold" font-size="14px" color="#334c78" font-family="helvetica">
            ${value}
        </mj-text>
    </mj-column>
</mj-section>
`;

export const createImageTitleRowSection = ({
  imagePath,
  title,
}: {
  imagePath: string;
  title: string;
}) => `
// Title w Text row
<mj-section padding="0">
    <mj-column >
    <mj-image width="200px" padding="0" fluid-on-mobile="true" src="${imagePath}" />
    </mj-column>
    <mj-column  >
        <mj-text align="right" font-weight="bold" font-size="14px" color="#334c78" font-family="helvetica">
            ${title}
        </mj-text>
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
    <mj-text font-size="20px" color="#334c78" font-weight="bold" font-family="helvetica">
      ${subtitle}
    </mj-text>
  </mj-column>
</mj-section>
`;

const socialLinks = [
  {
    icon: 'https://compositethegame.com/email/social_icon_facebook.png',
    href: 'https://www.facebook.com/compositethegame.com',
    alt: 'Facebook',
  },
  {
    icon: 'https://compositethegame.com/email/social_icon_instagram.png',
    href: 'https://www.instagram.com/compositethegame.com/?hl=fr',
    alt: 'Instagram',
  },
  {
    icon: 'https://compositethegame.com/email/social_icon_twitter.png',
    href: 'https://twitter.com/TODO:',
    alt: 'Twitter',
  },
  {
    icon: 'https://compositethegame.com/email/social_icon_linkedin.png',
    href: 'https://www.linkedin.com/company/TODO:/',
    alt: 'Linkedin',
  },
  {
    icon: 'https://compositethegame.com/email/social_icon_mail.png',
    href: 'mailto:hello@compositethegame.com',
    alt: 'Email',
  },
  {
    icon: 'https://compositethegame.com/email/social_icon_calendly.png',
    href: 'https://calendly.com/TODO:/rdv-telephonique',
    alt: 'Calendly',
  },
];

export const createFooter = () => `
<mj-section padding="0">
  <mj-column width="50%">
    <mj-text color="#334c78" padding="25px 0" align="left" >&copy; Copyright ${new Date().getFullYear()} <a href="https://compositethegame.com">Composite</a></mj-text>
  </mj-column>
  <mj-column width="50%">
    <mj-table>
      <tr>
        ${socialLinks
          .map(
            (link) => `
              <td style="padding: 0">
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
