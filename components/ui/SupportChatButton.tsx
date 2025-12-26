import React, { useState } from 'react';
import { MessageCircle, X, Send, HelpCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

export const SupportChatButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);
    const { user, profile } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        try {
            const { error } = await supabase.from('support_messages').insert({
                sender_name: profile?.full_name || name,
                sender_email: user?.email || email,
                sender_profile_id: user?.id || null,
                subject: subject || 'Support Request',
                content: message,
                message_type: 'support'
            });

            if (error) {
                console.error('Error sending message:', error);
                alert('Failed to send message. Please try again.');
            } else {
                setSent(true);
                setSubject('');
                setMessage('');
                // Reset after showing success
                setTimeout(() => {
                    setSent(false);
                    setIsOpen(false);
                }, 2000);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-brand-black text-white rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center z-50 group"
                aria-label="Contact Support"
            >
                <MessageCircle size={24} />
                <span className="absolute right-full mr-3 bg-brand-black text-white text-sm font-bold px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Need Help?
                </span>
            </button>

            {/* Chat Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Chat Panel */}
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
                        {/* Header */}
                        <div className="bg-brand-black text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                    <HelpCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Support</h3>
                                    <p className="text-xs text-gray-300">We typically reply within 24 hours</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        {sent ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send size={24} />
                                </div>
                                <h4 className="text-xl font-bold text-brand-black mb-2">Message Sent!</h4>
                                <p className="text-gray-500">We'll get back to you soon.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                {/* If not logged in, ask for name and email */}
                                {!user && (
                                    <>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase">Your Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/10"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase">Your Email</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/10"
                                                placeholder="you@example.com"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Subject</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/10"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Message</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/10 resize-none h-32"
                                        placeholder="Describe your question or issue..."
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSending || !message.trim()}
                                    className="w-full bg-brand-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {isSending ? 'Sending...' : 'Send Message'}
                                    <Send size={16} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
