import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiStar, FiMessageSquare, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../store';
import toast from 'react-hot-toast';

export default function ReviewsManager() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => { fetchReviews(); }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const approved = filter === 'approved' ? 'true' : filter === 'rejected' ? 'false' : undefined;
      const params = new URLSearchParams();
      if (approved !== undefined) params.set('approved', approved);
      else if (filter === 'pending') params.set('approved', 'false');
      const res = await api.get(`/reviews?${params}&type=restaurant`);
      setReviews(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const approve = async (id, approved) => {
    try {
      await api.patch(`/reviews/${id}/approve`, { approved });
      setReviews(prev => prev.filter(r => r._id !== id));
      toast.success(approved ? 'Review approved & published' : 'Review rejected');
    } catch { toast.error('Failed'); }
  };

  const submitReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      await api.post(`/reviews/${id}/reply`, { text: replyText });
      toast.success('Reply posted'); setReplyId(null); setReplyText(''); fetchReviews();
    } catch { toast.error('Failed'); }
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    try { await api.delete(`/reviews/${id}`); setReviews(prev => prev.filter(r => r._id !== id)); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div><h2 className="text-white font-bold text-lg">Reviews</h2></div>
        <div className="flex gap-2 ml-auto">
          {['pending', 'approved', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-brand text-gray-900' : 'bg-surface-card border border-surface-border text-gray-400 hover:text-white'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? Array(5).fill(0).map((_, i) => <div key={i} className="admin-card h-28 animate-pulse bg-surface-hover" />) :
          reviews.length === 0 ? <p className="text-center text-gray-500 text-sm py-12">No reviews in this category</p> :
          reviews.map(review => (
            <div key={review._id} className="admin-card">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand text-sm font-bold flex-shrink-0">{review.customerName?.[0] || 'G'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-medium text-sm">{review.customerName || 'Guest'}</p>
                    <div className="flex gap-0.5">{Array(5).fill(0).map((_, i) => <FiStar key={i} className={`text-xs ${i < review.rating ? 'text-brand fill-current' : 'text-gray-700'}`} />)}</div>
                    <span className={`badge text-xs ${review.isApproved ? 'badge-green' : 'badge-yellow'}`}>{review.isApproved ? 'Published' : 'Pending'}</span>
                    <span className="text-gray-600 text-xs ml-auto">{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <p className="text-gray-400 text-sm">"{review.comment}"</p>
                  {review.reply && <div className="mt-2 bg-brand/5 border border-brand/20 rounded-lg p-2 text-xs text-gray-400"><span className="text-brand font-medium">Owner reply: </span>{review.reply.text}</div>}

                  {replyId === review._id && (
                    <div className="mt-2 flex gap-2">
                      <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply..." className="admin-input text-xs flex-1" />
                      <button onClick={() => submitReply(review._id)} className="admin-btn py-1.5 px-3 text-xs">Post</button>
                      <button onClick={() => setReplyId(null)} className="admin-btn-ghost py-1.5 px-2 text-xs"><FiX /></button>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    {!review.isApproved && <button onClick={() => approve(review._id, true)} className="admin-btn py-1 px-3 text-xs"><FiCheck className="text-xs" /> Approve</button>}
                    {review.isApproved && <button onClick={() => approve(review._id, false)} className="admin-btn-ghost py-1 px-3 text-xs">Unpublish</button>}
                    {!review.reply && <button onClick={() => { setReplyId(review._id); setReplyText(''); }} className="admin-btn-ghost py-1 px-3 text-xs"><FiMessageSquare className="text-xs" /> Reply</button>}
                    <button onClick={() => deleteReview(review._id)} className="admin-btn-ghost py-1 px-3 text-xs text-red-400 hover:text-red-300 ml-auto"><FiX className="text-xs" /> Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
