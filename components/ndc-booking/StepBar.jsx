'use client';

import { useRouter, useParams } from 'next/navigation';

const steps = [
  {n:1, label:'Choose your flight', path: ''},
  {n:2, label:'Enter your details', path: '/passengers'},
  {n:3, label:'Upgrade your experience', path: '/extras'},
  {n:4, label:'Final details', path: '/checkout'},
];

export default function StepBar({ currentStep = 1 }) {
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || 'en';

  const handleStepClick = (step) => {
    if (step.n < currentStep) {
      router.push(`/${lang}/ndc-flights${step.path}`);
    }
  };

  return (
    <div style={{background:'#fff',borderBottom:'1px solid #eaecef',boxShadow:'0 1px 3px rgba(0,0,0,.04)'}}>
      <div className="step-bar">
        {steps.map((s,i)=>(
          <div key={s.n} style={{display:'flex',alignItems:'center',flexShrink:0}}>
            <div 
              style={{display:'flex',alignItems:'center',gap:7,cursor:s.n<currentStep?'pointer':'default'}} 
              onClick={()=>handleStepClick(s)}
            >
              <div style={{
                width:26,
                height:26,
                borderRadius:'50%',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                fontWeight:800,
                fontSize:'0.75rem',
                flexShrink:0,
                background:s.n<currentStep?'#10b981':s.n===currentStep?'#4361ee':'#e5e7eb',
                color:s.n<=currentStep?'#fff':'#9ca3af',
                transition:'all .2s'
              }}>
                {s.n<currentStep?'✓':s.n}
              </div>
              <span style={{
                fontSize:'0.78rem',
                fontWeight:s.n===currentStep?700:400,
                color:s.n<currentStep?'#10b981':s.n===currentStep?'#4361ee':'#9ca3af',
                whiteSpace:'nowrap'
              }}>
                {s.label}
              </span>
            </div>
            {i<3 && (
              <div style={{
                width:28,
                height:1.5,
                background:s.n<currentStep?'#10b981':'#e5e7eb',
                margin:'0 6px',
                flexShrink:0
              }}/>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
