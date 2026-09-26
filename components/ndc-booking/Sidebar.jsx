'use client';

import FlightLeg from './FlightLeg';

export default function Sidebar({ flight, step, passengerName, addInsurance, extras = [] }) {
  const baseFare = flight?.baseFare || 0;
  const serviceFee = flight?.serviceFee || 0;
  const insurancePrice = flight?.insurancePrice || 0;
  
  // Calculate extras total
  const extrasTotal = extras.reduce((sum, extra) => sum + (extra.price || 0), 0);
  
  const flightTotal = baseFare + serviceFee;
  const addonsTotal = (addInsurance ? insurancePrice : 0) + extrasTotal;
  const total = flightTotal + addonsTotal;

  if (!flight) return null;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14,position:'sticky',top:16}}>
      <div className="scard">
        <div className="shd" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span>Flight summary</span>
          <span style={{fontSize:'0.72rem',color:'#4361ee',cursor:'pointer',fontWeight:600}}>Details</span>
        </div>
        <div className="sb">
          {flight.legs?.map((leg,i)=>(
            <div key={i}>
              <FlightLeg leg={leg}/>
              {i < flight.legs.length-1 && <div style={{height:1,background:'#f0f0f0',margin:'10px 0'}}/>}
            </div>
          ))}
          
          <div style={{height:1,background:'#f0f0f0',margin:'12px 0'}}/>
          
          <div style={{fontSize:'0.72rem',fontWeight:600,color:'#111',marginBottom:8}}>Cancel & date change</div>
          <div style={{fontSize:'0.72rem',fontWeight:600,color:'#374151',marginBottom:3}}>Details</div>
          <div style={{fontSize:'0.7rem',color:'#f59e0b'}}>Refundable with fees</div>
          <div style={{fontSize:'0.7rem',color:'#f59e0b',marginTop:2}}>Changeable with fees</div>
          
          <div style={{height:1,background:'#f0f0f0',margin:'12px 0'}}/>
          
          <div style={{fontSize:'0.72rem',fontWeight:600,color:'#111',marginBottom:8}}>Flight fare breakdown</div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',color:'#6b7280',marginBottom:4}}>
            <span>{step >= 2 && passengerName ? `Mr ${passengerName} (Adult)` : 'Traveller Adult 1'}</span>
            <span>SAR {baseFare.toFixed(2)}</span>
          </div>
          
          {step >= 2 && (
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',color:'#6b7280',marginBottom:4}}>
              <span>Service fee</span>
              <span>SAR {serviceFee.toFixed(2)}</span>
            </div>
          )}
          
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',color:'#6b7280',marginBottom:4,paddingTop:4,borderTop:'1px dashed #e5e7eb'}}>
            <span>Flight total (incl. VAT)</span>
            <span>SAR {flightTotal.toFixed(2)}</span>
          </div>

          {/* Add-ons section */}
          {(addInsurance || extras.length > 0) && (
            <>
              <div style={{height:1,background:'#f0f0f0',margin:'12px 0'}}/>
              <div style={{fontSize:'0.72rem',fontWeight:600,color:'#111',marginBottom:8}}>Add-on</div>
              
              {addInsurance && (
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',color:'#6b7280',marginBottom:4}}>
                  <span>Trip Insurance</span>
                  <span>SAR {insurancePrice.toFixed(2)}</span>
                </div>
              )}
              
              {extras.map((extra, i) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',color:'#6b7280',marginBottom:4}}>
                  <span>{extra.name}</span>
                  <span>SAR {extra.price.toFixed(2)}</span>
                </div>
              ))}
              
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',color:'#6b7280',marginBottom:4,paddingTop:4,borderTop:'1px dashed #e5e7eb'}}>
                <span>Add-on total (incl. VAT)</span>
                <span>SAR {addonsTotal.toFixed(2)}</span>
              </div>
            </>
          )}

          {/* Overall Total */}
          <div style={{height:1,background:'#f0f0f0',margin:'12px 0'}}/>
          <div style={{fontSize:'0.72rem',fontWeight:600,color:'#111',marginBottom:8}}>Overall Total Payments</div>
          
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',color:'#6b7280',marginBottom:4}}>
            <span>flight</span>
            <span>SAR {flightTotal.toFixed(2)}</span>
          </div>
          
          {addonsTotal > 0 && (
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',color:'#6b7280',marginBottom:4}}>
              <span>{addInsurance ? 'Trip Insurance' : 'Add-ons'}</span>
              <span>SAR {addonsTotal.toFixed(2)}</span>
            </div>
          )}
          
          <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:'0.95rem',color:'#111',borderTop:'2px solid #111',paddingTop:10,marginTop:6}}>
            <span>Total to be paid</span>
            <span>SAR {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
