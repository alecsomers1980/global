import './globals.css'
import { Poppins } from 'next/font/google'
import RestaurantJsonLd from '../components/JsonLd'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata = {
  title: 'Ramenhead | Authentic Japanese Ramen in Cape Town',
  description: 'Experience the best authentic Japanese ramen in Cape Town at Ramenhead. Freshly made noodles, 18-hour simmered broths, and a vibrant atmosphere at Speaker\'s Corner and Time Out Market.',
  keywords: ['Ramen Cape Town', 'Japanese Restaurant Cape Town', 'Best Ramen South Africa', 'Ramenhead', 'Speaker\'s Corner Restaurant'],
  openGraph: {
    title: 'Ramenhead | Authentic Japanese Ramen in Cape Town',
    description: 'Freshly made noodles and umami-rich broths in the heart of the city.',
    images: ['/assets/RAMENHEAD-WS-PIC-02.jpg'],
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <RestaurantJsonLd />
      </head>
      <body className={poppins.variable}>
        <header>
          <a href="#">
            <img src="/assets/logo.svg" alt="logo" />
          </a>
          <a className="button alt bookings" href="https://www.dineplan.com/restaurants/ramenhead" target="_blank" rel="noopener noreferrer">BOOK NOW</a>
        </header>

        <main>{children}</main>

        <footer>
          <div>
            <h4>AUTHENTIC JAPANESE RAMEN</h4>
            <p>If you&apos;re as serious about ramen as we are, you&apos;ve found the best place in Cape Town to slurp silky freshly made noodles, sip umami-rich broth which has been simmered and nurtured for days, and socialise with brimful glasses of sake.</p>
            <p>Taking our cue from the ramen houses in Japan, not only with the authenticity of our ingredients and the care lavished on the preparation, we are casual, we are edgy, and we have a vibe - day and night, right in the heart of the city. Because the noodles are freshly made on-site, we limit the number of guests per half hour so you get the finest bowl of ramen. </p>
            
            <h4 style={{marginTop: '56px'}}>OUR RESTAURANTS</h4>
            <div>
              <a style={{backgroundColor: 'transparent', padding: 0}} href="https://beyondrestaurant.co.za/" target="_blank" rel="noopener noreferrer">
                <img src="/assets/beyond-logo.svg" alt="Beyond" width="100" style={{display: 'inline-block'}} />
              </a>
              <a style={{backgroundColor: 'transparent', padding: 0}} href="https://fynrestaurant.com/" target="_blank" rel="noopener noreferrer">
                <img src="/assets/fyn-logo.svg" alt="Fyn" width="76" style={{display: 'inline-block', marginLeft: '32px'}} />
              </a>
              <a style={{backgroundColor: 'transparent', padding: 0}} href="https://www.sushiya.co.za/" target="_blank" rel="noopener noreferrer">
                <img src="/assets/sushiya-logo.svg" alt="Sushiya" height="38" style={{display: 'inline-block', marginLeft: '32px'}} />
              </a>
              <a style={{backgroundColor: 'transparent', padding: 0}} href="https://arum.co.za/" target="_blank" rel="noopener noreferrer">
                <img src="/assets/arum.png" alt="arum" height="23" style={{display: 'inline-block', marginLeft: '32px', marginBottom: '5px'}} />
              </a>
            </div>
          </div>

          <div>
            <div>
              <h5>DINNER</h5>
              <p>Tues-Sun 5-10pm</p>
            </div>
            
            <div>
              <h5>RAMENHEAD HAPPY HOUR</h5>
              <p>Weekdays 5–7pm</p>
              <p>2-for-1 cocktails.<br />
              2-for-1 small plates & gyoza.</p>
            </div>
            
            <div style={{marginBottom: '8px'}}>
              <h5>LOCATIONS</h5>
              <p>Speaker&apos;s Corner</p>
              <p>37 Parliament St Cape Town</p>
              <p style={{marginTop: '12px'}}>Time Out Market Cape Town</p>
              <p>V&A Waterfront</p>
            </div>
            
            <div style={{marginBottom: '8px'}}>
              <h5>CONTACT</h5>
              <p>WhatsApp: +27673128061</p>
              <p>Email: <a href="mailto:info@ramenhead.co.za">info@ramenhead.co.za</a></p>
            </div>
            
            <div style={{marginBottom: '8px'}}>
              <h5>BOOK VIA DINEPLAN. WALK-INS ARE WELCOME. NO CASH PAYMENTS.</h5>
            </div>
            
            <div className="btns">
              <a className="button" href="/downloads/menu.pdf" target="_blank" rel="noopener noreferrer">MENU</a>
              <a className="button" href="/downloads/menu_drinks.pdf" target="_blank" rel="noopener noreferrer" style={{marginTop: '8px'}}>DRINKS MENU</a>
              <a className="button" href="https://www.voucherplan.co.za/event/9aa986c760c0da21e14789e83d70ce5a" target="_blank" rel="noopener noreferrer" style={{marginTop: '8px'}}>BUY VOUCHER</a>
            </div>
            
            <div>
              <h5 style={{fontWeight: 'normal', textTransform: 'none', letterSpacing: 'normal'}}>We can accommodate most dietary needs with prior notice, but not severe, fatal, or allium/garlic allergies. For questions, please contact reservations.</h5>
            </div>
          </div>
        </footer>
        
        <div className="copyw"> 
          <p style={{width: '80%'}}>2026 © Ramenhead. All Rights Reserved.</p>
        </div>
      </body>
    </html>
  )
}
