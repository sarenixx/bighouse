import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal-page-shell";

export const metadata: Metadata = {
  title: "Terms of Use | Amseta",
  description: "Amseta Terms of Use."
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Amseta Terms of Use" effectiveDate="April 19, 2026">
      <p>
        These Terms of Use ("Terms") govern your access to and use of the website, platform, and
        services provided by Amseta, Inc. ("Amseta," "we," "us," or "our") (collectively, the
        "Services").
      </p>

      <p>
        By accessing or using the Services, you agree to be bound by these Terms. If you do not
        agree to these Terms, you may not access or use the Services.
      </p>

      <h2>1. Use of Services</h2>
      <p>
        You may use the Services only in accordance with these Terms and all applicable laws and
        regulations.
      </p>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Services for any unlawful purpose</li>
        <li>Interfere with or disrupt the integrity or performance of the Services</li>
        <li>
          Attempt to gain unauthorized access to any portion of the Services or related systems
        </li>
        <li>Use the Services to transmit or store malicious code</li>
      </ul>
      <p>
        Amseta reserves the right to suspend or terminate access to the Services for any user who
        violates these Terms.
      </p>

      <h2>2. Account Registration and Security</h2>
      <p>
        Access to certain features of the Services may require you to create an account.
      </p>
      <p>You agree to:</p>
      <ul>
        <li>Provide accurate and complete information</li>
        <li>Maintain and promptly update your information</li>
        <li>Maintain the confidentiality of your account credentials</li>
        <li>Be responsible for all activity under your account</li>
      </ul>
      <p>
        You must notify Amseta immediately of any unauthorized use of your account.
      </p>

      <h2>3. Services and No Professional Advice</h2>
      <p>
        Amseta provides real estate oversight, reporting, and related services.
      </p>
      <p>
        All information provided through the Services is for informational and oversight purposes
        only and does not constitute legal, tax, accounting, or investment advice.
      </p>
      <p>
        You are solely responsible for evaluating and acting upon any information provided through
        the Services and should consult appropriate professional advisors where necessary.
      </p>

      <h2>4. Fiduciary Role and Limitations</h2>
      <p>
        Amseta may act in a fiduciary or oversight capacity pursuant to separate written agreements.
      </p>
      <p>
        Nothing in these Terms creates a fiduciary relationship unless expressly set forth in a
        separate agreement between you and Amseta.
      </p>

      <h2>5. Intellectual Property</h2>
      <p>
        All content, materials, and functionality included in the Services, including but not
        limited to text, graphics, logos, software, and reports, are the property of Amseta or its
        licensors and are protected by applicable intellectual property laws.
      </p>
      <p>You may not:</p>
      <ul>
        <li>Copy, reproduce, distribute, or create derivative works</li>
        <li>Reverse engineer or attempt to extract source code</li>
        <li>Use any content for commercial purposes without prior written consent</li>
      </ul>

      <h2>6. Confidentiality</h2>
      <p>
        You agree to maintain the confidentiality of any non-public information obtained through the
        Services, including reports, financial data, and platform outputs.
      </p>
      <p>
        You may not disclose such information to third parties except as required by law or with
        prior written consent from Amseta.
      </p>

      <h2>7. Third-Party Data and Integrations</h2>
      <p>
        The Services may incorporate data from third-party sources, including property managers,
        operators, and financial systems.
      </p>
      <p>
        Amseta does not guarantee the accuracy, completeness, or timeliness of third-party data and
        is not responsible for errors or omissions in such data.
      </p>

      <h2>8. Disclaimer of Warranties</h2>
      <p>The Services are provided on an "as is" and "as available" basis.</p>
      <p>
        To the fullest extent permitted by law, Amseta disclaims all warranties, whether express or
        implied, including but not limited to:
      </p>
      <ul>
        <li>Merchantability</li>
        <li>Fitness for a particular purpose</li>
        <li>Non-infringement</li>
        <li>Accuracy or reliability of information</li>
      </ul>
      <p>
        Amseta does not warrant that the Services will be uninterrupted, secure, or error-free.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, Amseta shall not be liable for any indirect,
        incidental, consequential, special, or punitive damages, including but not limited to loss
        of profits, data, or business opportunities, arising out of or related to your use of the
        Services.
      </p>
      <p>
        In no event shall Amseta's total liability exceed the amount paid by you, if any, for
        access to the Services during the twelve months preceding the claim.
      </p>

      <h2>10. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless Amseta and its officers, directors,
        employees, and affiliates from and against any claims, liabilities, damages, losses, or
        expenses arising out of or related to:
      </p>
      <ul>
        <li>Your use of the Services</li>
        <li>Your violation of these Terms</li>
        <li>Your violation of any applicable law or rights of a third party</li>
      </ul>

      <h2>11. Termination</h2>
      <p>
        Amseta may suspend or terminate your access to the Services at any time, with or without
        notice, for any reason, including violation of these Terms.
      </p>
      <p>Upon termination, your right to use the Services will immediately cease.</p>

      <h2>12. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of the State of
        California, without regard to its conflict of laws principles.
      </p>

      <h2>13. Changes to Terms</h2>
      <p>
        Amseta may update these Terms from time to time. Any changes will be effective upon posting.
        Your continued use of the Services constitutes acceptance of the revised Terms.
      </p>

      <h2>14. Contact Information</h2>
      <p>If you have any questions regarding these Terms, please contact:</p>
      <address>
        Amseta, Inc.
        <br />
        27 W Anapamu St Unit 422
        <br />
        Santa Barbara, CA 93101
        <br />
        hello@amseta.com
      </address>
    </LegalPageShell>
  );
}
