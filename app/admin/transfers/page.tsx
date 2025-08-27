"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Eye, Check, X, Download, MessageCircle } from 'lucide-react';

interface Payment {
  id: number;
  reference: string;
  full_name: string;
  email: string;
  phone_number: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
  courses: string;
  evidence_filename?: string;
  user_id: number;
}

export default function AdminBankTransfers() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [filter, setFilter] = useState<'pending' | 'success' | 'failed' | 'all'>('pending');
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://ns.auwebx.com/api/payments/get_bank_transfers.php?filter=${filter}`);
      const data = await response.json();
      setPayments((data.payments || []) as Payment[]);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: number, newStatus: 'success' | 'failed') => {
    try {
      setUpdating(true);
      const response = await fetch('https://ns.auwebx.com/api/payments/update_status.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: paymentId,
          status: newStatus,
          verified_by: 1, // Replace with actual admin user ID
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // If verified, also create enrollments
        if (newStatus === 'success') {
          const payment = payments.find(p => p.id === paymentId);
          if (payment && payment.user_id) {
            await createEnrollments(payment.user_id, payment.courses);
          }
        }
        
        await fetchPayments();
        setShowModal(false);
        alert(`Payment ${newStatus === 'success' ? 'verified' : 'rejected'} successfully!`);
      } else {
        alert('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Error updating payment status');
    } finally {
      setUpdating(false);
    }
  };

  const createEnrollments = async (userId: number, coursesString: string) => {
    // This would need course IDs, you might need to modify this based on your course structure
    try {
      const response = await fetch('https://ns.auwebx.com/api/payments/batch_enroll.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          courses: coursesString,
        }),
      });
      
      const result = await response.json();
      console.log('Enrollment result:', result);
    } catch (error) {
      console.error('Error creating enrollments:', error);
    }
  };

  const openWhatsApp = (phoneNumber: string, customerName: string, reference: string) => {
    const message = `Hi ${customerName}! 👋\n\nGreat news! Your bank transfer payment (Ref: ${reference}) has been verified and your course enrollment is now active! 🎉\n\nYou can now access your courses in your dashboard.\n\nThank you for choosing AUWEBx Academy! 📚✨`;
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount / 100);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const PaymentModal = ({ payment, onClose }: { payment: Payment; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Reference</label>
                <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                  {payment.reference}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <p className="mt-1 text-sm text-gray-900">{payment.full_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{payment.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{payment.phone_number}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <p className="mt-1 text-lg font-semibold text-green-600">
                  {formatCurrency(payment.amount)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Submitted</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(payment.created_at).toLocaleString()}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Courses</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {payment.courses}
                </p>
              </div>
            </div>
          </div>

          {payment.evidence_filename && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Evidence</label>
              <div className="border rounded-lg p-4">
                <Image 
                  src={`https://ns.auwebx.com/api/uploads/payment_evidence/thumb_${payment.evidence_filename}`}
                  alt="Payment Evidence"
                  width={600}
                  height={400}
                  className="max-w-full h-auto rounded cursor-pointer"
                  onClick={() => window.open(`https://ns.auwebx.com/api/uploads/payment_evidence/${payment.evidence_filename}`, '_blank')}
                />
                <div className="mt-2 flex gap-2">
                  <a 
                    href={`https://ns.auwebx.com/api/uploads/payment_evidence/${payment.evidence_filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye size={16} className="mr-1" />
                    View Full Size
                  </a>
                  <a 
                    href={`https://ns.auwebx.com/api/uploads/payment_evidence/${payment.evidence_filename}`}
                    download
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download size={16} className="mr-1" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          )}

          {payment.status === 'pending' && (
            <div className="flex gap-3">
              <button
                onClick={() => updatePaymentStatus(payment.id, 'success')}
                disabled={updating}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                <Check size={16} className="mr-2" />
                {updating ? 'Verifying...' : 'Verify & Approve'}
              </button>
              
              <button
                onClick={() => updatePaymentStatus(payment.id, 'failed')}
                disabled={updating}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <X size={16} className="mr-2" />
                {updating ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          )}

          {payment.status === 'success' && payment.phone_number && (
            <button
              onClick={() => openWhatsApp(payment.phone_number, payment.full_name, payment.reference)}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <MessageCircle size={16} className="mr-2" />
              Send WhatsApp Confirmation
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank Transfer Management</h1>
        <p className="text-gray-600">Manage and verify bank transfer payments</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'pending' as const, label: 'Pending', count: payments.filter(p => p.status === 'pending').length },
              { key: 'success' as const, label: 'Verified', count: payments.filter(p => p.status === 'success').length },
              { key: 'failed' as const, label: 'Rejected', count: payments.filter(p => p.status === 'failed').length },
              { key: 'all' as const, label: 'All', count: payments.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} 
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {payments.length === 0 ? (
              <li className="px-6 py-8 text-center text-gray-500">
                No payments found for the selected filter.
              </li>
            ) : (
              payments.map((payment) => (
                <li key={payment.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-medium text-sm">
                            {payment.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {payment.full_name}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{payment.email}</span>
                          <span>•</span>
                          <span>{formatCurrency(payment.amount)}</span>
                          <span>•</span>
                          <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        <p className="mt-1 text-sm text-gray-600 truncate">
                          Courses: {payment.courses}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowModal(true);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye size={16} className="mr-1" />
                      View Details
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Payment Details Modal */}
      {showModal && selectedPayment && (
        <PaymentModal 
          payment={selectedPayment} 
          onClose={() => {
            setShowModal(false);
            setSelectedPayment(null);
          }} 
        />
      )}
    </div>
  );
}