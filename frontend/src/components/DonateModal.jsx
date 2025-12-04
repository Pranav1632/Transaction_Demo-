import React, { useState } from 'react';
import API from '../api/apiClient';

export default function DonateModal() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  async function startDonate() {
    if (!amount || Number(amount) <= 0) return alert('Enter valid amount');
    setLoading(true);
    try {
      const res = await API.post('/donations/create', { amount: Number(amount) });
      const { orderId, donationId, amount: amountPaise, key_id } = res.data.data;

      const options = {
        key: key_id,
        amount: amountPaise,
        currency: 'INR',
        name: 'Your App Name',
        description: 'Donation',
        order_id: orderId,
        handler: async function (response) {
          // frontend handler: notify user that payment is done; wait for webhook to confirm
          alert('Payment initiated. Waiting for confirmation...');
          // Optionally poll status
          const poll = async () => {
            const statusRes = await API.get(`/donations/${donationId}/status`);
            if (statusRes.data.data.status === 'paid') {
              alert('Donation successful — thank you!');
              window.location.reload();
            } else {
              // keep polling or show "awaiting confirmation"
            }
          };
          setTimeout(poll, 2000); // start short poll
        },
        prefill: { name: '', email: '' },
        theme: { color: '#2b8bf2' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err?.response?.data?.error?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{padding:12}}>
      <input placeholder="Amount in INR" value={amount} onChange={e=>setAmount(e.target.value)} />
      <button onClick={startDonate} disabled={loading}>Donate</button>
    </div>
  );
}
