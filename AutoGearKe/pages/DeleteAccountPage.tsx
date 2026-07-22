import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BUSINESS_NAME, CONTACT_EMAIL } from '../constants.ts';

const DeleteAccountPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Delete Account | Mekh</title>
        <meta name="description" content="Learn how to delete your Mekh account and manage your data." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-50">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-black text-blue-500 mb-8">
            Your Data, Your Choice.
          </h1>
          
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-blue-500 mb-6">
              {BUSINESS_NAME} is committed to transparency and giving you 
              full control over your data.
            </h2>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-blue-500 mb-4">Mechanics</h2>
            <p className="text-slate-400 mb-2">
              Head to Settings → Account → Delete Account 
              in the app to permanently delete your account instantly.
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-blue-500 mb-4">Other Users</h2>
            <p className="text-slate-400">
              Send a deletion request to <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-400 hover:underline">{CONTACT_EMAIL}</a> 
              with the subject line "Account Deletion Request."
            </p>
            <p className="text-slate-400 mt-2">
              We'll handle the rest within 30 days.
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-blue-500 mb-4">Questions?</h2>
            <p className="text-slate-400">
              We're here at <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-400 hover:underline">{CONTACT_EMAIL}</a>
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default DeleteAccountPage;