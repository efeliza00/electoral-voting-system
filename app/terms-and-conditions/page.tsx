import Footer from '@/components/sections/landing-page/footer/footer'
import HeaderNavbarPublic from '@/components/sections/landing-page/header/navbar-public'
import { Mail } from 'lucide-react'


const TermsAndConditions = () => {
  return (
<>
<HeaderNavbarPublic/>
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 my-28">
  {/* Header */}
  <div className="text-center mb-12">
    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Terms and Conditions</h1>
    <p className="text-lg text-gray-600 dark:text-gray-300">Last updated: July 19, 2025</p>
    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <p className="text-blue-800 dark:text-blue-200">
        Please read these terms and conditions carefully before using Our Service.
      </p>
    </div>
  </div>

  {/* Content Container */}
  <div className="bg-white dark:bg-gray-800  rounded-xl overflow-hidden">
    {/* Interpretation Section */}
    <div className="p-8 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Interpretation and Definitions</h2>
      
      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mt-6 mb-3">Interpretation</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        The words of which the initial letter is capitalized have meanings defined under the following conditions. 
        The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
      </p>
      
      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mt-6 mb-3">Definitions</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        For the purposes of these Terms and Conditions:
      </p>
      
      <ul className="space-y-4">
        <li className="flex">
          <span className="flex-shrink-0 text-primary dark:text-blue-400 mr-2">•</span>
          <span className="text-gray-600 dark:text-gray-400">
            <strong className="text-gray-800 dark:text-white">Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.
          </span>
        </li>
        <li className="flex">
          <span className="flex-shrink-0 text-primary dark:text-blue-400 mr-2">•</span>
          <span className="text-gray-600 dark:text-gray-400">
            <strong className="text-gray-800 dark:text-white">Country</strong> refers to: Philippines
          </span>
        </li>
        <li className="flex">
          <span className="flex-shrink-0 text-primary dark:text-blue-400 mr-2">•</span>
          <span className="text-gray-600 dark:text-gray-400">
            <strong className="text-gray-800 dark:text-white">Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Agreement) refers to VoteBuddy.
          </span>
        </li>
        {/* Add other list items similarly */}
      </ul>
    </div>

    {/* Acknowledgment Section */}
    <div className="p-8 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Acknowledgment</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.
      </p>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.
      </p>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg my-4">
        <p className="text-yellow-800 dark:text-yellow-200">
          By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.
        </p>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.
      </p>
    </div>

    {/* Links Section */}
    <div className="p-8 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Links to Other Websites</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Our Service may contain links to third-party web sites or services that are not owned or controlled by the Company.
      </p>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such web sites or services.
      </p>
      <div className="bg-accent dark:bg-blue-900/20 p-4 rounded-lg">
        <p className="text-primary dark:text-blue-200">
          We strongly advise You to read the terms and conditions and privacy policies of any third-party web sites or services that You visit.
        </p>
      </div>
    </div>

    {/* Termination Section */}
    <div className="p-8 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Termination</h2>
      <p className="text-gray-600 dark:text-gray-400">
        We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.
      </p>
      <div className="bg-destructive/5 dark:bg-red-900/20 p-4 rounded-lg my-4">
        <p className="text-destructive dark:text-red-200">
          Upon termination, Your right to use the Service will cease immediately.
        </p>
      </div>
    </div>

    {/* Continue with other sections in similar fashion */}

    {/* Contact Section */}
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Contact Us</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        If you have any questions about these Terms and Conditions, You can contact us:
      </p>
      <div className="flex items-center">
        <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
        <a href="mailto:evanfeliza22@gmail.com" className="text-primary dark:text-blue-400 hover:underline">
          evanfeliza22@gmail.com
        </a>
      </div>
    </div>
  </div>
</div>
<Footer/>
</>
  )
}

export default TermsAndConditions