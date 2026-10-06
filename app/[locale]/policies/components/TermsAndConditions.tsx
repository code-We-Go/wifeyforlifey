import React from 'react'

const TermsAndConditions = ({selectedTab ,setSelectedTab}:{selectedTab:string,setSelectedTab:React.Dispatch<React.SetStateAction<string>> }) => {
    return (
      <div className={`${selectedTab === "terms-and-conditions" ? 'flex flex-col gap-4' : 'hidden'} h-auto w-full`}>
 <div className='flex flex-col gap-4'>

<h1 className='font-bold text-xl mb-2'>Terms & Conditions</h1>

<p>
  Welcome to Wifey for Lifey! By accessing our website or making a purchase, you agree to the terms
  outlined below. Please read them carefully.
</p>

<div>
  <h2 className='font-bold text-lg mt-4'>1. General Use</h2>
  <ul>
    <li>You must be 18 years or older to place an order.</li>
    <li>You agree to use our website legally and responsibly.</li>
    <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
  </ul>
</div>

<div>
  <h2 className='font-bold text-lg mt-4'>2. Products</h2>
  <p>
    We aim to ensure our product descriptions, images, and pricing are accurate. However, please note
    that designs, features, and availability may change without prior notice.
  </p>
</div>

<div>
  <h2 className='font-bold text-lg mt-4'>3. Orders & Payments</h2>
  <ul>
    <li>Orders are only confirmed once payment has been successfully processed.</li>
    <li>We reserve the right to cancel or delay orders due to stock limitations or payment issues.</li>
  </ul>
</div>

<div>
  <h2 className='font-bold text-lg mt-4'>4. Shipping</h2>
  <ul>
    <li>We currently deliver across Egypt.</li>
    <li>Delivery timelines vary based on your location and courier service performance.</li>
    <li>We are not liable for courier delays once the order has been dispatched.</li>
  </ul>
</div>

<div>
  <h2 className='font-bold text-lg mt-4'>5. Exclusive Video Access</h2>
  <ul>
    <li>Every planner purchase includes access to our exclusive video platform.</li>
    <li>Content is protected — it cannot be shared, downloaded, or screen-recorded.</li>
    <li>Sharing login details is strictly prohibited and may lead to revoked access or legal action.</li>
  </ul>
</div>

<div>
  <h2 className='font-bold text-lg mt-4'>6. Intellectual Property</h2>
  <p>
    All content — including videos, planner designs, and website material — is the intellectual
    property of Wifey for Lifey. Use or reproduction of this material without written permission is
    prohibited.
  </p>
</div>

<div>
  <h2 className='font-bold text-lg mt-4'>7. Community Code</h2>
  <p>
    Access to our private WhatsApp support group is reserved for verified planner buyers. We expect
    respectful communication at all times. Any form of harassment or inappropriate behavior may result
    in removal from the group.
  </p>
</div>

<p className='mt-4'>
  By continuing to use our services, you agree to these terms. If you have questions, please contact
  us at <a href="mailto:support@wifeyforlifey.com">support@wifeyforlifey.com</a>.
</p>

</div>

</div>




  )
}

export default TermsAndConditions