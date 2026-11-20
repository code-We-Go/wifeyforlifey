import localFont from 'next/font/local'

export const lifeyFont = localFont({
  src: './app/fonts/Nickainley.otf',
}) 
export const wifeyFont = localFont({
  src: "./app/fonts/AcuminVariableConcept.otf",
});
export const thirdFont = localFont({
  src: './app/fonts/BebasNeue-Regular.ttf',
}) 
export const arabicFont = localFont({
  src: './app/fonts/SkolarSansArabicTEST-Rg.otf',
  variable: '--font-arabic',
});
export const skolarFont = arabicFont; 