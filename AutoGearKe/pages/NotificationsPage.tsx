import React from 'react';
import { Link } from 'react-router-dom';
import { NotificationSettings } from '../src/components/NotificationSettings';

const NotificationsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-24">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <Link 
            to="/menu" 
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-blue-500">Notifications</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Push Notifications Settings */}
        <NotificationSettings />

        {/* Information Section */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
          <h2 className="text-blue-500 font-medium mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-500">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
            What you'll receive
          </h2>
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-slate-300 font-medium">Booking Updates</p>
                <p>When technicians respond to your booking requests or update job status</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-slate-300 font-medium">Messages</p>
                <p>Direct messages from technicians about your bookings</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-slate-300 font-medium">Account Updates</p>
                <p>Important information about your account and security</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-slate-300 font-medium">Service Reminders</p>
                <p>Helpful reminders about upcoming appointments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="bg-blue-600 border border-blue-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0">
              <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.814 3.051 10.77 7.608 13.566a.75.75 0 00.784 0C15.199 20.52 18.25 15.564 18.25 9.75a12.74 12.74 0 00-.635-4.235.75.75 0 00-.722-.515 11.209 11.209 0 01-7.877-3.08z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M9.663 17.85a.75.75 0 01-.902-.62l-.57-3.415a.75.75 0 01.902-1.18l.57 3.415a.75.75 0 01-.62.902z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M15.75 12.75a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-[#ffff] font-medium text-sm">Your privacy is protected</p>
              <p className="text-[#ffff] text-xs mt-1">
                We only send notifications related to your bookings and account. You can disable notifications at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;