'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function FlightTicketPage() {
    const params = useParams();
    const ref = params?.ref || 'TLR 100 012 003';
    const [ticketData, setTicketData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/v2/akbar/retrieve/${encodeURIComponent(ref)}`);
                const json = await res.json();
                if (json.success) {
                    setTicketData(json.data);
                }
            } catch (err) {
                console.error("Failed to load ticket details", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [ref]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontFamily: 'sans-serif' }}>
                <p style={{ fontSize: '18px', color: '#E85D1F', fontWeight: 700 }}>Loading E-Ticket Confirmation...</p>
            </div>
        );
    }

    const bookingRef = decodeURIComponent(ticketData?.order_reference || ref).replace(/%20/g, ' ');
    const pnr = ticketData?.airline_pnr || 'SVQKAM';
    const ticketNo = ticketData?.ticket_number || '712-40981928';
    const totalAmount = ticketData?.total_amount || ticketData?.customer_total_amount || 1401;
    const paxName = ticketData?.passenger ? `${ticketData.passenger.last_name} / ${ticketData.passenger.first_name} ${ticketData.passenger.title || 'MR'}`.toUpperCase() : 'TAHIR / MUHAMMAD MR';

    return (
        <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '120px 16px 40px 16px', fontFamily: "'DM Sans', sans-serif" }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * { visibility: hidden !important; }
                    .ticket-card, .ticket-card * { visibility: visible !important; }
                    .ticket-card {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border: 2px solid #E85D1F !important;
                        box-shadow: none !important;
                        background: #fff !important;
                    }
                    .action-bar { display: none !important; }
                }
            `}} />

            {/* Action Bar */}
            <div className="action-bar" style={{ maxWidth: '840px', margin: '0 auto 16px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href="/en/akbar-flights" style={{ color: '#E85D1F', textDecoration: 'none', fontWeight: 700, fontSize: '13px' }}>
                    ← Back to Tilal Rimal Tourism
                </a>
                <button
                    onClick={handlePrint}
                    style={{
                        background: '#E85D1F',
                        color: '#ffffff',
                        border: 'none',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(232, 93, 31, 0.25)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    🖨 Print / Save PDF E-Ticket
                </button>
            </div>

            {/* Main E-Ticket Card */}
            <div className="ticket-card" style={{ maxWidth: '840px', margin: '0 auto', background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)', border: '2px solid #E85D1F' }}>
                {/* 1. Brand Header */}
                <div style={{ background: '#0b1329', color: '#ffffff', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #E85D1F' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                            src="/logo.png"
                            alt="Tilal Rimal Logo"
                            style={{ height: '38px', width: 'auto', objectFit: 'contain', verticalAlign: 'middle' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>Tilal Rimal Tourism Organization</div>
                            <div style={{ fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.12em', color: '#E85D1F', textTransform: 'uppercase', marginTop: '3px' }}>TILAL RIMAL TOURISM</div>
                        </div>
                    </div>
                    <div>
                        <span style={{ display: 'inline-block', background: 'rgba(232, 93, 31, 0.15)', border: '1px solid #E85D1F', color: '#ff9868', padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            ✈ E-TICKET & PASSENGER RECEIPT
                        </span>
                    </div>
                </div>

                {/* 2. Prepared For / Issuing Agency Row */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#ffffff' }}>
                    <div>
                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '4px' }}>PREPARED FOR / PASSENGER NAME</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.01em' }}>{paxName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '4px' }}>ISSUING TRAVEL AGENCY</div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Tilal Rimal Tourism Organization</div>
                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', fontWeight: 600 }}>شركة تلال الرمال لتنظيم الرحلات السياحية</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>License No: <strong style={{ color: '#0f172a' }}>73106935</strong></div>
                        <div style={{ fontSize: '11px', color: '#E85D1F', fontWeight: 700, marginTop: '3px' }}>+966 54 730 5060 · ✉ info@tilalrimal.com</div>
                    </div>
                </div>

                {/* 3. References Bar */}
                <div style={{ padding: '14px 24px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '16px', background: '#f8fafc', padding: '14px 18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div>
                            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '2px' }}>BOOKING REFERENCE (ORDER PNR)</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#E85D1F', letterSpacing: '0.03em' }}>{bookingRef}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '2px' }}>AIRLINE PNR</div>
                            <div>
                                <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.03em', fontFamily: 'monospace' }}>{pnr}</span>
                                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginLeft: '4px' }}>(SAA())</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '2px' }}>ISSUE DATE</div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Sep 7, 2026</div>
                        </div>
                    </div>
                </div>

                {/* 4. Flight Details Banner & Route */}
                <div style={{ padding: '20px 24px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#c2410c', marginBottom: '16px', background: '#fff7ed', border: '1px solid #ffedd5', borderLeft: '4px solid #E85D1F', padding: '10px 16px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>✈ Outbound Flight — Sep 8, 2026</span>
                        <span style={{ fontSize: '11px', color: '#9a3412', fontWeight: 600 }}>Please verify terminal & flight times prior to departure</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                        <div style={{ minWidth: '180px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Sep 8, 2026</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '6px' }}>07:15 AM</div>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>JED</div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, maxWidth: '200px', lineHeight: 1.3 }}>King Abdulaziz International Airport</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Terminal 1</div>
                        </div>

                        <div style={{ flexGrow: 1, margin: '0 24px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', background: '#1e293b', color: '#ff9868', borderRadius: '10px', fontSize: '20px', marginBottom: '8px', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.15)' }}>
                                ✈
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>Saudi Arabian Airlines (Saudia)</div>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#E85D1F', marginBottom: '8px' }}>SV-304</div>
                            <div style={{ borderTop: '2px dashed #cbd5e1', position: 'relative', margin: '12px 20px' }}>
                                <span style={{ position: 'absolute', top: -10, right: '20%', background: '#ffffff', padding: '0 4px', color: '#94a3b8', fontSize: '14px' }}>✈</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginTop: '6px' }}>🕒 02h 15m</div>
                            <div style={{ fontSize: '11px', color: '#0f172a', fontWeight: 800, marginTop: '2px' }}>Price +</div>
                        </div>

                        <div style={{ minWidth: '180px', textAlign: 'left' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Sep 8, 2026</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '6px' }}>09:30 AM</div>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>CAI</div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, maxWidth: '200px', lineHeight: 1.3 }}>Cairo International Airport</div>
                        </div>
                    </div>
                </div>

                {/* 5. Summary Bar */}
                <div style={{ padding: '14px 24px', background: '#fafafa', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginRight: '6px' }}>TICKET NUMBER:</span>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{ticketNo}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>TOTAL AMOUNT PAID:</span>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#E85D1F', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {totalAmount}
                            <img
                                src="/saudi_riyal.png"
                                alt="Saudi Riyal"
                                style={{ height: '20px', width: 'auto', verticalAlign: 'middle', display: 'inline-block' }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </span>
                    </div>
                    <div>
                        <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginRight: '6px' }}>PAYMENT STATUS:</span>
                        <span style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>✓ PAID</span>
                    </div>
                </div>

                {/* 6. Passenger Table Details */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', fontWeight: 800 }}>PASSENGER & DOCUMENT DETAILS</div>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '9px 12px', fontSize: '10px', color: '#475569', fontWeight: 800, textTransform: 'uppercase' }}>PASSENGER NAME</th>
                                <th style={{ padding: '9px 12px', fontSize: '10px', color: '#475569', fontWeight: 800, textTransform: 'uppercase' }}>TYPE</th>
                                <th style={{ padding: '9px 12px', fontSize: '10px', color: '#475569', fontWeight: 800, textTransform: 'uppercase' }}>PASSPORT / ID</th>
                                <th style={{ padding: '9px 12px', fontSize: '10px', color: '#475569', fontWeight: 800, textTransform: 'uppercase' }}>EMAIL ADDRESS</th>
                                <th style={{ textAlign: 'right', padding: '9px 12px', fontSize: '10px', color: '#475569', fontWeight: 800, textTransform: 'uppercase' }}>TICKET NUMBER</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{paxName}</td>
                                <td style={{ padding: '12px', color: '#475569', fontWeight: 600 }}>Adult</td>
                                <td style={{ padding: '12px', color: '#475569', fontWeight: 600 }}>CH7127003</td>
                                <td style={{ padding: '12px', color: '#475569' }}>amanshah12sweer@gmail.com</td>
                                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#E85D1F' }}>{ticketNo}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 7. Important Notice */}
                <div style={{ margin: '16px 24px', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#3b82f6', color: '#ffffff', width: '18px', height: '18px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0, fontWeight: 900, marginTop: '1px' }}>
                        i
                    </div>
                    <div style={{ fontSize: '11px', color: '#9a3412', lineHeight: 1.5, fontWeight: 600 }}>
                        <strong>IMPORTANT TRAVEL NOTICE:</strong> Please present a printed copy of this E-Ticket receipt along with your valid original Passport / National ID at the airport check-in counter at least 3 hours prior to scheduled flight departure. Airport terminal and boarding gate assignments are subject to change by airport authorities.
                    </div>
                </div>

                {/* 8. Footer */}
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', background: '#f8fafc' }}>
                    <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>Tilal Rimal Tourism Organization (شركة تلال الرمال لتنظيم الرحلات السياحية)</div>
                        <div>License No: 73106935 | Phone: +966 54 730 5060 | Email: info@tilalrimal.com</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>BOOKING ISSUE DATE</div>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>September 7, 2026</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
