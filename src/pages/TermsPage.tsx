
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

const TermsPage = () => {
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
            <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
            
            <div className="prose prose-lg dark:prose-invert">
              <h2>1. Terms</h2>
              <p>
                By accessing this website, you are agreeing to be bound by these terms of service, 
                all applicable laws and regulations, and agree that you are responsible for compliance 
                with any applicable local laws.
              </p>
              
              <h2>2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials on our website 
                for personal, non-commercial transitory viewing only.
              </p>
              
              <h2>3. Disclaimer</h2>
              <p>
                The materials on our website are provided on an 'as is' basis. We make no warranties, 
                expressed or implied, and hereby disclaim and negate all other warranties including, 
                without limitation, implied warranties or conditions of merchantability, fitness for a 
                particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
              
              <h2>4. Health Information Disclaimer</h2>
              <p>
                The health information provided on this website is for general educational purposes only. 
                It is not intended to substitute for professional medical advice, diagnosis, or treatment. 
                Always seek the advice of your physician or other qualified health provider with any questions 
                you may have regarding a medical condition.
              </p>
              
              <h2>5. Data Privacy</h2>
              <p>
                We take your privacy seriously. All blood test data uploaded to our platform is encrypted 
                and securely stored. We never share your health information with third parties without your 
                explicit consent. Please refer to our Privacy Policy for more information.
              </p>
              
              <h2>6. Limitations</h2>
              <p>
                In no event shall we or our suppliers be liable for any damages (including, without limitation, 
                damages for loss of data or profit, or due to business interruption) arising out of the use or 
                inability to use the materials on our website.
              </p>
              
              <h2>7. Revisions and Errata</h2>
              <p>
                The materials appearing on our website could include technical, typographical, or photographic 
                errors. We do not warrant that any of the materials on our website are accurate, complete or current.
              </p>
              
              <h2>8. Links</h2>
              <p>
                We have not reviewed all of the sites linked to our website and are not responsible for the 
                contents of any such linked site. The inclusion of any link does not imply endorsement by us 
                of the site.
              </p>
              
              <h2>9. Terms of Use Modifications</h2>
              <p>
                We may revise these terms of use for our website at any time without notice. By using this 
                website you are agreeing to be bound by the then current version of these terms of service.
              </p>
              
              <h2>10. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws and you 
                irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default TermsPage;
