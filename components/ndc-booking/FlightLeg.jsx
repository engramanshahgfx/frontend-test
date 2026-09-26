'use client';

export default function FlightLeg({ leg }) {
  return (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:'0.7rem',fontWeight:600,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.4px',marginBottom:4}}>{leg.type}</div>
      <div style={{fontSize:'0.82rem',fontWeight:600,color:'#111',marginBottom:2}}>{leg.date}</div>
      <div style={{fontSize:'0.75rem',color:'#6b7280',marginBottom:10}}>{leg.airline} {leg.flightNo}</div>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'1.15rem',fontWeight:700,color:'#111',lineHeight:1}}>{leg.dep}</div>
          <div style={{fontSize:'0.58rem',color:'#9ca3af',fontWeight:600}}>
            {parseInt(leg.dep?.split(':')[0]) >= 12 ? 'PM' : 'AM'}
          </div>
          <div style={{fontSize:'0.65rem',color:'#6b7280',fontWeight:600,marginTop:2}}>{leg.from}</div>
        </div>
        <div style={{flex:1,textAlign:'center'}}>
          {leg.direct && <div style={{fontSize:'0.65rem',color:'#10b981',fontWeight:700,marginBottom:3}}>Direct</div>}
          <div style={{height:1.5,background:'#d1d5db',position:'relative'}}>
            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:6,height:6,borderRadius:'50%',background:'#4361ee'}}/>
          </div>
          <div style={{fontSize:'0.62rem',color:'#9ca3af',marginTop:3}}>{leg.duration}</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'1.15rem',fontWeight:700,color:'#111',lineHeight:1}}>{leg.arr}</div>
          <div style={{fontSize:'0.58rem',color:'#9ca3af',fontWeight:600}}>
            {parseInt(leg.arr?.split(':')[0]) >= 12 ? 'PM' : 'AM'}
          </div>
          <div style={{fontSize:'0.65rem',color:'#6b7280',fontWeight:600,marginTop:2}}>{leg.to}</div>
        </div>
      </div>
    </div>
  );
}
