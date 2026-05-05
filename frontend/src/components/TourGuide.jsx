import { useState, useEffect } from 'react';
import * as JoyridePkg from 'react-joyride';
import { useTranslation } from 'react-i18next';

const Joyride = JoyridePkg.default || JoyridePkg.Joyride || JoyridePkg;
const STATUS = JoyridePkg.STATUS;

export default function TourGuide() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'hi' ? 'hi' : 'en';

  const [run, setRun] = useState(false);

  useEffect(() => {
    // Only run the tour once per user device
    const hasSeenTour = localStorage.getItem('sk_tour_completed');
    if (!hasSeenTour) {
      // Small delay to ensure the DOM is fully rendered
      setTimeout(() => setRun(true), 1000);
    }
  }, []);

  const steps = [
    {
      target: 'body',
      content: lang === 'hi' 
        ? 'स्मार्ट किसान में आपका स्वागत है! चलिए एक छोटा सा टूर करते हैं कि ऐप का उपयोग कैसे करें।' 
        : 'Welcome to Smart Kisan! Let\'s take a quick tour of how to use the app.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: 'nav',
      content: lang === 'hi'
        ? 'यहाँ से आप मौसम, मंडी भाव, और लेबर जैसी विभिन्न सेवाओं पर जा सकते हैं।'
        : 'Use this menu to navigate between Weather, Market Prices, Labour, and other services.',
      placement: 'bottom',
    },
    {
      target: '.fixed.bottom-6.right-6',
      content: lang === 'hi'
        ? 'यह हमारा वॉयस असिस्टेंट है! इसे दबाएं और कहें "मौसम दिखाओ" या "मंडी भाव" और यह आपको उस पेज पर ले जाएगा।'
        : 'This is our Voice Assistant! Tap it and say "Show weather" or "Mandi rates" and it will navigate for you.',
      placement: 'top-start',
    },
    {
      target: '.fixed.bottom-6.left-6',
      content: lang === 'hi'
        ? 'यह किसान मित्र (AI चैटबॉट) है। खेती से जुड़ा कोई भी सवाल आप यहाँ पूछ सकते हैं।'
        : 'This is Kisan Mitra (AI Chatbot). Ask it any farming-related questions you have.',
      placement: 'top-end',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('sk_tour_completed', 'true');
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#10b981', // emerald-500
          zIndex: 10000,
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
        },
        tooltip: {
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
        buttonNext: {
          borderRadius: '8px',
          fontWeight: 'bold',
        },
        buttonBack: {
          marginRight: 10,
        },
        buttonSkip: {
          color: '#6b7280',
        }
      }}
      locale={{
        last: lang === 'hi' ? 'खत्म करें' : 'Finish',
        next: lang === 'hi' ? 'आगे बढ़ें' : 'Next',
        back: lang === 'hi' ? 'पीछे' : 'Back',
        skip: lang === 'hi' ? 'छोड़ें' : 'Skip',
      }}
    />
  );
}
