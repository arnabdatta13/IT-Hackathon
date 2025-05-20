import React from 'react';
import { FaAtom, FaFlask, FaDna, FaCalculator } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
const ChatBotHome = () => {
      const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '2rem',
        }}>
            <div style={{
                width: '95%',
                maxWidth: '1000px',
                padding: '3rem',
                borderRadius: '25px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                textAlign: 'center',
                transition: 'transform 0.3s ease',
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    marginBottom: '1rem',
                    fontWeight: 'bold',
                }}>
                    জ্ঞান অর্জনের নতুন পথ
                </h1>
               <p style={{
    fontSize: '1.3rem',
    marginBottom: '2rem',
    lineHeight: '1.8',
}}>
    পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান আর গণিতের যেকোনো প্রশ্ন? <br />
    এখন <strong>উত্তর পেতে দেরি নয়</strong> — <strong>এক ক্লিকে শুরু করুন</strong>, <em>জেনে নিন সবকিছু!</em><br /><br />
    
    <strong>ভার্চুয়াল ল্যাবের</strong> মাধ্যমে সিমুলেশন চালিয়ে শেখা এখন আরও সহজ — <em>নিজে চেষ্টা করো, নিজেই বুঝে ফেলো!</em><br />
    
    ইংরেজিতে কথা বলার অনুশীলনে আছে <strong>AI স্পিকিং অ্যাসিস্ট্যান্ট</strong> — <em>সরাসরি কারও সঙ্গে কথা না বলেও</em> উচ্চারণ, ব্যাকরণ ও শব্দভান্ডারে মিলবে তাত্ক্ষণিক সহায়তা।<br /><br />
    
    <strong>শেখা হোক মজার, সহজ আর বাস্তবসম্মত</strong> — শহর হোক কিংবা গ্রাম, যেখানেই থাকো, <em>তোমার জায়গা থেকে, নিজের সময়ে শেখার সুযোগ এখন সবার জন্য!</em>
</p>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2rem',
                    fontSize: '2rem',
                    marginBottom: '2rem',
                }}>
                    <div title="পদার্থবিজ্ঞান"><FaAtom /></div>
                    <div title="রসায়ন"><FaFlask /></div>
                    <div title="জীববিজ্ঞান"><FaDna /></div>
                    <div title="গণিত"><FaCalculator /></div>
                </div>
                <button style={{
                    padding: '1rem 2rem',
                    fontSize: '1.2rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #00b894, #00cec9)',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0, 255, 204, 0.4)',
                    transition: 'transform 0.2s ease, background 0.3s ease',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                onClick={() => navigate('/chatbot')}
                >
                    শুরু করুন
                </button>
            </div>
        </div>
    );
};

export default ChatBotHome;