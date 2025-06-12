import React from 'react'

const CookiePolicy = ({selectedTab ,setSelectedTab}:{selectedTab:string,setSelectedTab:React.Dispatch<React.SetStateAction<string>> }) => {
    return (
    <div className={`${selectedTab==="cookie-policy"?'flex flex-col gap-4':'hidden'}  h-auto w-full`}>
       <div className="flex flex-col gap-4">

  <div>
    <h2 className="font-bold text-xl">What Are Cookies?</h2>
    <p>
      Cookies are small text files stored on your device (computer, smartphone, or tablet) when you visit
      our website. They help us enhance your browsing experience, remember your preferences, and gather
      analytics to improve our services.
    </p>
  </div>

  <div>
    <h2 className="font-bold text-xl">How ANCHUVA Uses Cookies</h2>
    <p>We use cookies to:</p>
    <ul className="list-disc pl-6">
      <li>
        <strong>Ensure website functionality:</strong> Enable basic functions like navigation and access
        to secure areas.
      </li>
      <li>
        <strong>Enhance user experience:</strong> Remember your preferences, such as language and
        region.
      </li>
      <li>
        <strong>Analyze performance:</strong> Collect data to measure and improve website performance.
      </li>
      <li>
        <strong>Personalize content:</strong> Tailor product recommendations and marketing based on your
        interests.
      </li>
    </ul>
  </div>

  <div>
    <h2 className="font-bold text-xl">Types of Cookies We Use</h2>

    <h3 className="font-semibold">1. Essential Cookies</h3>
    <p>
      These are necessary for the website to function properly and cannot be disabled. Examples include
      cookies that allow you to log into your account or make a purchase.
    </p>

    <h3 className="font-semibold">2. Performance and Analytics Cookies</h3>
    <p>
      These cookies help us understand how visitors interact with our website by collecting anonymous
      data on usage and behavior.
    </p>

    <h3 className="font-semibold">3. Functionality Cookies</h3>
    <p>
      These remember your preferences (e.g., language, location) to provide a personalized experience.
    </p>

    <h3 className="font-semibold">4. Marketing and Advertising Cookies</h3>
    <p>
      These track your online activity to deliver tailored ads and promotions. They may be set by
      third-party services like Google Ads or Facebook.
    </p>
  </div>

  <div>
    <h2 className="font-bold text-xl">Third-Party Cookies</h2>
    <p>Some cookies are placed by third parties on our website, such as:</p>
    <ul className="list-disc pl-6">
      <li>
        <strong>Google Analytics:</strong> For tracking website performance and visitor activity.
      </li>
      <li>
        <strong>Social Media Integrations:</strong> To enable sharing content on platforms like
        Instagram, Facebook, or Pinterest.
      </li>
    </ul>
    <p>
      For more information on third-party cookies, please review the respective policies of these
      services.
    </p>
  </div>

  <div>
    <h2 className="font-bold text-xl">Managing Your Cookie Preferences</h2>
    <p>
      You can control or disable cookies through your browser settings. Please note that disabling
      cookies may affect your ability to access certain features of the website.
    </p>
    <p>Steps to Manage Cookies:</p>
    <ul className="list-disc pl-6">
      <li>
        <strong>Google Chrome:</strong> Go to Settings &gt; Privacy and Security &gt; Cookies and Other
        Site Data.
      </li>
      <li>
        <strong>Safari:</strong> Go to Preferences &gt; Privacy &gt; Manage Website Data.
      </li>
      <li>
        <strong>Firefox:</strong> Go to Preferences &gt; Privacy & Security &gt; Cookies and Site Data.
      </li>
    </ul>
  </div>

  <div>
    <h2 className="font-bold text-xl">Updates to This Cookie Policy</h2>
    <p>
      ANCHUVA may update this Cookie Policy to reflect changes in technology, law, or our practices. The
      latest version will always be available on this page.
    </p>
  </div>

  <div>
    <h2 className="font-bold text-xl">Contact Us</h2>
    <p>
      If you have questions about this Cookie Policy or how we use cookies, please reach out to us:
    </p>
    <p>
      <strong>ANCHUVA Privacy Team</strong><br />
      Email: <a href="mailto:privacy@anchuva.com" className="text-blue-500 underline">privacy@anchuva.com</a>
    </p>
    <p>
      By continuing to use our website, you consent to the use of cookies as outlined in this policy.
    </p>
  </div>
</div>




        
    </div>
  )
}

export default CookiePolicy