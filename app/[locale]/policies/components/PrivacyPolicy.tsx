import React from 'react'

const PrivacyPolicy = ({selectedTab ,setSelectedTab}:{selectedTab:string,setSelectedTab:React.Dispatch<React.SetStateAction<string>> }) => {
    return (
    <div className={`${selectedTab==="privacy-policy"?'flex flex-col gap-4':'hidden'}  h-auto w-full`}>
        {/* <div>
            <p>At ANCHUVA, we value your trust and are committed to safeguarding your personal information. This Privacy Notice explains how we collect, use, share, and protect your data when you interact with our website, services, or products.</p>
        </div>
        <div className='flex flex-col'>
            <div>

            <h1 className='font-bold text-xl' className='font-semibold'text-lg>Information We Collect</h1>
            <p>Personal Information</p>
We collect personal data you provide directly to us, such as:
•	Contact details: Name, email address, phone number, and mailing address.
•	Payment information: Credit/debit card details or other payment methods.
•	Account information: Login credentials and purchase history.
</p>
            </div> */}

        {/* </div> */}
        <div className='flex flex-col gap-4'>

<p>
  At Wifey for Lifey, we deeply value your privacy. This Privacy Policy explains what data we collect,
  how we use it, and how we keep it safe while offering you the best bridal experience.
</p>

<div>
  <h1 className='font-bold text-xl mb-4'>1. What We Collect</h1>
  <h2 className='font-semibold text-lg'>Personal Information</h2>
  <p>We may collect the following personal details you provide:</p>
  <ul>
    <li>Your name, email, phone number</li>
    <li>Order and shipping details</li>
  </ul>

  <h2 className='font-semibold text-lg mt-4'>Non-Personal Information</h2>
  <p>We also collect some data automatically when you use our site:</p>
  <ul>
    <li>IP address and device type</li>
    <li>Browser data and activity info (via cookies)</li>
  </ul>
</div>

<div>
  <h1 className='font-bold text-xl'>2. Why We Collect It</h1>
  <p>We collect and use your data to:</p>
  <ul>
    <li>Process your order and send you updates</li>
    <li>Give you access to exclusive video content</li>
    <li>Improve your shopping and learning experience</li>
    <li>Respond to customer support inquiries</li>
    <li>Meet legal and regulatory requirements</li>
  </ul>
</div>

<div>
  <h1 className='font-bold text-xl'>3. How We Protect Your Data</h1>
  <p>
    We use secure systems and technologies to protect your information. While no method of online
    transmission is 100% secure, we take strong steps to safeguard your personal data.
  </p>
</div>

<div>
  <h1 className='font-bold text-xl'>4. Sharing Your Information</h1>
  <p>
    We do not sell or rent your personal information. We may share it with trusted partners like:
  </p>
  <ul>
    <li>Payment processors</li>
    <li>Shipping and delivery services</li>
  </ul>
  <p>Only the minimum necessary data is shared for these essential services.</p>
</div>

<div>
  <h1 className='font-bold text-xl'>5. Your Rights</h1>
  <p>You have the right to:</p>
  <ul>
    <li>Access your personal data</li>
    <li>Correct inaccuracies</li>
    <li>Request deletion of your data</li>
  </ul>
  <p>
    To exercise any of these rights, please contact us at <a href="mailto:privacy@wifeyforlifey.com">privacy@wifeyforlifey.com</a> or WhatsApp us at [Insert Number].
  </p>
</div>

<div>
  <h1 className='font-bold text-xl'>6. Updates to This Policy</h1>
  <p>
    We may update this Privacy Policy occasionally to reflect changes in our practices. Please check
    this page regularly to stay informed.
  </p>
</div>

<p>
  Thank you for trusting Wifey for Lifey with your personal information. Your privacy is our promise.
</p>
</div>



        
    </div>
  )
}

export default PrivacyPolicy