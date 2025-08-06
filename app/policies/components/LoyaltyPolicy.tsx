import React from 'react'

const LoyaltyPolicy = ({selectedTab ,setSelectedTab}:{selectedTab:string,setSelectedTab:React.Dispatch<React.SetStateAction<string>> }) => {
    return (
      <div className={`${selectedTab === "loyalty" ? 'flex flex-col gap-4' : 'hidden'} h-auto w-full`}>
        <div className='flex flex-col gap-4'>

          <h1 className='font-bold text-xl mb-2'>🎁 Wifey for Lifey – Loyalty Program</h1>
          
          <p className='text-lg font-medium mb-4'>
            Earn points. Unlock rewards. Join the sisterhood.
          </p>

          <div>
            <h2 className='font-bold text-lg mt-6 mb-3'>👀 How to Earn Points</h2>
            <ul className='space-y-2'>
              <li className='flex items-start gap-2'>
                <span>📲</span>
                <span><strong>Follow us on Instagram</strong> = 25 points</span>
              </li>
              <li className='flex items-start gap-2'>
                <span>💬</span>
                <span><strong>Tag Wifey on your IG Stories</strong> = 30 points</span>
              </li>
              <li className='flex items-start gap-2'>
                <span>📦</span>
                <span><strong>Place another order within 30 days</strong> = 50 points</span>
              </li>
              <li className='flex items-start gap-2'>
                <span>💕</span>
                <span><strong>Refer a bride</strong> = 2500 points</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className='font-bold text-lg mt-6 mb-3'>👑 Loyalty Tiers</h2>
            
            <div className='space-y-6'>
              <div className='border border-gray-200 rounded-lg p-4'>
                <h6 className='font-bold text-md mb-2'>1. 💌 Bestie – up to 5,000 points</h6>
                <ul className='space-y-1 text-sm'>
                  <li>🎂 Birthday bonus points</li>
                  <li>🔓 Early access to pre-orders of new products</li>
                </ul>
              </div>

              <div className='border border-gray-200 rounded-lg p-4'>
                <h6 className='font-bold text-md mb-2'>2. 💍 Wifey – up to 10,000 points</h6>
                <p className='text-sm mb-2'>Everything in Bestie, plus:</p>
                <ul className='space-y-1 text-sm'>
                  <li>🎁 Discounts on new product launches</li>
                  <li>⏰ Early access to new collections</li>
                  <li>💖 Bonus points on birthday and wedding day</li>
                </ul>
              </div>

              <div className='border border-gray-200 rounded-lg p-4'>
                <h6 className='font-bold text-md mb-2'>3. 👑 Boss Wifey – 15,000+ points</h6>
                <p className='text-sm mb-2'>Everything in Wifey, plus:</p>
                <ul className='space-y-1 text-sm'>
                  <li>🎉️ Exclusive invites to Wifey for Lifey events</li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <p> each 20 points is equal to 1 EGP.</p>
          </div>

        </div>
      </div>
    )
}

export default LoyaltyPolicy