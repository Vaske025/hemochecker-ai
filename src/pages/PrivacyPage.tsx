
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

const PrivacyPage = () => {
  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
            
            <div className="prose prose-lg dark:prose-invert">
              <p>
                Your privacy is important to us. It is our policy to respect your privacy regarding any 
                information we may collect from you across our website.
              </p>
              
              <h2>Information We Collect</h2>
              <p>
                We only collect information about you if we have a reason to do so—for example, to provide 
                our services, to communicate with you, or to make our services better. We collect information 
                in three ways: if and when you provide information to us, automatically through operating our 
                services, and from outside sources.
              </p>
              
              <h3>Information You Provide to Us</h3>
              <p>
                We collect information that you provide to us. The amount and type of information depends on 
                the context and how we use the information. Here are some examples:
              </p>
              <ul>
                <li>
                  <strong>Basic Account Information:</strong> We ask for basic information from you in order 
                  to set up your account, such as your name and email address.
                </li>
                <li>
                  <strong>Health Information:</strong> When you upload blood test results, we collect and 
                  store this health information in order to provide analysis and recommendations.
                </li>
              </ul>
              
              <h2>Health Data Privacy</h2>
              <p>
                We take the privacy of your health data extremely seriously:
              </p>
              <ul>
                <li>All health data is encrypted in transit and at rest</li>
                <li>We only use your health data to provide the services you explicitly request</li>
                <li>Your health data is never sold to third parties</li>
                <li>You can request deletion of your data at any time</li>
              </ul>
              
              <h2>How We Use Information</h2>
              <p>
                We use information about you as mentioned above and for the purposes listed below:
              </p>
              <ul>
                <li>To provide our services</li>
                <li>To further develop and improve our services</li>
                <li>To communicate with you about offers, promotions, and new features</li>
                <li>To monitor and analyze trends and better understand how users interact with our services</li>
                <li>To personalize your experience</li>
              </ul>
              
              <h2>Sharing Information</h2>
              <p>
                We do not sell our users' personal information. We share information about you in the limited 
                circumstances spelled out below:
              </p>
              <ul>
                <li>
                  <strong>Legal Requests:</strong> We may disclose information about you in response to a 
                  subpoena, court order, or other governmental request.
                </li>
                <li>
                  <strong>To Protect Rights, Property, and Others:</strong> We may disclose information about 
                  you when we believe in good faith that disclosure is reasonably necessary to protect the 
                  property or rights of our company, third parties, or the public at large.
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with any merger, sale of company assets, 
                  or acquisition of all or a portion of our business by another company, or in the unlikely 
                  event that our business goes bankrupt, user information would likely be one of the assets 
                  that is transferred or acquired by a third party.
                </li>
                <li>
                  <strong>With Your Consent:</strong> We may share and disclose information with your consent 
                  or at your direction.
                </li>
              </ul>
              
              <h2>Security</h2>
              <p>
                We take reasonable precautions to protect your information. When you submit sensitive 
                information via the website, your information is protected both online and offline. 
                However, we cannot guarantee that our security measures will prevent third party "hackers" 
                from illegally obtaining this information.
              </p>
              
              <h2>Your Rights</h2>
              <p>
                If you are located in certain countries, including those that fall under the scope of the 
                European General Data Protection Regulation (GDPR), you may have certain rights regarding 
                your personal information. These include the right to:
              </p>
              <ul>
                <li>Access to your personal data</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your personal data</li>
                <li>Objection to processing</li>
                <li>Data portability</li>
                <li>Withdrawal of consent</li>
              </ul>
              
              <h2>Changes</h2>
              <p>
                We may update this privacy policy from time to time in order to reflect changes to our practices 
                or for other operational, legal, or regulatory reasons.
              </p>
              
              <h2>Contact Us</h2>
              <p>
                For more information about our privacy practices, if you have questions, or if you would like to 
                make a complaint, please contact us by e-mail.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPage;
